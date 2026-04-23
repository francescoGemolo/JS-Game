// --- VARIABILI DI STATO E RIFERIMENTI ---
const player = document.getElementById("player");
const gameContainer = document.getElementById("game-container");
const startMenu = document.getElementById("start-menu");
const gameOverMenu = document.getElementById("game-over-menu");
const finalScoreValue = document.getElementById("final-score");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");
const hearts = [
    document.getElementById("heart1"),
    document.getElementById("heart2"),
    document.getElementById("heart3")
];

let isJumping = false;
let isGameOver = false;
let isStarted = false;
let gravity = 1;
let obstacleTimeout;
let score = 0;
let timer = 0;
let timeElapsed = 0;
let gameInterval;
let lives = 3;
let isInvulnerable = false;
let gameSpeed = 10;
let obstacleInterval = 2500;

// --- INIZIALIZZAZIONE E CONTROLLI ---

// Avvia il gioco dai bottoni
startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", initGame);

// Gestione tastiera (Salto e Start)
document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        if (!isStarted) {
            initGame();
        } else if (!isJumping && !isGameOver) {
            jump();
        }
    }
});

function initGame() {
    isGameOver = false;
    isStarted = true;
    isJumping = false;
    score = 0;
    timeElapsed = 0;
    lives = 3;
    isInvulnerable = false;
    gameSpeed = 10;
    obstacleInterval = 2500;

    player.classList.remove("invulnerable");
    hearts.forEach(heart => heart.style.display = "inline");

    timerDisplay.innerText = timeElapsed;
    scoreDisplay.innerText = score;

    startMenu.style.display = "none";
    gameOverMenu.style.display = "none";
    
    // Pulizia campo da vecchi ostacoli
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obs => obs.remove());
    
    // Reset posizione player
    player.style.bottom = "0px";

    player.classList.remove("jumping"); 
    player.style.transform = "";

    clearInterval(gameInterval);
    gameInterval = setInterval(updateScoreAndTime, 1000);

    clearTimeout(obstacleTimeout);
    obstacleTimeout = setTimeout(createObstacle, 1000);
    
}

function updateScoreAndTime() {
    if (!isGameOver && isStarted) {
        timeElapsed++;
        score += 10;
        
        timerDisplay.innerText = timeElapsed;
        scoreDisplay.innerText = score;

        if (score % 100 === 0) {    
            gameSpeed += 1.5; 
    
            if (obstacleInterval > 700) {
                obstacleInterval -= 200; 
            }
            console.log("TEST DIFFICOLTÀ ATTIVO");
        }
    }
}
// --- LOGICA DEL SALTO ---
function jump() {
    isJumping = true;
    let position = 0;
    let velocity = 15;

    player.classList.remove("jumping")
    player.style.transform = "";
    void player.offsetWidth;
    player.classList.add("jumping");

    let timerId = setInterval(function () {
        // Se il gioco finisce mentre stiamo saltando, fermiamo il timer
        if (isGameOver) {
            clearInterval(timerId);
            return;
        }

        position += velocity;
        velocity -= gravity;

        if (position <= 0) {
            clearInterval(timerId);
            isJumping = false;
            position = 0;
            player.classList.remove("jumping");
        }
        player.style.bottom = position + "px";
    }, 20);
}

function createObstacle() {
    if (isGameOver || !isStarted) return;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameContainer.appendChild(obstacle);

    let randomHeight = Math.floor(Math.random() * (60 - 20 + 1)) + 20;
    let randomWidth = Math.floor(Math.random() * (40 - 15 + 1)) + 15;
    obstacle.style.height = randomHeight + 'px';
    obstacle.style.width = randomWidth + 'px';
    
    let obstaclePosition = 600;

    let moveTimerId = setInterval(function() {
        if (isGameOver) {
            clearInterval(moveTimerId);
            return;
        }
        obstaclePosition -= gameSpeed; 
        obstacle.style.left = obstaclePosition + 'px';

        let playerBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom"));

        if (
            obstaclePosition > (50 - randomWidth) && 
            obstaclePosition < 100 && 
            playerBottom < randomHeight
        ) {
            if (!isInvulnerable) {
                takeDamage();
            }
        }

        if (obstaclePosition < -50) {
            clearInterval(moveTimerId);
            obstacle.remove();
        }
    }, 20);

    let minTime = obstacleInterval - 500;
    if (minTime < 400) minTime = 400;

    let randomTime = Math.random() * (obstacleInterval - minTime) + minTime;
    
    if (typeof obstacleTimeout !== 'undefined') clearTimeout(obstacleTimeout);
    obstacleTimeout = setTimeout(createObstacle, randomTime);
}

function takeDamage() {
    lives--;
    
    if (hearts[lives]) {
        hearts[lives].style.display = "none";
    }

    if (lives <= 0) {
        gameOver();
    } else {
        isInvulnerable = true;
        player.classList.add("invulnerable");

        setTimeout(() => {
            isInvulnerable = false;
            player.classList.remove("invulnerable");
        }, 1500);
    }
}

// --- FINE GIOCO ---
function gameOver() {
    isGameOver = true;
    isStarted = false;
    
    // Blocca la generazione di nuovi ostacoli
    clearTimeout(obstacleTimeout);

    finalScoreValue.innerText = `Your Score: ${score}`;
    
    // Mostra Menu di Game Over
    gameOverMenu.style.display = "flex";
}