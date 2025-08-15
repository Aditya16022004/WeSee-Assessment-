# 🎮 Gaming Staking dApp

A decentralized application (dApp) that facilitates a trustless staking and reward system for player-vs-player (PvP) games. The system manages an in-game ERC-20 token, allows players to purchase this token with USDT, enable them to stake tokens on a match, and automatically awards the entire prize pool to the winner.

## 📈 Project Progress & Development Journey

### 🎯 Assessment Task Completion Status

This project was developed as a comprehensive assessment task to build a full-stack decentralized gaming application. The development process involved multiple iterations, problem-solving, and technical challenges that were successfully resolved.

#### ✅ Completed Components

1. **Smart Contracts (100% Complete)**
   - ✅ GameToken.sol - ERC-20 token with minting restrictions
   - ✅ TokenStore.sol - USDT to GT conversion mechanism
   - ✅ PlayGame.sol - Match lifecycle and staking logic
   - ✅ MockUSDT.sol - Test USDT token for development

2. **Backend API Gateway (100% Complete)**
   - ✅ Node.js Express server with comprehensive endpoints
   - ✅ Smart contract integration with Ethers.js v6
   - ✅ Token distribution system for testing
   - ✅ Match management and result submission
   - ✅ Error handling and validation

3. **Frontend Interface (100% Complete)**
   - ✅ React.js application with modern UI
   - ✅ MetaMask wallet integration
   - ✅ Real-time balance updates
   - ✅ Match creation and management forms
   - ✅ Leaderboard display

4. **Off-Chain Indexer (100% Complete)**
   - ✅ MongoDB integration (migrated from SQLite)
   - ✅ Blockchain event listening
   - ✅ Real-time leaderboard updates
   - ✅ Player statistics tracking

5. **🎮 Real-Time Game Server (100% Complete)**
   - ✅ Socket.IO-based real-time game engine
   - ✅ Game mechanics with PONG video game
   - ✅ Real-time player communication and game state management
   - ✅ Automated result submission to blockchain
   - ✅ Game session management and timeout handling

6. **🔄 Matchmaking Service (100% Complete)**
   - ✅ Advanced player queue management
   - ✅ Skill-based matchmaking algorithm
   - ✅ Real-time queue status updates
   - ✅ Automatic game room creation
   - ✅ Player rating and ELO system integration

### 🖼️ Frontend UI Screenshots
#### Main Application Interface
![Gaming Staking dApp Frontend] : In Project Images Folder (main)

1.Wallet Connect and Port Connect with Metamask🐺:

![UI Screenshot 1](Project%20Images/1.png)

2. USDT:

![UI Screenshot 2](Project%20Images/2.png)

            TO
            
   GAME TOKEN CONVERSION (GT):
   
![UI Screenshot 3](Project%20Images/3.png)

4. Staking GT Token In Game:

![UI Screenshot 7](Project%20Images/7.png)

4.Matchmaking Started, Players in Queue:

![UI Screenshot 8](Project%20Images/8.png)

![UI Screenshot 9](Project%20Images/9.png)

5. Match Found And Token is Being Staked From Each Player:

![UI Screenshot 10](Project%20Images/10.png)

6. Game Starts🎯:

![UI Screenshot 11](Project%20Images/11.jpg)

7: Winning Player's Balance Is Updated (Automated)💲:

![UI Screenshot 5](Project%20Images/5.png)

**Frontend Features Demonstrated:**
- **Wallet Connection**: Successfully connected to MetaMask wallet (0x861e1D31804049bd45eA2db67861036fC45e4766)
- **Token Information**: Real-time GT balance display with refresh functionality
- **Match Management**: Complete forms for creating matches and submitting results
- **Leaderboard**: Trophy section for displaying player rankings
- **Modern UI**: Clean, responsive design with dark theme and card-based layout

#### API Testing with Postman
**Match Creation Success**
**Token Distribution Testing**

### 🚧 Issues Faced & Solutions Implemented

#### 1. **Ethers.js Version Compatibility Issues**
**Problem**: Initial implementation used Ethers.js v5 syntax, but the project required v6 compatibility.
**Solution**: 
- Updated all contract interactions to use `ethers.JsonRpcProvider` instead of `ethers.providers.JsonRpcProvider`
- Changed `.deployed()` to `.waitForDeployment()` for contract deployments
- Updated `ethers.utils.parseEther` to `ethers.parseEther`
- Modified address handling to use `ethers.getAddress()` for normalization

