@echo off
title Aditya's Blockchain Gaming Arena - System Startup

echo.
echo 🎮 Starting Aditya's Blockchain Gaming Arena...
echo =============================================
echo.

echo 🧹 Cleaning up any existing processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 🚀 Starting all services...
echo.

echo 📡 Starting Backend API (Port 3001)...
start "Backend API" cmd /k "cd /d "%~dp0" && echo 🔗 Backend API Server Starting... && npm run backend"

timeout /t 3 /nobreak >nul

echo 📊 Starting Blockchain Indexer (Port 3002)...  
start "Indexer" cmd /k "cd /d "%~dp0" && echo 📈 Blockchain Indexer Starting... && npm run indexer"

timeout /t 3 /nobreak >nul

echo 🎯 Starting Matchmaking Service (Port 3003)...
start "Matchmaking" cmd /k "cd /d "%~dp0" && echo 🔍 Matchmaking Service Starting... && npm run matchmaking"

timeout /t 3 /nobreak >nul

echo 🎮 Starting Pong Game Server (Port 3004)...
start "Game Server" cmd /k "cd /d "%~dp0" && echo 🏓 Pong Game Server Starting... && npm run game-server"

timeout /t 5 /nobreak >nul

echo 🌐 Starting Frontend Interface (Port 3000)...
start "Frontend" cmd /k "cd /d "%~dp0\frontend" && echo 🎨 Frontend Interface Starting... && npm start"

echo.
echo ⏳ Waiting for all services to initialize...
timeout /t 15 /nobreak >nul

echo.
echo 🎉 Gaming System Startup Complete!
echo =============================================
echo.
echo 📱 Access Points:
echo    🌐 Main Game:      http://localhost:3000
echo    📡 Backend API:    http://localhost:3001/health
echo    📊 Leaderboard:    http://localhost:3002/leaderboard
echo    🎯 Matchmaking:    http://localhost:3003/health
echo    🎮 Game Server:    http://localhost:3004/health
echo.
echo 🎮 How to Play:
echo    1. Open http://localhost:3000 in your browser
echo    2. Connect your MetaMask wallet
echo    3. Buy GT tokens if needed
echo    4. Click 'Find Match' to start gaming!
echo.
echo 🛑 To stop all services: Close all command windows
echo.
echo Opening main game in your browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo Press any key to exit this startup script (services will continue running)...
pause >nul
