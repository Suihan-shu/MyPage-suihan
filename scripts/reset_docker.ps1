# =============================================================================
# Hardware/Network Reset Script for Docker
# Usage: .\scripts\reset_docker.ps1
# Description: Kills zombie processes and restarts Docker to free up port 4000
# =============================================================================

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Docker is not installed or not in the system PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Stopping all running containers..." -ForegroundColor Yellow
docker compose down --remove-orphans

Write-Host "Killing any zombie processes on port 8040..." -ForegroundColor Yellow
$connections = Get-NetTCPConnection -LocalPort 8040 -ErrorAction SilentlyContinue

if ($connections) {
    foreach ($conn in $connections) {
        $pid_to_check = $conn.OwningProcess
        # Skip System Idle (0) and System (4)
        if ($pid_to_check -gt 4) {
            $process = Get-Process -Id $pid_to_check -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Killing process $($process.ProcessName) (ID: $($process.Id))..." -ForegroundColor Red
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
        else {
            Write-Host "Port 8040 is held by System/Idle (ID: $pid_to_check). Skipping." -ForegroundColor DarkGray
        }
    }
}
else {
    Write-Host "No process found on port 8040." -ForegroundColor Green
}

Write-Host "Pruning stopped containers..." -ForegroundColor Yellow
docker container prune -f

Write-Host "Done! Please try running .\scripts\serve.ps1 again." -ForegroundColor Cyan
