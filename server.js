// server.ts
import dotenv from "dotenv";
import express from "express";
import { createServer as createViteServer } from "vite";
import path5 from "path";
import fs5 from "fs";

// server/db.ts
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// server/utils/helpers.ts
function formatCurrency(amount) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "\u20B90";
  return "\u20B9" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
function parseCSV(content) {
  const result = [];
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return result;
  const headers = parseCSVLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      const h = header.trim();
      if (h) {
        row[h] = values[index] !== void 0 ? values[index].trim() : "";
      }
    });
    result.push(row);
  }
  return result;
}
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((v) => {
    let clean = v.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.substring(1, clean.length - 1);
    }
    return clean.replace(/""/g, '"');
  });
}
function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
function formatLegacyDate(date = /* @__PURE__ */ new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// server/db.ts
var rawPool = void 0;
var pool = new Proxy({}, {
  get(target, prop, receiver) {
    if (!rawPool) {
      throw new Error(
        "Database connection pool is not initialized. This means the server failed to connect to your MySQL database on startup. Please ensure your MySQL/MariaDB server is running (e.g. XAMPP locally or your Hostinger database) and check that your .env credentials are correct."
      );
    }
    const value = Reflect.get(rawPool, prop);
    if (typeof value === "function") {
      return value.bind(rawPool);
    }
    return value;
  }
});
async function setupDatabase() {
  try {
    let dbHost = process.env.DB_HOST;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;
    let dbPort = 3306;
    if (dbHost.includes("://")) {
      dbHost = dbHost.split("://")[1];
    }
    if (dbHost.includes(":")) {
      const parts = dbHost.split(":");
      dbHost = parts[0];
      const parsedPort = parseInt(parts[1], 10);
      if (!isNaN(parsedPort)) {
        dbPort = parsedPort;
      }
    }
    let initConnection;
    try {
      if (dbUser === "root") {
        initConnection = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          connectTimeout: 5e3
        });
        await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await initConnection.end();
      }
    } catch (err) {
      console.warn("WARNING: Could not connect to MySQL server to create database (normal on shared hosting if database already exists). Error:", err.message);
    }
    rawPool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 1e4,
      connectTimeout: 1e4
    });
    console.log("MySQL Connection Pool initialized.");
    await rawPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        avatar VARCHAR(500) NULL,
        phone VARCHAR(20) NULL,
        company_name VARCHAR(255) NULL,
        address TEXT NULL,
        gstin VARCHAR(20) NULL,
        notification_prefs TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY idx_users_email (email)
      ) ENGINE=InnoDB;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT NULL,
        price DECIMAL(10, 2) NOT NULL,
        mode VARCHAR(50) NULL,
        turnaround_time VARCHAR(100) NULL,
        is_recurring VARCHAR(20) NULL,
        compliance_type VARCHAR(255) NULL,
        recurring_frequency VARCHAR(50) NULL,
        standard_due_rule TEXT NULL,
        reminder_offsets VARCHAR(255) NULL,
        documents_required TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY idx_services_code (code),
        UNIQUE KEY idx_services_slug (slug),
        INDEX idx_services_category (category)
      ) ENGINE=InnoDB;
    `);
    try {
      let needsMigration = false;
      try {
        const [ordCols] = await pool.query("SHOW COLUMNS FROM orders");
        if (!ordCols.some((c) => c.Field === "total_amount")) needsMigration = true;
      } catch (e) {
      }
      try {
        const [compCols] = await pool.query("SHOW COLUMNS FROM compliance_tasks");
        if (!compCols.some((c) => c.Field === "service_id")) needsMigration = true;
      } catch (e) {
      }
      if (needsMigration) {
        console.log("Legacy tables detected (schema mismatch). Dropping tables for migration...");
        await pool.query("SET FOREIGN_KEY_CHECKS = 0");
        await pool.query("DROP TABLE IF EXISTS order_items");
        await pool.query("DROP TABLE IF EXISTS compliance_tasks");
        await pool.query("DROP TABLE IF EXISTS documents");
        await pool.query("DROP TABLE IF EXISTS orders");
        await pool.query("DROP TABLE IF EXISTS invoices");
        await pool.query("SET FOREIGN_KEY_CHECKS = 1");
        console.log("Legacy tables dropped successfully.");
      }
    } catch (e) {
    }
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        user_id INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'placed',
        total_amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_orders_user_id (user_id),
        INDEX idx_orders_status (status),
        INDEX idx_orders_created_at (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        service_id INT NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_items_order_id (order_id),
        INDEX idx_items_service_id (service_id),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        size VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        folder VARCHAR(100) NOT NULL,
        file_path VARCHAR(500) NULL,
        order_id VARCHAR(50) NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_documents_user_id (user_id),
        INDEX idx_documents_order_id (order_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        amount VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        service VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_invoices_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS compliance_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        dueDate VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        type VARCHAR(100) NOT NULL,
        penalty VARCHAR(100) NULL,
        user_id INT NOT NULL,
        service_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_compliance_user_id (user_id),
        INDEX idx_compliance_status (status),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        requests INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_name VARCHAR(255) NULL,
        user_email VARCHAR(255) NULL,
        INDEX idx_log_user_id (user_id),
        INDEX idx_log_timestamp (timestamp)
      ) ENGINE=InnoDB;
    `);
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const [adminRows] = await pool.query("SELECT * FROM users WHERE email = ?", ["admin@deccanfilings.com"]);
    if (adminRows.length === 0) {
      await pool.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["System Admin", "admin@deccanfilings.com", hashedAdminPassword, "admin"]
      );
      console.log("Admin user seeded (admin@deccanfilings.com / admin123).");
    }
    const [superAdminRows] = await pool.query("SELECT * FROM users WHERE email = ?", ["superadmin@deccanfilings.com"]);
    if (superAdminRows.length === 0) {
      await pool.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Super Admin", "superadmin@deccanfilings.com", hashedAdminPassword, "super_admin"]
      );
      console.log("Super Admin user seeded (superadmin@deccanfilings.com / admin123).");
    }
    await seedServices();
    await seedTestData();
    return pool;
  } catch (error) {
    rawPool = void 0;
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
async function seedServices() {
  const [serviceCountRows] = await pool.query("SELECT COUNT(*) as count FROM services");
  if (serviceCountRows[0].count > 0) {
    console.log(`Services catalog already seeded with ${serviceCountRows[0].count} entries.`);
    return;
  }
  try {
    const csvPath = path.join(process.cwd(), "DF_knowledge_base_updated.csv");
    if (!fs.existsSync(csvPath)) {
      console.warn("WARNING: DF_knowledge_base_updated.csv not found in workspace root. Skipping CSV seeding.");
      return;
    }
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const parsedRows = parseCSV(csvContent);
    console.log(`Parsed ${parsedRows.length} rows from services CSV.`);
    const dueDatesPath = path.join(process.cwd(), "due_date_rules.json");
    let dueDatesRules = [];
    if (fs.existsSync(dueDatesPath)) {
      try {
        dueDatesRules = JSON.parse(fs.readFileSync(dueDatesPath, "utf-8"));
      } catch (e) {
        console.error("Failed to parse due_date_rules.json:", e);
      }
    }
    const dueDatesMap = /* @__PURE__ */ new Map();
    dueDatesRules.forEach((rule) => {
      dueDatesMap.set(rule.service_id, {
        standard_due_rule: rule.standard_due_rule,
        reminder_offsets: rule.reminder_offsets
      });
    });
    for (const row of parsedRows) {
      const code = row.service_id;
      const name = row.service_name;
      const category = row.category;
      let price = parseFloat(row.price_inr);
      if (isNaN(price)) {
        price = 2999;
      }
      if (!code || !name || !category) continue;
      const slug = generateSlug(name);
      const desc = row.ideal_customer ? `Ideal for: ${row.ideal_customer}. Turnaround: ${row.turnaround_time || "N/A"}` : `Professional service for ${name}`;
      const mode = row.mode || "Online";
      const tat = row.turnaround_time || "3-5 days";
      const recurring = row.is_recurring || "No";
      const compType = row.compliance_type || "";
      const recFreq = row.recurring_frequency || "";
      const dueInfo = dueDatesMap.get(code);
      const standardDue = dueInfo?.standard_due_rule || row.standard_due_rule || "No statutory deadline";
      const reminderOffsets = dueInfo?.reminder_offsets || row.reminder_offsets || "7,3,1 days";
      const docs = row.documents_required || "";
      await pool.execute(
        `INSERT INTO services (code, name, slug, category, description, price, mode, turnaround_time, is_recurring, compliance_type, recurring_frequency, standard_due_rule, reminder_offsets, documents_required) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [code, name, slug, category, desc, price, mode, tat, recurring, compType, recFreq, standardDue, reminderOffsets, docs]
      );
    }
    const [newCount] = await pool.query("SELECT COUNT(*) as count FROM services");
    console.log(`Seeding complete. Loaded ${newCount[0].count} services into catalog.`);
  } catch (error) {
    console.error("Error during services database seeding:", error);
  }
}
async function seedTestData() {
  const [users] = await pool.query("SELECT id FROM users LIMIT 1");
  const firstUserId = users.length > 0 ? users[0].id : null;
  if (!firstUserId) return;
  const [compCount] = await pool.query("SELECT COUNT(*) as count FROM compliance_tasks");
  if (compCount[0].count === 0) {
    const defaultTasks = [
      { title: "GSTR-3B Filing (October)", dueDate: "Nov 20, 2026", status: "overdue", type: "Taxation", penalty: "\u20B950/day" },
      { title: "GSTR-1 Filing (November)", dueDate: "Dec 11, 2026", status: "upcoming", type: "Taxation", penalty: null },
      { title: "Advance Tax Payment (Q3)", dueDate: "Dec 15, 2026", status: "upcoming", type: "Taxation", penalty: null },
      { title: "Annual General Meeting (AGM)", dueDate: "Sep 30, 2026", status: "completed", type: "ROC Compliance", penalty: null },
      { title: "AOC-4 Filing", dueDate: "Oct 29, 2026", status: "completed", type: "ROC Compliance", penalty: null }
    ];
    for (const t of defaultTasks) {
      await pool.execute(
        "INSERT INTO compliance_tasks (title, dueDate, status, type, penalty, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [t.title, t.dueDate, t.status, t.type, t.penalty, firstUserId]
      );
    }
    console.log("Compliance tasks seeded.");
  }
  const [statsCount] = await pool.query("SELECT COUNT(*) as count FROM activity_stats");
  if (statsCount[0].count === 0) {
    const stats = [
      { name: "Jan", requests: 4 },
      { name: "Feb", requests: 3 },
      { name: "Mar", requests: 5 },
      { name: "Apr", requests: 7 },
      { name: "May", requests: 6 },
      { name: "Jun", requests: 9 },
      { name: "Jul", requests: 12 }
    ];
    for (const s of stats) {
      await pool.execute("INSERT INTO activity_stats (name, requests) VALUES (?, ?)", [s.name, s.requests]);
    }
  }
}

// server/models/compliance.model.ts
async function listUserComplianceTasks(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM compliance_tasks WHERE user_id = ? ORDER BY STR_TO_DATE(dueDate, "%b %d, %Y") ASC, id DESC',
    [userId]
  );
  return rows;
}
async function listAllComplianceTasks() {
  const [rows] = await pool.query(
    'SELECT c.*, u.name as user_name, u.email as user_email FROM compliance_tasks c JOIN users u ON c.user_id = u.id ORDER BY STR_TO_DATE(c.dueDate, "%b %d, %Y") ASC',
    []
  );
  return rows;
}
async function createComplianceTask(task) {
  const [result] = await pool.execute(
    "INSERT INTO compliance_tasks (title, dueDate, status, type, penalty, user_id, service_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      task.title,
      task.dueDate,
      task.status || "upcoming",
      task.type || "Taxation",
      task.penalty || null,
      task.user_id,
      task.service_id || null
    ]
  );
  return result.insertId;
}
async function findComplianceTaskById(id) {
  const [rows] = await pool.query("SELECT * FROM compliance_tasks WHERE id = ?", [id]);
  if (rows.length === 0) return null;
  return rows[0];
}
async function updateComplianceTaskStatus(id, status) {
  const [result] = await pool.execute("UPDATE compliance_tasks SET status = ? WHERE id = ?", [status, id]);
  return result.affectedRows > 0;
}
async function deleteComplianceTask(id) {
  const [result] = await pool.execute("DELETE FROM compliance_tasks WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// server/services/notification.service.ts
import fs2 from "fs";
import path2 from "path";
var LOG_DIR = path2.join(process.cwd(), "logs");
var LOG_FILE = path2.join(LOG_DIR, "notifications.log");
function ensureLogFile() {
  if (!fs2.existsSync(LOG_DIR)) {
    fs2.mkdirSync(LOG_DIR, { recursive: true });
  }
  if (!fs2.existsSync(LOG_FILE)) {
    fs2.writeFileSync(LOG_FILE, "", "utf-8");
  }
}
function logNotificationToFile(type, recipient, subjectOrMessage, body) {
  ensureLogFile();
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const logEntry = `[${timestamp}] [${type}] To: ${recipient}
` + (body ? `Subject: ${subjectOrMessage}
Body: ${body}` : `Message: ${subjectOrMessage}`) + `
------------------------------------------------------------
`;
  fs2.appendFileSync(LOG_FILE, logEntry, "utf-8");
}
async function logToActivityDB(userId, action, details) {
  try {
    const [rows] = await pool.query("SELECT name, email FROM users WHERE id = ?", [userId]);
    const name = rows.length > 0 ? rows[0].name : "System";
    const email = rows.length > 0 ? rows[0].email : "";
    await pool.execute(
      "INSERT INTO activity_log (user_id, action, details, user_name, user_email) VALUES (?, ?, ?, ?, ?)",
      [userId, action, details, name, email]
    );
  } catch (error) {
    console.error("Failed to write notification audit to activity_log:", error);
  }
}
async function sendEmail(to, subject, body, userId) {
  console.log(`[SMTP MOCK] Sending Email to ${to}:
Subject: ${subject}
Body: ${body}
`);
  logNotificationToFile("EMAIL", to, subject, body);
  if (userId) {
    await logToActivityDB(userId, "Email Dispatched", `Subject: ${subject}`);
  }
  return true;
}
async function sendSMS(toPhone, message, userId) {
  console.log(`[SMS GATEWAY MOCK] Sending SMS to ${toPhone}:
Message: ${message}
`);
  logNotificationToFile("SMS", toPhone, message);
  if (userId) {
    await logToActivityDB(userId, "SMS Dispatched", `Message: ${message}`);
  }
  return true;
}
async function notifyOrderPlacement(orderId, userEmail, userPhone, userName, serviceNames, amount, userId) {
  const formattedAmt = formatCurrency(amount);
  const emailSubject = `Order Placed Successfully - ${orderId}`;
  const emailBody = `Hi ${userName},

Thank you for choosing Deccan Filings! We have received your order.

Order Details:
- Order ID: ${orderId}
- Services: ${serviceNames}
- Total Amount: ${formattedAmt}
- Status: Placed (Our experts will start working shortly)

Best regards,
Team Deccan Filings`;
  await sendEmail(userEmail, emailSubject, emailBody, userId);
  const smsMessage = `Hi ${userName}, order ${orderId} for ${serviceNames} (Amt: ${formattedAmt}) has been placed successfully. Team Deccan Filings`;
  if (userPhone) {
    await sendSMS(userPhone, smsMessage, userId);
  }
}
async function notifyOrderStatusChange(orderId, status, userEmail, userPhone, userName, userId) {
  const statusDisplay = status.toUpperCase().replace("_", " ");
  const emailSubject = `Order Update - ${orderId}`;
  const emailBody = `Hi ${userName},

Your order ${orderId} has been updated to: ${statusDisplay}.

You can track the progress and upload any required documents via your customer dashboard.

Best regards,
Team Deccan Filings`;
  await sendEmail(userEmail, emailSubject, emailBody, userId);
  const smsMessage = `Hi ${userName}, status of your order ${orderId} has been updated to ${statusDisplay}. Log in to dashboard to check. Team Deccan Filings`;
  if (userPhone) {
    await sendSMS(userPhone, smsMessage, userId);
  }
}
async function notifyComplianceDeadline(taskTitle, dueDate, userEmail, userPhone, userName, status, daysRemaining, userId) {
  const subject = status === "overdue" ? `URGENT: Compliance Overdue - ${taskTitle}` : `Reminder: Compliance Due in ${daysRemaining} Days - ${taskTitle}`;
  const emailBody = `Hi ${userName},

` + (status === "overdue" ? `This is a reminder that the compliance filing for "${taskTitle}" was due on ${dueDate} and is now OVERDUE. Please submit the required documents immediately to avoid statutory penalties.` : `This is a reminder that the compliance filing for "${taskTitle}" is due on ${dueDate} (${daysRemaining} days remaining). Please share the necessary documents so we can file on time.`) + `

Best regards,
Team Deccan Filings`;
  await sendEmail(userEmail, subject, emailBody, userId);
  const smsMessage = status === "overdue" ? `Hi ${userName}, compliance for ${taskTitle} was due on ${dueDate} and is OVERDUE. Please share documents immediately to avoid penalties. Team Deccan Filings` : `Hi ${userName}, compliance for ${taskTitle} is due on ${dueDate}. Please share required documents at the earliest. Team Deccan Filings`;
  if (userPhone) {
    await sendSMS(userPhone, smsMessage, userId);
  }
}

// server/services/scheduler.service.ts
function parseReminderOffsets(offsetsStr) {
  if (!offsetsStr) return [7, 3, 1];
  const matches = offsetsStr.match(/\d+/g);
  if (!matches) return [7, 3, 1];
  return matches.map((n) => parseInt(n, 10));
}
function parseTaskDueDate(dateStr) {
  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) {
    return null;
  }
  return new Date(parsed);
}
async function runComplianceScan() {
  const result = {
    tasksScanned: 0,
    notificationsSent: 0,
    statusUpdates: 0,
    details: []
  };
  try {
    const [tasks] = await pool.query(
      `SELECT c.*, u.name as user_name, u.email as user_email, u.phone as user_phone, 
              s.reminder_offsets, s.name as service_name
       FROM compliance_tasks c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN services s ON c.service_id = s.id
       WHERE c.status != 'completed'`
    );
    result.tasksScanned = tasks.length;
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    for (const task of tasks) {
      const dueDateObj = parseTaskDueDate(task.dueDate);
      if (!dueDateObj) {
        result.details.push(`Task ID ${task.id} has unparseable due date "${task.dueDate}"`);
        continue;
      }
      dueDateObj.setHours(0, 0, 0, 0);
      const diffTime = dueDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
      const offsets = parseReminderOffsets(task.reminder_offsets || "");
      if (diffDays < 0) {
        if (task.status !== "overdue") {
          await updateComplianceTaskStatus(task.id, "overdue");
          result.statusUpdates++;
          result.details.push(`Task ID ${task.id} ("${task.title}") transitioned to OVERDUE`);
        }
        if (diffDays === -1 || diffDays % 7 === 0) {
          await notifyComplianceDeadline(
            task.title,
            task.dueDate,
            task.user_email,
            task.user_phone || "",
            task.user_name,
            "overdue",
            diffDays,
            task.user_id
          );
          result.notificationsSent++;
          result.details.push(`Sent OVERDUE notification for "${task.title}" to ${task.user_email}`);
        }
      } else if (diffDays === 0) {
        await notifyComplianceDeadline(
          task.title,
          task.dueDate,
          task.user_email,
          task.user_phone || "",
          task.user_name,
          "upcoming",
          0,
          task.user_id
        );
        result.notificationsSent++;
        result.details.push(`Sent DUE TODAY notification for "${task.title}" to ${task.user_email}`);
      } else if (offsets.includes(diffDays)) {
        await notifyComplianceDeadline(
          task.title,
          task.dueDate,
          task.user_email,
          task.user_phone || "",
          task.user_name,
          "upcoming",
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
function initScheduler() {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1e3;
  setTimeout(() => {
    console.log("Running initial compliance scheduler scan...");
    runComplianceScan();
  }, 3e4);
  setInterval(() => {
    console.log("Running daily compliance scheduler scan...");
    runComplianceScan();
  }, TWENTY_FOUR_HOURS);
}

// server/routes/auth.routes.ts
import { Router } from "express";

// server/models/user.model.ts
async function findUserByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) return null;
  return rows[0];
}
async function findUserById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, phone, avatar, company_name, address, gstin, notification_prefs, created_at FROM users WHERE id = ?",
    [id]
  );
  if (rows.length === 0) return null;
  return rows[0];
}
async function createUser(user) {
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password, role, avatar, phone, company_name, address, gstin, notification_prefs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      user.name,
      user.email,
      user.password,
      user.role || "user",
      user.avatar || null,
      user.phone || null,
      user.company_name || null,
      user.address || null,
      user.gstin || null,
      user.notification_prefs || JSON.stringify({ email: true, sms: false })
    ]
  );
  return result.insertId;
}
async function updateUserAvatar(id, avatarUrl) {
  const [result] = await pool.execute("UPDATE users SET avatar = ? WHERE id = ?", [avatarUrl, id]);
  return result.affectedRows > 0;
}
async function listAllUsers() {
  const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY id ASC");
  return rows;
}
async function updateUserRole(id, role) {
  const [result] = await pool.execute('UPDATE users SET role = ? WHERE id = ? AND role != "super_admin"', [role, id]);
  return result.affectedRows > 0;
}

// server/utils/security.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "deccan-filings-secret-key-123";
var JWT_EXPIRES_IN = "1h";
async function hashPassword(password) {
  return bcrypt2.hash(password, 10);
}
async function comparePassword(password, hashed) {
  return bcrypt2.compare(password, hashed);
}
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// server/services/auth.service.ts
async function register(userData) {
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw { status: 400, message: "Email address is already in use" };
  }
  const hashedPassword = await hashPassword(userData.password);
  const userId = await createUser({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: "user",
    // Default register role is user
    phone: userData.phone || null,
    company_name: userData.companyName || null,
    address: userData.address || null,
    gstin: userData.gstin || null
  });
  const user = await findUserById(userId);
  if (!user) {
    throw { status: 500, message: "Failed to retrieve created user profile" };
  }
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company_name: user.company_name
    },
    token
  };
}
async function login(credentials) {
  const user = await findUserByEmail(credentials.email);
  if (!user || !user.password) {
    throw { status: 401, message: "Invalid email or password" };
  }
  const passwordMatch = await comparePassword(credentials.password, user.password);
  if (!passwordMatch) {
    throw { status: 401, message: "Invalid email or password" };
  }
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company_name: user.company_name
    },
    token
  };
}

// server/schemas/validation.schema.ts
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validateRegister(body) {
  const errors = {};
  if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  }
  if (!body.email || typeof body.email !== "string" || !validateEmail(body.email)) {
    errors.email = "A valid email address is required";
  }
  if (!body.password || typeof body.password !== "string" || body.password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
function validateLogin(body) {
  const errors = {};
  if (!body.email || typeof body.email !== "string" || !validateEmail(body.email)) {
    errors.email = "A valid email address is required";
  }
  if (!body.password || typeof body.password !== "string") {
    errors.password = "Password is required";
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
function validateOrder(body) {
  const errors = {};
  if (!body.serviceId && !body.service) {
    errors.service = "Service ID or Service name is required";
  }
  if (body.quantity !== void 0 && (typeof body.quantity !== "number" || body.quantity <= 0)) {
    errors.quantity = "Quantity must be a positive integer";
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
function validateService(body, isUpdate = false) {
  const errors = {};
  if (!isUpdate) {
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      errors.name = "Service name is required";
    }
    if (!body.category || typeof body.category !== "string" || body.category.trim().length === 0) {
      errors.category = "Category is required";
    }
    if (body.price === void 0 || isNaN(parseFloat(body.price)) || parseFloat(body.price) < 0) {
      errors.price = "Price is required and must be a non-negative number";
    }
  } else {
    if (body.name !== void 0 && (typeof body.name !== "string" || body.name.trim().length === 0)) {
      errors.name = "Service name cannot be empty";
    }
    if (body.category !== void 0 && (typeof body.category !== "string" || body.category.trim().length === 0)) {
      errors.category = "Category cannot be empty";
    }
    if (body.price !== void 0 && (isNaN(parseFloat(body.price)) || parseFloat(body.price) < 0)) {
      errors.price = "Price must be a non-negative number";
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
var VALID_STATUSES = ["placed", "in_progress", "completed", "rejected"];
function validateOrderStatus(status) {
  const errors = {};
  const normalized = status ? status.toLowerCase() : "";
  if (!VALID_STATUSES.includes(normalized)) {
    errors.status = `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`;
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// server/middlewares/auth.ts
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Access denied. Malformed token." });
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({ error: "Forbidden. You do not have permission to access this resource." });
    }
    next();
  };
}
var requireAdmin = requireRole(["admin", "super_admin"]);
var requireSuperAdmin = requireRole(["super_admin"]);

// server/routes/auth.routes.ts
import { OAuth2Client } from "google-auth-library";
import jwt2 from "jsonwebtoken";
import bcrypt3 from "bcryptjs";
var router = Router();
var JWT_SECRET2 = process.env.JWT_SECRET || "deccan-filings-secret-key-123";
async function logActivity(userId, action, details) {
  try {
    const user = await findUserById(userId);
    await pool.execute(
      "INSERT INTO activity_log (user_id, action, details, user_name, user_email) VALUES (?, ?, ?, ?, ?)",
      [userId, action, details, user?.name || "System", user?.email || ""]
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
router.post("/register", async (req, res, next) => {
  try {
    const validation = validateRegister(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", details: validation.errors });
    }
    const result = await register(req.body);
    await logActivity(result.user.id, "REGISTER", "Registered new user account");
    return res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", details: validation.errors });
    }
    const result = await login(req.body);
    await logActivity(result.user.id, "LOGIN", "Logged into user portal");
    return res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});
router.post("/google", async (req, res, next) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Google credential token is required" });
  }
  try {
    let email;
    let name;
    let picture;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID" || credential.startsWith("mock_token_")) {
      console.log("[GOOGLE-AUTH-MOCK] Bypassing Google verification for local testing.");
      if (credential.startsWith("mock_token_")) {
        const parts = credential.split("_");
        email = parts[2] || "mockuser@example.com";
        name = parts[3] ? `${parts[3]} ${parts[4] || ""}`.trim() : "Mock User";
        picture = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
      } else {
        email = "mockuser@example.com";
        name = "Mock User";
        picture = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
      }
    } else {
      if (credential.split(".").length === 3) {
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: clientId
        });
        const payload = ticket.getPayload();
        if (!payload) {
          return res.status(400).json({ error: "Invalid Google credential payload" });
        }
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
      } else {
        try {
          const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${credential}` }
          });
          if (userinfoRes.ok) {
            const payload = await userinfoRes.json();
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
          } else {
            return res.status(400).json({ error: "Invalid Google access token" });
          }
        } catch (e) {
          return res.status(500).json({ error: "Failed to verify access token with Google", details: e.message });
        }
      }
    }
    if (!email) {
      return res.status(400).json({ error: "Google account does not provide an email" });
    }
    let user = await findUserByEmail(email);
    if (user) {
      if (!user.avatar && picture) {
        await updateUserAvatar(user.id, picture);
        user.avatar = picture;
      }
    } else {
      const dummyPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt3.hash(dummyPassword, 10);
      const userId = await createUser({
        name: name || "Google User",
        email,
        password: hashedPassword,
        avatar: picture || null,
        role: "user"
      });
      user = await findUserById(userId);
      await logActivity(userId, "REGISTER_GOOGLE", "Registered using Google OAuth");
    }
    if (!user) {
      return res.status(500).json({ error: "Failed to create user from Google profile." });
    }
    await logActivity(user.id, "LOGIN_GOOGLE", "Signed in using Google OAuth");
    const token = jwt2.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET2, { expiresIn: "1h" });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (error) {
    console.error("Google Auth route error:", error);
    return res.status(500).json({ error: "Google Authentication failed", details: error.message });
  }
});
router.get("/me", authenticate, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }
    return res.json(user);
  } catch (error) {
    next(error);
  }
});
var auth_routes_default = router;

