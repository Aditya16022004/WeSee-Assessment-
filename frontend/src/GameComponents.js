import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

export const Matchmaking = ({ account, onGameStart }) => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueStatus, setQueueStatus] = useState('');
  const [stake, setStake] = useState('1');
  const [matchFound, setMatchFound] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isStaking, setIsStaking] = useState(false);

  useEffect(() => {
    const matchmakingSocket = io('http://localhost:3003');
    setSocket(matchmakingSocket);

    matchmakingSocket.on('queue_joined', (data) => {
      setQueueStatus(`Looking for opponent with ${data.stake} GT stake... (Position: ${data.position})`);
    });

    matchmakingSocket.on('match_found', (data) => {
      setMatchFound(data);
      setQueueStatus(`Match found! Opponent: ${data.opponent.slice(0, 8)}...`);
      setIsInQueue(false);
    });

    matchmakingSocket.on('game_ready', (data) => {
      setQueueStatus('Game starting...');
      setTimeout(() => {
        onGameStart(data.matchId, matchFound);
      }, 1000);
    });

    matchmakingSocket.on('opponent_staked', () => {
      setQueueStatus('Opponent staked! Waiting for your confirmation...');
    });

    matchmakingSocket.on('error', (data) => {
      setQueueStatus(`Error: ${data.message}`);
      setIsInQueue(false);
      setIsStaking(false);
    });

    return () => {
      matchmakingSocket.disconnect();
    };
  }, [onGameStart, matchFound]);

  const joinQueue = () => {
    if (!account || !socket) return;

    setIsInQueue(true);
    setQueueStatus('Joining queue...');
    
    socket.emit('join_queue', {
      playerAddress: account,
      stake: stake
    });
  };

  const leaveQueue = () => {
    if (socket) socket.emit('leave_queue');
    setIsInQueue(false);
    setQueueStatus('');
    setMatchFound(null);
    setIsStaking(false);
  };

  const confirmStake = async () => {
    if (!matchFound) return;

    try {
      setIsStaking(true);
      setQueueStatus('Creating match and staking tokens...');
      
      const response = await axios.post('/match/start', {
        matchId: matchFound.matchId,
        player1: matchFound.yourTurn === 'player1' ? account : matchFound.opponent,
        player2: matchFound.yourTurn === 'player2' ? account : matchFound.opponent,
        stake: matchFound.stake
      });

      if (response.data.transactionHash) {
        setQueueStatus('Stake confirmed! Waiting for opponent...');
        socket.emit('stake_confirmed', {
          matchId: matchFound.matchId,
          txHash: response.data.transactionHash
        });
      }
      
    } catch (error) {
      console.error('Staking failed:', error);
      setQueueStatus('Staking failed: ' + (error.response?.data?.error || error.message));
      setIsStaking(false);
    }
  };

  return (
    <div className="matchmaking-container">
      <div className="matchmaking-header">
        <h3>🎮 Find Your Opponent</h3>
        <p>Stake GT tokens and play real-time Pong!</p>
      </div>
      
      {!isInQueue && !matchFound && (
        <div className="queue-join">
          <div className="stake-selector">
            <label>Choose Your Stake:</label>
            <select value={stake} onChange={(e) => setStake(e.target.value)} className="stake-dropdown">
              <option value="1">1 GT</option>
              <option value="5">5 GT</option>
              <option value="10">10 GT</option>
              <option value="25">25 GT</option>
              <option value="50">50 GT</option>
            </select>
          </div>
          
          <button onClick={joinQueue} className="join-queue-btn" disabled={!account}>
            🔍 Find Match ({stake} GT)
          </button>
        </div>
      )}

      {isInQueue && (
        <div className="queue-waiting">
          <div className="loading-spinner"></div>
          <p className="queue-status">{queueStatus}</p>
          <button onClick={leaveQueue} className="leave-queue-btn">
            ❌ Leave Queue
          </button>
        </div>
      )}

      {matchFound && (
        <div className="match-found-container">
          <div className="match-details">
            <h4>🎯 Match Found!</h4>
            <div className="opponent-info">
              <span className="opponent-label">Opponent:</span>
              <span className="opponent-address">{matchFound.opponent.slice(0, 8)}...{matchFound.opponent.slice(-6)}</span>
            </div>
            <div className="stake-info">
              <span className="stake-label">Stake:</span>
              <span className="stake-amount">{matchFound.stake} GT each</span>
            </div>
          </div>
          
          <p className="match-status">{queueStatus}</p>
          
          <button 
            onClick={confirmStake}
            className="stake-btn"
            disabled={isStaking}
          >
            {isStaking ? '⏳ Staking...' : `💰 Stake ${matchFound.stake} GT`}
          </button>
        </div>
      )}
    </div>
  );
};

