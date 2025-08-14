@echo off
title Stop Aditya's Blockchain Gaming Arena

echo.
echo 🛑 Stopping Aditya's Blockchain Gaming Arena...
echo =============================================
echo.

echo 🧹 Stopping all Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo 🧹 Stopping all command windows...
taskkill /f /fi "WindowTitle eq Backend API*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Indexer*" >nul 2>&1  
taskkill /f /fi "WindowTitle eq Matchmaking*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Game Server*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Frontend*" >nul 2>&1

echo.
echo ✅ All gaming services have been stopped!
echo.
echo Press any key to exit...
pause >nul
