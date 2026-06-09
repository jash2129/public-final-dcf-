import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST !== undefined ? process.env.DB_HOST : 'localhost',
  user: process.env.DB_USER !== undefined ? process.env.DB_USER : 'u149740700_DeccanFilings',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'DeccanFilings@2026',
  database: process.env.DB_NAME !== undefined ? process.env.DB_NAME : 'u149740700_DeccanFilings',
  connectTimeout: 10000
};

console.log('=========================================');
console.log('   MySQL Database Connection Test Script');
console.log('=========================================');
console.log('Configured Credentials:');
console.log(`- Host:     ${dbConfig.host}`);
console.log(`- User:     ${dbConfig.user}`);
console.log(`- Database: ${dbConfig.database}`);
console.log('- Password: **********');
console.log('-----------------------------------------');
console.log('Connecting to database...');

async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('\n✅ SUCCESS: Successfully connected to the database server!');

    const [rows] = await connection.query('SELECT 1 + 1 AS test_result');
    console.log(`✅ QUERY OK: SELECT 1+1 returned ${rows[0].test_result}`);

    try {
      const [tables] = await connection.query('SHOW TABLES');
      console.log(`✅ SCHEMA OK: Found ${tables.length} tables in database:`);
      tables.forEach((row, i) => {
        console.log(`   [${i + 1}] ${Object.values(row)[0]}`);
      });
    } catch (schemaErr) {
      console.warn('⚠️ SCHEMA WARNING: Connected, but failed to list tables:', schemaErr.message);
    }

    await connection.end();
    console.log('\n✅ Connection closed cleanly. Test passed!');
    console.log('=========================================');
  } catch (error) {
    console.error('\n❌ FAILURE: Could not connect to the database!');
    console.error(`- Error Message: ${error.message}`);
    console.error(`- Error Code:    ${error.code || 'N/A'}`);
    console.error(`- System Call:   ${error.syscall || 'N/A'}`);
    console.log('=========================================');
    process.exit(1);
  }
}

testConnection();