#### 2. **Smart Contract Constructor Errors**
**Problem**: OpenZeppelin v4 contracts had different constructor syntax.
**Solution**: 
- Fixed `Ownable(msg.sender)` to `Ownable()` in all contracts
- Resolved naming conflicts by renaming `stake` parameter to `matchStake` in PlayGame.sol

#### 3. **Token Distribution Challenges**
**Problem**: Players couldn't receive GT tokens for testing, causing staking failures.
**Solution**: 
- Implemented comprehensive `/get-test-tokens` endpoint
- Added automatic USDT to GT conversion for backend
- Created balance verification system
- Simplified approval process for testing purposes

#### 4. **Database Migration from SQLite to MongoDB**
**Problem**: Initial implementation used SQLite, but requirements changed to MongoDB.
**Solution**: 
- Completely rewrote indexer to use MongoDB client
- Updated all database operations to use MongoDB collections
- Implemented proper connection handling and indexing
- Added MongoDB setup instructions

#### 5. **Frontend Framework Migration**
**Problem**: Initial HTML/JS frontend needed to be converted to React.
**Solution**: 
- Created complete React application structure
- Implemented MetaMask integration with `ethers.BrowserProvider`
- Added state management for wallet connection and balances
- Created responsive UI components with modern styling

#### 6. **Environment Configuration Issues**
**Problem**: Backend couldn't find contract addresses and private keys.
**Solution**: 
- Enhanced environment variable debugging
- Added comprehensive validation for all required variables
- Implemented proper error messages for missing configuration
- Created deployment script that generates `.env` file automatically

#### 7. **Blockchain Event Handling**
**Problem**: Indexer needed to listen to specific contract events.
**Solution**: 
- Implemented event listeners for `MatchCreated`, `MatchStaked`, and `MatchSettled`
- Added proper event parsing and database storage
- Created real-time leaderboard updates

#### 8. **Real-Time Game Communication**
**Problem**: Players needed real-time interaction during matches.
**Solution**: 
- Implemented Socket.IO-based game server
- Created game mechanics with PONG video game
- Added real-time player communication and game state synchronization
- Implemented automated result submission to blockchain

#### 9. **Matchmaking and Queue Management**
**Problem**: Players needed an efficient way to find opponents.
**Solution**: 
- Built dedicated matchmaking service with skill-based pairing
- Implemented player queue management with real-time updates
- Added ELO rating system for balanced matches
- Created automatic game room creation upon match found

### 🔧 Technical Challenges Overcome

1. **Address Validation**: Implemented strict Ethereum address validation using `ethers.isAddress()`
2. **Bytes32 Handling**: Properly hashed string matchIds to bytes32 format using `ethers.id()`
3. **Reentrancy Protection**: Added `nonReentrant` modifiers to all critical functions
4. **Error Handling**: Comprehensive error messages and proper HTTP status codes
5. **Cross-Service Communication**: Ensured proper communication between Hardhat node, backend, indexer, and frontend
6. **Real-Time State Management**: Synchronized game state across multiple services
7. **Concurrency Handling**: Managed multiple simultaneous games and player connections
8. **Network Resilience**: Implemented reconnection logic and error recovery

### 📊 Testing & Validation

#### API Endpoints Successfully Tested:
- ✅ `POST /get-test-tokens` - Token distribution
- ✅ `POST /match/start` - Match creation
- ✅ `POST /match/stake` - Player staking
- ✅ `POST /match/result` - Result submission
- ✅ `GET /balance/:address` - Balance checking
- ✅ `GET /leaderboard` - Leaderboard data

#### Smart Contract Functions Validated:
- ✅ Token minting and transfer
- ✅ Match creation and management
- ✅ Staking mechanism
- ✅ Winner payout system
- ✅ Timeout and refund logic

#### Game Server Features Tested:
- ✅ Real-time player connections
- ✅ PONG game mechanics
- ✅ Automated result submission
- ✅ Game state synchronization
- ✅ Timeout and disconnection handling

#### Matchmaking Service Validated:
- ✅ Player queue management
- ✅ Skill-based matchmaking
- ✅ Real-time queue updates
- ✅ Automatic game room creation

