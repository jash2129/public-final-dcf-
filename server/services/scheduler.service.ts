import { pool } from '../db';
import * as complianceModel from '../models/compliance.model';
import * as userModel from '../models/user.model';
import * as serviceModel from '../models/service.model';
import { notifyComplianceDeadline } from './notification.service';
import mysql from 'mysql2/promise';

/**
 * Parses offsets string (e.g., "7,3,1 days before planned launch date") and returns list of integers
 */
export function parseReminderOffsets(offsetsStr: string): number[] {
  if (!offsetsStr) return [7, 3, 1]; // default fallback offsets
  
  // Extract all numbers
  const matches = offsetsStr.match(/\d+/g);
  if (!matches) return [7, 3, 1];
  
  return matches.map(n => parseInt(n, 10));
}

/**
 * Helper to parse dueDate string (e.g. "Nov 20, 2026") into Date object
 */
export function parseTaskDueDate(dateStr: string): Date | null {
  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) {
    // Attempt fallback format mapping if needed
    return null;
  }
  return new Date(parsed);
}

export interface ScanResult {
  tasksScanned: number;
  notificationsSent: number;
  statusUpdates: number;
  details: string[];
}

/**
 * Core compliance scan function. Finds active, non-completed tasks, matches offsets, and sends notifications.
 */
export async function runComplianceScan(): Promise<ScanResult> {
  const result: ScanResult = {
    tasksScanned: 0,
    notificationsSent: 0,
    statusUpdates: 0,
    details: []
  };

  try {
    // Fetch all non-completed tasks
    const [tasks] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT c.*, u.name as user_name, u.email as user_email, u.phone as user_phone, 
              s.reminder_offsets, s.name as service_name
       FROM compliance_tasks c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN services s ON c.service_id = s.id
       WHERE c.status != 'completed'`
    );

    result.tasksScanned = tasks.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const task of tasks) {
      const dueDateObj = parseTaskDueDate(task.dueDate);
      if (!dueDateObj) {
        result.details.push(`Task ID ${task.id} has unparseable due date "${task.dueDate}"`);
        continue;
      }
      dueDateObj.setHours(0, 0, 0, 0);

      // Compute day differences
      const diffTime = dueDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const offsets = parseReminderOffsets(task.reminder_offsets || '');

      // Check if task is overdue
      if (diffDays < 0) {
        if (task.status !== 'overdue') {
          await complianceModel.updateComplianceTaskStatus(task.id, 'overdue');
          result.statusUpdates++;
          result.details.push(`Task ID ${task.id} ("${task.title}") transitioned to OVERDUE`);
        }

        // Trigger overdue notification once (e.g. if due yesterday, or weekly)
        // To be safe and prevent spamming, we send overdue reminders if diffDays matches -1, -7, -14, etc.
        if (diffDays === -1 || diffDays % 7 === 0) {
          await notifyComplianceDeadline(
            task.title,
            task.dueDate,
            task.user_email,
            task.user_phone || '',
            task.user_name,
            'overdue',
            diffDays,
            task.user_id
          );
          result.notificationsSent++;
          result.details.push(`Sent OVERDUE notification for "${task.title}" to ${task.user_email}`);
        }
      } 
      // Check if task is due today
      else if (diffDays === 0) {
        await notifyComplianceDeadline(
          task.title,
          task.dueDate,
          task.user_email,
          task.user_phone || '',
          task.user_name,
          'upcoming',
          0,
          task.user_id
        );
        result.notificationsSent++;
        result.details.push(`Sent DUE TODAY notification for "${task.title}" to ${task.user_email}`);
      } 
      // Check if days remaining matches any of the parsed offsets
      else if (offsets.includes(diffDays)) {
        await notifyComplianceDeadline(
          task.title,
          task.dueDate,
          task.user_email,
          task.user_phone || '',
          task.user_name,
          'upcoming',
          diffDays,
          task.user_id
        );
        result.notificationsSent++;
        result.details.push(`Sent reminder (${diffDays} days before) for "${task.title}" to ${task.user_email}`);
      }
    }

    console.log(`Compliance scan completed. Scanned ${result.tasksScanned} tasks. Sent ${result.notificationsSent} alerts.`);
  } catch (error) {
    console.error("Compliance scan encountered error:", error);
  }

  return result;
}

/**
 * Initializes the background scheduler to run the scan once every 24 hours
 */
export function initScheduler() {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  
  // Run first scan shortly after startup (e.g. after 30 seconds to let DB stabilize)
  setTimeout(() => {
    console.log("Running initial compliance scheduler scan...");
    runComplianceScan();
  }, 30000);

  // Set recurring interval
  setInterval(() => {
    console.log("Running daily compliance scheduler scan...");
    runComplianceScan();
  }, TWENTY_FOUR_HOURS);
}
