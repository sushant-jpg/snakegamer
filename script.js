const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
let snake, food, direction, score, speed, game;

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

let highScore = localStorage.getItem("highScore") || 0;
highScoreEl.innerText = highScore;

document.addEventListener("keydown", changeDirection);

function init() {
    snake = [{ x: 200, y: 200 }];
    direction = "RIGHT";
    score = 0;
    speed = 150;
    scoreEl.innerText = score;

    food = randomFood();

    clearInterval(game);
    game = setInterval(draw, speed);
}

function randomFood() {
    return {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
    };
}

function changeDirection(e) {
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? "#22c55e" : "#16a34a";
        ctx.fillRect(part.x, part.y, box, box);
    });

    // Draw food
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(food.x, food.y, box, box);

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "UP") headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN") headY += box;

    // Eat food
    if (headX === food.x && headY === food.y) {
        score++;
        scoreEl.innerText = score;

        food = randomFood();

        // Increase speed
        if (speed > 60) {
            speed -= 5;
            clearInterval(game);
            game = setInterval(draw, speed);
        }

        // Save high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreEl.innerText = highScore;
        }
    } else {
        snake.pop();
    }

    const newHead = { x: headX, y: headY };

    // Game over
    if (
        headX < 0 || headY < 0 ||
        headX >= canvas.width || headY >= canvas.height ||
        snake.some(part => part.x === newHead.x && part.y === newHead.y)
    ) {
        clearInterval(game);
        alert("Game Over! Score: " + score);
        return;
    }

    snake.unshift(newHead);
}

function restartGame() {
    init();
}

// Start game
init();
