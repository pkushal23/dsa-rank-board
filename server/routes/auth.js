const express = require('express');
const router = express.Router();
const db = require('../db');
db.query('SELECT * FROM users').then(res => console.log(res.rows)).catch(console.error);

router.post('/login', async (req, res) => {
    const { email, name, uid } = req.body;
    try {
    const user = await db.query('SELECT * FROM users WHERE uid = $1', [uid]);
    if (user.rows.length === 0) {
        await db.query(
        'INSERT INTO users (email, name, uid) VALUES ($1, $2, $3)',
        [email, name, uid]
        );
    }
    res.json({ message: 'User logged in' });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

module.exports = router;