#!/bin/bash
# Launch Chrome with remote debugging enabled for TabNab

PORT=${1:-9222}

# Detect OS and Chrome location
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if [[ ! -f "$CHROME_PATH" ]]; then
        CHROME_PATH="/Applications/Chromium.app/Contents/MacOS/Chromium"
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash)
    CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"
    if [[ ! -f "$CHROME_PATH" ]]; then
        CHROME_PATH="/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
    fi
else
    # Linux
    CHROME_PATH=$(which google-chrome || which google-chrome-stable || which chromium-browser || which chromium)
fi

if [[ -z "$CHROME_PATH" ]] || [[ ! -f "$CHROME_PATH" ]]; then
    echo "Error: Chrome/Chromium not found. Please install Chrome or set CHROME_PATH manually."
    exit 1
fi

echo "Launching Chrome with remote debugging on port $PORT..."
echo "Chrome path: $CHROME_PATH"

# Launch Chrome with debugging enabled
"$CHROME_PATH" \
    --remote-debugging-port=$PORT \
    --no-first-run \
    --no-default-browser-check \
    --user-data-dir="${HOME}/.tabnab-chrome-profile" \
    &

echo ""
echo "Chrome launched! TabNab can now connect to http://localhost:$PORT"
echo ""
echo "Note: Using a separate Chrome profile at ~/.tabnab-chrome-profile"
echo "This keeps your TabNab session separate from your regular Chrome."
