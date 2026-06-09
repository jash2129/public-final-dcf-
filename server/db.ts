import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { parseCSV, generateSlug } from './utils/helpers';

let rawPool: mysql.Pool | undefined = undefined;

// Export a proxy for the database pool that throws a descriptive error if accessed before connection is established
export const pool = new Proxy({} as mysql.Pool, {
  get(target, prop, receiver) {
    if (!rawPool) {
      throw new Error(
        "Database connection pool is not initialized. " +
        "This means the server failed to connect to your MySQL database on startup. " +
        "Please ensure your MySQL/MariaDB server is running (e.g. XAMPP locally or your Hostinger database) and check that your .env credentials are correct."
      );
    }
    const value = Reflect.get(rawPool, prop);
    if (typeof value === 'function') {
      return value.bind(rawPool);
    }
    return value;
  }
});

export async function setupDatabase(): Promise<mysql.Pool> {
  try {
    let dbHost = process.env.DB_HOST; //|| 'localhost';
    const dbUser = process.env.DB_USER;// || 'u149740700_DeccanFilings';
    const dbPassword = process.env.DB_PASSWORD;// || 'DeccanFilings@2026';
    const dbName = process.env.DB_NAME;// || 'u149740700_DeccanFilings';
    let dbPort = 3306;

    // Normalize dbHost if it was configured as a URI (e.g. http://127.0.0.1:3306)
    if (dbHost.includes('://')) {
      dbHost = dbHost.split('://')[1];
    }
    if (dbHost.includes(':')) {
      const parts = dbHost.split(':');
      dbHost = parts[0];
      const parsedPort = parseInt(parts[1], 10);
      if (!isNaN(parsedPort)) {
        dbPort = parsedPort;
      }
    }

    let initConnection;
    try {
      // Only attempt to run CREATE DATABASE if connecting as root (usually local development)
      if (dbUser === 'root') {
        initConnection = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          connectTimeout: 5000,
        });
        await initConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await initConnection.end();
      }
    } catch (err: any) {
      console.warn("WARNING: Could not connect to MySQL server to create database (normal on shared hosting if database already exists). Error:", err.message);
    }

    // Create the connection pool to the database
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
      keepAliveInitialDelay: 10000,
      connectTimeout: 10000
    });

    console.log("MySQL Connection Pool initialized.");

    // 1. Create users table
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

    // 2. Create services table
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

    // Migration check for legacy tables
    try {
      let needsMigration = false;

      // Check orders
      try {
        const [ordCols] = await pool.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM orders');
        if (!ordCols.some(c => c.Field === 'total_amount')) needsMigration = true;
      } catch (e) { }

      // Check compliance_tasks
      try {
        const [compCols] = await pool.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM compliance_tasks');
        if (!compCols.some(c => c.Field === 'service_id')) needsMigration = true;
      } catch (e) { }

      if (needsMigration) {
        console.log("Legacy tables detected (schema mismatch). Dropping tables for migration...");
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('DROP TABLE IF EXISTS order_items');
        await pool.query('DROP TABLE IF EXISTS compliance_tasks');
        await pool.query('DROP TABLE IF EXISTS documents');
        await pool.query('DROP TABLE IF EXISTS orders');
        await pool.query('DROP TABLE IF EXISTS invoices');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("Legacy tables dropped successfully.");
      }
    } catch (e) {
      // Ignore
    }

    // 3. Create orders table
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

    // 4. Create order_items table
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

    // 5. Create documents table
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

    // 6. Create invoices table
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

    // 7. Create compliance_tasks table
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

    // 8. Create activity_stats table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        requests INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB;
    `);

    // 9. Create activity_log table
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

    // Seed default admin accounts
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    const [adminRows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM users WHERE email = ?', ['admin@deccanfilings.com']);
    if (adminRows.length === 0) {
      await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['System Admin', 'admin@deccanfilings.com', hashedAdminPassword, 'admin']
      );
      console.log('Admin user seeded (admin@deccanfilings.com / admin123).');
    }

    const [superAdminRows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM users WHERE email = ?', ['superadmin@deccanfilings.com']);
    if (superAdminRows.length === 0) {
      await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Super Admin', 'superadmin@deccanfilings.com', hashedAdminPassword, 'super_admin']
      );
      console.log('Super Admin user seeded (superadmin@deccanfilings.com / admin123).');
    }

    // Database Seeding Engine: Parse CSV and populate Services catalog
    await seedServices();

    // Seed test orders, compliance, and stats for the first user if empty
    await seedTestData();

    return pool;
  } catch (error) {
    rawPool = undefined;
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Parses services CSV and seeds the database
 */
async function seedServices() {
  const [serviceCountRows] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM services');
  if (serviceCountRows[0].count > 0) {
    console.log(`Services catalog already seeded with ${serviceCountRows[0].count} entries.`);
    return;
  }

  try {
    const csvPath = path.join(process.cwd(), 'DF_knowledge_base_updated.csv');
    if (!fs.existsSync(csvPath)) {
      console.warn("WARNING: DF_knowledge_base_updated.csv not found in workspace root. Skipping CSV seeding.");
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const parsedRows = parseCSV(csvContent);
    console.log(`Parsed ${parsedRows.length} rows from services CSV.`);

    // Load due dates dictionary to enrich services
    const dueDatesPath = path.join(process.cwd(), 'due_date_rules.json');
    let dueDatesRules: any[] = [];
    if (fs.existsSync(dueDatesPath)) {
      try {
        dueDatesRules = JSON.parse(fs.readFileSync(dueDatesPath, 'utf-8'));
      } catch (e) {
        console.error("Failed to parse due_date_rules.json:", e);
      }
    }

    const dueDatesMap = new Map<string, { standard_due_rule: string; reminder_offsets: string }>();
    dueDatesRules.forEach((rule: any) => {
      dueDatesMap.set(rule.service_id, {
        standard_due_rule: rule.standard_due_rule,
        reminder_offsets: rule.reminder_offsets
      });
    });

    for (const row of parsedRows) {
      const code = row.service_id;
      const name = row.service_name;
      const category = row.category;

      // Clean and normalize price
      let price = parseFloat(row.price_inr);
      if (isNaN(price)) {
        price = 2999.00; // default backup price
      }

      if (!code || !name || !category) continue;

      const slug = generateSlug(name);
      const desc = row.ideal_customer ? `Ideal for: ${row.ideal_customer}. Turnaround: ${row.turnaround_time || 'N/A'}` : `Professional service for ${name}`;
      const mode = row.mode || 'Online';
      const tat = row.turnaround_time || '3-5 days';
      const recurring = row.is_recurring || 'No';
      const compType = row.compliance_type || '';
      const recFreq = row.recurring_frequency || '';

      const dueInfo = dueDatesMap.get(code);
      const standardDue = dueInfo?.standard_due_rule || row.standard_due_rule || 'No statutory deadline';
      const reminderOffsets = dueInfo?.reminder_offsets || row.reminder_offsets || '7,3,1 days';
      const docs = row.documents_required || '';

      await pool.execute(
        `INSERT INTO services (code, name, slug, category, description, price, mode, turnaround_time, is_recurring, compliance_type, recurring_frequency, standard_due_rule, reminder_offsets, documents_required) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [code, name, slug, category, desc, price, mode, tat, recurring, compType, recFreq, standardDue, reminderOffsets, docs]
      );
    }

    const [newCount] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM services');
    console.log(`Seeding complete. Loaded ${newCount[0].count} services into catalog.`);

  } catch (error) {
    console.error("Error during services database seeding:", error);
  }
}

