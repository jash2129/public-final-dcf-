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
    let dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'deccan_filings';
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
        whatsapp_number VARCHAR(20) NULL,
        company_name VARCHAR(255) NULL,
        address TEXT NULL,
        gstin VARCHAR(20) NULL,
        notification_prefs TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reset_password_token VARCHAR(255) NULL,
        reset_password_expires DATETIME NULL,
        UNIQUE KEY idx_users_email (email),
        UNIQUE KEY idx_users_whatsapp_number (whatsapp_number)
      ) ENGINE=InnoDB;
    `);

    // Alter users table to add whatsapp_number if it doesn't exist (migration for existing db)
    try {
      const [cols] = await rawPool.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM users LIKE "whatsapp_number"');
      if (cols.length === 0) {
        console.log("Adding whatsapp_number column to users table...");
        await rawPool.query('ALTER TABLE users ADD COLUMN whatsapp_number VARCHAR(20) NULL UNIQUE');
        console.log("whatsapp_number column added successfully.");
      }
    } catch (e: any) {
      console.error("Failed to alter users table:", e.message);
    }

    // Alter users table to add reset_password_token if it doesn't exist (migration for existing db)
    try {
      const [cols] = await rawPool.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM users LIKE "reset_password_token"');
      if (cols.length === 0) {
        console.log("Adding reset_password_token column to users table...");
        await rawPool.query('ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255) NULL');
        console.log("reset_password_token column added successfully.");
      }
    } catch (e: any) {
      console.error("Failed to alter users table for reset_password_token:", e.message);
    }

    // Alter users table to add reset_password_expires if it doesn't exist (migration for existing db)
    try {
      const [cols] = await rawPool.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM users LIKE "reset_password_expires"');
      if (cols.length === 0) {
        console.log("Adding reset_password_expires column to users table...");
        await rawPool.query('ALTER TABLE users ADD COLUMN reset_password_expires DATETIME NULL');
        console.log("reset_password_expires column added successfully.");
      }
    } catch (e: any) {
      console.error("Failed to alter users table for reset_password_expires:", e.message);
    }

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
        base_price DECIMAL(10, 2) NULL,
        cgst DECIMAL(10, 2) NULL,
        sgst DECIMAL(10, 2) NULL,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        razorpay_order_id VARCHAR(255) NULL,
        razorpay_payment_id VARCHAR(255) NULL,
        razorpay_signature VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_orders_user_id (user_id),
        INDEX idx_orders_status (status),
        INDEX idx_orders_created_at (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    // Alter orders table to add payment status and razorpay columns if they do not exist
    try {
      const [cols] = await pool.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM orders LIKE "payment_status"');
      if (cols.length === 0) {
        console.log("Adding payment status and razorpay columns to orders table...");
        await pool.query(`
          ALTER TABLE orders 
          ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
          ADD COLUMN razorpay_order_id VARCHAR(255) NULL,
          ADD COLUMN razorpay_payment_id VARCHAR(255) NULL,
          ADD COLUMN razorpay_signature VARCHAR(255) NULL
        `);
        console.log("Payment and razorpay columns added successfully to orders table.");
      }
    } catch (e: any) {
      console.error("Failed to alter orders table:", e.message);
    }

    // Alter orders table to add base_price, cgst, and sgst columns if they do not exist
    try {
      const [cols] = await pool.query<mysql.RowDataPacket[]>('SHOW COLUMNS FROM orders LIKE "base_price"');
      if (cols.length === 0) {
        console.log("Adding base_price, cgst, and sgst columns to orders table...");
        await pool.query(`
          ALTER TABLE orders 
          ADD COLUMN base_price DECIMAL(10, 2) NULL,
          ADD COLUMN cgst DECIMAL(10, 2) NULL,
          ADD COLUMN sgst DECIMAL(10, 2) NULL
        `);
        console.log("base_price, cgst, and sgst columns added successfully to orders table.");
      }
    } catch (e: any) {
      console.error("Failed to alter orders table to add tax columns:", e.message);
    }

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

    // 10. Create blog_posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        author VARCHAR(100) NOT NULL DEFAULT 'Jay Reddy',
        date VARCHAR(50) NOT NULL,
        readTime VARCHAR(50) NOT NULL,
        image VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // Seed default blog posts
    await seedBlogPosts();

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
  try {
    const csvPath = path.join(process.cwd(), 'DF_knowledge_base_updated.csv');
    if (!fs.existsSync(csvPath)) {
      console.warn("WARNING: DF_knowledge_base_updated.csv not found in workspace root. Skipping CSV seeding.");
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const parsedRows = parseCSV(csvContent);
    console.log(`Starting database service catalog synchronization. Parsed ${parsedRows.length} rows from services CSV.`);

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

    const newCodes: string[] = [];

    for (const row of parsedRows) {
      const code = row['Service Code'] || row.service_id || row.code;
      const name = row['Service Name'] || row.service_name;
      const category = row['Category'] || row.category;

      if (!code || !name || !category) continue;

      newCodes.push(code);

      // Clean and normalize price
      let price = parseFloat(row.price_inr);
      if (isNaN(price)) {
        price = 2999.00; // default backup price
      }

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

      // Check if service code already exists
      const [existing] = await pool.query<mysql.RowDataPacket[]>(
        'SELECT id FROM services WHERE code = ?',
        [code]
      );

      if (existing.length > 0) {
        // Update name, slug, and category to synchronize configurations
        await pool.execute(
          'UPDATE services SET name = ?, slug = ?, category = ? WHERE code = ?',
          [name, slug, category, code]
        );
      } else {
        // Insert new service
        await pool.execute(
          `INSERT INTO services (code, name, slug, category, description, price, mode, turnaround_time, is_recurring, compliance_type, recurring_frequency, standard_due_rule, reminder_offsets, documents_required) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [code, name, slug, category, desc, price, mode, tat, recurring, compType, recFreq, standardDue, reminderOffsets, docs]
        );
      }
    }

    // Clean up obsolete services
    if (newCodes.length > 0) {
      try {
        const [obsoleteServices] = await pool.query<mysql.RowDataPacket[]>(
          'SELECT id, code FROM services WHERE code NOT IN (?)',
          [newCodes]
        );
        for (const service of obsoleteServices) {
          try {
            await pool.execute('DELETE FROM services WHERE id = ?', [service.id]);
            console.log(`Deleted obsolete service: ${service.code}`);
          } catch (deleteErr: any) {
            console.warn(`Could not delete obsolete service ${service.code} (it may have active orders referencing it). Error: ${deleteErr.message}`);
          }
        }
      } catch (e: any) {
        console.error("Failed to clean up obsolete services:", e.message);
      }
    }

    const [newCount] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM services');
    console.log(`Services catalog synchronization complete. Total database catalog entries: ${newCount[0].count}`);

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

