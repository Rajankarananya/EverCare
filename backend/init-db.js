const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    
    try {
        // First connect without database to create it if needed
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`Database ${process.env.DB_NAME} created or already exists`);

        // Switch to the database
        await connection.query(`USE ${process.env.DB_NAME}`);
        console.log(`Using database ${process.env.DB_NAME}`);

        // Read and execute the SQL file
        const sqlFile = path.join(__dirname, 'database.sql');
        const sqlContent = await fs.readFile(sqlFile, 'utf8');
        
        // Split and execute each statement separately
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());
        
        for (let statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
                console.log('Executed SQL statement successfully');
            }
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// Run the initialization
initializeDatabase()
    .then(() => {
        console.log('Database setup completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('Failed to setup database:', error);
        process.exit(1);
    }); 