// server/routes/service.routes.ts
import { Router as Router2 } from "express";

// server/models/service.model.ts
async function listAllServices() {
  const [rows] = await pool.query("SELECT * FROM services ORDER BY category ASC, name ASC");
  return rows.map((r) => ({ ...r, price: parseFloat(r.price) }));
}
async function findServiceById(id) {
  const [rows] = await pool.query("SELECT * FROM services WHERE id = ?", [id]);
  if (rows.length === 0) return null;
  const res = rows[0];
  res.price = parseFloat(res.price);
  return res;
}
async function findServiceByCode(code) {
  const [rows] = await pool.query("SELECT * FROM services WHERE code = ?", [code]);
  if (rows.length === 0) return null;
  const res = rows[0];
  res.price = parseFloat(res.price);
  return res;
}
async function findServiceByName(name) {
  const [rows] = await pool.query("SELECT * FROM services WHERE LOWER(name) = LOWER(?)", [name.trim()]);
  if (rows.length > 0) {
    const res = rows[0];
    res.price = parseFloat(res.price);
    return res;
  }
  const [allRows] = await pool.query("SELECT * FROM services");
  const normalize = (s) => s.toLowerCase().replace(/ registration/g, "").replace(/ certification/g, "").replace(/ certificate/g, "").replace(/ services/g, "").replace(/ service/g, "").replace(/ setup/g, "").replace(/ & /g, " and ").replace(/ and /g, " & ").replace(/ firm/g, "").replace(/ company/g, "").replace(/ limited/g, "").replace(/ incorporation/g, "").replace(/ filing/g, "").replace(/ filings/g, "").replace(/ - /g, " ").replace(/-/g, " ").replace(/\(.*\)/g, "").replace(/[^a-z0-9]/g, "").trim();
  const normTarget = normalize(name);
  for (const row of allRows) {
    const normRow = normalize(row.name);
    if (normRow === normTarget || normRow.includes(normTarget) || normTarget.includes(normRow)) {
      row.price = parseFloat(row.price);
      return row;
    }
  }
  return null;
}
async function createService(service) {
  const [result] = await pool.execute(
    `INSERT INTO services (code, name, slug, category, description, price, mode, turnaround_time, is_recurring, compliance_type, recurring_frequency, standard_due_rule, reminder_offsets, documents_required)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      service.code,
      service.name,
      service.slug,
      service.category,
      service.description || null,
      service.price,
      service.mode || "Online",
      service.turnaround_time || "3-5 days",
      service.is_recurring || "No",
      service.compliance_type || null,
      service.recurring_frequency || null,
      service.standard_due_rule || "No statutory deadline",
      service.reminder_offsets || "7,3,1 days",
      service.documents_required || null
    ]
  );
  return result.insertId;
}
async function updateService(id, service) {
  const [result] = await pool.execute(
    "UPDATE services SET name = COALESCE(?, name), category = COALESCE(?, category), description = COALESCE(?, description), price = COALESCE(?, price), standard_due_rule = COALESCE(?, standard_due_rule) WHERE id = ?",
    [
      service.name !== void 0 ? service.name : null,
      service.category !== void 0 ? service.category : null,
      service.description !== void 0 ? service.description : null,
      service.price !== void 0 ? service.price : null,
      service.standard_due_rule !== void 0 ? service.standard_due_rule : null,
      id
    ]
  );
  return result.affectedRows > 0;
}

// server/services/service.service.ts
async function getServicesCatalog() {
  return listAllServices();
}
async function getServiceDetails(id) {
  const service = await findServiceById(id);
  if (!service) {
    throw { status: 404, message: `Service with ID ${id} not found.` };
  }
  return service;
}
async function addNewService(serviceData) {
  const existingService = await findServiceByCode(serviceData.code);
  if (existingService) {
    throw { status: 400, message: `Service code ${serviceData.code} already exists.` };
  }
  const slug = generateSlug(serviceData.name);
  const existingSlug = await findServiceById(serviceData.id || 0);
  return createService({
    code: serviceData.code,
    name: serviceData.name,
    slug,
    category: serviceData.category,
    description: serviceData.description,
    price: parseFloat(serviceData.price),
    mode: serviceData.mode,
    turnaround_time: serviceData.turnaroundTime,
    is_recurring: serviceData.isRecurring,
    compliance_type: serviceData.complianceType,
    recurring_frequency: serviceData.recurringFrequency,
    standard_due_rule: serviceData.standardDueRule,
    reminder_offsets: serviceData.reminderOffsets,
    documents_required: serviceData.documentsRequired
  });
}
async function updateServiceDetails(id, updateData) {
  const service = await findServiceById(id);
  if (!service) {
    throw { status: 404, message: `Service with ID ${id} not found.` };
  }
  return updateService(id, {
    name: updateData.name,
    category: updateData.category,
    description: updateData.description,
    price: updateData.price !== void 0 ? parseFloat(updateData.price) : void 0,
    standard_due_rule: updateData.standardDueRule
  });
}

// server/routes/service.routes.ts
var router2 = Router2();
router2.get("/", async (req, res, next) => {
  try {
    const services = await getServicesCatalog();
    return res.json(services);
  } catch (error) {
    next(error);
  }
});
router2.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid service ID format" });
    }
    const service = await getServiceDetails(id);
    return res.json(service);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});
var service_routes_default = router2;

// server/routes/order.routes.ts
import { Router as Router3 } from "express";

// server/models/order.model.ts
async function createOrderWithItems(userId, items) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const datePrefix = `${year}${month}${day}`;
    const orderIdLike = `DCF-${datePrefix}-%`;
    const [latestRows] = await connection.query(
      "SELECT id FROM orders WHERE id LIKE ? ORDER BY id DESC LIMIT 1 FOR UPDATE",
      [orderIdLike]
    );
    let nextIndex = 1;
    if (latestRows.length > 0) {
      const latestId = latestRows[0].id;
      const parts = latestId.split("-");
      const currentIndexStr = parts[parts.length - 1];
      const currentIndex = parseInt(currentIndexStr, 10);
      if (!isNaN(currentIndex)) {
        nextIndex = currentIndex + 1;
      }
    }
    const suffix = String(nextIndex).padStart(4, "0");
    const orderId = `DCF-${datePrefix}-${suffix}`;
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.priceAtPurchase * item.quantity;
    }
    await connection.execute(
      "INSERT INTO orders (id, user_id, status, total_amount) VALUES (?, ?, ?, ?)",
      [orderId, userId, "placed", totalAmount]
    );
    for (const item of items) {
      await connection.execute(
        "INSERT INTO order_items (order_id, service_id, price_at_purchase, quantity) VALUES (?, ?, ?, ?)",
        [orderId, item.serviceId, item.priceAtPurchase, item.quantity]
      );
    }
    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    console.error("Failed to execute order placement transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
}
async function findOrderById(orderId) {
  const [rows] = await pool.query(
    `SELECT o.*, u.name as user_name, u.email as user_email 
     FROM orders o 
     JOIN users u ON o.user_id = u.id 
     WHERE o.id = ?`,
    [orderId]
  );
  if (rows.length === 0) return null;
  const order = rows[0];
  order.total_amount = parseFloat(order.total_amount);
  return order;
}
async function getOrderItems(orderId) {
  const [rows] = await pool.query(
    `SELECT oi.*, s.name as service_name, s.code as service_code 
     FROM order_items oi 
     JOIN services s ON oi.service_id = s.id 
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows.map((r) => ({ ...r, price_at_purchase: parseFloat(r.price_at_purchase) }));
}
async function listUserOrders(userId, startDate, endDate) {
  let sql = `
    SELECT o.*, 
      (SELECT GROUP_CONCAT(s.name SEPARATOR ', ') 
       FROM order_items oi 
       JOIN services s ON oi.service_id = s.id 
       WHERE oi.order_id = o.id) as service_names
    FROM orders o
    WHERE o.user_id = ?
  `;
  const params = [userId];
  if (startDate && endDate) {
    sql += " AND o.created_at >= ? AND o.created_at <= ?";
    params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  }
  sql += " ORDER BY o.created_at DESC";
  const [rows] = await pool.query(sql, params);
  return rows.map((r) => ({ ...r, total_amount: parseFloat(r.total_amount) }));
}
async function listAllOrders(startDate, endDate) {
  let sql = `
    SELECT o.*, u.name as user_name, u.email as user_email,
      (SELECT GROUP_CONCAT(s.name SEPARATOR ', ') 
       FROM order_items oi 
       JOIN services s ON oi.service_id = s.id 
       WHERE oi.order_id = o.id) as service_names
    FROM orders o
    JOIN users u ON o.user_id = u.id
  `;
  const params = [];
  if (startDate && endDate) {
    sql += " WHERE o.created_at >= ? AND o.created_at <= ?";
    params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  }
  sql += " ORDER BY o.created_at DESC";
  const [rows] = await pool.query(sql, params);
  return rows.map((r) => ({ ...r, total_amount: parseFloat(r.total_amount) }));
}
async function updateOrderStatus(orderId, status) {
  const [result] = await pool.execute("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
  return result.affectedRows > 0;
}
async function updateOrderAmountAndItems(orderId, amount) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orderResult] = await connection.execute(
      "UPDATE orders SET total_amount = ? WHERE id = ?",
      [amount, orderId]
    );
    await connection.execute(
      "UPDATE order_items SET price_at_purchase = ? WHERE order_id = ?",
      [amount, orderId]
    );
    await connection.commit();
    return orderResult.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error("Failed to update order amount and items:", error);
    throw error;
  } finally {
    connection.release();
  }
}
async function deleteOrderRecord(orderId) {
  const [result] = await pool.execute("DELETE FROM orders WHERE id = ?", [orderId]);
  return result.affectedRows > 0;
}

