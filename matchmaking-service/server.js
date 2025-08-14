const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

class MatchmakingService {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.port = process.env.MATCHMAKING_PORT || 3003;
        this.backendUrl = `http://localhost:${process.env.BACKEND_PORT || 3001}`;
        this.gameServerUrl = `http://localhost:${process.env.GAME_SERVER_PORT || 3004}`;
        
        // Matchmaking queues organized by stake amount
        this.queues = new Map(); // stake -> [players]
        this.activePlayers = new Map(); // socketId -> playerData
        this.pendingMatches = new Map(); // matchId -> matchData
        
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
                service: 'matchmaking',
                queues: Array.from(this.queues.keys()),
                activePlayers: this.activePlayers.size,
                pendingMatches: this.pendingMatches.size
            });
        });
        
        // Get queue status
        this.app.get('/queue-status', (req, res) => {
            const queueStatus = {};
            for (const [stake, players] of this.queues.entries()) {
                queueStatus[stake] = players.length;
            }
            res.json({ queues: queueStatus });
        });
    }
    
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Player connected: ${socket.id}`);
            
            // Player joins matchmaking queue
            socket.on('join_queue', async (data) => {
                try {
                    const { playerAddress, stake } = data;
                    
                    if (!playerAddress || !stake) {
                        socket.emit('error', { message: 'Missing playerAddress or stake' });
                        return;
                    }
                    
                    // Store player data
                    const playerData = {
                        socketId: socket.id,
                        address: playerAddress,
                        stake: stake,
                        joinedAt: Date.now()
                    };
                    
                    this.activePlayers.set(socket.id, playerData);
                    
                    // Add to appropriate queue
                    if (!this.queues.has(stake)) {
                        this.queues.set(stake, []);
                    }
                    
                    this.queues.get(stake).push(playerData);
                    
                    console.log(`Player ${playerAddress} joined queue for stake ${stake} GT`);
                    socket.emit('queue_joined', { stake, position: this.queues.get(stake).length });
                    
                    // Try to find a match
                    await this.tryMatchmaking(stake);
                    
                } catch (error) {
                    console.error('Error in join_queue:', error);
                    socket.emit('error', { message: 'Failed to join queue' });
                }
            });
            
            // Player leaves queue
            socket.on('leave_queue', () => {
                this.removePlayerFromQueue(socket.id);
                socket.emit('queue_left');
            });
            
            // Player confirms they've staked
            socket.on('stake_confirmed', async (data) => {
                try {
                    const { matchId, txHash } = data;
                    await this.handleStakeConfirmation(socket.id, matchId, txHash);
                } catch (error) {
                    console.error('Error in stake_confirmed:', error);
                    socket.emit('error', { message: 'Failed to confirm stake' });
                }
            });
            
            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`Player disconnected: ${socket.id}`);
                this.removePlayerFromQueue(socket.id);
                this.activePlayers.delete(socket.id);
            });
        });
    }
    
    async tryMatchmaking(stake) {
        const queue = this.queues.get(stake);
        
        console.log(`Trying matchmaking for stake ${stake}. Queue length: ${queue ? queue.length : 0}`);
        
        if (queue && queue.length >= 2) {
            console.log(`Found ${queue.length} players in queue, attempting to match...`);
            // Get two players from queue
            const player1 = queue.shift();
            const player2 = queue.shift();
            
            // Prevent self-matching (same wallet address)
            if (player1.address.toLowerCase() === player2.address.toLowerCase()) {
                console.log(`Same player tried to match with themselves: ${player1.address}`);
                // Put both back in queue
                queue.unshift(player2, player1);
                return;
            }
            
            // Generate unique match ID
            const matchId = this.generateMatchId();
            
            // Create match data
            const matchData = {
                matchId,
                player1: player1.address,
                player2: player2.address,
                stake,
                status: 'waiting_for_stakes',
                createdAt: Date.now(),
                player1Socket: player1.socketId,
                player2Socket: player2.socketId,
                stakesConfirmed: {
                    [player1.address]: false,
                    [player2.address]: false
                }
            };
            
            this.pendingMatches.set(matchId, matchData);
            
            console.log(`Match created: ${matchId} - ${player1.address} vs ${player2.address} for ${stake} GT`);
            
            // Notify both players
            this.io.to(player1.socketId).emit('match_found', {
                matchId,
                opponent: player2.address,
                stake,
                yourTurn: 'player1'
            });
            
            this.io.to(player2.socketId).emit('match_found', {
                matchId,
                opponent: player1.address,
                stake,
                yourTurn: 'player2'
            });
        }
    }
    
    async handleStakeConfirmation(socketId, matchId, txHash) {
        const match = this.pendingMatches.get(matchId);
        if (!match) {
            return;
        }
        
        const player = this.activePlayers.get(socketId);
        if (!player) {
            return;
        }
        
        // Mark stake as confirmed
        match.stakesConfirmed[player.address] = true;
        
        console.log(`Stake confirmed for ${player.address} in match ${matchId}`);
        
        // Check if both players have staked
        const bothStaked = Object.values(match.stakesConfirmed).every(staked => staked);
        
        if (bothStaked) {
            // Both players have staked - notify game server to start game
            match.status = 'ready_to_play';
            
            try {
                // Notify game server to create game room
                await axios.post(`${this.gameServerUrl}/create-game`, {
                    matchId: match.matchId,
                    player1: match.player1,
                    player2: match.player2,
                    stake: match.stake
                });
                
                // Notify both players game is ready
                this.io.to(match.player1Socket).emit('game_ready', {
                    matchId: match.matchId,
                    gameServerUrl: this.gameServerUrl
                });
                
                this.io.to(match.player2Socket).emit('game_ready', {
                    matchId: match.matchId,
                    gameServerUrl: this.gameServerUrl
                });
                
                console.log(`Game ready for match ${matchId}`);
                
            } catch (error) {
                console.error('Failed to notify game server:', error);
            }
        } else {
            // Notify the other player that one stake is confirmed
            const otherSocketId = socketId === match.player1Socket ? match.player2Socket : match.player1Socket;
            this.io.to(otherSocketId).emit('opponent_staked', { matchId });
        }
    }
    
    removePlayerFromQueue(socketId) {
        const player = this.activePlayers.get(socketId);
        if (!player) return;
        
        const queue = this.queues.get(player.stake);
        if (queue) {
            const index = queue.findIndex(p => p.socketId === socketId);
            if (index !== -1) {
                queue.splice(index, 1);
                console.log(`Removed player ${player.address} from queue`);
            }
        }
    }
    
    generateMatchId() {
        return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    start() {
        this.server.listen(this.port, () => {
            console.log(`🎮 Matchmaking Service running on port ${this.port}`);
            console.log(`📡 Backend URL: ${this.backendUrl}`);
            console.log(`🎯 Game Server URL: ${this.gameServerUrl}`);
        });
    }
}

// Start the service
const matchmakingService = new MatchmakingService();
matchmakingService.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down matchmaking service...');
    process.exit(0);
});
