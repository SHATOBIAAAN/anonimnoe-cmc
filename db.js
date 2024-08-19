const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('requests.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS history (
            user_id TEXT,
            channel_id TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS channels (
            channel_id TEXT PRIMARY KEY,
            link TEXT
        )
    `);
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('База данных закрыта.');
});