// server/services/order.service.ts
function getCategoryForService(name) {
  const lower = name.toLowerCase();
  if (lower.includes("proprietorship") || lower.includes("partnership") || lower.includes("company") || lower.includes("llp") || lower.includes("subsidiary") || lower.includes("nidhi") || lower.includes("trust")) {
    return "Startup";
  }
  if (lower.includes("gst") || lower.includes("gstr") || lower.includes("lut")) {
    return "GST";
  }
  if (lower.includes("trademark") || lower.includes("logo") || lower.includes("design") || lower.includes("copyright") || lower.includes("patent")) {
    return "Trademark";
  }
  if (lower.includes("itr") || lower.includes("tax") || lower.includes("tds") || lower.includes("15ca") || lower.includes("15cb") || lower.includes("form 16")) {
    return "Income Tax";
  }
  if (lower.includes("mca") || lower.includes("roc") || lower.includes("dir-") || lower.includes("director")) {
    return "MCA";
  }
  if (lower.includes("pf") || lower.includes("esi") || lower.includes("payroll") || lower.includes("attendance") || lower.includes("bookkeeping") || lower.includes("financial statement") || lower.includes("compliance")) {
    return "Compliance";
  }
  if (lower.includes("loan") || lower.includes("insurance") || lower.includes("mutual fund")) {
    return "Finance";
  }
  if (lower.includes("uae") || lower.includes("usa") || lower.includes("uk") || lower.includes("singapore") || lower.includes("foreign")) {
    return "Global";
  }
  return "More Services";
}
async function checkout(userId, payload) {
  const quantity = payload.quantity || 1;
  let service = null;
  if (payload.serviceId) {
    service = await findServiceById(payload.serviceId);
  } else if (payload.service) {
    service = await findServiceByName(payload.service);
    if (!service) {
      const category = getCategoryForService(payload.service);
      const prefixMap = {
        "Startup": "START",
        "Registrations": "REG",
        "Trademark": "TM",
        "GST": "GST",
        "Income Tax": "IT",
        "MCA": "MCA",
        "Compliance": "COMP",
        "Finance": "FIN",
        "Global": "GLOB",
        "More Services": "MORE"
      };
      const prefix = prefixMap[category] || "MORE";
      const code = `${prefix}${Date.now().toString().slice(-4)}`;
      let price = 2999;
      if (payload.amount) {
        const cleanAmount = payload.amount.replace(/[^0-9.]/g, "");
        const parsedPrice = parseFloat(cleanAmount);
        if (!isNaN(parsedPrice)) {
          price = parsedPrice;
        }
      }
      const newServiceId = await createService({
        code,
        name: payload.service,
        slug: generateSlug(payload.service),
        category,
        price,
        description: `Professional service for ${payload.service}`
      });
      service = await findServiceById(newServiceId);
    }
  }
  if (!service) {
    throw { status: 400, message: "Invalid service selected." };
  }
  const items = [
    {
      serviceId: service.id,
      priceAtPurchase: service.price,
      quantity
    }
  ];
  const orderId = await createOrderWithItems(userId, items);
  triggerOrderNotification(userId, orderId, service.name, service.price * quantity);
  return orderId;
}
async function getClientOrders(userId, startDate, endDate) {
  const dbOrders = await listUserOrders(userId, startDate, endDate);
  return dbOrders.map(mapToLegacyOrder);
}
async function getAllClientOrders(startDate, endDate) {
  const dbOrders = await listAllOrders(startDate, endDate);
  return dbOrders.map(mapToLegacyOrder);
}
async function changeOrderStatus(orderId, status) {
  const order = await findOrderById(orderId);
  if (!order) {
    throw { status: 404, message: `Order ${orderId} not found.` };
  }
  const success = await updateOrderStatus(orderId, status);
  if (success) {
    triggerStatusChangeNotification(order.user_id, orderId, status);
  }
  return success;
}
async function triggerOrderNotification(userId, orderId, serviceName, amount) {
  try {
    const user = await findUserById(userId);
    if (user) {
      await notifyOrderPlacement(
        orderId,
        user.email,
        user.phone || "",
        user.name,
        serviceName,
        amount,
        userId
      );
    }
  } catch (err) {
    console.error("Failed to trigger order creation notification:", err);
  }
}
async function triggerStatusChangeNotification(userId, orderId, status) {
  try {
    const user = await findUserById(userId);
    if (user) {
      await notifyOrderStatusChange(
        orderId,
        status,
        user.email,
        user.phone || "",
        user.name,
        userId
      );
    }
  } catch (err) {
    console.error("Failed to trigger status change notification:", err);
  }
}
function mapToLegacyOrder(dbOrder) {
  return {
    id: dbOrder.id,
    user_name: dbOrder.user_name,
    user_email: dbOrder.user_email,
    service: dbOrder.service_names || "General Filing Services",
    date: dbOrder.created_at ? formatLegacyDate(new Date(dbOrder.created_at)) : formatLegacyDate(/* @__PURE__ */ new Date()),
    amount: formatCurrency(dbOrder.total_amount),
    status: dbOrder.status === "placed" ? "Placed" : dbOrder.status === "in_progress" ? "Processing" : dbOrder.status === "completed" ? "Completed" : "Action Required"
  };
}

