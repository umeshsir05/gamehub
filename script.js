let player = document.getElementById("player");
let enemy = document.querySelector(".enemy");
let scoreEl = document.getElementById("score");
let startScreen = document.getElementById("start");

let keys = {};
let score = 0;
let gameRunning = false;

document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if(e.key === "Enter" && !gameRunning){
    startGame();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

function startGame(){
  gameRunning = true;
  score = 0;
  enemy.style.top = "-100px";
  enemy.style.left = Math.floor(Math.random() * 240) + "px";
  startScreen.style.display = "none";
  requestAnimationFrame(gamePlay);
}

function gamePlay(){
  if(!gameRunning) return;

  score++;
  scoreEl.innerText = score;

  let playerLeft = player.offsetLeft;
  if(keys["ArrowLeft"] && playerLeft > 0){
    player.style.left = playerLeft - 5 + "px";
  }
  if(keys["ArrowRight"] && playerLeft < 260){
    player.style.left = playerLeft + 5 + "px";
  }

  let enemyTop = enemy.offsetTop;
  if(enemyTop > 500){
    enemy.style.top = "-100px";
    enemy.style.left = Math.floor(Math.random() * 240) + "px";
  }else{
    enemy.style.top = enemyTop + 5 + "px";
  }

  if(isCollide(player, enemy)){
    gameOver();
    return;
  }

  requestAnimationFrame(gamePlay);
}

function isCollide(a,b){
  let aRect = a.getBoundingClientRect();
  let bRect = b.getBoundingClientRect();

  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function gameOver(){
  gameRunning = false;
  startScreen.innerHTML = "Game Over<br>Score: " + score + "<br>Press ENTER";
  startScreen.style.display = "block";
}