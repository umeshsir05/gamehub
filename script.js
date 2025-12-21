const player = document.getElementById("player");
const enemy = document.getElementById("enemy");
const scoreEl = document.getElementById("score");
const startScreen = document.getElementById("startScreen");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let keys = {};
let score = 0;
let speed = 5;
let gameRunning = false;

/* Keyboard */
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if(e.key === "Enter" && !gameRunning){
    startGame();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

/* Mobile Touch */
leftBtn.addEventListener("touchstart", () => keys["ArrowLeft"] = true);
leftBtn.addEventListener("touchend", () => keys["ArrowLeft"] = false);

rightBtn.addEventListener("touchstart", () => keys["ArrowRight"] = true);
rightBtn.addEventListener("touchend", () => keys["ArrowRight"] = false);

/* Tap to start */
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

  if(score % 200 === 0){
    speed++;
  }

  let playerX = player.offsetLeft;

  if(keys["ArrowLeft"] && playerX > 0){
    player.style.left = playerX - 6 + "px";
  }

  if(keys["ArrowRight"] && playerX < 260){
    player.style.left = playerX + 6 + "px";
  }

  let enemyY = enemy.offsetTop;

  if(enemyY > 520){
    enemy.style.top = "-100px";
    enemy.style.left = Math.floor(Math.random() * 240) + "px";
  }else{
    enemy.style.top = enemyY + speed + "px";
  }

  if(checkCollision(player, enemy)){
    endGame();
    return;
  }

  requestAnimationFrame(gamePlay);
}

function checkCollision(a, b){
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