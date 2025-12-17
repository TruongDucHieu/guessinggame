const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let secretNumber = Math.floor(10000 + Math.random() * 90000).toString();
console.log(`[Admin] Số bí mật hiện tại: ${secretNumber}`);

// API Kiểm tra số
app.post('/api/check-guess', (req, res) => {
    const { guess } = req.body;
    if (guess === secretNumber) {
        // Đổi số mới sau khi có người thắng
        secretNumber = Math.floor(10000 + Math.random() * 90000).toString();
        return res.json({ correct: true });
    }
    const hint = parseInt(guess) < parseInt(secretNumber) ? "LỚN HƠN ↑" : "NHỎ HƠN ↓";
    res.json({ correct: false, hint });
});

// API Bảng xếp hạng
app.get('/api/leaderboard', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('leaderboard.json', 'utf8') || "[]");
        res.json(data.sort((a, b) => a.score - b.score).slice(0, 10));
    } catch (e) { res.json([]); }
});

app.post('/api/leaderboard', (req, res) => {
    const { name, score } = req.body;
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync('leaderboard.json', 'utf8') || "[]");
    } catch (e) { data = []; }
    data.push({ name, score, date: new Date().toLocaleDateString() });
    fs.writeFileSync('leaderboard.json', JSON.stringify(data, null, 2));
    res.sendStatus(200);
});

app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));