export const PongGame = ({ matchId, matchData, account }) => {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerNumber, setPlayerNumber] = useState(null);
  const [gameStatus, setGameStatus] = useState('connecting');
  const [winner, setWinner] = useState(null);
  const [keys, setKeys] = useState({ up: false, down: false });

  useEffect(() => {
    const gameSocket = io('http://localhost:3004');
    setSocket(gameSocket);

    gameSocket.emit('join_game', {
      matchId: matchId,
      playerAddress: account
    });

    gameSocket.on('game_joined', (data) => {
      setPlayerNumber(data.playerNumber);
      setGameState(data.gameState);
      setGameStatus('waiting');
    });

    gameSocket.on('game_started', (data) => {
      setGameState(data.gameState);
      setGameStatus('playing');
    });

    gameSocket.on('game_update', (data) => {
      setGameState(data);
    });

    gameSocket.on('score', (data) => {
      console.log('Score!', data);
    });

    gameSocket.on('game_ended', (data) => {
      setWinner(data.winner);
      setGameStatus('finished');
      setGameState(data.gameState);
    });

    gameSocket.on('error', (data) => {
      console.error('Game error:', data.message);
    });

    return () => {
      gameSocket.disconnect();
    };
  }, [matchId, account]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStatus !== 'playing') return;
      
      let action = null;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        action = 'up';
        setKeys(prev => ({ ...prev, up: true }));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        action = 'down';
        setKeys(prev => ({ ...prev, down: true }));
      }
      
      if (action && socket) {
        socket.emit('player_input', { action });
      }
    };

    const handleKeyUp = (e) => {
      if (gameStatus !== 'playing') return;
      
      let shouldStop = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setKeys(prev => ({ ...prev, up: false }));
        shouldStop = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setKeys(prev => ({ ...prev, down: false }));
        shouldStop = true;
      }
      
      if (shouldStop && socket && !keys.up && !keys.down) {
        socket.emit('player_input', { action: 'stop' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStatus, socket, keys]);

  useEffect(() => {
    if (!gameState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fff';
    
    ctx.fillRect(0, gameState.player1.paddle.y, gameState.settings.paddleWidth, gameState.player1.paddle.height);
    ctx.fillRect(canvas.width - gameState.settings.paddleWidth, gameState.player2.paddle.y, gameState.settings.paddleWidth, gameState.player2.paddle.height);

    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.player1.score, canvas.width / 4, 60);
    ctx.fillText(gameState.player2.score, (canvas.width * 3) / 4, 60);

  }, [gameState]);

  return (
    <div className="pong-game-container">
      <div className="game-header">
        <h3>🏓 Pong Arena</h3>
        <div className="game-meta">
          <span className="match-id">Match: {matchId}</span>
          <span className="player-info">You: Player {playerNumber}</span>
          <span className="game-status">{gameStatus.toUpperCase()}</span>
        </div>
      </div>

      {gameStatus === 'waiting' && (
        <div className="waiting-screen">
          <div className="loading-spinner"></div>
          <p>Waiting for opponent to join...</p>
        </div>
      )}

      {gameStatus === 'playing' && (
        <div className="controls-info">
          <p>🎮 Use ↑↓ Arrow Keys or W/S to control your paddle</p>
        </div>
      )}

      <div className="game-area">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="pong-canvas"
        />
      </div>

      {gameState && (
        <div className="score-board">
          <div className="player-info">
            <div className={`player-card ${playerNumber === 1 ? 'you' : ''}`}>
              <h4>Player 1</h4>
              <div className="score">{gameState.player1.score}</div>
              <div className="address">{gameState.player1.address.slice(0, 6)}...{gameState.player1.address.slice(-4)}</div>
            </div>
            <div className="vs-divider">VS</div>
            <div className={`player-card ${playerNumber === 2 ? 'you' : ''}`}>
              <h4>Player 2</h4>
              <div className="score">{gameState.player2.score}</div>
              <div className="address">{gameState.player2.address.slice(0, 6)}...{gameState.player2.address.slice(-4)}</div>
            </div>
          </div>
        </div>
      )}

      {gameStatus === 'finished' && winner && (
        <div className="game-result">
          <h2>🏆 Game Complete!</h2>
          <div className="winner-info">
            <p className="winner-text">
              {winner === account ? 'Victory! You won!' : 'Opponent wins!'}
            </p>
            <p className="payout-info">💰 Payout processing automatically...</p>
          </div>
        </div>
      )}
    </div>
  );
};