#!/bin/bash

# Script to start Chrome/Chromium with remote debugging enabled
# This is required for TabNab to connect to your browser

PORT=9222

echo "🚀 Starting Chrome with remote debugging on port $PORT"
echo ""
echo "Note: This will start a new Chrome instance. You can use your existing"
echo "profile or start with a fresh profile."
echo ""

# Detect OS and Chrome location
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  if [ ! -f "$CHROME_PATH" ]; then
    CHROME_PATH="/Applications/Chromium.app/Contents/MacOS/Chromium"
  fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  CHROME_PATH=$(which google-chrome || which chromium-browser || which chromium)
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  # Windows
  CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
fi

if [ -z "$CHROME_PATH" ] || [ ! -f "$CHROME_PATH" ]; then
  echo "❌ Chrome/Chromium not found!"
  echo ""
  echo "Please install Chrome or Chromium, or set CHROME_PATH manually:"
  echo "  export CHROME_PATH='/path/to/chrome'"
  echo "  $0"
  exit 1
fi

echo "📍 Using Chrome at: $CHROME_PATH"
echo ""
echo "Starting Chrome with remote debugging on port $PORT..."
echo ""
echo "You can now use TabNab to connect to this browser instance."
echo "Press Ctrl+C to stop Chrome."
echo ""

"$CHROME_PATH" --remote-debugging-port=$PORT
