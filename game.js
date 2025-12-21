// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const pauseBtn = document.getElementById('pauseBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const messageBox = document.getElementById('messageBox');
const messageTitle = document.getElementById('messageTitle');
const messageText = document.getElementById('messageText');
const messageBtn = document.getElementById('messageBtn');

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}

// Game state
let game = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    speed: 0,
    level: 1,
    roadSpeed: 2,
    gameLoopId: null
};

// Player car
const playerCar = {
    x: 0,
    y: 0,
    width: 40,
    height: 80,
    color: '#3498db',
    moveSpeed: 8,
    moveLeft: false,
    moveRight: false
};

// Arrays for game objects
let obstacles = [];
let fuels = [];
let particles = [];
let roadMarkers = [];

// Initialize game
function init() {
    resizeCanvas();
    
    // Set player car position
    playerCar.x = canvas.width / 2 - playerCar.width / 2;
    playerCar.y = canvas.height - playerCar.height - 20;
    
    // Initialize road markers
    initRoadMarkers();
    
    // Draw initial game state
    drawRoad();
    drawPlayerCar();
    
    // Show start message
    showMessage("Ready to Race?", "Tap START to begin your racing adventure!", "START GAME");
    
    // Update UI
    updateUI();
}

// Initialize road markers
function initRoadMarkers() {
    roadMarkers = [];
    for (let i = 0; i < 20; i++) {
        roadMarkers.push({
            x: canvas.width / 2 - 2,
            y: i * 40 - 40,
            width: 4,
            height: 20,
            color: '#f8c555'
        });
    }
}

// Game objects
class Obstacle {
    constructor() {
        this.width = 35 + Math.random() * 30;
        this.height = 60 + Math.random() * 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.color = `hsl(${Math.random() * 30 + 330}, 80%, 60%)`;
        this.speed = 3 + Math.random() * 2 + game.level * 0.3;
    }
}

class Fuel {
    constructor() {
        this.width = 25;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.color = '#2ecc71';
        this.speed = 4;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = color;
        this.life = 30;
    }
}

// Draw functions
function drawRoad() {
    // Road surface
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Road borders
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 15, canvas.height);
    ctx.fillRect(canvas.width - 15, 0, 15, canvas.height);
    
    // Road markers
    roadMarkers.forEach(marker => {
        ctx.fillStyle = marker.color;
        ctx.fillRect(marker.x, marker.y, marker.width, marker.height);
    });
}

function drawPlayerCar() {
    // Car body
    ctx.fillStyle = playerCar.color;
    ctx.fillRect(playerCar.x, playerCar.y, playerCar.width, playerCar.height);
    
    // Car details
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(playerCar.x + 3, playerCar.y + 5, playerCar.width - 6, 12);
    ctx.fillRect(playerCar.x + 3, playerCar.y + playerCar.height - 17, playerCar.width - 6, 12);
    
    // Windows
    ctx.fillStyle = '#1a5276';
    ctx.fillRect(playerCar.x + 8, playerCar.y + 22, playerCar.width - 16, 25);
    
    // Wheels
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(playerCar.x - 4, playerCar.y + 10, 4, 15);
    ctx.fillRect(playerCar.x + playerCar.width, playerCar.y + 10, 4, 15);
    ctx.fillRect(playerCar.x - 4, playerCar.y + playerCar.height - 25, 4, 15);
    ctx.fillRect(playerCar.x + playerCar.width, playerCar.y + playerCar.height - 25, 4, 15);
    
    // Headlights
    ctx.fillStyle = '#f8c555';
    ctx.fillRect(playerCar.x + 5, playerCar.y, 8, 5);
    ctx.fillRect(playerCar.x + playerCar.width - 13, playerCar.y, 8, 5);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Obstacle body
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Obstacle details
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(obstacle.x + 4, obstacle.y + 4, obstacle.width - 8, 8);
        ctx.fillRect(obstacle.x + 4, obstacle.y + obstacle.height - 12, obstacle.width - 8, 8);
    });
}

