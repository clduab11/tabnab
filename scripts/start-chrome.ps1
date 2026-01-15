# Script to start Chrome with remote debugging enabled on Windows
# This is required for TabNab to connect to your browser

$PORT = 9222

Write-Host "🚀 Starting Chrome with remote debugging on port $PORT" -ForegroundColor Green
Write-Host ""
Write-Host "Note: This will start a new Chrome instance. You can use your existing"
Write-Host "profile or start with a fresh profile."
Write-Host ""

# Try to find Chrome
$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:LocalAppData}\Google\Chrome\Application\chrome.exe"
)

$CHROME_PATH = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $CHROME_PATH = $path
        break
    }
}

if (-not $CHROME_PATH) {
    Write-Host "❌ Chrome not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Chrome or specify the path manually:"
    Write-Host "  `$env:CHROME_PATH = 'C:\Path\To\chrome.exe'"
    Write-Host "  .\start-chrome.ps1"
    exit 1
}

Write-Host "📍 Using Chrome at: $CHROME_PATH" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Chrome with remote debugging on port $PORT..." -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now use TabNab to connect to this browser instance."
Write-Host "Press Ctrl+C to stop Chrome."
Write-Host ""

& $CHROME_PATH --remote-debugging-port=$PORT
