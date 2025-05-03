document.addEventListener('DOMContentLoaded', () => {
  // Game elements
  const road = document.querySelector('.road');
  const car = document.getElementById('playerCar');
  const scoreElement = document.getElementById('scoreValue');
  const speedElement = document.getElementById('speedValue');
  const finalScoreElement = document.getElementById('finalScore');
  const gameOverScreen = document.getElementById('gameOver');
  const startScreen = document.getElementById('startScreen');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  
  // Game variables
  let gameRunning = false;
  let score = 0;
  let speed = 1;
  let roadWidth = road.offsetWidth;
  let carWidth = car.offsetWidth;
  let carPosition = (roadWidth - carWidth) / 2;
  let obstacles = [];
  let dividers = [];
  let animationFrameId;
  let lastObstacleTime = 0;
  let obstacleInterval = 2000; // milliseconds
  
  // Movement controls
  let leftPressed = false;
  let rightPressed = false;
  
  // Set initial car position
  car.style.left = carPosition + 'px';
  
  // Keyboard event listeners
  function setupControls() {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      
      leftBtn.addEventListener('touchstart', () => { leftPressed = true; });
      leftBtn.addEventListener('touchend', () => { leftPressed = false; });
      leftBtn.addEventListener('mousedown', () => { leftPressed = true; });
      leftBtn.addEventListener('mouseup', () => { leftPressed = false; });
      
      rightBtn.addEventListener('touchstart', () => { rightPressed = true; });
      rightBtn.addEventListener('touchend', () => { rightPressed = false; });
      rightBtn.addEventListener('mousedown', () => { rightPressed = true; });
      rightBtn.addEventListener('mouseup', () => { rightPressed = false; });
  }
  
  function handleKeyDown(e) {
      if (e.key === 'ArrowLeft') {
          leftPressed = true;
      } else if (e.key === 'ArrowRight') {
          rightPressed = true;
      }
  }
  
  function handleKeyUp(e) {
      if (e.key === 'ArrowLeft') {
          leftPressed = false;
      } else if (e.key === 'ArrowRight') {
          rightPressed = false;
      }
  }
  
  // Create road dividers
  function createDividers() {
      // Clear existing dividers
      dividers.forEach(div => road.removeChild(div));
      dividers = [];
      
      // Create new dividers
      const dividerCount = 10;
      const roadHeight = road.offsetHeight;
      
      for (let i = 0; i < dividerCount; i++) {
          const divider = document.createElement('div');
          divider.className = 'divider';
          divider.style.top = (i * (roadHeight / dividerCount)) + 'px';
          road.appendChild(divider);
          dividers.push(divider);
      }
  }
  
  // Create obstacle
  function createObstacle() {
      const obstacle = document.createElement('div');
      obstacle.className = 'obstacle';
      
      // Random horizontal position within road bounds
      const minLeft = 50;
      const maxLeft = roadWidth - minLeft - 60; // 60 is obstacle width
      const randomLeft = Math.random() * (maxLeft - minLeft) + minLeft;
      
      obstacle.style.left = randomLeft + 'px';
      obstacle.style.top = '-100px'; // Start above the visible area
      obstacle.dataset.speed = Math.random() * 2 + 3; // Random speed
      
      road.appendChild(obstacle);
      obstacles.push(obstacle);
  }
  
  // Move the car
  function moveCar() {
      const moveSpeed = 8 * speed;
      if (leftPressed && carPosition > 30) {
          carPosition -= moveSpeed;
      }
      if (rightPressed && carPosition < roadWidth - carWidth - 30) {
          carPosition += moveSpeed;
      }
      
      car.style.left = carPosition + 'px';
  }
  
  // Update dividers position
  function updateDividers() {
      dividers.forEach((divider, index) => {
          let top = parseFloat(divider.style.top);
          top += 7 * speed;
          
          if (top > road.offsetHeight) {
              top = -50; // Reset to top when it goes below the road
          }
          
          divider.style.top = top + 'px';
          
          // Create 3D effect by scaling and translating
          const perspective = 1 - (top / road.offsetHeight);
          divider.style.transform = `scaleX(${perspective}) translateZ(${perspective * 100}px)`;
          divider.style.opacity = perspective;
      });
  }
  
  // Update obstacles position
  function updateObstacles(timestamp) {
      // Create new obstacle at intervals
      if (timestamp - lastObstacleTime > obstacleInterval / speed) {
          createObstacle();
          lastObstacleTime = timestamp;
          
          // Gradually decrease obstacle interval (increase difficulty)
          if (obstacleInterval > 800) {
              obstacleInterval -= 50;
          }
      }
      
      // Move existing obstacles
      obstacles.forEach((obstacle, index) => {
          let top = parseFloat(obstacle.style.top) || -100;
          const obstacleSpeed = parseFloat(obstacle.dataset.speed) * speed;
          
          top += obstacleSpeed;
          obstacle.style.top = top + 'px';
          
          // Create 3D effect
          const perspective = 1 - (top / (road.offsetHeight * 2));
          if (perspective > 0) {
              obstacle.style.transform = `scale(${perspective}) translateZ(${perspective * 50}px)`;
              obstacle.style.opacity = perspective;
          }
          
          // Check collision
          if (top > road.offsetHeight - 180 && top < road.offsetHeight - 80) {
              const obstacleLeft = parseFloat(obstacle.style.left);
              const obstacleWidth = obstacle.offsetWidth;
              
              if (
                  carPosition < obstacleLeft + obstacleWidth - 20 &&
                  carPosition + carWidth > obstacleLeft + 20
              ) {
                  gameOver();
              }
          }
          
          // Remove obstacle when it goes out of view
          if (top > road.offsetHeight) {
              road.removeChild(obstacle);
              obstacles.splice(index, 1);
              
              // Increase score when passing an obstacle
              score += Math.floor(10 * speed);
              scoreElement.textContent = score;
              
              // Increase speed gradually
              if (score % 100 === 0 && speed < 3) {
                  speed += 0.1;
                  speedElement.textContent = speed.toFixed(1);
              }
          }
      });
  }
  
  // Game over
  function gameOver() {
      gameRunning = false;
      cancelAnimationFrame(animationFrameId);
      finalScoreElement.textContent = score;
      gameOverScreen.style.display = 'flex';
  }
  
  // Game loop
  function gameLoop(timestamp) {
      if (!gameRunning) return;
      
      moveCar();
      updateDividers();
      updateObstacles(timestamp);
      
      animationFrameId = requestAnimationFrame(gameLoop);
  }
  
  // Reset game
  function resetGame() {
      // Reset variables
      score = 0;
      speed = 1;
      roadWidth = road.offsetWidth;
      carPosition = (roadWidth - carWidth) / 2;
      lastObstacleTime = 0;
      obstacleInterval = 2000;
      
      // Reset UI
      scoreElement.textContent = '0';
      speedElement.textContent = '1';
      car.style.left = carPosition + 'px';
      
      // Clear obstacles
      obstacles.forEach(obs => road.removeChild(obs));
      obstacles = [];
      
      // Recreate dividers
      createDividers();
      
      // Hide screens
      gameOverScreen.style.display = 'none';
      startScreen.style.display = 'none';
      
      // Start game
      gameRunning = true;
      animationFrameId = requestAnimationFrame(gameLoop);
  }
  
  // Handle window resize
  function handleResize() {
      roadWidth = road.offsetWidth;
      carPosition = Math.min(carPosition, roadWidth - carWidth);
      car.style.left = carPosition + 'px';
      createDividers();
  }
  
  // Initialize game
  function init() {
      setupControls();
      createDividers();
      
      startBtn.addEventListener('click', resetGame);
      restartBtn.addEventListener('click', resetGame);
      
      window.addEventListener('resize', handleResize);
  }
  
  init();
});