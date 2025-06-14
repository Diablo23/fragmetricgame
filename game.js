
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Load images
const background = new Image();
background.src = 'assets/background.png';

const playerImg = new Image();
playerImg.src = 'assets/player.png';

const objectImg = new Image();
objectImg.src = 'assets/object.png';

const bombImg = new Image();
bombImg.src = 'assets/bimba.png';

const heartImg = new Image();
heartImg.src = 'assets/hearts.png';

const gameOverImg = new Image();
gameOverImg.src = 'assets/game over.png';

// Game state
let player = { x: canvas.width / 2, y: canvas.height - 100, width: 100, height: 100 };
let objects = [];
let score = 0;
let lives = 3;
let gameOver = false;
let missedObjects = 0;
let overlayAlpha = 0;

// Controls


let keys = {
    ArrowLeft: false,
    ArrowRight: false
};

let mouseX = player.x;

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
});

function updatePlayer() {
    let dx = mouseX - player.x - player.width / 2;
    player.x += dx * 0.1;
}

window.addEventListener('keydown', function(e) {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        keys[e.code] = true;
    }
});
window.addEventListener('keyup', function(e) {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        keys[e.code] = false;
    }
});



// Helper
function spawnObject() {
    const isBomb = Math.random() < 0.2;
    const img = isBomb ? bombImg : objectImg;
    objects.push({
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 60,
        height: 60,
        speed: 3 + Math.random() * 2,
        type: isBomb ? 'bomb' : 'normal',
        image: img
    });
}

// Game loop
function update() {
    if (!gameOver && Math.random() < 0.01) spawnObject();

    objects.forEach(obj => {
        obj.y += obj.speed;

        // If object falls below the screen and was not caught
        if (obj.y > canvas.height && !obj.collected && obj.type !== 'bomb') {
            lives--;
            obj.collected = true;
            if (lives <= 0) {
                gameOver = true;
            }
        }
    

        
    // Keyboard movement
    if (keys['ArrowLeft']) {
        player.x -= 4;
    }
    if (keys['ArrowRight']) {
        player.x += 4;
    }
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

        // Collision detection
        if (
            obj.x < player.x + player.width &&
            obj.x + obj.width > player.x &&
            obj.y < player.y + player.height &&
            obj.y + obj.height > player.y
        ) {
            if (obj.type === 'bomb') {
                lives -= 1;
                if (lives <= 0) {
                    gameOver = true;
                }
            } else {
                score++;
            }
            obj.collected = true;
        }
    });

    objects = objects.filter(obj => obj.y < canvas.height && !obj.collected);

    if (gameOver && overlayAlpha < 1) {
        overlayAlpha += 0.02;
    }
}

function draw() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    for (const obj of objects) {
        ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
    }

    // Score
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2 - 40, 40);

    // Hearts
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(heartImg, canvas.width / 2 - 75 + i * 50, 70, 40, 40);
    }

    if (gameOver) {
        ctx.globalAlpha = overlayAlpha;
        ctx.drawImage(gameOverImg, canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 200);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Play Again", canvas.width / 2 - 70, canvas.height / 2 + 80);
        ctx.globalAlpha = 1;
    }
}

function gameLoop() {
    updatePlayer();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();

// Handle click to restart
canvas.addEventListener("click", (e) => {
    if (gameOver) {
        const x = e.clientX;
        const y = e.clientY;
        if (x > canvas.width / 2 - 100 && x < canvas.width / 2 + 100 &&
            y > canvas.height / 2 + 50 && y < canvas.height / 2 + 100) {
            score = 0;
            lives = 3;
            objects = [];
            gameOver = false;
            overlayAlpha = 0;
        }
    }
});
