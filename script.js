const player = document.getElementById("player");
const gameContainer = document.getElementById("game-container");
const startMenu = document.getElementById("start-menu");
const gameOverMenu = document.getElementById("game-over-menu");
const pauseMenu = document.getElementById("pause-menu");

const finalScoreValue = document.getElementById("final-score");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const resumeBtn = document.getElementById("resume-btn");
const pauseBtn = document.getElementById("pause-btn");

const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");

const hearts = [
    document.getElementById("heart1"),
    document.getElementById("heart2"),
    document.getElementById("heart3")
];

let isMuted = false;
const jumpSound = new Audio('sound/jump-sound.wav');
const damageSound = new Audio('sound/hit-sound.wav'); 
const backgroundMusic = new Audio('sound/bg-music.mp3');

backgroundMusic.preload = 'auto';
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;
jumpSound.volume = 0.6;
damageSound.volume = 0.8;

let isJumping = false;
let isGameOver = false;
let isStarted = false;
let isPaused = false;

let gravity = 1;
let obstacleTimeout;

let score = 0;
let timeElapsed = 0;
let gameInterval;

let lives = 3;
let isInvulnerable = false;

let gameSpeed = 10;
let obstacleInterval = 2500;

let pausedObstacleTimeRemaining = 0;
let pauseTime = null;

startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", initGame);

resumeBtn.addEventListener("click", () => {
    if (isPaused) togglePause();
});

pauseBtn.addEventListener("click", () => {
    if (isStarted && !isGameOver) togglePause();
});

document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();

        if (!isStarted) initGame();
        else if (isPaused) togglePause();
        else if (!isJumping && !isGameOver) jump();
    }
});

document.addEventListener("touchstart", (event) => {
    event.preventDefault();

    if (!isStarted) initGame();
    else if (isPaused) togglePause();
    else if (!isJumping && !isGameOver) jump();
}, { passive: false });

function initGame() {
    isGameOver = false;
    isStarted = true;
    isJumping = false;
    isPaused = false;

    score = 0;
    timeElapsed = 0;
    lives = 3;

    isInvulnerable = false;

    gameSpeed = 10;
    obstacleInterval = 2500;

    pausedObstacleTimeRemaining = 0;
    pauseTime = null;

    pauseBtn.querySelector("i").className = "hgi hgi-stroke hgi-rounded hgi-pause";

    player.classList.remove("invulnerable");
    hearts.forEach(h => h.style.display = "inline");

    timerDisplay.innerText = timeElapsed;
    scoreDisplay.innerText = score;

    startMenu.style.display = "none";
    gameOverMenu.style.display = "none";
    pauseMenu.style.display = "none";

    document.querySelectorAll(".obstacle").forEach(o => o.remove());

    player.style.bottom = "0px";
    player.classList.remove("jumping");
    player.style.transform = "";

    clearInterval(gameInterval);
    gameInterval = setInterval(updateScoreAndTime, 1000);

    clearTimeout(obstacleTimeout);
    obstacleTimeout = setTimeout(createObstacle, 1000);

    backgroundMusic.play();
}

function togglePause() {
    isPaused = !isPaused;
    const icon = pauseBtn.querySelector("i");

    if (isPaused) {
        icon.className = "hgi hgi-play";
        clearInterval(gameInterval);
        clearTimeout(obstacleTimeout);
        pauseTime = Date.now();
        pauseMenu.style.display = "flex";
    } else {
        icon.className = "hgi hgi-pause";
        gameInterval = setInterval(updateScoreAndTime, 1000);

        const remaining = Math.max(0, pausedObstacleTimeRemaining - (Date.now() - pauseTime));
        obstacleTimeout = setTimeout(createObstacle, remaining);

        pauseTime = null;
        pauseMenu.style.display = "none";
    }
}

function updateScoreAndTime() {
    if (!isGameOver && isStarted && !isPaused) {
        timeElapsed++;
        score += 10;

        timerDisplay.innerText = timeElapsed;
        scoreDisplay.innerText = score;

        if (score % 100 === 0) {
            gameSpeed += 1.5;

            if (obstacleInterval > 700) {
                obstacleInterval -= 200;
            }
        }
    }
}

function jump() {
    isJumping = true;
    let position = 0;
    let velocity = 15;

    player.classList.remove("jumping");
    void player.offsetWidth;
    player.classList.add("jumping");

    let timerId = setInterval(() => {
        if (isGameOver || isPaused) {
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

    if (!isMuted) {
        jumpSound.currentTime = 0;
        jumpSound.play();
    }
}

function createObstacle() {
    if (isGameOver || !isStarted) return;

    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle");
    gameContainer.appendChild(obstacle);

    let randomHeight = Math.floor(Math.random() * 40) + 20;
    let randomWidth = Math.floor(Math.random() * 25) + 15;

    obstacle.style.height = randomHeight + "px";
    obstacle.style.width = randomWidth + "px";

    let obstaclePosition = 600;

    let moveTimerId = setInterval(() => {
        if (isGameOver) {
            clearInterval(moveTimerId);
            return;
        }

        if (isPaused) return;

        obstaclePosition -= gameSpeed;

        obstacle.style.left = obstaclePosition + "px";

        let playerBottom = parseInt(getComputedStyle(player).bottom);

        if (
            obstaclePosition > (50 - randomWidth) &&
            obstaclePosition < 100 &&
            playerBottom < randomHeight
        ) {
            if (!isInvulnerable) takeDamage();
        }

        if (obstaclePosition < -50) {
            clearInterval(moveTimerId);
            obstacle.remove();
        }
    }, 20);

    let minTime = Math.max(400, obstacleInterval - 500);
    let randomTime = Math.random() * (obstacleInterval - minTime) + minTime;

    pausedObstacleTimeRemaining = randomTime;

    clearTimeout(obstacleTimeout);
    obstacleTimeout = setTimeout(createObstacle, randomTime);
}

function takeDamage() {
    lives--;

    if (hearts[lives]) hearts[lives].style.display = "none";

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

    if (!isMuted) {
        damageSound.currentTime = 0;
        damageSound.play();
    }
}

function gameOver() {
    isGameOver = true;
    isStarted = false;

    clearTimeout(obstacleTimeout);

    finalScoreValue.innerText = `Your Score: ${score}`;
    gameOverMenu.style.display = "flex";
}

function toggleMute() {
    isMuted = !isMuted;

    if (isMuted) {
        backgroundMusic.pause();
    } else {
        if (isStarted && !isGameOver) {
            backgroundMusic.play().catch(err => console.log("Audio in attesa di interazione"));
        }
    }
    return isMuted;
}