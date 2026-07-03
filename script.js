const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
let snake, food, direction, nextDirection, score, speed, gameLoop, isRunning;

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const statusEl = document.getElementById("status");

let highScore = Number(localStorage.getItem("highScore")) || 0;
highScoreEl.innerText = highScore;

document.addEventListener("keydown", handleKeydown);

document.querySelectorAll(".control-btn").forEach((button) => {
    const handleControl = (event) => {
        event.preventDefault();
        changeDirection(button.dataset.direction);
    };

    button.addEventListener("touchstart", handleControl, { passive: false });
    button.addEventListener("mousedown", handleControl);
});

// Overlay and fullscreen elements
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const overlayRestart = document.getElementById('overlay-restart');
const overlayClose = document.getElementById('overlay-close');
const fullscreenBtn = document.getElementById('fullscreenBtn');

overlayRestart.addEventListener('click', () => { hideOverlay(); restartGame(); });
overlayClose.addEventListener('click', () => { hideOverlay(); });

fullscreenBtn.addEventListener('click', toggleFullScreen);

canvas.addEventListener('dblclick', toggleFullScreen);
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

// adjust canvas size to fit available space (keeps grid aligned to `box`)
const gameShell = document.querySelector('.game-shell');
function adjustCanvasSize() {
    const isFs = !!document.fullscreenElement;
    const availW = isFs ? window.innerWidth : gameShell.clientWidth;
    const availH = isFs ? window.innerHeight : gameShell.clientHeight || window.innerHeight;

    const cols = Math.max(1, Math.floor(availW / box));
    const rows = Math.max(1, Math.floor(availH / box));

    const newWidth = cols * box;
    const newHeight = rows * box;

    // preserve old canvas size for scaling check
    const oldW = canvas.width;
    const oldH = canvas.height;

    canvas.width = newWidth;
    canvas.height = newHeight;

    // scale drawing context if needed (we use direct pixel sizing, so no scale here)

    // align snake to grid and keep it within bounds
    if (snake && snake.length) {
        snake = snake.map(part => ({
            x: Math.min(Math.floor(part.x / box), cols - 1) * box,
            y: Math.min(Math.floor(part.y / box), rows - 1) * box
        }));
    }

    // ensure food is within bounds, regenerate if necessary
    if (!food || food.x >= canvas.width || food.y >= canvas.height) {
        food = randomFood();
    }

}

// debounce helper for resize
function debounce(fn, wait = 150) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

window.addEventListener('resize', debounce(() => { adjustCanvasSize(); }));
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        document.body.classList.add('is-fullscreen');
    } else {
        document.body.classList.remove('is-fullscreen');
    }
    adjustCanvasSize();
});

let lastTouch = 0;
function handleTouchStart(e) {
    const now = Date.now();
    if (now - lastTouch < 300) { // double-tap
        e.preventDefault();
        toggleFullScreen();
    }
    lastTouch = now;
}

function init() {
    snake = [{ x: 200, y: 200 }];
    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;
    speed = 150;
    isRunning = true;

    scoreEl.innerText = score;
    statusEl.innerText = "Game on!";

    adjustCanvasSize();
    food = randomFood();

    clearInterval(gameLoop);
    gameLoop = setInterval(draw, speed);
}

function randomFood() {
    let position;

    do {
        position = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
    } while (snake.some((part) => part.x === position.x && part.y === position.y));

    return position;
}

function changeDirection(newDirection) {
    const opposite = { LEFT: "RIGHT", RIGHT: "LEFT", UP: "DOWN", DOWN: "UP" };

    if (!newDirection || opposite[newDirection] === direction) return;
    if (nextDirection && opposite[nextDirection] === newDirection) return;

    nextDirection = newDirection;
}

function handleKeydown(event) {
    const key = event.key;

    if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
    }

    if (key === "ArrowLeft" || key === "a") changeDirection("LEFT");
    if (key === "ArrowUp" || key === "w") changeDirection("UP");
    if (key === "ArrowRight" || key === "d") changeDirection("RIGHT");
    if (key === "ArrowDown" || key === "s") changeDirection("DOWN");
}



// removed old alert-based endGame (replaced by overlay version below)

function draw() {
    if (!isRunning) return;

    if (nextDirection) {
        const opposite = { LEFT: "RIGHT", RIGHT: "LEFT", UP: "DOWN", DOWN: "UP" };

        if (opposite[nextDirection] !== direction) {
            direction = nextDirection;
        }

        nextDirection = null;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? "#22c55e" : "#16a34a";
        ctx.fillRect(part.x, part.y, box, box);
    });

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(food.x, food.y, box, box);

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "UP") headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN") headY += box;

    if (headX === food.x && headY === food.y) {
        score++;
        scoreEl.innerText = score;

        food = randomFood();

        if (speed > 60) {
            speed -= 5;
            clearInterval(gameLoop);
            gameLoop = setInterval(draw, speed);
        }

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreEl.innerText = highScore;
        }
    } else {
        snake.pop();
    }

    const newHead = { x: headX, y: headY };

    if (
        headX < 0 || headY < 0 ||
        headX >= canvas.width || headY >= canvas.height ||
        snake.some((part) => part.x === newHead.x && part.y === newHead.y)
    ) {
        endGame("Game Over!");
        return;
    }

    snake.unshift(newHead);
}

function restartGame() {
    init();
}

init();

function showOverlay(title, msg) {
    overlayTitle.innerText = title;
    overlayMsg.innerText = msg;
    overlay.classList.remove('hidden');
}

function hideOverlay() {
    overlay.classList.add('hidden');
}

function endGame(message) {
    if (!isRunning) return;

    isRunning = false;
    clearInterval(gameLoop);
    statusEl.innerText = message;
    showOverlay(message, `Score: ${score}`);
}

function toggleFullScreen() {
    const target = gameShell || document.documentElement;
    if (!document.fullscreenElement) {
        target.requestFullscreen().then(() => {
            // fullscreenchange handler will call adjustCanvasSize
        }).catch(() => {
            // fallback: still attempt to adjust canvas
            adjustCanvasSize();
        });
    } else {
        document.exitFullscreen().then(() => {
            // fullscreenchange handler will call adjustCanvasSize
        }).catch(() => {
            adjustCanvasSize();
        });
    }
}