### 🎉 Final Achievement

The project successfully demonstrates:
- **Full-stack dApp development** with blockchain integration
- **Modern web technologies** (React, Node.js, MongoDB, Socket.IO)
- **Smart contract development** with security best practices
- **Real-time data processing** and event handling
- **Comprehensive testing** and error handling
- **Production-ready architecture** with proper separation of concerns
- **Scalable gaming infrastructure** with real-time multiplayer capabilities
- **Advanced matchmaking** and player management systems

## 🏗️ System Architecture

The dApp consists of six main components:

1. **Smart Contracts (On-Chain Logic)**: Core decentralized logic handling tokenomics and value transfer
2. **Backend API (Off-Chain Gateway)**: Node.js server acting as a secure bridge between game servers and smart contracts
3. **Frontend (User Interface)**: React.js application for user interactions with modern UI/UX
4. **Indexer & Leaderboard (Off-Chain Data Processor)**: Standalone script listening to blockchain events for leaderboard data
5. **🎮 Game Server (Real-Time Engine)**: Socket.IO-based server managing live game sessions
6. **🔄 Matchmaking Service (Player Management)**: Advanced queue and matchmaking system

## 📁 Project Structure

```
wesee/
├── contracts/                 # Solidity smart contracts
│   ├── GameToken.sol         # ERC-20 token contract
│   ├── TokenStore.sol        # Token purchase contract
│   ├── PlayGame.sol          # Game logic contract
│   └── MockUSDT.sol          # Mock USDT for testing
├── scripts/
│   ├── deploy.js             # Contract deployment script
│   └── deploy-missing.js     # Additional deployment utilities
├── backend/
│   └── server.js             # Node.js API server
├── indexer/
│   ├── indexer.js            # Blockchain event indexer
│   └── gaming_data.db        # SQLite database for player data
├── game-server/              # 🎮 Real-time game engine
│   ├── server.js            # Socket.IO game server
│   └── package.json         # Game server dependencies
├── matchmaking-service/      # 🔄 Player matchmaking system
│   ├── server.js            # Matchmaking logic and queue management
│   └── package.json         # Matchmaking service dependencies
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── App.js           # Main application component
│   │   ├── GameComponents.js # Game-specific React components
│   │   └── index.js         # Application entry point
│   ├── public/
│   │   └── index.html       # HTML template
│   └── package.json         # Frontend dependencies
├── test/
│   └── gaming.test.js       # Comprehensive test suite
├── package.json             # Main project dependencies and scripts
├── hardhat.config.js        # Hardhat configuration with Sepolia support
├── SETUP.md                 # Quick setup guide
├── endpoints_details.md     # Detailed API documentation
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

### 🏃‍♂️ One-Command Start (Recommended)

For Windows users:
```bash
npm run start-all
```

This PowerShell script will automatically:
- Start the Hardhat node
- Deploy contracts
- Launch all services (backend, indexer, game server, matchmaking)
- Open the frontend

### Manual Setup

### 1. Install Dependencies

```bash
cd wesee
npm install
```

### 2. Start Local Blockchain

```bash
npm run node
```

This starts a local Hardhat network on `http://127.0.0.1:8545`

### 3. Deploy Smart Contracts

In a new terminal:

```bash
npm run deploy
```

This will:
- Deploy all smart contracts
- Create a `.env` file with contract addresses
- Display deployment summary

### 4. Start All Services

Choose one of these options:

**Option A: Start All Gaming Services**
```bash
npm run dev-game
```

**Option B: Start Individual Services**
```bash
# Backend API
npm run backend

# Indexer (new terminal)
npm run indexer

# Game Server (new terminal)
npm run game-server

# Matchmaking Service (new terminal)
npm run matchmaking
```

### 5. Start Frontend

```bash
cd frontend
npm start
```

The React application will run on `http://localhost:3000`

### 6. Test the System

```bash
npm run test-api
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `wesee` directory with the following variables:

```env
# Contract Addresses (filled after deployment)
MOCK_USDT_ADDRESS=0x...
GAME_TOKEN_ADDRESS=0x...
TOKEN_STORE_ADDRESS=0x...
PLAY_GAME_ADDRESS=0x...

# Network Configuration
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=1337