// server/routes/order.routes.ts
var router3 = Router3();
router3.use(authenticate);
router3.post("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const validation = validateOrder(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", details: validation.errors });
    }
    const orderId = await checkout(req.user.id, req.body);
    const dbOrder = await findOrderById(orderId);
    const dbItems = await getOrderItems(orderId);
    const formatted = mapToLegacyOrder({
      ...dbOrder,
      service_names: dbItems.map((i) => i.service_name).join(", ")
    });
    return res.status(201).json({
      message: "Order created successfully",
      orderId,
      order: formatted
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});
router3.get("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { startDate, endDate } = req.query;
    const orders = await getClientOrders(
      req.user.id,
      startDate,
      endDate
    );
    return res.json(orders);
  } catch (error) {
    next(error);
  }
});
router3.get("/my", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { startDate, endDate } = req.query;
    const orders = await getClientOrders(
      req.user.id,
      startDate,
      endDate
    );
    return res.json(orders);
  } catch (error) {
    next(error);
  }
});
router3.get("/:order_id", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const orderId = req.params.order_id;
    const order = await findOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: `Order with ID ${orderId} not found.` });
    }
    if (order.user_id !== req.user.id && req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden. You do not own this order." });
    }
    const items = await getOrderItems(orderId);
    return res.json({
      ...order,
      items
    });
  } catch (error) {
    next(error);
  }
});
var order_routes_default = router3;