function drawFuels() {
    fuels.forEach(fuel => {
        // Fuel can body
        ctx.fillStyle = fuel.color;
        ctx.fillRect(fuel.x, fuel.y, fuel.width, fuel.height);
        
        // Fuel details
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(fuel.x + 4, fuel.y + 4, fuel.width - 8, fuel.height - 8);
        
        // Fuel icon
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⛽', fuel.x + fuel.width / 2, fuel.y + fuel.height / 2 + 6);
    });
}

function drawParticles() {
    particles.forEach((particle, index) => {
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        
        // Update particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;
        
        // Remove dead particles
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Update functions
function updateRoadMarkers() {
    if (!game.running || game.paused) return;
    
    roadMarkers.forEach(marker => {
        marker.y += game.roadSpeed;
        if (marker.y > canvas.height) {
            marker.y = -20;
        }
    });
}

function updateObstacles() {
    // Add new obstacles
    if (Math.random() < 0.02 + game.level * 0.004) {
        obstacles.push(new Obstacle());
    }
    
    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.speed;
        
        // Remove obstacles that are off screen
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            game.score += 10;
        }
        
        // Check collision with player
        if (checkCollision(playerCar, obstacle)) {
            // Collision detected
            obstacles.splice(index, 1);
            game.lives--;
            
            // Create explosion particles
            for (let i = 0; i < 12; i++) {
                particles.push(new Particle(
                    obstacle.x + obstacle.width / 2,
                    obstacle.y + obstacle.height / 2,
                    obstacle.color
                ));
            }
            
            updateUI();
            
            if (game.lives <= 0) {
                gameOver();
            }
        }
    });
}

function updateFuels() {
    // Add new fuel
    if (Math.random() < 0.01) {
        fuels.push(new Fuel());
    }
    
    // Update fuels
    fuels.forEach((fuel, index) => {
        fuel.y += fuel.speed;
        
        // Remove fuels that are off screen
        if (fuel.y > canvas.height) {
            fuels.splice(index, 1);
        }
        
        // Check collision with player
        if (checkCollision(playerCar, fuel)) {
            // Fuel collected
            fuels.splice(index, 1);
            game.score += 50;
            game.speed += 0.5;
            
            // Create collection particles
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(
                    fuel.x + fuel.width / 2,
                    fuel.y + fuel.height / 2,
                    fuel.color
                ));
            }
            
            updateUI();
        }
    });
}