# Backend Configuration
BACKEND_PRIVATE_KEY=0x... # Private key for backend operations
BACKEND_PORT=3000

# Indexer Configuration
INDEXER_PORT=3001

# Game Server Configuration
GAME_SERVER_PORT=3004

# Matchmaking Service Configuration
MATCHMAKING_PORT=3005

# Sepolia Testnet (Optional)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_PRIVATE_KEY=0x... # For testnet deployment
```

### Network Configuration

The dApp supports multiple networks:

**Local Development (Default)**
- Network: Hardhat Local
- Chain ID: 1337
- RPC: http://127.0.0.1:8545

**Sepolia Testnet**
- Network: Ethereum Sepolia
- Chain ID: 11155111
- Deploy with: `npm run deploy:sepolia`

## 🎯 Smart Contracts

### GameToken.sol
- **Purpose**: ERC-20 token (GT) for in-game transactions
- **Features**: 
  - 18 decimals
  - Only mintable by TokenStore contract
  - Standard ERC-20 functionality
  - Access control for minting

### TokenStore.sol
- **Purpose**: On-ramp for purchasing GT with USDT
- **Features**:
  - 1:1 USDT to GT conversion rate
  - Reentrancy protection
  - Owner withdrawal functionality
  - Approval handling for seamless UX

### PlayGame.sol
- **Purpose**: Manages match lifecycle and staking
- **Features**:
  - Match creation and management
  - Player staking system
  - Automatic winner payout
  - Timeout and refund mechanisms
  - Status tracking and validation

### MockUSDT.sol
- **Purpose**: Test USDT token with 6 decimals
- **Features**: 
  - Pre-minted supply for testing
  - Standard ERC-20 with 6 decimals
  - Faucet functionality for testing

## 🌐 API Endpoints

### Backend API (`http://localhost:3000`)

#### Core Endpoints
- `GET /health` - Health check and system status
- `GET /balance/:address` - Get GT balance for address
- `GET /rate` - Get token conversion rate
- `POST /add-dummy-usdt` - Add test USDT (testing only)
- `POST /purchase` - Purchase GT tokens with USDT
- `POST /give-backend-usdt` - Fund backend wallet (testing only)

#### Match Management
- `POST /match/start` - Create new match
- `POST /match/stake` - Player staking (Hardhat testing only)
- `POST /match/result` - Submit match result
- `GET /match/:matchId` - Get match details
- `GET /match/summary/:matchId` - Get match summary with decision logic

### Indexer API (`http://localhost:3001`)

- `GET /leaderboard` - Get top 10 players by GT won
- `GET /player/:address` - Get player statistics
- `GET /matches` - Get all match history
- `GET /stats` - Get overall system statistics

### 🎮 Game Server API (`http://localhost:3004`)

#### Game Management
- `GET /health` - Game server health check
- `POST /create-game` - Create new game room
- `GET /game/:matchId` - Get game state
- `POST /game/:matchId/move` - Submit player move
- `POST /game/:matchId/end` - End game session

#### Socket.IO Events
- `join-game` - Player joins game room
- `game-state` - Real-time game state updates
- `player-move` - Player move notifications
- `game-result` - Game completion events
- `disconnect` - Handle player disconnections

### 🔄 Matchmaking API (`http://localhost:3005`)

#### Queue Management
- `GET /health` - Matchmaking service health
- `POST /queue/join` - Join matchmaking queue
- `POST /queue/leave` - Leave matchmaking queue
- `GET /queue/status` - Get queue status
- `GET /queue/position/:address` - Get player queue position

#### Socket.IO Events
- `join-queue` - Player joins matchmaking queue
- `queue-update` - Real-time queue status updates
- `match-found` - Match found notification
- `queue-left` - Player left queue confirmation

## 🎮 Usage Flow

### 1. Token Purchase & Setup
1. User connects MetaMask wallet to local network (Chain ID: 1337)
2. User requests test USDT via frontend or API
3. User approves USDT spending for TokenStore
4. User purchases GT tokens (1:1 USDT to GT conversion)
5. GT tokens are minted to user's address

### 2. Matchmaking & Game Creation
1. Player joins matchmaking queue via frontend
2. Matchmaking service pairs players based on skill/rating
3. Game room is automatically created when match is found
4. Players are notified and redirected to game interface

