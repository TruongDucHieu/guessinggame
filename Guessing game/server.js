const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// --- CẤU HÌNH DATABASE ---
// Lấy link DB từ biến môi trường (cho bảo mật) hoặc hardcode nếu test nhanh
const MONGO_URI = process.env.MONGO_URI || "DÁN_LINK_MONGODB_CỦA_ÔNG_VÀO_ĐÂY_NẾU_CHẠY_LOCAL_TEST";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Đã kết nối MongoDB"))
    .catch(err => console.error("❌ Lỗi DB:", err));

// Định nghĩa bảng điểm (Schema)
const ScoreSchema = new mongoose.Schema({
    name: String,
    score: Number,
    date: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', ScoreSchema);

// --- LOGIC GAME ---
let secretNumber = Math.floor(10000 + Math.random() * 90000).toString();
console.log(`[Admin] Số bí mật: ${secretNumber}`);

app.post('/api/check-guess', (req, res) => {
    const { guess } = req.body;
    if (guess === secretNumber) {
        secretNumber = Math.floor(10000 + Math.random() * 90000).toString();
        return res.json({ correct: true });
    }
    const hint = parseInt(guess) < parseInt(secretNumber) ? "LỚN HƠN NỮA ↑" : "NHỎ HƠN XÍU ↓";
    res.json({ correct: false, hint });
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        // Lấy Top 10 điểm thấp nhất (ít lượt đoán nhất)
        const data = await Score.find().sort({ score: 1 }).limit(10);
        res.json(data);
    } catch (e) { res.status(500).json([]); }
});

app.post('/api/leaderboard', async (req, res) => {
    const { name, score } = req.body;
    try {
        await Score.create({ name, score });
        res.sendStatus(200);
    } catch (e) { res.sendStatus(500); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));