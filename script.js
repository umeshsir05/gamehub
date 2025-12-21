const player = document.getElementById("player");
const enemy = document.getElementById("enemy");
const scoreEl = document.getElementById("score");
const startScreen = document.getElementById("startScreen");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let moveLeft = false;
let moveRight = false;
let score = 0;
let speed = 5;
let gameRunning = false;

/* Keyboard */
document.addEventListener("keydown", e => {
  if(e.key === "ArrowLeft") moveLeft = true;
  if(e.key === "ArrowRight") moveRight = true;
  if(e.key === "Enter" && !gameRunning) startGame();
});

document.addEventListener("keyup", e => {
  if(e.key === "ArrowLeft") moveLeft = false;
  if(e.key === "ArrowRight") moveRight = false;
});

/* 🔥 Mobile Touch Fix */
leftBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  moveLeft = true;
});

leftBtn.addEventListener("touchend", e => {
  e.preventDefault();
  moveLeft = false;
});

rightBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  moveRight = true;
});

rightBtn.addEventListener("touchend", e => {
  e.preventDefault();
  moveRight = false;
});

/* Tap to Start */
startScreen.addEventListener("touchstart", () => {
  if(!gameRunning) startGame();
});

startScreen.addEventListener("click", () => {
  if(!gameRunning) startGame();
});

function startGame(){
  gameRunning = true;
  score = 0;
  speed = 5;
  enemy.style.top = "-100px";
  enemy.style.left = Math.floor(Math.random() * 240) + "px";
  startScreen.style.display = "none";
  requestAnimationFrame(gamePlay);
}

function gamePlay(){
  if(!gameRunning) return;

  score++;
  scoreEl.innerText = score;

  if(score % 200 === 0) speed++;

  let playerX = player.offsetLeft;

  if(moveLeft && playerX > 0){
    player.style.left = playerX - 6 + "px";
  }

  if(moveRight && playerX < 260){
    player.style.left = playerX + 6 + "px";
  }

  let enemyY = enemy.offsetTop;

  if(enemyY > 520){
    enemy.style.top = "-100px";
    enemy.style.left = Math.floor(Math.random() * 240) + "px";
  } else {
    enemy.style.top = enemyY + speed + "px";
  }

  if(isCollide(player, enemy)){
    endGame();
    return;
  }

  requestAnimationFrame(gamePlay);
}

function isCollide(a, b){
  let aRect = a.getBoundingClientRect();
  let bRect = b.getBoundingClientRect();

  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function endGame(){
  gameRunning = false;
  startScreen.innerHTML =
    "Game Over<br>Score: " + score + "<br>Tap / Enter to Restart";
  startScreen.style.display = "flex";
}