function updatePlayer() {
    // Move player based on button states
    if (playerCar.moveLeft && playerCar.x > 20) {
        playerCar.x -= playerCar.moveSpeed;
    }
    
    if (playerCar.moveRight && playerCar.x < canvas.width - playerCar.width - 20) {
        playerCar.x += playerCar.moveSpeed;
    }
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Update UI
function updateUI() {
    scoreElement.textContent = game.score;
    speedElement.textContent = game.speed.toFixed(1);
    livesElement.textContent = game.lives;
    
    // Increase level based on score
    game.level = Math.floor(game.score / 500) + 1;
    
    // Update pause button icon
    const pauseIcon = pauseBtn.querySelector('i');
    if (game.paused) {
        pauseIcon.className = 'fas fa-play';
    } else {
        pauseIcon.className = 'fas fa-pause';
    }
}

// Game loop
function gameLoop() {
    if (!game.running || game.paused) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game elements
    updateRoadMarkers();
    updatePlayer();
    updateObstacles();
    updateFuels();
    
    // Draw game elements
    drawRoad();
    drawObstacles();
    drawFuels();
    drawParticles();
    drawPlayerCar();
    
    // Increase speed over time
    game.speed += 0.003;
    game.roadSpeed = 2 + game.speed * 0.4;
    
    // Update UI
    updateUI();
    
    // Continue game loop
    game.gameLoopId = requestAnimationFrame(gameLoop);
}

// Game control functions
function startGame() {
    if (game.running) return;
    
    game.running = true;
    game.paused = false;
    game.score = 0;
    game.lives = 3;
    game.speed = 0;
    game.level = 1;
    game.roadSpeed = 2;
    
    obstacles = [];
    fuels = [];
    particles = [];
    
    playerCar.x = canvas.width / 2 - playerCar.width / 2;
    playerCar.moveLeft = false;
    playerCar.moveRight = false;
    
    updateUI();
    hideMessage();
    gameLoop();
    initRoadMarkers();
}

function pauseGame() {
    if (!game.running) return;
    
    game.paused = !game.paused;
    
    if (game.paused) {
        showMessage("Game Paused", "Tap RESUME to continue racing", "RESUME GAME");
    } else {
        hideMessage();
        gameLoop();
    }
}

function resetGame() {
    game.running = false;
    game.paused = false;
    
    if (game.gameLoopId) {
        cancelAnimationFrame(game.gameLoopId);
    }
    
    obstacles = [];
    fuels = [];
    particles = [];
    
    playerCar.x = canvas.width / 2 - playerCar.width / 2;
    playerCar.moveLeft = false;
    playerCar.moveRight = false;
    
    game.score = 0;
    game.lives = 3;
    game.speed = 0;
    game.level = 1;
    
    updateUI();
    hideMessage();
    
    // Draw initial game state
    drawRoad();
    drawPlayerCar();
    initRoadMarkers();
    
    showMessage("Ready to Race?", "Tap START to begin your racing adventure!", "START GAME");
}

function gameOver() {
    game.running = false;
    showMessage("Game Over", `Final Score: ${game.score}`, "PLAY AGAIN");
}

// Message functions
function showMessage(title, text, buttonText) {
    messageTitle.textContent = title;
    messageText.textContent = text;
    messageBtn.textContent = buttonText;
    
    if (title === "Game Over") {
        messageTitle.style.color = "#e74c3c";
    } else {
        messageTitle.style.color = "#f8c555";
    }
    
    messageBox.style.display = "block";
}

function hideMessage() {
    messageBox.style.display = "none";
}

// Event listeners
// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!game.running || game.paused) return;
    
    if (e.key === 'ArrowLeft') {
        playerCar.moveLeft = true;
    }
    
    if (e.key === 'ArrowRight') {
        playerCar.moveRight = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        playerCar.moveLeft = false;
    }
    
    if (e.key === 'ArrowRight') {
        playerCar.moveRight = false;
    }
    
    if (e.key === 'p' || e.key === 'P') {
        pauseGame();
    }
    
    if (e.key === ' ' && !game.running) {
        startGame();
    }
});

// Button controls
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
pauseBtn.addEventListener('click', pauseGame);

// Mobile touch controls
leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    playerCar.moveLeft = true;
});

leftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    playerCar.moveLeft = false;
});

leftBtn.addEventListener('mousedown', () => {
    playerCar.moveLeft = true;
});

leftBtn.addEventListener('mouseup', () => {
    playerCar.moveLeft = false;
});

leftBtn.addEventListener('mouseleave', () => {
    playerCar.moveLeft = false;
});

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    playerCar.moveRight = true;
});

rightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    playerCar.moveRight = false;
});

rightBtn.addEventListener('mousedown', () => {
    playerCar.moveRight = true;
});

rightBtn.addEventListener('mouseup', () => {
    playerCar.moveRight = false;
});

rightBtn.addEventListener('mouseleave', () => {
    playerCar.moveRight = false;
});

messageBtn.addEventListener('click', () => {
    if (messageTitle.textContent === "Game Over") {
        startGame();
    } else if (messageTitle.textContent === "Game Paused") {
        pauseGame();
    } else {
        startGame();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    playerCar.x = Math.min(playerCar.x, canvas.width - playerCar.width - 20);
    playerCar.y = canvas.height - playerCar.height - 20;
    initRoadMarkers();
    
    if (!game.running) {
        drawRoad();
        drawPlayerCar();
    }
});

// Prevent context menu on mobile
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Initialize the game when page loads
window.addEventListener('load', init);

// Also call init if DOM is already loaded
if (document.readyState === 'complete') {
    init();
}