// server/routes/admin.routes.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.use(authenticate);
router4.use(requireAdmin);
router4.get("/orders", async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const orders = await getAllClientOrders(
      startDate,
      endDate
    );
    return res.json(orders);
  } catch (error) {
    next(error);
  }
});
router4.put("/orders/:order_id", async (req, res, next) => {
  try {
    let { status, amount } = req.body;
    const orderId = req.params.order_id;
    if (status !== void 0) {
      const normalized = status.toLowerCase();
      if (normalized === "processing") status = "in_progress";
      else if (normalized === "action required") status = "rejected";
      else if (normalized === "completed") status = "completed";
      else if (normalized === "placed") status = "placed";
      const validation = validateOrderStatus(status);
      if (!validation.isValid) {
        return res.status(400).json({ error: "Validation failed", details: validation.errors });
      }
      await changeOrderStatus(orderId, status);
    }
    if (amount !== void 0) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({ error: "Invalid amount value." });
      }
      await updateOrderAmountAndItems(orderId, numericAmount);
    }
    return res.json({ message: `Order ${orderId} updated successfully.` });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});
router4.patch("/orders/:order_id", async (req, res, next) => {
  try {
    let { status, amount } = req.body;
    const orderId = req.params.order_id;
    if (status !== void 0) {
      const normalized = status.toLowerCase();
      if (normalized === "processing") status = "in_progress";
      else if (normalized === "action required") status = "rejected";
      else if (normalized === "completed") status = "completed";
      else if (normalized === "placed") status = "placed";
      const validation = validateOrderStatus(status);
      if (!validation.isValid) {
        return res.status(400).json({ error: "Validation failed", details: validation.errors });
      }
      await changeOrderStatus(orderId, status);
    }
    if (amount !== void 0) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({ error: "Invalid amount value." });
      }
      await updateOrderAmountAndItems(orderId, numericAmount);
    }
    return res.json({ message: `Order ${orderId} updated successfully.` });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});
