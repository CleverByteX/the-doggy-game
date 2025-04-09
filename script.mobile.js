// Variables for game state (if not already defined)
let isGameOver = false;
let isJumping = false;
let score = 0;
const dog = document.getElementById('dog');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
let dogBottom = 12; // in vh units; originally 12vh as the base level

// Allow jump on touch (and spacebar for testing)
document.addEventListener('touchstart', () => {
  jump();
});
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    jump();
  }
});

// Simple jump function (adjust as needed)
function jump() {
  if (isJumping) return;
  isJumping = true;
  let jumpHeight = 0;
  // Jump up for 200ms then fall down (using setInterval for simplicity)
  const jumpInterval = setInterval(() => {
    // Increase height until a max delta (e.g. 20 vh)
    if (jumpHeight >= 20) {
      clearInterval(jumpInterval);
      // Start falling down
      const fallInterval = setInterval(() => {
        if (jumpHeight <= 0) {
          clearInterval(fallInterval);
          isJumping = false;
          jumpHeight = 0;
        }
        jumpHeight -= 2;
        dog.style.bottom = `${dogBottom + jumpHeight}vh`;
      }, 20);
    } else {
      jumpHeight += 2;
      dog.style.bottom = `${dogBottom + jumpHeight}vh`;
    }
  }, 20);
}

// Define cactus spawning
function spawnCactus() {
  if (isGameOver) return;
  
  const cactus = document.createElement('div');
  cactus.className = 'cactus';
  cactus.style.left = '100vw'; // start off-screen
  gameContainer.appendChild(cactus);
  
  // Remove cactus after its animation ends
  cactus.addEventListener('animationend', () => {
    cactus.remove();
  });
  
  // Spawn the next cactus after a random delay (between 1-3 seconds)
  setTimeout(spawnCactus, Math.random() * 2000 + 1000);
}

// Collision detection function – check all cacti and stop game on first collision
function checkCollision() {
  const dogRect = dog.getBoundingClientRect();
  // Adjust dog's collision box with an inset margin (20% of width/height)
  const marginX = dogRect.width * 0.2;
  const marginY = dogRect.height * 0.2;
  const adjustedDogRect = {
    left: dogRect.left + marginX,
    right: dogRect.right - marginX,
    top: dogRect.top + marginY,
    bottom: dogRect.bottom - marginY
  };

  const cacti = document.querySelectorAll('.cactus');
  for (const cactus of cacti) {
    const cactusRect = cactus.getBoundingClientRect();
    if (
      adjustedDogRect.left < cactusRect.right &&
      adjustedDogRect.right > cactusRect.left &&
      adjustedDogRect.top < cactusRect.bottom &&
      adjustedDogRect.bottom > cactusRect.top
    ) {
      gameOver();
      return; // Exit once a collision is detected
    }
  }
  if (!isGameOver) {
    requestAnimationFrame(checkCollision);
  }
}

// Updated game over function: stop game loops and reset spawning
function gameOver() {
  isGameOver = true;
  gameOverElement.style.display = 'block';
  
  // Stop background animation by clearing its inline style
  gameContainer.style.animation = 'none';
  
  // Remove all existing cacti to stop further collisions
  document.querySelectorAll('.cactus').forEach(cactus => cactus.remove());
  
  // Optionally, cancel any pending timeouts/intervals if you stored them
  console.log("Game Over!");
}

// Score updating function
function updateScore() {
  if (isGameOver) return;
  score++;
  scoreElement.textContent = 'Score: ' + score;
  setTimeout(updateScore, 100); // Update score every 100ms
}

// Start the game
function startGame() {
  isGameOver = false;
  spawnCactus();
  requestAnimationFrame(checkCollision); // Start collision detection loop
  updateScore();
}

// Restart game logic for mobile
restartButton.addEventListener('click', () => {
  isGameOver = false;
  score = 0;
  scoreElement.textContent = 'Score: 0';
  gameOverElement.style.display = 'none';
  dogBottom = 12; // Reset dog's base level (in vh)
  dog.style.bottom = `${dogBottom}vh`;
  isJumping = false;
  
  // Remove all existing cacti
  document.querySelectorAll('.cactus').forEach(c => c.remove());
  
  // Restart background animation
  gameContainer.style.animation = '';
  void gameContainer.offsetWidth;  // trigger reflow
  gameContainer.style.animation = 'scrollBackground 3s linear infinite';
  
  startGame();
});

// Start collision detection and score update once the game starts
window.addEventListener('load', () => {
  console.log("Mobile game started");
  startGame();
  requestAnimationFrame(checkCollision);
  updateScore();
});