/**
 * Seed compliance tasks and analytics logs for test workspace users
 */
async function seedTestData() {
  const [users] = await pool.query<mysql.RowDataPacket[]>('SELECT id FROM users LIMIT 1');
  const firstUserId = users.length > 0 ? users[0].id : null;
  if (!firstUserId) return;

  // Seed default compliance calendar data if empty
  const [compCount] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM compliance_tasks');
  if (compCount[0].count === 0) {
    const defaultTasks = [
      { title: 'GSTR-3B Filing (October)', dueDate: 'Nov 20, 2026', status: 'overdue', type: 'Taxation', penalty: '₹50/day' },
      { title: 'GSTR-1 Filing (November)', dueDate: 'Dec 11, 2026', status: 'upcoming', type: 'Taxation', penalty: null },
      { title: 'Advance Tax Payment (Q3)', dueDate: 'Dec 15, 2026', status: 'upcoming', type: 'Taxation', penalty: null },
      { title: 'Annual General Meeting (AGM)', dueDate: 'Sep 30, 2026', status: 'completed', type: 'ROC Compliance', penalty: null },
      { title: 'AOC-4 Filing', dueDate: 'Oct 29, 2026', status: 'completed', type: 'ROC Compliance', penalty: null }
    ];

    for (const t of defaultTasks) {
      await pool.execute(
        'INSERT INTO compliance_tasks (title, dueDate, status, type, penalty, user_id) VALUES (?, ?, ?, ?, ?, ?)',
        [t.title, t.dueDate, t.status, t.type, t.penalty, firstUserId]
      );
    }
    console.log('Compliance tasks seeded.');
  }

  // Seed Activity Stats
  const [statsCount] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM activity_stats');
  if (statsCount[0].count === 0) {
    const stats = [
      { name: 'Jan', requests: 4 },
      { name: 'Feb', requests: 3 },
      { name: 'Mar', requests: 5 },
      { name: 'Apr', requests: 7 },
      { name: 'May', requests: 6 },
      { name: 'Jun', requests: 9 },
      { name: 'Jul', requests: 12 }
    ];
    for (const s of stats) {
      await pool.execute('INSERT INTO activity_stats (name, requests) VALUES (?, ?)', [s.name, s.requests]);
    }
  }
}
