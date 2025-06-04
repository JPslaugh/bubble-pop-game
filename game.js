class BubblePopGame {
        constructor() {
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.bubbles = [];
            this.score = 0;
            this.level = 1;
            this.lives = 5;
            this.gameRunning = false;
            this.gameOver = false;

            this.bubbleSpawnRate = 2000;
            this.maxBubbles = 8;
            this.bubbleLifetime = 5000;

            this.colors = [
                '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
                '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
            ];

            this.setupCanvas();
            this.setupEventListeners();
            this.gameLoop();
        }

        setupCanvas() {
            const container = document.getElementById('gameArea');
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;

            window.addEventListener('resize', () => {
                this.canvas.width = container.clientWidth;
                this.canvas.height = container.clientHeight;
            });
        }

        setupEventListeners() {
            document.getElementById('startBtn').addEventListener('click', ()
    => {
                this.startGame();
            });

            document.getElementById('playAgainBtn').addEventListener('click',
    () => {
                this.resetGame();
                this.startGame();
            });

            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this.handleTouch(x, y);
            });

            this.canvas.addEventListener('click', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.handleTouch(x, y);
            });
        }

        startGame() {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('gameOverScreen').classList.add('hidden');
            this.gameRunning = true;
            this.gameOver = false;
            this.startBubbleSpawning();
        }

        resetGame() {
            this.bubbles = [];
            this.score = 0;
            this.level = 1;
            this.lives = 5;
            this.gameOver = false;
            this.bubbleSpawnRate = 2000;
            this.maxBubbles = 8;
            this.bubbleLifetime = 5000;
            this.updateUI();
        }

        startBubbleSpawning() {
            this.spawnInterval = setInterval(() => {
                if (this.gameRunning && this.bubbles.length < this.maxBubbles)
     {
                    this.spawnBubble();
                }
            }, this.bubbleSpawnRate);
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
        }

        handleTouch(x, y) {
            if (!this.gameRunning) return;

            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i];
                const distance = Math.sqrt(
                    Math.pow(x - bubble.x, 2) + Math.pow(y - bubble.y, 2)
                );

                if (distance <= bubble.size / 2) {
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
                this.bubbles.splice(index, 1);
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

                clearInterval(this.spawnInterval);
                this.startBubbleSpawning();
                this.updateUI();
            }
        }

        updateUI() {
            document.getElementById('score').textContent = this.score;
            document.getElementById('level').textContent = this.level;
            document.getElementById('lives').textContent = this.lives;
        }

        checkBubbleLifetime() {
            const currentTime = Date.now();

            for (let i = this.bubbles.length - 1; i >= 0; i--) {
                const bubble = this.bubbles[i];
                if (currentTime - bubble.spawnTime > this.bubbleLifetime) {
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
            this.gameRunning = false;
            this.gameOver = true;
            clearInterval(this.spawnInterval);
            document.getElementById('finalScore').textContent = this.score;

    document.getElementById('gameOverScreen').classList.remove('hidden');
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

            const gradient = this.ctx.createRadialGradient(
                bubble.x - bubble.size/4, bubble.y - bubble.size/4, 0,
                bubble.x, bubble.y, bubble.size/2
            );
            gradient.addColorStop(0, bubble.color + '80');
            gradient.addColorStop(1, bubble.color);

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, bubble.size/2, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = bubble.color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.restore();
        }

        gameLoop() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (this.gameRunning) {
                this.checkBubbleLifetime();

                this.bubbles.forEach(bubble => {
                    this.drawBubble(bubble);
                });
            }

            requestAnimationFrame(() => this.gameLoop());
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        new BubblePopGame();
    });
