const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const bgMusic = document.getElementById("bgMusic");

// Lower the volume a bit so it doesn't blast your ears (0.0 to 1.0)
bgMusic.volume = 0.3; 

// Grid and game sizing
const gridSize = 20; 
const tileCount = canvas.width / gridSize;

// Snake initialization
let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];

let food = { x: 5, y: 5 };
let dx = 1;
let dy = 0;
let score = 0;
let gameInterval;
const gameSpeed = 100; 
let musicStarted = false;

function startGame() {
    gameInterval = setInterval(update, gameSpeed);
}

// Function to handle browser autoplay policies safely
function tryPlayMusic() {
    if (!musicStarted) {
        bgMusic.play()
            .then(() => {
                musicStarted = true;
            })
            .catch(err => {
                console.log("Waiting for user interaction to play audio...");
            });
    }
}

// Try playing music if they click anywhere on the page
document.addEventListener("click", tryPlayMusic);

function update() {
    moveSnake();

    if (checkGameOver()) {
        clearInterval(gameInterval);
        bgMusic.pause();
        bgMusic.currentTime = 0; // Rewind track to start
        alert(`Game Over! Your final score was: ${score}`);
        resetGame();
        return;
    }

    checkFoodCollision();
    clearCanvas();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#2E7D32" : "#4CAF50";
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); 
    snake.pop(); 
}

function drawFood() {
    ctx.fillStyle = "#FF5252"; 
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function checkFoodCollision() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        
        const tail = { ...snake[snake.length - 1] };
        snake.push(tail);

        generateFood();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            generateFood();
        }
    });
}

function checkGameOver() {
    const head = snake[0];

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    dx = 1;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = score;
    musicStarted = false;
    generateFood();
    startGame();
}

// Handle Keyboard Inputs
window.addEventListener("keydown", (e) => {
    // Attempt to start music on keypress
    tryPlayMusic();

    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case "ArrowDown":
        case "s":
        case "S":
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case "ArrowRight":
        case "d":
        case "D":
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

// Boot the game
generateFood();
startGame();