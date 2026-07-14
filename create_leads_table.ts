import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createTable() {
  try {
    let dbHost = process.env.DB_HOST || 'localhost';
    if (dbHost.includes('://')) dbHost = dbHost.split('://')[1];
    if (dbHost.includes(':')) dbHost = dbHost.split(':')[0];

    const connection = await mysql.createConnection({
      host: dbHost,
      port: 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'deccan_filings'
    });

    const query = `
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(50) NOT NULL,
        email_address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        sequence_step INT DEFAULT 0,
        last_email_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('active', 'unsubscribed', 'converted') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    await connection.query(query);
    console.log("Leads table created successfully.");
    await connection.end();
  } catch (error) {
    console.error("Error creating leads table:", error);
  } finally {
    process.exit(0);
  }
}

createTable();
