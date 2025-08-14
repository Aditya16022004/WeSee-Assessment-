Write-Host "Starting Gaming System..." -ForegroundColor Cyan
Write-Host ""

function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($processId in $processes) {
            if ($processId -and $processId -ne 0) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
            }
        }
    } catch {
        Write-Host "Could not stop process on port $Port" -ForegroundColor Yellow
    }
}

Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
$ports = @(3001, 3002, 3003, 3004, 3000)
foreach ($port in $ports) {
    if (Test-Port $port) {
        Stop-ProcessOnPort $port
    }
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command', 
    'cd "' + $PWD.Path + '"; npm run backend'
) -WindowStyle Normal

Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    'cd "' + $PWD.Path + '"; npm run indexer'
) -WindowStyle Normal

Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    'cd "' + $PWD.Path + '"; npm run matchmaking'
) -WindowStyle Normal

Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList @(
    '-NoExit', 
    '-Command',
    'cd "' + $PWD.Path + '"; npm run game-server'
) -WindowStyle Normal

Start-Sleep -Seconds 5

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command', 
    'cd "' + $PWD.Path + '\frontend"; npm start'
) -WindowStyle Normal

Write-Host ""
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Cyan

$services = @(
    @{Name="Backend"; Port=3001; Endpoint="health"},
    @{Name="Indexer"; Port=3002; Endpoint="leaderboard"}, 
    @{Name="Matchmaking"; Port=3003; Endpoint="health"},
    @{Name="Game Server"; Port=3004; Endpoint="health"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$($service.Port)/$($service.Endpoint)" -TimeoutSec 5
        Write-Host "✅ $($service.Name) (Port $($service.Port)): Running" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) (Port $($service.Port)): Not responding" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Gaming System Ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor White
Write-Host "   Main Game:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend API:    http://localhost:3001/health" -ForegroundColor Gray
Write-Host "   Leaderboard:    http://localhost:3002/leaderboard" -ForegroundColor Gray  
Write-Host "   Matchmaking:    http://localhost:3003/health" -ForegroundColor Gray
Write-Host "   Game Server:    http://localhost:3004/health" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")