/**
 * Seed default blog posts into MySQL if table is empty
 */
async function seedBlogPosts() {
  try {
    const [countRows] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM blog_posts');
    if (countRows[0].count > 0) {
      return;
    }

    const defaultBlogs = [
      {
        title: 'Understanding the New GST Regulations for E-commerce',
        excerpt: 'A comprehensive guide to the latest GST changes affecting e-commerce sellers in India and how to stay compliant.',
        category: 'GST',
        author: 'Jay Reddy',
        date: 'Oct 15, 2023',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        content: `<p class="text-lg text-slate-700 mb-6 leading-relaxed">The e-commerce landscape in India has grown exponentially over the past decade. However, with rapid growth comes the need for a robust regulatory framework. The Goods and Services Tax (GST) Council has introduced several critical updates aimed at simplifying compliance for small e-commerce operators while ensuring tax transparency.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">1. Relaxed Registration Norms for Small Sellers</h2><p class="text-slate-700 mb-4 leading-relaxed">Previously, anyone selling goods through an e-commerce platform was required to obtain a mandatory GST registration, regardless of their annual turnover. This was a significant barrier for micro-entrepreneurs.</p><p class="text-slate-700 mb-6 leading-relaxed">Under the new rules, suppliers selling goods through e-commerce operators are exempted from mandatory registration if their aggregate annual turnover does not exceed:</p><ul class="list-disc pl-6 mb-6 text-slate-700 space-y-2"><li><strong>INR 40 Lakhs</strong> for goods (INR 20 Lakhs in special category states).</li><li><strong>INR 20 Lakhs</strong> for services (INR 10 Lakhs in special category states).</li></ul><p class="text-slate-700 mb-6 leading-relaxed"><em>Note: This exemption only applies to intra-state (within the same state) transactions. If you plan to sell across state borders, a GST registration is still mandatory from day one.</em></p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">2. Reduction in TCS (Tax Collected at Source)</h2><p class="text-slate-700 mb-4 leading-relaxed">E-commerce operators (like Amazon, Flipkart, etc.) are required to collect TCS when making payments to sellers. The GST Council has rationalized the TCS rates to ease cash flows for small sellers.</p><p class="text-slate-700 mb-6 leading-relaxed">The overall TCS rate has been maintained at a low percentage, minimizing the working capital blockage that previously burdened online businesses. Sellers can easily claim credit for this TCS in their electronic cash ledger and use it to offset their output tax liability.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">3. Enrollment for Unregistered Sellers</h2><p class="text-slate-700 mb-4 leading-relaxed">Unregistered e-commerce sellers must obtain a unique **Enrollment Number** on the common GST portal before commencing sales. This serves as a tracking ID and ensures that unregistered individuals do not engage in inter-state supplies.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">Compliance Checklist for Online Sellers</h2><div class="bg-brand-lightest/30 border border-brand-light p-6 rounded-xl my-6"><h4 class="font-bold text-dark mb-3">Key Requirements to Remember:</h4><ul class="list-decimal pl-5 space-y-2 text-slate-700"><li>Monitor your annual turnover to ensure it remains below the registration threshold.</li><li>Apply for an Enrollment Number on the GST Portal if you choose to remain unregistered.</li><li>Only sell goods/services within your home state if unregistered.</li><li>Reconcile your sales records monthly with the TCS statements provided by e-commerce operators.</li></ul></div><h2 class="text-2xl font-bold text-dark mt-8 mb-4">Conclusion</h2><p class="text-slate-700 mb-4 leading-relaxed">These regulations represent a major step towards integrating small businesses into India's digital economy. By removing the immediate burden of GST registration for micro-sellers, the government has leveled the playing field. If your business is ready to scale or expand sales to other states, applying for a formal GST registration remains the best path forward.</p>`
      },
      {
        title: 'Top 5 Benefits of Registering a Private Limited Company',
        excerpt: 'Discover why a Private Limited Company is the preferred business structure for startups and growing businesses.',
        category: 'Startup',
        author: 'Jay Reddy',
        date: 'Oct 10, 2023',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        content: `<p class="text-lg text-slate-700 mb-6 leading-relaxed">Starting a new business is an exciting journey, but choosing the right legal structure is crucial. Among the various business entities in India, the Private Limited Company (Pvt Ltd) remains the gold standard for entrepreneurs aiming for rapid growth and long-term viability. Here are the top 5 reasons why.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">1. Limited Liability Protection</h2><p class="text-slate-700 mb-6 leading-relaxed">In a sole proprietorship or partnership, the personal assets of the owners (like their home, car, and bank accounts) are at risk if the business incurs debts. In a Private Limited Company, the liability of shareholders is limited to the amount they contributed to the share capital. If the business fails, your personal wealth remains safe and secure.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">2. Access to Venture Capital and Funding</h2><p class="text-slate-700 mb-6 leading-relaxed">If you plan to raise funds from Venture Capitalists (VCs) or Angel Investors, registering as a Private Limited Company is practically mandatory. VCs and professional investors prefer Pvt Ltd companies because they can easily issue equity shares in exchange for capital. Proprietorships and LLPs cannot offer shares, making them unattractive to external investors.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">3. Separate Legal Entity Status</h2><p class="text-slate-700 mb-6 leading-relaxed">A registered company is recognized as an independent legal person under the eyes of the law. This means it can buy property, take loans, enter into contracts, and sue or be sued in its own name. This separate identity builds tremendous trust and credibility with clients, suppliers, and partners.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">4. Perpetual Succession</h2><p class="text-slate-700 mb-6 leading-relaxed">A Private Limited Company has "unlimited life." It continues to exist until it is legally dissolved or wound up. The death, retirement, insanity, or transfer of ownership of any shareholder does not affect the existence of the company. It ensures business continuity across generations.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">5. Tax Benefits and Credibility</h2><p class="text-slate-700 mb-6 leading-relaxed">Private Limited Companies enjoy fixed corporate tax rates which are often lower than individual tax slabs for high-earning businesses. Additionally, having "Pvt Ltd" at the end of your brand name acts as a stamp of credibility, making it easier to secure corporate clients and attract top-tier talent.</p><div class="bg-brand-lightest/30 border border-brand-light p-6 rounded-xl my-6"><h4 class="font-bold text-dark mb-2">Ready to Register? Here is what you need:</h4><ul class="list-disc pl-5 space-y-1 text-slate-700"><li>Minimum 2 Directors (at least one must be an Indian resident).</li><li>Minimum 2 Shareholders.</li><li>A registered office address in India.</li><li>Digital Signature Certificates (DSC) for all directors.</li></ul></div>`
      },
      {
        title: 'How to Protect Your Brand with a Trademark',
        excerpt: 'Learn the step-by-step process of trademark registration in India and safeguard your intellectual property.',
        category: 'Trademark',
        author: 'Jay Reddy',
        date: 'Oct 05, 2023',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
        content: `<p class="text-lg text-slate-700 mb-6 leading-relaxed">Your brand is one of your most valuable business assets. It represents your reputation, values, and quality. If you do not legally protect it, competitor businesses can copy your name, logo, or slogan, resulting in confusion and loss of revenue. A Trademark Registration is your shield.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">What Can Be Trademarked?</h2><p class="text-slate-700 mb-4 leading-relaxed">A trademark can protect a wide range of brand elements, including:</p><ul class="list-disc pl-6 mb-6 text-slate-700 space-y-2"><li><strong>Brand Names:</strong> Like Nike or Apple.</li><li><strong>Logos and Icons:</strong> Like the golden arches of McDonald's or the Twitter bird.</li><li><strong>Slogans and Taglines:</strong> Like "Just Do It".</li><li><strong>Unique Shapes or Color Combinations:</strong> Associated distinctively with your product.</li></ul><h2 class="text-2xl font-bold text-dark mt-8 mb-4">The Trademark Registration Process in India</h2><p class="text-slate-700 mb-4 leading-relaxed">The path to securing a registered trademark involves five main phases:</p><h3 class="text-xl font-bold text-dark mt-6 mb-2">1. Trademark Search</h3><p class="text-slate-700 mb-4 leading-relaxed">Before filing, a comprehensive search must be conducted in the Trademark Registry database. This verifies if similar marks exist in the relevant trademark classes, preventing future objections.</p><h3 class="text-xl font-bold text-dark mt-6 mb-2">2. Filing the Application</h3><p class="text-slate-700 mb-4 leading-relaxed">Once cleared, a Form TM-A is submitted online. Upon successful submission, you can immediately begin using the <strong>TM</strong> symbol next to your logo.</p><h3 class="text-xl font-bold text-dark mt-6 mb-2">3. Examination and Objections</h3><p class="text-slate-700 mb-4 leading-relaxed">A Trademark Examiner reviews the application. If they find any issues (such as similarity to an existing mark or lack of distinctiveness), they issue an Examination Report with an objection. You must submit a professional written response within 30 days.</p><h3 class="text-xl font-bold text-dark mt-6 mb-2">4. Journal Publication</h3><p class="text-slate-700 mb-4 leading-relaxed">If accepted, the mark is advertised in the official Trademark Journal for 4 months. This allows the public to raise oppositions if they believe the mark infringes on their prior rights.</p><h3 class="text-xl font-bold text-dark mt-6 mb-2">5. Registration</h3><p class="text-slate-700 mb-6 leading-relaxed">If no oppositions are filed, the certificate is issued. You can now proudly use the <strong>R</strong> symbol. Trademark registration is valid for 10 years and can be renewed indefinitely.</p><div class="bg-brand-lightest/30 border border-brand-light p-6 rounded-xl my-6"><h4 class="font-bold text-dark mb-2">Why Professional Guidance Matters:</h4><p class="text-slate-700 text-sm leading-relaxed">Over 40% of trademark applications receive objections or oppositions. Working with a registered trademark agent or attorney ensures your search is accurate, your application is correctly classified, and replies to objections are drafted with sound legal precedents.</p></div>`
      },
      {
        title: 'Income Tax Return Filing: Common Mistakes to Avoid',
        excerpt: 'Ensure a smooth tax filing season by avoiding these common errors that could lead to notices or penalties.',
        category: 'Income Tax',
        author: 'Jay Reddy',
        date: 'Sep 28, 2023',
        readTime: '4 min read',
        image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
        content: `<p class="text-lg text-slate-700 mb-6 leading-relaxed">Filing Income Tax Returns (ITR) is a civic duty for citizens and businesses. While the Income Tax Department has simplified the digital filing process, mistakes are still surprisingly common. An error in your ITR can lead to processing delays, rejection of tax refunds, or even an audit notice.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">1. Selecting the Wrong ITR Form</h2><p class="text-slate-700 mb-6 leading-relaxed">Choosing the incorrect form is one of the most critical errors. For instance, using ITR-1 (Sahaj) when you have capital gains from stock trading or own more than one house property will make your return defective. Always review the criteria for ITR-1, ITR-2, ITR-3, and ITR-4 before proceeding.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">2. Ignoring the Annual Information Statement (AIS)</h2><p class="text-slate-700 mb-6 leading-relaxed">The tax department collects comprehensive data on your financial transactions, including high-value bank deposits, share purchases, mutual fund investments, and foreign remittances. This is compiled in your AIS and Tax Information Summary (TIS). Failing to report income listed in your AIS (such as bank savings interest or dividend income) will trigger an automatic notice.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">3. Mismatch with Form 26AS</h2><p class="text-slate-700 mb-6 leading-relaxed">Form 26AS records the Tax Deducted at Source (TDS) by employers, clients, or banks. Before submitting your return, make sure the TDS amounts declared in your ITR exactly match the values shown in Form 26AS. If there is a mismatch, you may not receive the tax credit you are entitled to.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">4. Forgetting to Verify the Return</h2><p class="text-slate-700 mb-6 leading-relaxed">Just clicking "Submit" on the portal is not enough. You must verify your return within 30 days of filing. This can be done instantly online using Aadhaar OTP, net banking, or electronic verification codes (EVC). If you fail to verify it, the tax department will treat your return as invalid, and you may face penalties for late filing.</p><div class="bg-brand-lightest/30 border border-brand-light p-6 rounded-xl my-6"><h4 class="font-bold text-dark mb-2">Pro-Tip for Fast Returns:</h4><p class="text-slate-700 text-sm leading-relaxed">Double-check your pre-validated bank account details. If your bank account is not pre-validated or has an incorrect IFSC code, the income tax department will not be able to credit your refund.</p></div>`
      },
      {
        title: 'Annual MCA Compliance Checklist for 2024',
        excerpt: 'Stay ahead of your corporate compliance requirements with our detailed MCA annual filing checklist.',
        category: 'MCA',
        author: 'Jay Reddy',
        date: 'Sep 20, 2023',
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        content: `<p class="text-lg text-slate-700 mb-6 leading-relaxed">Every registered company in India must comply with the guidelines set by the Ministry of Corporate Affairs (MCA). Failing to file corporate returns on time leads to heavy fines (up to Rs. 100 per day per form) and can result in the disqualification of directors. Let's look at the core annual requirements.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">The Non-Negotiable Filings</h2><h3 class="text-xl font-bold text-dark mt-6 mb-2">1. Form AOC-4 (Financial Statements)</h3><p class="text-slate-700 mb-4 leading-relaxed">This form is used to submit the company's audited balance sheet, profit and loss account, auditor report, and director report. It must be filed within 30 days of the company's Annual General Meeting (AGM).</p><h3 class="text-xl font-bold text-dark mt-6 mb-2">2. Form MGT-7 (Annual Return)</h3><p class="text-slate-700 mb-4 leading-relaxed">This document contains details about the company's shareholding structure, transfers of shares, list of directors, and details of board meetings held during the fiscal year. The deadline is within 60 days of the AGM.</p><h3 class="text-xl font-bold text-dark mt-6 mb-2">3. Form ADT-1 (Appointment of Auditor)</h3><p class="text-slate-700 mb-4 leading-relaxed">When an auditor is appointed or reappointed in the AGM, Form ADT-1 must be filed within 15 days of the meeting. This registration is valid for a block of five years.</p><h3 class="text-xl font-bold text-dark mt-6 mb-2">4. DIR-3 KYC (Director KYC)</h3><p class="text-slate-700 mb-4 leading-relaxed">All individuals holding a Director Identification Number (DIN) must complete their KYC verification annually, verifying their mobile numbers and email addresses. The typical deadline is September 30th of every year.</p><div class="bg-brand-lightest/30 border border-brand-light p-6 rounded-xl my-6"><h4 class="font-bold text-dark mb-2">Important Deadlines Table (Standard Financial Year):</h4><table class="w-full text-left text-sm mt-3 border-collapse"><thead><tr class="border-b border-slate-200 bg-white"><th class="py-2 font-bold text-dark">Requirement</th><th class="py-2 font-bold text-dark">Form Code</th><th class="py-2 font-bold text-dark">Standard Due Date</th></tr></thead><tbody class="divide-y divide-slate-100 text-slate-700"><tr><td class="py-2">Director KYC</td><td class="py-2">DIR-3 KYC</td><td class="py-2">September 30th</td></tr><tr><td class="py-2">Financial Statements</td><td class="py-2">AOC-4</td><td class="py-2">October 29th (30 days from AGM)</td></tr><tr><td class="py-2">Annual Return</td><td class="py-2">MGT-7</td><td class="py-2">November 29th (60 days from AGM)</td></tr></tbody></table></div><h2 class="text-2xl font-bold text-dark mt-8 mb-4">Board Meetings and Minutes</h2><p class="text-slate-700 mb-6 leading-relaxed">Apart from forms, companies must hold at least 4 Board Meetings in a calendar year, with a maximum gap of 120 days between consecutive meetings. Maintaining physical or digital minutes books of these discussions is legally mandatory.</p>`
      },
      {
        title: 'FDI in India: Opportunities and Regulations',
        excerpt: 'An overview of Foreign Direct Investment policies in India and how global businesses can enter the market.',
        category: 'Global',
        author: 'Jay Reddy',
        date: 'Sep 15, 2023',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
        content: `<p class="text-lg text-slate-700 mb-6 leading-relaxed">India is one of the most attractive investment destinations globally, thanks to its vast consumer market, talented workforce, and progressive economic reforms. For foreign enterprises looking to establish operations here, understanding the Foreign Direct Investment (FDI) guidelines is the first step.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">Entry Routes for FDI in India</h2><p class="text-slate-700 mb-4 leading-relaxed">Foreign investments enter India via one of two primary pathways:</p><h3 class="text-xl font-bold text-dark mt-6 mb-2">1. Automatic Route</h3><p class="text-slate-700 mb-4 leading-relaxed">Under this route, the foreign investor does not require prior approval from the Reserve Bank of India (RBI) or the Government of India. They only need to report the inflow of funds and issue of shares through RBI portals.</p><p class="text-slate-700 mb-4 leading-relaxed">Sectors offering 100% Automatic Route include:</p><ul class="list-disc pl-6 mb-4 text-slate-700 space-y-1"><li>Information Technology and software</li><li>Manufacturing (most categories)</li><li>Renewable energy</li><li>E-commerce marketplace model</li></ul><h3 class="text-xl font-bold text-dark mt-6 mb-2">2. Government Route</h3><p class="text-slate-700 mb-4 leading-relaxed">Investments in sensitive sectors require prior approval from the concerned government department or ministry. Applications are submitted online through the Foreign Investment Facilitation Portal (FIFP). This includes sectors like defense, print media, and multi-brand retail.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">FEMA and RBI Compliance</h2><p class="text-slate-700 mb-6 leading-relaxed">Once the foreign capital lands in India, the company must submit **Form FC-GPR (Foreign Collaboration-General Permission Route)** to the RBI within 30 days of issuing shares to the foreign investor. This filing requires a certified valuation report from a Chartered Accountant (CA) to prove shares were issued at fair market value.</p><h2 class="text-2xl font-bold text-dark mt-8 mb-4">Entry Structures</h2><p class="text-slate-700 mb-4 leading-relaxed">Foreign entities can select several corporate options:</p><ul class="list-disc pl-6 mb-6 text-slate-700 space-y-2"><li><strong>Wholly Owned Subsidiary:</strong> Incorporated as a Private Limited Company. This is the most popular route as it offers complete operational control.</li><li><strong>Liaison Office:</strong> Used strictly for marketing and representing the parent company. It cannot earn any revenue in India.</li><li><strong>Branch Office:</strong> Can perform export/import, research, and professional services, but cannot manufacture goods directly.</li></ul>`
      }
    ];

    for (const b of defaultBlogs) {
      await pool.execute(
        'INSERT INTO blog_posts (title, excerpt, category, author, date, readTime, image, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [b.title, b.excerpt, b.category, b.author, b.date, b.readTime, b.image, b.content]
      );
    }
    console.log('Blog posts successfully seeded.');
  } catch (error) {
    console.error("Error during blog posts database seeding:", error);
  }
}
