const http = require('http');
const url = require('url');
const { parse } = require('querystring');
const connection = require('./db.js');

// Helper function to run a query and return a promise
function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// Function to handle POST request to save chat data
async function handleSaveChatData(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const chatData = JSON.parse(body).Updatedchatdata;

            for (let username in chatData) {
                // Insert the user
                const sqlInsertUser = `INSERT IGNORE INTO users (username) VALUES (?)`;
                await runQuery(sqlInsertUser, [username]);

                // Get the user ID
                const sqlSelectUserId = `SELECT id FROM users WHERE username = ?`;
                const userResult = await runQuery(sqlSelectUserId, [username]);
                const userId = userResult[0].id;

                // Insert the messages
                const messages = chatData[username];
                for (let msg of messages) {
                    const sqlInsertMessage = `INSERT INTO messages (user_id, sender, message) VALUES (?, ?, ?)`;
                    await runQuery(sqlInsertMessage, [userId, msg.user, msg.message]);
                }
            }

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Chat data saved successfully.');
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
            console.error('Error:', error);
        }
    });
}
async function handleGetFollowers(req,res) {
    try{
        const sql = `
            SELECT u.username
            FROM users u
        `;
        const followers = await runQuery(sql);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ followers }));
    }catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
        console.error('Error:', error);
    }
}
// Function to handle GET request to retrieve chat data
async function handleGetChatData(req, res) {
    try {
        const sql = `
            SELECT u.username, m.sender, m.message 
            FROM users u 
            JOIN messages m 
            ON u.id = m.user_id
        `;
        const results = await runQuery(sql);

        let chatData = {};

        results.forEach(row => {
            if (!chatData[row.username]) {
                chatData[row.username] = [];
            }
            chatData[row.username].push({
                sender: row.sender,
                message: row.message
            });
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ Updatedchatdata: chatData }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
        console.error('Error:', error);
    }
}

// Create server and handle requests
http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'POST' && parsedUrl.pathname === '/api/saveChatData') {
        await handleSaveChatData(req, res);
    } else if (req.method === 'GET' && parsedUrl.pathname === '/api/getChatData') {
        await handleGetChatData(req, res);
    } else if (req.method === 'GET' && parsedUrl.pathname === '/api/getFollowerData') {
        await handleGetFollowers(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
}).listen(3000, () => {
    console.log('Server is running on port 3000');
});
