const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

class GameServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.port = process.env.GAME_SERVER_PORT || 3004;
        this.backendUrl = `http://localhost:${process.env.BACKEND_PORT || 3001}`;
        
        // Active games
        this.games = new Map(); // matchId -> gameState
        this.playerSockets = new Map(); // socketId -> {matchId, playerAddress}
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
    }
    
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }
    
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'game-server',
                activeGames: this.games.size
            });
        });
        
        // Create new game room
        this.app.post('/create-game', (req, res) => {
            try {
                const { matchId, player1, player2, stake } = req.body;
                
                if (!matchId || !player1 || !player2 || !stake) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }
                
                // Create new game state
                const gameState = this.createPongGame(matchId, player1, player2, stake);
                this.games.set(matchId, gameState);
                
                console.log(`🎮 Game room created for match ${matchId}`);
                res.json({ success: true, matchId });
                
            } catch (error) {
                console.error('Error creating game:', error);
                res.status(500).json({ error: 'Failed to create game' });
            }
        });
    }
    
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Player connected to game server: ${socket.id}`);
            
            // Player joins game room
            socket.on('join_game', (data) => {
                try {
                    const { matchId, playerAddress } = data;
                    
                    const game = this.games.get(matchId);
                    if (!game) {
                        socket.emit('error', { message: 'Game not found' });
                        return;
                    }
                    
                    // Determine which player this is
                    let playerNumber = null;
                    if (playerAddress === game.player1.address) {
                        playerNumber = 1;
                        game.player1.socketId = socket.id;
                        game.player1.connected = true;
                    } else if (playerAddress === game.player2.address) {
                        playerNumber = 2;
                        game.player2.socketId = socket.id;
                        game.player2.connected = true;
                    } else {
                        socket.emit('error', { message: 'Player not in this game' });
                        return;
                    }
                    
                    // Store socket mapping
                    this.playerSockets.set(socket.id, { matchId, playerAddress });
                    
                    // Join socket room
                    socket.join(matchId);
                    
                    console.log(`Player ${playerAddress} joined game ${matchId} as Player ${playerNumber}`);
                    
                    // Send initial game state
                    socket.emit('game_joined', {
                        matchId,
                        playerNumber,
                        gameState: this.getClientGameState(game)
                    });
                    
                    // Check if both players are connected
                    if (game.player1.connected && game.player2.connected && game.status === 'waiting') {
                        this.startGame(matchId);
                    }
                    
                } catch (error) {
                    console.error('Error in join_game:', error);
                    socket.emit('error', { message: 'Failed to join game' });
                }
            });
            
            // Player input (paddle movement)
            socket.on('player_input', (data) => {
                try {
                    const { action } = data; // 'up' or 'down' or 'stop'
                    const playerData = this.playerSockets.get(socket.id);
                    
                    if (!playerData) return;
                    
                    const game = this.games.get(playerData.matchId);
                    if (!game || game.status !== 'playing') return;
                    
                    // Update player input
                    const playerNumber = playerData.playerAddress === game.player1.address ? 1 : 2;
                    const player = playerNumber === 1 ? game.player1 : game.player2;
                    
                    player.input = action;
                    
                } catch (error) {
                    console.error('Error in player_input:', error);
                }
            });
            
            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`Player disconnected from game server: ${socket.id}`);
                
                const playerData = this.playerSockets.get(socket.id);
                if (playerData) {
                    const game = this.games.get(playerData.matchId);
                    if (game) {
                        // Mark player as disconnected
                        if (playerData.playerAddress === game.player1.address) {
                            game.player1.connected = false;
                        } else if (playerData.playerAddress === game.player2.address) {
                            game.player2.connected = false;
                        }
                        
                        // Handle game abandonment if needed
                        if (game.status === 'playing') {
                            // Could implement forfeit logic here
                            console.log(`Player disconnected during game ${playerData.matchId}`);
                        }
                    }
                    
                    this.playerSockets.delete(socket.id);
                }
            });
        });
    }
    
    createPongGame(matchId, player1Address, player2Address, stake) {
        return {
            matchId,
            status: 'waiting', // waiting -> playing -> finished
            stake,
            createdAt: Date.now(),
            startedAt: null,
            finishedAt: null,
            winner: null,
            
            // Players
            player1: {
                address: player1Address,
                socketId: null,
                connected: false,
                score: 0,
                paddle: { y: 250, height: 80 }, // Canvas height 500, so center is 250
                input: 'stop' // 'up', 'down', 'stop'
            },
            player2: {
                address: player2Address,
                socketId: null,
                connected: false,
                score: 0,
                paddle: { y: 250, height: 80 },
                input: 'stop'
            },
            
            // Ball
            ball: {
                x: 400, // Canvas width 800, center is 400
                y: 250, // Canvas height 500, center is 250
                dx: 5, // velocity x
                dy: 3, // velocity y
                radius: 10
            },
            
            // Game settings
            settings: {
                canvasWidth: 800,
                canvasHeight: 500,
                paddleWidth: 15,
                paddleSpeed: 8,
                maxScore: 5 // First to 5 points wins
            },
            
            // Game loop
            gameLoop: null
        };
    }
    
    startGame(matchId) {
        const game = this.games.get(matchId);
        if (!game) return;
        
        game.status = 'playing';
        game.startedAt = Date.now();
        
        console.log(`🎮 Starting game ${matchId}`);
        
        // Notify players game is starting
        this.io.to(matchId).emit('game_started', {
            message: 'Game started! First to 5 points wins!',
            gameState: this.getClientGameState(game)
        });
        
        // Start game loop (60 FPS)
        game.gameLoop = setInterval(() => {
            this.updateGame(matchId);
        }, 1000 / 60);
    }
    
    updateGame(matchId) {
        const game = this.games.get(matchId);
        if (!game || game.status !== 'playing') return;
        
        // Update paddle positions based on input
        this.updatePaddles(game);
        
        // Update ball position
        this.updateBall(game);
        
        // Check for scoring
        this.checkScoring(game);
        
        // Check for game end
        if (this.checkGameEnd(game)) {
            this.endGame(matchId);
            return;
        }
        
        // Send updated game state to clients
        this.io.to(matchId).emit('game_update', this.getClientGameState(game));
    }
    
    updatePaddles(game) {
        const { settings } = game;
        
        // Update player 1 paddle
        if (game.player1.input === 'up') {
            game.player1.paddle.y = Math.max(0, game.player1.paddle.y - settings.paddleSpeed);
        } else if (game.player1.input === 'down') {
            game.player1.paddle.y = Math.min(
                settings.canvasHeight - game.player1.paddle.height,
                game.player1.paddle.y + settings.paddleSpeed
            );
        }
        
        // Update player 2 paddle
        if (game.player2.input === 'up') {
            game.player2.paddle.y = Math.max(0, game.player2.paddle.y - settings.paddleSpeed);
        } else if (game.player2.input === 'down') {
            game.player2.paddle.y = Math.min(
                settings.canvasHeight - game.player2.paddle.height,
                game.player2.paddle.y + settings.paddleSpeed
            );
        }
    }
    
    updateBall(game) {
        const { ball, settings } = game;
        
        // Update ball position
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Ball collision with top and bottom walls
        if (ball.y <= ball.radius || ball.y >= settings.canvasHeight - ball.radius) {
            ball.dy = -ball.dy;
        }
        
        // Ball collision with paddles
        this.checkPaddleCollision(game);
    }
    
    checkPaddleCollision(game) {
        const { ball, player1, player2, settings } = game;
        
        // Player 1 paddle (left side)
        if (ball.x <= settings.paddleWidth + ball.radius &&
            ball.y >= player1.paddle.y &&
            ball.y <= player1.paddle.y + player1.paddle.height &&
            ball.dx < 0) {
            ball.dx = -ball.dx;
            ball.x = settings.paddleWidth + ball.radius; // Prevent ball from getting stuck
        }
        
        // Player 2 paddle (right side)
        if (ball.x >= settings.canvasWidth - settings.paddleWidth - ball.radius &&
            ball.y >= player2.paddle.y &&
            ball.y <= player2.paddle.y + player2.paddle.height &&
            ball.dx > 0) {
            ball.dx = -ball.dx;
            ball.x = settings.canvasWidth - settings.paddleWidth - ball.radius;
        }
    }
    
    checkScoring(game) {
        const { ball, settings } = game;
        
        // Player 2 scores (ball goes off left side)
        if (ball.x < 0) {
            game.player2.score++;
            this.resetBall(game, 'right'); // Ball starts moving toward player 1
            this.io.to(game.matchId).emit('score', {
                scorer: game.player2.address,
                score: { player1: game.player1.score, player2: game.player2.score }
            });
        }
        
        // Player 1 scores (ball goes off right side)
        if (ball.x > settings.canvasWidth) {
            game.player1.score++;
            this.resetBall(game, 'left'); // Ball starts moving toward player 2
            this.io.to(game.matchId).emit('score', {
                scorer: game.player1.address,
                score: { player1: game.player1.score, player2: game.player2.score }
            });
        }
    }
    
    resetBall(game, direction) {
        const { ball, settings } = game;
        
        // Reset ball to center
        ball.x = settings.canvasWidth / 2;
        ball.y = settings.canvasHeight / 2;
        
        // Random Y velocity
        ball.dy = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
        
        // Set X velocity based on direction
        ball.dx = direction === 'left' ? -5 : 5;
    }
    
    checkGameEnd(game) {
        return game.player1.score >= game.settings.maxScore || game.player2.score >= game.settings.maxScore;
    }
    
    async endGame(matchId) {
        const game = this.games.get(matchId);
        if (!game) return;
        
        // Stop game loop
        if (game.gameLoop) {
            clearInterval(game.gameLoop);
            game.gameLoop = null;
        }
        
        game.status = 'finished';
        game.finishedAt = Date.now();
        
        // Determine winner
        const winner = game.player1.score > game.player2.score ? game.player1.address : game.player2.address;
        game.winner = winner;
        
        console.log(`🏆 Game ${matchId} finished! Winner: ${winner}`);
        
        // Notify players
        this.io.to(matchId).emit('game_ended', {
            winner,
            finalScore: {
                player1: game.player1.score,
                player2: game.player2.score
            },
            gameState: this.getClientGameState(game)
        });
        
        // Call backend to commit result and payout
        try {
            await axios.post(`${this.backendUrl}/match/result`, {
                matchId: game.matchId,
                winner: winner
            });
            
            console.log(`💰 Payout initiated for winner ${winner} in match ${matchId}`);
            
        } catch (error) {
            console.error('Failed to commit result to backend:', error);
        }
        
        // Clean up game after 30 seconds
        setTimeout(() => {
            this.games.delete(matchId);
            console.log(`🧹 Cleaned up game ${matchId}`);
        }, 30000);
    }
    
    getClientGameState(game) {
        return {
            matchId: game.matchId,
            status: game.status,
            player1: {
                address: game.player1.address,
                score: game.player1.score,
                paddle: game.player1.paddle,
                connected: game.player1.connected
            },
            player2: {
                address: game.player2.address,
                score: game.player2.score,
                paddle: game.player2.paddle,
                connected: game.player2.connected
            },
            ball: game.ball,
            settings: game.settings,
            winner: game.winner
        };
    }
    
    start() {
        this.server.listen(this.port, () => {
            console.log(`🎮 Game Server running on port ${this.port}`);
            console.log(`📡 Backend URL: ${this.backendUrl}`);
        });
    }
}

// Start the service
const gameServer = new GameServer();
gameServer.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down game server...');
    process.exit(0);
});