router4.patch("/orders/:order_id/status", async (req, res, next) => {
  try {
    let { status } = req.body;
    const normalized = status ? status.toLowerCase() : "";
    if (normalized === "processing") status = "in_progress";
    else if (normalized === "action required") status = "rejected";
    else if (normalized === "completed") status = "completed";
    else if (normalized === "placed") status = "placed";
    const validation = validateOrderStatus(status);
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", details: validation.errors });
    }
    const orderId = req.params.order_id;
    await changeOrderStatus(orderId, status);
    return res.json({ message: `Order ${orderId} status updated to ${status} successfully.` });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});
router4.delete("/orders/:order_id", async (req, res, next) => {
  try {
    const orderId = req.params.order_id;
    const success = await deleteOrderRecord(orderId);
    if (!success) {
      return res.status(404).json({ error: `Order ${orderId} not found.` });
    }
    return res.json({ message: `Order ${orderId} deleted successfully.` });
  } catch (error) {
    next(error);
  }
});
router4.post("/services", async (req, res, next) => {
  try {
    const validation = validateService(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", details: validation.errors });
    }
    const serviceId = await addNewService(req.body);
    const service = await findServiceById(serviceId);
    return res.status(201).json({
      message: "Service added successfully to catalog",
      service
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});
router4.put("/services/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid service ID format" });
    }
    const validation = validateService(req.body, true);
    if (!validation.isValid) {
      return res.status(400).json({ error: "Validation failed", details: validation.errors });
    }
    await updateServiceDetails(id, req.body);
    const service = await findServiceById(id);
    return res.json({
      message: "Service catalog record updated",
      service
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});
router4.post("/compliance/trigger-scan", async (req, res, next) => {
  try {
    const result = await runComplianceScan();
    return res.json({
      message: "Compliance scan executed successfully.",
      result
    });
  } catch (error) {
    next(error);
  }
});
router4.get("/compliance", async (req, res, next) => {
  try {
    const tasks = await listAllComplianceTasks();
    return res.json(tasks);
  } catch (error) {
    next(error);
  }
});
router4.post("/compliance", async (req, res, next) => {
  try {
    const { title, dueDate, type, penalty, userId, serviceId } = req.body;
    if (!title || !dueDate || !userId) {
      return res.status(400).json({ error: "Title, dueDate, and userId are required fields" });
    }
    const taskId = await createComplianceTask({
      title,
      dueDate,
      status: "upcoming",
      type: type || "Taxation",
      penalty: penalty || null,
      user_id: parseInt(userId, 10),
      service_id: serviceId ? parseInt(serviceId, 10) : void 0
    });
    const task = await findComplianceTaskById(taskId);
    return res.status(201).json({
      message: "Compliance task assigned to user successfully.",
      task
    });
  } catch (error) {
    next(error);
  }
});
router4.put("/compliance/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID format" });
    const { status } = req.body;
    if (!status || !["upcoming", "overdue", "completed"].includes(status)) {
      return res.status(400).json({ error: "Valid status must be provided" });
    }
    await updateComplianceTaskStatus(id, status);
    return res.json({ message: "Compliance task status updated successfully." });
  } catch (error) {
    next(error);
  }
});
router4.delete("/compliance/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID format" });
    await deleteComplianceTask(id);
    return res.json({ message: "Compliance task deleted." });
  } catch (error) {
    next(error);
  }
});
router4.get("/users", async (req, res, next) => {
  try {
    const users = await listAllUsers();
    return res.json(users);
  } catch (error) {
    next(error);
  }
});
var updateUserRoleHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid user ID format" });
    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role must be user or admin" });
    }
    const success = await updateUserRole(id, role);
    if (!success) {
      return res.status(400).json({ error: "Could not update user role. User may not exist or is a Super Admin." });
    }
    return res.json({ message: `User role modified to ${role}.` });
  } catch (error) {
    next(error);
  }
};
router4.put("/users/:id/role", requireSuperAdmin, updateUserRoleHandler);
router4.patch("/users/:id/role", requireSuperAdmin, updateUserRoleHandler);
var admin_routes_default = router4;

