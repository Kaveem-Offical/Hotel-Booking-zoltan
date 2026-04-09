const mysql = require('mysql2/promise');
require('dotenv').config();

// Debug: Log connection attempt (without sensitive info)
console.log(`🔌 Attempting MySQL connection to: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);

// Create connection pool with timeout settings
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotel_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: false,
    charset: 'utf8mb4',
    // Connection timeout settings to prevent ETIMEDOUT
    connectTimeout: 10000       // 10 seconds for initial connection
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database connected successfully.');
        connection.release();
    })
    .catch(error => {
        console.error('❌ MySQL Connection Error:');
        console.error(error.message);

        // Provide helpful diagnostics for common errors
        if (error.code === 'ETIMEDOUT') {
            console.error('\n📋 Possible causes:');
            console.error('   • MySQL server is not running');
            console.error('   • Incorrect DB_HOST in .env file');
            console.error('   • Firewall blocking port', process.env.DB_PORT || 3306);
            console.error('   • Network connectivity issues');
            console.error('\n💡 Check your .env file settings and ensure MySQL is running.');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\n📋 MySQL server refused connection. Is it running on the specified host/port?');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n📋 Authentication failed. Check DB_USER and DB_PASSWORD in .env file.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n📋 Database does not exist. Check DB_NAME in .env file.');
        }
    });

module.exports = pool;
