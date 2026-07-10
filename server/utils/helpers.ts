/**
 * General helper utilities for Deccan Filings
 */

/**
 * Format a number or numeric string to Indian Rupee currency format (e.g. ₹14,999)
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/**
 * Clean currency string to extract numeric value (e.g. "₹14,999" -> 14999)
 */
export function cleanCurrency(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse CSV content while respecting quoted fields containing commas
 */
export function parseCSV(content: string): Record<string, string>[] {
  const result: Record<string, string>[] = [];
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return result;

  const headers = parseCSVLine(lines[0]);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      const h = header.trim();
      if (h) {
        row[h] = values[index] !== undefined ? values[index].trim() : '';
      }
    });
    result.push(row);
  }
  return result;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result.map(v => {
    let clean = v.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.substring(1, clean.length - 1);
    }
    return clean.replace(/""/g, '"'); // Unescape double double-quotes
  });
}

/**
 * Helper to generate URL-safe service slug from service name
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Format date in legacy frontend format (e.g. "Oct 24, 2023")
 */
export function formatLegacyDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Standardize phone and whatsapp number fields to always include the +91 country code for Indian numbers.
 */
export function formatPhoneWithCountryCode(phone: any): string | null {
  if (phone === undefined || phone === null) return null;
  const cleaned = String(phone).trim().replace(/\s+/g, '').replace(/[-()]/g, '');
  if (!cleaned) return null;
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  return cleaned;
}
