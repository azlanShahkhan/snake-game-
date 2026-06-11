const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const bgMusic = document.getElementById("bgMusic");

bgMusic.volume = 0.25; 

const gridSize = 20; 
const tileCount = canvas.width / gridSize;

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
    clearInterval(gameInterval);
    gameInterval = setInterval(update, gameSpeed);
}

function tryPlayMusic() {
    if (!musicStarted) {
        bgMusic.play()
            .then(() => musicStarted = true)
            .catch(err => console.log("Audio awaiting interaction"));
    }
}

// Global page triggers for fallback audio activation
document.addEventListener("click", tryPlayMusic);
document.addEventListener("touchstart", tryPlayMusic, { passive: true });

function update() {
    moveSnake();

    if (checkGameOver()) {
        clearInterval(gameInterval);
        bgMusic.pause();
        bgMusic.currentTime = 0; 
        alert(`GAME OVER\nFINAL SCORE: ${score}`);
        resetGame();
        return;
    }

    checkFoodCollision();
    clearCanvas();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = "#050805";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => {
        let posX = part.x * gridSize;
        let posY = part.y * gridSize;

        if (index === 0) {
            ctx.fillStyle = "#1B5E20";
            ctx.fillRect(posX, posY, gridSize, gridSize);
            
            ctx.fillStyle = "#FFF";
            if (dx === 1) { 
                ctx.fillRect(posX + 12, posY + 4, 4, 4);
                ctx.fillRect(posX + 12, posY + 12, 4, 4);
            } else if (dx === -1) { 
                ctx.fillRect(posX + 4, posY + 4, 4, 4);
                ctx.fillRect(posX + 4, posY + 12, 4, 4);
            } else if (dy === -1) { 
                ctx.fillRect(posX + 4, posY + 4, 4, 4);
                ctx.fillRect(posX + 12, posY + 4, 4, 4);
            } else if (dy === 1) { 
                ctx.fillRect(posX + 4, posY + 12, 4, 4);
                ctx.fillRect(posX + 12, posY + 12, 4, 4);
            }
        } else {
            ctx.fillStyle = "#4CAF50";
            ctx.fillRect(posX, posY, gridSize, gridSize);
            ctx.fillStyle = "#388E3C";
            ctx.fillRect(posX + 4, posY + 4, 6, 6);
        }
    });
}

function drawFood() {
    let posX = food.x * gridSize;
    let posY = food.y * gridSize;
    ctx.fillStyle = "#D32F2F"; 
    ctx.fillRect(posX + 2, posY + 4, 16, 14);
    ctx.fillRect(posX + 4, posY + 2, 12, 16);
    ctx.fillStyle = "#FFCDD2";
    ctx.fillRect(posX + 4, posY + 4, 4, 4);
    ctx.fillStyle = "#795548";
    ctx.fillRect(posX + 9, posY, 2, 4);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); 
    snake.pop(); 
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
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function resetGame() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dx = 1; dy = 0; score = 0;
    scoreDisplay.textContent = score;
    musicStarted = false;
    generateFood();
    startGame();
}

// SHARED INTERACTION ACTION
function handleDirectionChange(key) {
    switch (key) {
        case "ArrowUp":
            if (dy !== 1) { dx = 0; dy = -1; } break;
        case "ArrowDown":
            if (dy !== -1) { dx = 0; dy = 1; } break;
        case "ArrowLeft":
            if (dx !== 1) { dx = -1; dy = 0; } break;
        case "ArrowRight":
            if (dx !== -1) { dx = 1; dy = 0; } break;
    }
}

// KEYBOARD HANDLING (Desktop fallback)
window.addEventListener("keydown", (e) => {
    tryPlayMusic();
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) {
        e.preventDefault(); 
    }
    handleDirectionChange(e.key);
});

// VIRTUAL DPAD BUTTON LISTENERS (Mobile + Mouse Support)
const buttons = [
    { id: "btnUp", key: "ArrowUp" },
    { id: "btnDown", key: "ArrowDown" },
    { id: "btnLeft", key: "ArrowLeft" },
    { id: "btnRight", key: "ArrowRight" }
];

buttons.forEach(btn => {
    const el = document.getElementById(btn.id);
    
    // Mobile touch binding for ultra quick execution
    el.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Prevents simulated browser click delays
        tryPlayMusic();
        handleDirectionChange(btn.key);
    }, { passive: false });

    // Desktop mouse fallback fallback
    el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        tryPlayMusic();
        handleDirectionChange(btn.key);
    });
});

// Blanket safeguard to stop screen dynamic dragging on browsers
window.addEventListener('touchmove', (e) => {
    if (e.cancelable) e.preventDefault(); 
}, { passive: false });

// Boot execution
generateFood();
startGame();