// server/routes/compliance.routes.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.use(authenticate);
router5.get("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const tasks = await listUserComplianceTasks(req.user.id);
    return res.json(tasks);
  } catch (error) {
    next(error);
  }
});
router5.post("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { title, dueDate, type, penalty } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ error: "Title and due date are required" });
    }
    const taskId = await createComplianceTask({
      title,
      dueDate,
      status: "upcoming",
      type: type || "ROC Compliance",
      penalty: penalty || null,
      user_id: req.user.id
    });
    const newTask = await findComplianceTaskById(taskId);
    return res.status(201).json({
      message: "Compliance task added successfully",
      task: newTask
    });
  } catch (error) {
    next(error);
  }
});
var compliance_routes_default = router5;

// server/routes/document.routes.ts
import { Router as Router6 } from "express";
import multer from "multer";
import path3 from "path";
import fs3 from "fs";
var router6 = Router6();
var uploadsDir = path3.join(process.cwd(), "uploads");
if (!fs3.existsSync(uploadsDir)) fs3.mkdirSync(uploadsDir, { recursive: true });
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path3.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});
var upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
async function logActivity2(userId, action, details) {
  try {
    const [users] = await pool.query("SELECT name, email FROM users WHERE id = ?", [userId]);
    const user = users[0];
    await pool.execute(
      "INSERT INTO activity_log (user_id, action, details, user_name, user_email) VALUES (?, ?, ?, ?, ?)",
      [userId, action, details, user?.name || "Unknown", user?.email || "Unknown"]
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
router6.use(authenticate);
router6.get("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const [documents] = await pool.query("SELECT * FROM documents WHERE user_id = ?", [req.user.id]);
    return res.json(documents);
  } catch (error) {
    next(error);
  }
});
router6.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { folder, order_id } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    const ext = path3.extname(file.originalname).slice(1).toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif"].includes(ext);
    const isPDF = ext === "pdf";
    if (isImage) {
      if (file.size < 50 * 1024) return res.status(400).json({ error: "Image must be at least 50 KB" });
      if (file.size > 100 * 1024) return res.status(400).json({ error: "Image must be below 100 KB" });
    } else if (isPDF) {
      if (file.size < 100 * 1024) return res.status(400).json({ error: "PDF must be at least 100 KB" });
      if (file.size > 200 * 1024) return res.status(400).json({ error: "PDF must be below 200 KB" });
    } else {
      return res.status(400).json({ error: "Only Images (50-100KB) and PDFs (100-200KB) are allowed" });
    }
    const typeMap = {
      pdf: "pdf",
      jpg: "image",
      jpeg: "image",
      png: "image",
      zip: "archive",
      rar: "archive",
      doc: "word",
      docx: "word"
    };
    const type = typeMap[ext] || ext;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const date = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    await pool.execute(
      "INSERT INTO documents (name, type, size, date, folder, file_path, order_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [file.originalname, type, sizeMB, date, folder || "General", file.filename, order_id || null, req.user.id]
    );
    await logActivity2(req.user.id, "UPLOAD", `Uploaded document: ${file.originalname}`);
    return res.status(201).json({ message: "Document uploaded successfully" });
  } catch (error) {
    next(error);
  }
});
router6.patch("/:id/rename", async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const [result] = await pool.execute(
      "UPDATE documents SET name = ? WHERE id = ? AND user_id = ?",
      [name, id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Document not found" });
    await logActivity2(req.user.id, "RENAME", `Renamed document (ID: ${id}) to: ${name}`);
    return res.json({ message: "Document renamed successfully" });
  } catch (error) {
    next(error);
  }
});
router6.get("/:id/file", async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const [rows] = await pool.query(
      "SELECT * FROM documents WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!rows.length || !rows[0].file_path) return res.status(404).json({ error: "File not found" });
    const filePath = path3.join(uploadsDir, rows[0].file_path);
    return res.download(filePath, rows[0].name);
  } catch (error) {
    next(error);
  }
});
router6.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const [rows] = await pool.query(
      "SELECT * FROM documents WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Document not found or unauthorized" });
    if (rows[0].file_path) {
      const filePath = path3.join(uploadsDir, rows[0].file_path);
      if (fs3.existsSync(filePath)) fs3.unlinkSync(filePath);
    }
    await pool.execute("DELETE FROM documents WHERE id = ? AND user_id = ?", [id, req.user.id]);
    await logActivity2(req.user.id, "DELETE", `Deleted document: ${rows[0].name} (ID: ${id})`);
    return res.json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
});
router6.get("/admin/list", requireAdmin, async (_req, res, next) => {
  try {
    const [documents] = await pool.query(
      `SELECT d.*, u.name as user_name, u.email as user_email 
       FROM documents d 
       JOIN users u ON d.user_id = u.id 
       ORDER BY d.id DESC`
    );
    return res.json(documents);
  } catch (error) {
    next(error);
  }
});
router6.patch("/admin/:id/rename", requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const [result] = await pool.execute("UPDATE documents SET name = ? WHERE id = ?", [name, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Document not found" });
    await logActivity2(req.user.id, "ADMIN_RENAME", `Admin renamed document (ID: ${id}) to: ${name}`);
    return res.json({ message: "Document renamed successfully" });
  } catch (error) {
    next(error);
  }
});
router6.delete("/admin/:id", requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const [rows] = await pool.query("SELECT * FROM documents WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Document not found" });
    if (rows[0].file_path) {
      const filePath = path3.join(uploadsDir, rows[0].file_path);
      if (fs3.existsSync(filePath)) fs3.unlinkSync(filePath);
    }
    await pool.execute("DELETE FROM documents WHERE id = ?", [id]);
    await logActivity2(req.user.id, "ADMIN_DELETE", `Admin deleted document: ${rows[0].name} (ID: ${id})`);
    return res.json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
});
router6.get("/admin/:id/file", requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM documents WHERE id = ?", [id]);
    if (!rows.length || !rows[0].file_path) return res.status(404).json({ error: "File not found" });
    const filePath = path3.join(uploadsDir, rows[0].file_path);
    return res.download(filePath, rows[0].name);
  } catch (error) {
    next(error);
  }
});
var document_routes_default = router6;