### 3. Match Staking & Game Play
1. Both players stake GT tokens for the match
2. Game server manages real-time game session (Rock-Paper-Scissors)
3. Players make moves through Socket.IO connection
4. Game state is synchronized in real-time
5. Game server determines winner based on game rules

### 4. Result Submission & Payout
1. Game server automatically submits result to blockchain
2. Smart contract validates the result
3. Entire prize pool (2 × stake) is transferred to winner
4. Match status changes to "SETTLED"
5. Leaderboard is updated automatically

### 5. Leaderboard & Statistics
1. Indexer listens to blockchain events in real-time
2. Player statistics are updated immediately
3. Leaderboard API serves current rankings
4. Frontend displays updated player stats and rankings

## 🎯 Game Mechanics

### Rock-Paper-Scissors Implementation
- **Turn-based gameplay** with real-time communication
- **3-round matches** with best-of-3 winner determination
- **Move validation** and simultaneous reveal system
- **Timeout handling** for inactive players
- **Automatic result submission** to blockchain

### Matchmaking Algorithm
- **Skill-based pairing** using ELO rating system
- **Queue time optimization** to reduce wait times
- **Player preference matching** (stake amount, game type)
- **Anti-abuse measures** to prevent queue manipulation

## 🧪 Testing

### Automated Testing
```bash
# Run smart contract tests
npm test

# Test API endpoints
npm run test-api

# Check contract deployment
npm run check-contracts
```

### Manual Testing Flow
1. **Setup**: Deploy contracts and start all services
2. **Token Flow**: Test USDT distribution and GT purchase
3. **Matchmaking**: Join queue and test match finding
4. **Gaming**: Play complete Rock-Paper-Scissors matches
5. **Verification**: Check balance updates and leaderboard changes

### Testing Utilities
- `fix-env.js` - Environment configuration validator
- `check-contracts.js` - Contract deployment verifier
- `test-api.js` - Comprehensive API testing script

## 🔒 Security Features

### Smart Contract Security
- **Access Control**: Only authorized backend can create matches and submit results
- **Reentrancy Protection**: All critical functions protected against reentrancy attacks
- **Input Validation**: Comprehensive validation of all inputs and state transitions
- **Status Checks**: Prevents invalid state transitions and double-spending
- **Timeout Mechanisms**: Automatic refunds for unresolved matches

### API Security
- **Rate Limiting**: Protection against API abuse (planned)
- **Input Sanitization**: All user inputs are validated and sanitized
- **Error Handling**: Secure error messages that don't leak sensitive information
- **Authentication**: Wallet-based authentication for all game actions

### Real-Time Security
- **Socket Authentication**: Verified player connections
- **Game State Validation**: Server-side validation of all moves
- **Anti-Cheat Measures**: Move validation and timing checks
- **Connection Security**: Secure WebSocket connections with CORS protection

## 📊 Database Schema

### Players Collection (MongoDB/SQLite)
```javascript
{
  address: String (Primary Key),
  total_matches: Number,
  total_wins: Number,
  total_gt_won: Number,
  total_gt_staked: Number,
  elo_rating: Number,
  last_updated: Date,
  game_stats: {
    rock_paper_scissors: {
      wins: Number,
      losses: Number,
      draws: Number
    }
  }
}
```

### Matches Collection
```javascript
{
  match_id: String (Primary Key),
  player1: String,
  player2: String,
  stake: Number,
  status: String,
  winner: String,
  game_type: String,
  game_data: Object,
  created_at: Date,
  started_at: Date,
  settled_at: Date
}
```

### Events Collection
```javascript
{
  id: Number (Auto-increment),
  event_type: String,
  match_id: String,
  player_address: String,
  amount: Number,
  block_number: Number,
  transaction_hash: String,
  timestamp: Date,
  game_specific_data: Object
}
```

