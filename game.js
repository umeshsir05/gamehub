// Game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Mobile controls
const moveLeftBtn = document.querySelector('.move-left');
const moveRightBtn = document.querySelector('.move-right');
const shootBtn = document.querySelector('.shoot-btn');

// Game state
let game = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false
};

// Player
const player = {
    x: 0,
    y: 0,
    width: 40,
    height: 30,
    speed: 7,
    color: '#4a4aff',
    moveLeft: false,
    moveRight: false
};

// Bullets
let bullets = [];

// Aliens
let aliens = [];
let alienSpeed = 1;
let alienDirection = 1;

// Set canvas size
function setCanvasSize() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 300;
    
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 50;
}

// Create aliens
function createAliens() {
    aliens = [];
    const rows = 3;
    const cols = Math.min(6, Math.floor(canvas.width / 50));
    const alienWidth = 30;
    const alienHeight = 25;
    const spacing = 15;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            aliens.push({
                x: col * (alienWidth + spacing) + 20,
                y: row * (alienHeight + spacing) + 30,
                width: alienWidth,
                height: alienHeight,
                color: row === 0 ? '#ff3366' : row === 1 ? '#ff9900' : '#00cc00',
                alive: true
            });
        }
    }
}

// Initialize game
function initGame() {
    game.score = 0;
    game.lives = 3;
    game.level = 1;
    game.gameOver = false;
    bullets = [];
    alienSpeed = 1;
    
    setCanvasSize();
    createAliens();
    updateUI();
    draw();
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    
    // Spaceship body
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#a0a0ff';
    ctx.fillRect(player.x + player.width / 2 - 4, player.y + 5, 8, 10);
}

// Draw bullets
function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Draw aliens
function drawAliens() {
    aliens.forEach(alien => {
        if (alien.alive) {
            ctx.fillStyle = alien.color;
            ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
            
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(alien.x + 6, alien.y + 6, 5, 5);
            ctx.fillRect(alien.x + alien.width - 11, alien.y + 6, 5, 5);
        }
    });
}

// Draw game info
function drawGameInfo() {
    if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff3366';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${game.score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
    
    // Draw game elements
    drawAliens();
    drawPlayer();
    drawBullets();
    drawGameInfo();
}

// Update player
function updatePlayer() {
    if (player.moveLeft && player.x > 5) {
        player.x -= player.speed;
    }
    if (player.moveRight && player.x + player.width < canvas.width - 5) {
        player.x += player.speed;
    }
}

// Update bullets
function updateBullets() {
    // Move bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 8;
        
        // Remove if off screen
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check collision with aliens
        for (let j = 0; j < aliens.length; j++) {
            const alien = aliens[j];
            if (alien.alive && 
                bullets[i].x < alien.x + alien.width &&
                bullets[i].x + bullets[i].width > alien.x &&
                bullets[i].y < alien.y + alien.height &&
                bullets[i].y + bullets[i].height > alien.y) {
                
                // Hit!
                bullets.splice(i, 1);
                alien.alive = false;
                game.score += 100;
                updateUI();
                
                // Check if all aliens dead
                if (aliens.every(a => !a.alive)) {
                    game.level++;
                    alienSpeed += 0.3;
                    createAliens();
                }
                break;
            }
        }
    }
}

// Update aliens
function updateAliens() {
    let moveDown = false;
    
    // Check edge
    for (const alien of aliens) {
        if (alien.alive) {
            if (alien.x + alien.width >= canvas.width || alien.x <= 0) {
                moveDown = true;
                break;
            }
        }
    }
    
    // Move aliens
    for (const alien of aliens) {
        if (alien.alive) {
            if (moveDown) {
                alien.y += 20;
                alienDirection *= -1;
                moveDown = false;
            } else {
                alien.x += alienSpeed * alienDirection;
            }
            
            // Check if reached player
            if (alien.y + alien.height >= player.y) {
                alien.alive = false;
                game.lives--;
                updateUI();
                
                if (game.lives <= 0) {
                    game.gameOver = true;
                    game.running = false;
                }
            }
        }
    }
}

// Shoot bullet
function shoot() {
    if (!game.running || game.paused || game.gameOver) return;
    
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 12
    });
}

// Update UI
function updateUI() {
    scoreElement.textContent = game.score;
    livesElement.textContent = game.lives;
    levelElement.textContent = game.level;
}

// Game loop
function gameLoop() {
    if (!game.running || game.paused || game.gameOver) {
        draw();
        return;
    }
    
    updatePlayer();
    updateBullets();
    updateAliens();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Event Listeners

// Mobile controls
moveLeftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    player.moveLeft = true;
});

moveLeftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    player.moveLeft = false;
});

moveRightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    player.moveRight = true;
});

moveRightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    player.moveRight = false;
});

shootBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    shoot();
});

// Touch screen controls
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
    if (!game.running || game.paused || game.gameOver) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // If tap in lower half, move to that position
    if (y > canvas.height / 2) {
        player.x = x - player.width / 2;
    } else {
        // If tap in upper half, shoot
        shoot();
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    if (!game.running || game.paused || game.gameOver) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    
    // Move player to touch position
    player.x = x - player.width / 2;
    
    // Keep in bounds
    if (player.x < 5) player.x = 5;
    if (player.x + player.width > canvas.width - 5) {
        player.x = canvas.width - player.width - 5;
    }
});

// Buttons
startBtn.addEventListener('click', () => {
    if (!game.running) {
        game.running = true;
        game.paused = false;
        gameLoop();
        startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    }
});

pauseBtn.addEventListener('click', () => {
    if (game.running) {
        game.paused = !game.paused;
        pauseBtn.innerHTML = game.paused ? 
            '<i class="fas fa-play"></i> Resume' : 
            '<i class="fas fa-pause"></i> Pause';
        if (!game.paused) gameLoop();
    }
});

resetBtn.addEventListener('click', () => {
    initGame();
    game.running = false;
    game.paused = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
});

// Window resize
window.addEventListener('resize', () => {
    setCanvasSize();
    createAliens();
    draw();
});

// Keyboard controls (for testing)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') player.moveLeft = true;
    if (e.key === 'ArrowRight') player.moveRight = true;
    if (e.key === ' ') shoot();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') player.moveLeft = false;
    if (e.key === 'ArrowRight') player.moveRight = false;
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', function(e) {
    if (e.target === canvas || e.target.closest('.mobile-controls')) {
        e.preventDefault();
    }
}, { passive: false });

// Initialize
window.addEventListener('load', () => {
    initGame();
});
