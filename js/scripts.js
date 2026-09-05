const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const BOARD_SIZE = 15;
const GRID_SIZE = 32;
const OFFSET = 20;

canvas.width = OFFSET * 2 + GRID_SIZE * (BOARD_SIZE - 1);
canvas.height = OFFSET * 2 + GRID_SIZE * (BOARD_SIZE - 1);

let board = [];
let mode = null;
let myTurn = true;
let gameOver = false;

function initBoard() {
    board = Array.from({ length: BOARD_SIZE },
        () => Array(BOARD_SIZE).fill(0));

    gameOver = false;
    myTurn = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();

    if (mode === "pvp") {
        setInfo("黑棋落子");
    } else if (mode === "ai") {
        setInfo("轮到你落子（黑棋）");
    } else {
        setInfo("请选择模式开始游戏");
    }
}

function setInfo(text) {
    document.getElementById("info").innerText = text;
}

function drawBoard() {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(OFFSET, OFFSET + i * GRID_SIZE);
        ctx.lineTo(OFFSET + (BOARD_SIZE - 1) * GRID_SIZE, OFFSET + i * GRID_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(OFFSET + i * GRID_SIZE, OFFSET);
        ctx.lineTo(OFFSET + i * GRID_SIZE, OFFSET + (BOARD_SIZE - 1) * GRID_SIZE);
        ctx.stroke();
    }

    const stars = [
        [3, 3], [7, 3], [11, 3],
        [3, 7], [7, 7], [11, 7],
        [3, 11], [7, 11], [11, 11]
    ];
    for (const [x, y] of stars) {
        ctx.beginPath();
        ctx.arc(OFFSET + x * GRID_SIZE, OFFSET + y * GRID_SIZE, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
    }
}

function drawPiece(x, y, color) {
    const cx = OFFSET + x * GRID_SIZE;
    const cy = OFFSET + y * GRID_SIZE;

    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);

    if (color === 1) {
        ctx.fillStyle = "#000";
    } else {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    ctx.fill();
}

function startGame(selectedMode) {
    mode = selectedMode;
    initBoard();
}

function resetBoard() {
    if (mode) {
        initBoard();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBoard();
        setInfo("请选择模式开始游戏");
    }
}

canvas.addEventListener("click", (e) => {
    if (gameOver || !mode) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round(((e.clientX - rect.left) * scaleX - OFFSET) / GRID_SIZE);
    const y = Math.round(((e.clientY - rect.top) * scaleY - OFFSET) / GRID_SIZE);

    if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) return;
    if (board[y][x] !== 0) return;

    if (mode === "pvp") {
        const color = myTurn ? 1 : 2;
        placePiece(x, y, color);

        if (checkWin(x, y, color)) {
            setInfo((myTurn ? "黑棋" : "白棋") + " 获胜！");
            gameOver = true;
            return;
        }

        myTurn = !myTurn;
        setInfo((myTurn ? "黑棋" : "白棋") + " 落子");
    }

    if (mode === "ai") {
        if (!myTurn) return;

        placePiece(x, y, 1);
        if (checkWin(x, y, 1)) {
            setInfo("🎉 你赢了！");
            gameOver = true;
            return;
        }

        myTurn = false;
        setInfo("AI 思考中...");
        setTimeout(aiMove, 300);
    }
});

function placePiece(x, y, color) {
    board[y][x] = color;
    drawPiece(x, y, color);
}

function checkWin(x, y, color) {
    const dirs = [
        [1, 0], [0, 1], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of dirs) {
        let count = 1;

        for (let i = 1; i < 5; i++) {
            const nx = x + dx * i, ny = y + dy * i;
            if (board[ny] && board[ny][nx] === color) count++;
            else break;
        }
        for (let i = 1; i < 5; i++) {
            const nx = x - dx * i, ny = y - dy * i;
            if (board[ny] && board[ny][nx] === color) count++;
            else break;
        }
        if (count >= 5) return true;
    }
    return false;
}

function aiMove() {
    if (gameOver) return;

    let bestScore = -1;
    let move = null;

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== 0) continue;

            let score = evaluatePoint(x, y, 2);
            score += evaluatePoint(x, y, 1) * 1.2;

            if (score > bestScore) {
                bestScore = score;
                move = { x, y };
            }
        }
    }

    if (move) {
        placePiece(move.x, move.y, 2);
        if (checkWin(move.x, move.y, 2)) {
            setInfo("🤖 AI 赢了！");
            gameOver = true;
            return;
        }
    }

    myTurn = true;
    setInfo("轮到你落子");
}

function evaluatePoint(x, y, color) {
    let score = 0;
    const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];

    for (const [dx, dy] of dirs) {
        let count = 1;
        for (let i = 1; i < 5; i++) {
            const nx = x + dx * i, ny = y + dy * i;
            if (board[ny] && board[ny][nx] === color) count++;
            else break;
        }
        score += count * count;
    }
    return score;
}

initBoard();