### Queue Collection (Matchmaking)
```javascript
{
  player_address: String,
  stake_preference: Number,
  elo_rating: Number,
  joined_at: Date,
  game_preferences: Object
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Services Won't Start**
   ```bash
   # Check if ports are available
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   netstat -ano | findstr :3004
   netstat-ano | findstr :3005
   
   # Kill processes if needed
   taskkill /PID <PID> /F
   ```

2. **Contract Deployment Failed**
   - Ensure Hardhat node is running
   - Check deployer account has sufficient ETH
   - Verify Solidity compiler version (0.8.19)
   - Run `npm run check-contracts` for diagnostics

3. **Frontend Connection Issues**
   - Verify MetaMask is connected to localhost:8545
   - Check contract addresses in `.env` file
   - Ensure all backend services are running
   - Clear browser cache and reload

4. **Game Server Connection Problems**
   - Check Socket.IO connection in browser console
   - Verify CORS settings allow frontend domain
   - Ensure game server port (3004) is accessible
   - Check firewall settings

5. **Matchmaking Not Working**
   - Verify matchmaking service is running on port 3005
   - Check player queue status via API
   - Ensure minimum 2 players are in queue
   - Check ELO rating compatibility

### Advanced Debugging

**Environment Validation**
```bash
npm run fix-env
```

**Service Health Check**
```bash
curl http://localhost:3000/health
curl http://localhost:3001/health  
curl http://localhost:3004/health
curl http://localhost:3005/health
```

**Contract Verification**
```bash
npm run check-contracts
```

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Connection Pooling**: Optimize database connection management
3. **Caching**: Implement Redis for frequently accessed data
4. **Load Balancing**: Scale services horizontally for high load

## 🔮 Future Enhancements

### Immediate Roadmap
- **🎯 Multiple Game Types**: Chess, Checkers, Card Games
- **🏆 Tournament System**: Bracket-style competitions with entry fees
- **💰 Dynamic Pricing**: Market-driven token conversion rates
- **📱 Mobile App**: React Native application for mobile gaming

### Advanced Features
- **🌐 Multi-chain Support**: Deploy to Polygon, BSC, Arbitrum
- **🤖 AI Opponents**: Smart contract-based AI players
- **🎨 NFT Integration**: Collectible game pieces and achievements
- **⚡ Layer 2 Integration**: Reduce gas costs with L2 solutions

### Governance & Economics
- **🗳️ DAO Governance**: Community-driven protocol upgrades
- **📊 Advanced Analytics**: Detailed statistics and performance metrics
- **🎁 Reward Programs**: Loyalty rewards and referral bonuses
- **💱 DeFi Integration**: Yield farming and liquidity mining

### Technical Improvements
- **🔐 Enhanced Security**: Formal verification and audit integration
- **📈 Scalability**: Microservices architecture with Kubernetes
- **🔄 State Channels**: Off-chain state management for faster games
- **🌊 Real-time Streaming**: Live game spectating and streaming

### User Experience
- **🎮 VR/AR Support**: Immersive gaming experiences
- **🎵 Sound & Graphics**: Enhanced UI/UX with animations
- **🌍 Internationalization**: Multi-language support
- **♿ Accessibility**: Screen reader and disability support

## 🚀 Live Demo & Deployment

### Local Development
The project runs locally with full functionality on Hardhat network.

### Testnet Deployment
Deploy to Sepolia testnet:
```bash
npm run deploy:sepolia
```

### Production Deployment
🔗 **[Live Demo on Vercel](https://smart-contracts-tn29.vercel.app/)**

The frontend is deployed and accessible, showcasing:
- Full wallet integration
- Token purchase and conversion
- Match creation interface
- Real-time leaderboard
- Responsive design

### Deployment Architecture
- **Frontend**: Vercel (Static hosting with serverless functions)
- **Backend**: Railway/Heroku (Node.js API server)
- **Contracts**: Ethereum Sepolia Testnet
- **Database**: MongoDB Atlas (Cloud database)
- **Game Server**: Dedicated VPS with Socket.IO

## 📜 License & Credits

### License
This project is licensed under the MIT License - see the LICENSE file for details.

### Credits
- **Developer**: Aditya Tripathi
- **GitHub**: [@Aditya16022004](https://github.com/Aditya16022004)
- **Assessment**: WeSee Gaming Assessment Task
- **Technologies**: Ethereum, Hardhat, React, Node.js, Socket.IO, MongoDB

### Acknowledgments
- OpenZeppelin for secure smart contract libraries
- Hardhat team for excellent development tools
- Ethers.js for blockchain interaction
- Socket.IO for real-time communication
- React community for frontend framework

---

**Built by Aditya Tripathi**

*This project demonstrates advanced full-stack blockchain development with real-time gaming capabilities, showcasing modern web3 technologies and best practices.*
