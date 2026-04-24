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
const volumeBtn = document.getElementById("volume-btn");

const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");

const hearts = [
    document.getElementById("heart1"),
    document.getElementById("heart2"),
    document.getElementById("heart3")
];

const jumpSound = new Audio('assets/sound/jump-sound.wav');
const damageSound = new Audio('assets/sound//hit-sound.wav');
const backgroundMusic = new Audio('assets/sound/bg-music.mp3');

backgroundMusic.preload = 'auto';
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1;
jumpSound.volume = 0.2;
damageSound.volume = 0.4;

let isMuted = false;
let isJumping = false;
let isGameOver = false;
let isStarted = false;
let isPaused = false;
let isInvulnerable = false;

let gravity = 1;
let obstacleTimeout;
let gameInterval;

let score = 0;
let timeElapsed = 0;
let lives = 3;
let gameSpeed = 10;
let obstacleInterval = 2500;
let pausedObstacleTimeRemaining = 0;
let pauseTime = null;

let walkFrame = false;
let walkInterval = null;

function setPlayerState(state) {
    player.classList.remove('state-idle', 'state-walk-a', 'state-walk-b', 'state-jump', 'state-hit');
    player.classList.add('state-' + state);
}

function startWalkCycle() {
    stopWalkCycle();
    walkInterval = setInterval(() => {
        if (!isJumping && !isGameOver && !isPaused) {
            walkFrame = !walkFrame;
            setPlayerState(walkFrame ? 'walk-a' : 'walk-b');
        }
    }, 150);
}

function stopWalkCycle() {
    clearInterval(walkInterval);
    walkInterval = null;
}

startBtn.addEventListener("click", initGame);
restartBtn.addEventListener("click", initGame);

resumeBtn.addEventListener("click", () => {
    if (isPaused) togglePause();
});

pauseBtn.addEventListener("click", () => {
    if (isStarted && !isGameOver) togglePause();
});

volumeBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    const icon = volumeBtn.querySelector("i");

    if (isMuted) {
        backgroundMusic.pause();
        jumpSound.volume = 0;
        damageSound.volume = 0;
        icon.className = "hgi hgi-stroke hgi-rounded hgi-volume-off";
        volumeBtn.setAttribute("aria-label", "Unmute");
    } else {
        jumpSound.volume = 0.4;
        damageSound.volume = 0.6;
        if (isStarted && !isGameOver && !isPaused) {
            backgroundMusic.play().catch(() => { });
        }
        icon.className = "hgi hgi-stroke hgi-rounded hgi-volume-high";
        volumeBtn.setAttribute("aria-label", "Mute");
    }
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
    isInvulnerable = false;

    score = 0;
    timeElapsed = 0;
    lives = 3;
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

    setPlayerState('idle');
    startWalkCycle();

    clearInterval(gameInterval);
    gameInterval = setInterval(updateScoreAndTime, 1000);

    clearTimeout(obstacleTimeout);
    obstacleTimeout = setTimeout(createObstacle, 1000);

    if (!isMuted) backgroundMusic.play().catch(() => { });

    animate();
}

function togglePause() {
    isPaused = !isPaused;
    const icon = pauseBtn.querySelector("i");

    if (isPaused) {
        icon.className = "hgi hgi-stroke hgi-rounded hgi-play";
        clearInterval(gameInterval);
        clearTimeout(obstacleTimeout);
        pauseTime = Date.now();
        pauseMenu.style.display = "flex";
        backgroundMusic.pause();
        stopWalkCycle();
        setPlayerState('idle');
    } else {
        icon.className = "hgi hgi-stroke hgi-rounded hgi-pause";
        gameInterval = setInterval(updateScoreAndTime, 1000);
        const remaining = Math.max(0, pausedObstacleTimeRemaining - (Date.now() - pauseTime));
        obstacleTimeout = setTimeout(createObstacle, remaining);
        pauseTime = null;
        pauseMenu.style.display = "none";
        if (!isMuted) backgroundMusic.play().catch(() => { });
        startWalkCycle();
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
            if (obstacleInterval > 700) obstacleInterval -= 200;
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

    setPlayerState('jump');

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
            walkFrame = false;
            setPlayerState('walk-a');
        }

        player.style.bottom = position + "px";
    }, 20);

    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => { });
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

        const playerBottom = parseInt(getComputedStyle(player).bottom);

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

    const minTime = Math.max(400, obstacleInterval - 500);
    const randomTime = Math.random() * (obstacleInterval - minTime) + minTime;

    pausedObstacleTimeRemaining = randomTime;

    clearTimeout(obstacleTimeout);
    obstacleTimeout = setTimeout(createObstacle, randomTime);
}

function takeDamage() {
    lives--;

    if (hearts[lives]) hearts[lives].style.display = "none";

    damageSound.currentTime = 0;
    damageSound.play().catch(() => { });

    setPlayerState('hit');
    setTimeout(() => {
        if (!isJumping) setPlayerState('walk-a');
    }, 400);

    if (lives <= 0) {
        gameOver();
        return;
    }

    isInvulnerable = true;
    player.classList.add("invulnerable");

    setTimeout(() => {
        isInvulnerable = false;
        player.classList.remove("invulnerable");
    }, 1500);
}

function gameOver() {
    isGameOver = true;
    isStarted = false;

    stopWalkCycle();
    setPlayerState('idle');

    clearTimeout(obstacleTimeout);
    clearInterval(gameInterval);

    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    finalScoreValue.innerText = `Your Score: ${score}`;
    gameOverMenu.style.display = "flex";
}

const l1 = document.querySelector('.layerBg');
const l2 = document.querySelector('.layer2');
const l3 = document.querySelector('.layer3');

let posX = 0;
const bgSpeed = 2;

function moveBackground() {
    posX -= bgSpeed;

    l1.style.backgroundPositionX = (posX * 0.1) + "px";
    l2.style.backgroundPositionX = (posX * 0.4) + "px";
    l3.style.backgroundPositionX = (posX * 0.6) + "px";
}

function animate() {
    if (!isGameOver && isStarted && !isPaused) {
        moveBackground();
    }
    requestAnimationFrame(animate);
}
