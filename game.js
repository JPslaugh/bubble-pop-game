class BubblePopGame {
         constructor() {
             this.canvas = null;
             this.ctx = null;
             this.bubbles = [];
             this.score = 0;
             this.level = 1;
             this.lives = 5;
             this.gameRunning = false;
             this.gameOver = false;
             this.spawnInterval = null;

             this.bubbleSpawnRate = 2000;
             this.maxBubbles = 8;
             this.bubbleLifetime = 5000;

             this.colors = [
                 '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
                 '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
             ];

             this.init();
         }

         init() {
             // Wait for DOM to be ready
             if (document.readyState === 'loading') {
                 document.addEventListener('DOMContentLoaded', () =>
     this.setup());
             } else {
                 this.setup();
             }
         }

         setup() {
             this.canvas = document.getElementById('gameCanvas');
             if (!this.canvas) {
                 console.error('Canvas not found!');
                 return;
             }

             this.ctx = this.canvas.getContext('2d');
             this.setupCanvas();
             this.setupEventListeners();
             this.gameLoop();
             console.log('Game initialized successfully');
         }

         setupCanvas() {
             // Set canvas size
             this.canvas.width = window.innerWidth;
             this.canvas.height = window.innerHeight - 60; // Account for
     header

             // Prevent scrolling and zooming
             document.body.style.overflow = 'hidden';
             document.body.style.touchAction = 'none';

             window.addEventListener('resize', () => {
                 this.canvas.width = window.innerWidth;
                 this.canvas.height = window.innerHeight - 60;
             });

             console.log(`Canvas size:
     ${this.canvas.width}x${this.canvas.height}`);
         }

         setupEventListeners() {
             const startBtn = document.getElementById('startBtn');
             const playAgainBtn = document.getElementById('playAgainBtn');

             if (startBtn) {
                 startBtn.addEventListener('click', () => {
                     console.log('Start button clicked');
                     this.startGame();
                 });
             }

             if (playAgainBtn) {
                 playAgainBtn.addEventListener('click', () => {
                     console.log('Play again button clicked');
                     this.resetGame();
                     this.startGame();
                 });
             }

             // Touch events for mobile
             this.canvas.addEventListener('touchstart', (e) => {
                 e.preventDefault();
                 console.log('Touch detected');
                 const touch = e.touches[0];
                 const rect = this.canvas.getBoundingClientRect();
                 const x = touch.clientX - rect.left;
                 const y = touch.clientY - rect.top;
                 this.handleTouch(x, y);
             }, { passive: false });

             // Mouse events for desktop
             this.canvas.addEventListener('click', (e) => {
                 console.log('Click detected');
                 const rect = this.canvas.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 const y = e.clientY - rect.top;
                 this.handleTouch(x, y);
             });
         }

         startGame() {
             console.log('Starting game...');

             const startScreen = document.getElementById('startScreen');
             const gameOverScreen = document.getElementById('gameOverScreen');

             if (startScreen) startScreen.style.display = 'none';
             if (gameOverScreen) gameOverScreen.style.display = 'none';

             this.gameRunning = true;
             this.gameOver = false;

             // Clear any existing interval
             if (this.spawnInterval) {
                 clearInterval(this.spawnInterval);
             }

             this.startBubbleSpawning();
             console.log('Game started successfully');
         }

         resetGame() {
             console.log('Resetting game...');
             this.bubbles = [];
             this.score = 0;
             this.level = 1;
             this.lives = 5;
             this.gameOver = false;
             this.gameRunning = false;
             this.bubbleSpawnRate = 2000;
             this.maxBubbles = 8;
             this.bubbleLifetime = 5000;

             if (this.spawnInterval) {
                 clearInterval(this.spawnInterval);
                 this.spawnInterval = null;
             }

             this.updateUI();
         }

         startBubbleSpawning() {
             this.spawnInterval = setInterval(() => {
                 if (this.gameRunning && this.bubbles.length < this.maxBubbles)
      {
                     this.spawnBubble();
                 }
             }, this.bubbleSpawnRate);

             // Spawn first bubble immediately
             this.spawnBubble();
             console.log('Bubble spawning started');
         }

         spawnBubble() {
             const size = Math.random() * 40 + 30;
             const x = Math.random() * (this.canvas.width - size) + size/2;
             const y = Math.random() * (this.canvas.height - size) + size/2;
             const color = this.colors[Math.floor(Math.random() *
     this.colors.length)];
             const points = Math.floor(100 - size + (this.level * 10));

             const bubble = {
                 id: Date.now() + Math.random(),
                 x: x,
                 y: y,
                 size: size,
                 color: color,
                 points: points,
                 spawnTime: Date.now(),
                 popping: false,
                 popAnimation: 0
             };

             this.bubbles.push(bubble);
             console.log(`Spawned bubble at ${x}, ${y} with size ${size}`);
         }

         handleTouch(x, y) {
             if (!this.gameRunning) return;

             console.log(`Touch at ${x}, ${y}`);

             for (let i = this.bubbles.length - 1; i >= 0; i--) {
                 const bubble = this.bubbles[i];
                 const distance = Math.sqrt(
                     Math.pow(x - bubble.x, 2) + Math.pow(y - bubble.y, 2)
                 );

                 if (distance <= bubble.size / 2) {
                     console.log(`Popped bubble at ${bubble.x}, ${bubble.y}`);
                     this.popBubble(i);
                     break;
                 }
             }
         }

         popBubble(index) {
             const bubble = this.bubbles[index];
             bubble.popping = true;
             this.score += bubble.points;
             this.updateUI();

             setTimeout(() => {
                 if (this.bubbles[index]) {
                     this.bubbles.splice(index, 1);
                 }
             }, 200);

             this.checkLevelUp();
         }

         checkLevelUp() {
             const newLevel = Math.floor(this.score / 500) + 1;
             if (newLevel > this.level) {
                 this.level = newLevel;
                 this.bubbleSpawnRate = Math.max(500, 2000 - (this.level - 1) *
      200);
                 this.maxBubbles = Math.min(15, 8 + this.level - 1);
                 this.bubbleLifetime = Math.max(2000, 5000 - (this.level - 1) *
      300);

                 if (this.spawnInterval) {
                     clearInterval(this.spawnInterval);
                 }
                 this.startBubbleSpawning();
                 this.updateUI();
             }
         }

         updateUI() {
             const scoreEl = document.getElementById('score');
             const levelEl = document.getElementById('level');
             const livesEl = document.getElementById('lives');

             if (scoreEl) scoreEl.textContent = this.score;
             if (levelEl) levelEl.textContent = this.level;
             if (livesEl) livesEl.textContent = this.lives;
         }

         checkBubbleLifetime() {
             const currentTime = Date.now();

             for (let i = this.bubbles.length - 1; i >= 0; i--) {
                 const bubble = this.bubbles[i];
                 if (currentTime - bubble.spawnTime > this.bubbleLifetime &&
     !bubble.popping) {
                     this.bubbles.splice(i, 1);
                     this.lives--;
                     this.updateUI();

                     if (this.lives <= 0) {
                         this.endGame();
                     }
                 }
             }
         }

         endGame() {
             console.log('Game ended');
             this.gameRunning = false;
             this.gameOver = true;

             if (this.spawnInterval) {
                 clearInterval(this.spawnInterval);
                 this.spawnInterval = null;
             }

             const finalScoreEl = document.getElementById('finalScore');
             const gameOverScreen = document.getElementById('gameOverScreen');

             if (finalScoreEl) finalScoreEl.textContent = this.score;
             if (gameOverScreen) gameOverScreen.style.display = 'flex';
         }

         drawBubble(bubble) {
             this.ctx.save();

             if (bubble.popping) {
                 bubble.popAnimation += 0.3;
                 this.ctx.globalAlpha = Math.max(0, 1 - bubble.popAnimation);
                 const scale = 1 + bubble.popAnimation;
                 this.ctx.scale(scale, scale);
                 this.ctx.translate(bubble.x * (1 - scale) / scale, bubble.y *
     (1 - scale) / scale);
             }

             // Create gradient
             const gradient = this.ctx.createRadialGradient(
                 bubble.x - bubble.size/4, bubble.y - bubble.size/4, 0,
                 bubble.x, bubble.y, bubble.size/2
             );
             gradient.addColorStop(0, bubble.color + '80');
             gradient.addColorStop(1, bubble.color);

             // Draw bubble
             this.ctx.fillStyle = gradient;
             this.ctx.beginPath();
             this.ctx.arc(bubble.x, bubble.y, bubble.size/2, 0, Math.PI * 2);
             this.ctx.fill();

             // Draw border
             this.ctx.strokeStyle = bubble.color;
             this.ctx.lineWidth = 2;
             this.ctx.stroke();

             this.ctx.restore();
         }

         gameLoop() {
             if (!this.ctx) return;

             // Clear canvas
             this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

             if (this.gameRunning) {
                 this.checkBubbleLifetime();

                 // Draw all bubbles
                 this.bubbles.forEach(bubble => {
                     this.drawBubble(bubble);
                 });
             }

             requestAnimationFrame(() => this.gameLoop());
         }
     }

     // Initialize game when page loads
     let game;
     if (document.readyState === 'loading') {
         document.addEventListener('DOMContentLoaded', () => {
             game = new BubblePopGame();
         });
     } else {
         game = new BubblePopGame();
     }
