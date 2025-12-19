const guessBtn = document.getElementById('guessBtn');
const input = document.getElementById('userGuess');
const feedback = document.getElementById('feedback');
const attemptsEl = document.getElementById('attempts');
const gameBox = document.getElementById('gameBox');
const leaderboardBody = document.querySelector('#leaderboardTable tbody');

let attempts = 0;

async function updateLeaderboard() {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    leaderboardBody.innerHTML = data.map((item, i) => `
        <tr>
            <td>#${i+1}</td>
            <td>${item.name}</td>
            <td class="cyan-glow">${item.score}</td>
        </tr>
    `).join('');
}

updateLeaderboard();

guessBtn.addEventListener('click', async () => {
    const val = input.value;
    if(val.length !== 5) return alert("Phải nhập đủ 5 số!");

    attempts++;
    attemptsEl.innerText = attempts;

    const res = await fetch('/api/check-guess', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ guess: val })
    });
    const result = await res.json();

    if(result.correct) {
        feedback.innerText = "CHÍNH XÁC! PHÁ ĐẢO!";
        feedback.style.color = "var(--neon-cyan)";
        const name = prompt("Bạn là huyền thoại! Nhập tên:") || "Ẩn danh";
        await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, score: attempts })
        });
        attempts = 0;
        attemptsEl.innerText = 0;
        input.value = "";
        updateLeaderboard();
    } else {
        feedback.innerText = result.hint;
        feedback.style.color = "var(--error)";
        // Kích hoạt hiệu ứng Rung
        gameBox.classList.add('shake');
        setTimeout(() => gameBox.classList.remove('shake'), 400);
        input.value = "";
        input.focus();
    }
});