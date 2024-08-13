// db.js
const mysql = require('mysql2');
const dotenv = require('dotenv')

dotenv.config()

const connection = mysql.createConnection({
    host:process.env.MYSQL_HOST,
    user:process.env.MYSQL_USER,
    password:process.env.MYSQL_PASSWORD,
    database: 'instagram_scrape',
});

connection.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');

    connection.query('CREATE DATABASE IF NOT EXISTS instagram_scrape', (err, result) => {
        if (err) throw err;
        console.log('Database created or already exists.');

        connection.query('USE instagram_scrape', (err, result) => {
            if (err) throw err;
            console.log('Using instagram_scrape database.');

            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL
                )
            `;

            const createMessagesTable = `
                CREATE TABLE IF NOT EXISTS messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    sender VARCHAR(255),
                    message TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;

            connection.query(createUsersTable, (err, result) => {
                if (err) throw err;
                console.log('Users table created.');
            });

            connection.query(createMessagesTable, (err, result) => {
                if (err) throw err;
                console.log('Messages table created.');
            });
        });
    });
});

module.exports = connection;