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

let isJumping = false;
let isGameOver = false;
let isStarted = false;
let gravity = 1;
let obstacleTimeout;
let score = 0;
let timeElapsed = 0;
let gameInterval;

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
        
        // Usiamo i riferimenti costanti: molto più veloce!
        timerDisplay.innerText = timeElapsed;
        scoreDisplay.innerText = score;
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

// --- LOGICA OSTACOLI E COLLISIONE ---
function createObstacle() {
    if (isGameOver || !isStarted) return;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameContainer.appendChild(obstacle);

    // Randomizzazione forma
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

        obstaclePosition -= 10;
        obstacle.style.left = obstaclePosition + 'px';

        // Hitbox del player (X: 50 a 100)
        let playerBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom"));

        // Controllo Collisione
        if (
            obstaclePosition > (50 - randomWidth) && 
            obstaclePosition < 100 && 
            playerBottom < randomHeight
        ) {
            gameOver();
            clearInterval(moveTimerId);
        }

        // Rimozione ostacolo uscito a sinistra
        if (obstaclePosition < -50) {
            clearInterval(moveTimerId);
            obstacle.remove();
        }
    }, 20);

    // Programma il prossimo ostacolo (tempo casuale)
    let randomTime = Math.random() * (2500 - 1000) + 1000;
    obstacleTimeout = setTimeout(createObstacle, randomTime);
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