// server/routes/profile.routes.ts
import { Router as Router7 } from "express";
import multer2 from "multer";
import path4 from "path";
import fs4 from "fs";
import bcrypt4 from "bcryptjs";
var router7 = Router7();
var uploadsDir2 = path4.join(process.cwd(), "uploads");
var avatarsDir = path4.join(uploadsDir2, "avatars");
if (!fs4.existsSync(avatarsDir)) fs4.mkdirSync(avatarsDir, { recursive: true });
var avatarStorage = multer2.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const unique = `${req.user.id}-${Date.now()}`;
    const ext = path4.extname(file.originalname);
    cb(null, `avatar-${unique}${ext}`);
  }
});
var uploadAvatar = multer2({
  storage: avatarStorage,
  limits: { fileSize: 1024 * 1024 },
  // 1MB limit for avatars
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"), false);
  }
});
async function logActivity3(userId, action, details) {
  try {
    const [users] = await pool.query("SELECT name, email FROM users WHERE id = ?", [userId]);
    const user = users[0];
    await pool.execute(
      "INSERT INTO activity_log (user_id, action, details, user_name, user_email) VALUES (?, ?, ?, ?, ?)",
      [userId, action, details, user?.name || "Unknown", user?.email || "Unknown"]
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
router7.use(authenticate);
router7.get("/user/profile", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const [users] = await pool.query(
      "SELECT id, name, email, role, phone, avatar, company_name, address, gstin, notification_prefs FROM users WHERE id = ?",
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: "User not found" });
    const user = users[0];
    if (user.notification_prefs && typeof user.notification_prefs === "string") {
      try {
        user.notification_prefs = JSON.parse(user.notification_prefs);
      } catch (e) {
        user.notification_prefs = { email: true, sms: false };
      }
    } else if (!user.notification_prefs) {
      user.notification_prefs = { email: true, sms: false };
    }
    return res.json(user);
  } catch (error) {
    next(error);
  }
});
router7.patch("/user/profile", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { name, email, phone, company_name, address, gstin } = req.body;
    await pool.execute(
      "UPDATE users SET name = ?, email = ?, phone = ?, company_name = ?, address = ?, gstin = ? WHERE id = ?",
      [name, email, phone, company_name, address, gstin, req.user.id]
    );
    await logActivity3(req.user.id, "PROFILE_UPDATE", "Updated profile information");
    return res.json({ message: "Profile updated successfully" });
  } catch (error) {
    next(error);
  }
});
router7.patch("/user/password", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    const [users] = await pool.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    const user = users[0];
    const isMatch = await bcrypt4.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });
    const hashedPassword = await bcrypt4.hash(newPassword, 10);
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);
    await logActivity3(req.user.id, "PASSWORD_CHANGE", "Changed account password");
    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
});
router7.patch("/user/notifications", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { email, sms } = req.body;
    const prefs = JSON.stringify({ email, sms });
    await pool.execute("UPDATE users SET notification_prefs = ? WHERE id = ?", [prefs, req.user.id]);
    return res.json({ message: "Notification preferences updated" });
  } catch (error) {
    next(error);
  }
});
router7.post("/user/avatar", uploadAvatar.single("avatar"), async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.execute("UPDATE users SET avatar = ? WHERE id = ?", [avatarUrl, req.user.id]);
    await logActivity3(req.user.id, "AVATAR_UPDATE", "Uploaded new profile avatar");
    return res.json({ message: "Avatar updated successfully", avatarUrl });
  } catch (error) {
    next(error);
  }
});
router7.get("/invoices", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const [invoices] = await pool.query("SELECT * FROM invoices WHERE user_id = ?", [req.user.id]);
    return res.json(invoices);
  } catch (error) {
    next(error);
  }
});
router7.get("/stats/activity", async (req, res, next) => {
  try {
    const [stats] = await pool.query("SELECT name, requests FROM activity_stats ORDER BY id ASC");
    return res.json(stats);
  } catch (error) {
    next(error);
  }
});
router7.get("/stats/summary", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const [orderStats] = await pool.query(
      "SELECT status, COUNT(*) as count FROM orders WHERE user_id = ? GROUP BY status",
      [req.user.id]
    );
    const [docStats] = await pool.query(
      "SELECT COUNT(*) as count FROM documents WHERE user_id = ?",
      [req.user.id]
    );
    const summary = {
      activeOrders: 0,
      completed: 0,
      actionRequired: 0,
      totalDocuments: docStats[0].count
    };
    orderStats.forEach((s) => {
      if (s.status === "completed" || s.status === "Completed") {
        summary.completed += s.count;
      } else if (s.status === "rejected" || s.status === "Action Required") {
        summary.actionRequired += s.count;
      } else {
        summary.activeOrders += s.count;
      }
    });
    return res.json(summary);
  } catch (error) {
    next(error);
  }
});
router7.get("/admin/activity", requireSuperAdmin, async (_req, res, next) => {
  try {
    const [logs] = await pool.query("SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 200");
    return res.json(logs);
  } catch (error) {
    next(error);
  }
});
router7.patch("/admin/users/:id/password", requireSuperAdmin, async (req, res, next) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  try {
    const hashedPassword = await bcrypt4.hash(newPassword, 10);
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ? AND role != "super_admin"',
      [hashedPassword, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found or protected super_admin" });
    await logActivity3(req.user.id, "ADMIN_PASSWORD_RESET", `Admin reset password for user (ID: ${id})`);
    return res.json({ message: "User password reset successfully" });
  } catch (error) {
    next(error);
  }
});
var profile_routes_default = router7;

// server/middlewares/error.middleware.ts
function errorHandler(err, req, res, next) {
  console.error("Express Error Handler caught exception:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : void 0
  });
}

// server.ts
dotenv.config();
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  const uploadsDir3 = path5.join(process.cwd(), "uploads");
  if (!fs5.existsSync(uploadsDir3)) {
    fs5.mkdirSync(uploadsDir3, { recursive: true });
  }
  app.use((req, res, next) => {
    console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get(["/test", "/test/"], async (_req, res) => {
    try {
      const mysql2 = await import("mysql2/promise");
      let dbHost = process.env.DB_HOST || "localhost";
      const dbUser = process.env.DB_USER || "u149740700_DeccanFilings";
      const dbPassword = process.env.DB_PASSWORD || "DeccanFilings@2026";
      const dbName = process.env.DB_NAME || "u149740700_DeccanFilings";
      let dbPort = 3306;
      if (dbHost.includes("://")) {
        dbHost = dbHost.split("://")[1];
      }
      if (dbHost.includes(":")) {
        const parts = dbHost.split(":");
        dbHost = parts[0];
        const parsedPort = parseInt(parts[1], 10);
        if (!isNaN(parsedPort)) {
          dbPort = parsedPort;
        }
      }
      const connection = await mysql2.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        connectTimeout: 5e3
      });
      const [rows] = await connection.query("SELECT 1 + 1 AS test_result");
      let tablesList = [];
      try {
        const [tables] = await connection.query("SHOW TABLES");
        tablesList = tables.map((row) => Object.values(row)[0]);
      } catch (e) {
        tablesList = [`Warning: Could not fetch tables - ${e.message}`];
      }
      await connection.end();
      res.status(200).json({
        status: "success",
        message: "Successfully connected to the database server!",
        config: {
          host: dbHost,
          port: dbPort,
          user: dbUser,
          database: dbName
        },
        queryTest: `SELECT 1+1 returned ${rows[0].test_result}`,
        tables: tablesList
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to connect to the database!",
        errorMessage: error.message,
        errorCode: error.code || "N/A",
        syscall: error.syscall || "N/A"
      });
    }
  });
  app.use("/api/auth", auth_routes_default);
  app.use("/api/services", service_routes_default);
  app.use("/api/orders", order_routes_default);
  app.use("/api/admin", admin_routes_default);
  app.use("/api/compliance", compliance_routes_default);
  app.use("/api/documents", document_routes_default);
  app.use("/api", profile_routes_default);
  app.use("/uploads", express.static(uploadsDir3));
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path5.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path5.join(distPath, "index.html"));
    });
  }
  app.use(errorHandler);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`============================================================`);
    console.log(` Deccan Filings Backend Server Running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`============================================================`);
    setupDatabase().then(() => {
      console.log("Database initialized & catalog seeded successfully.");
      initScheduler();
    }).catch((err) => {
      console.error("CRITICAL: Database initialization failed:", err);
    });
  });
}
startServer();
