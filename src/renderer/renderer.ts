// Renderer process script
interface LogEntry {
  timestamp: Date | string;
  level: string;
  message: string;
}

// DOM elements
const statusDot = document.getElementById('statusDot') as HTMLDivElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement;
const disconnectBtn = document.getElementById('disconnectBtn') as HTMLButtonElement;
const portInput = document.getElementById('portInput') as HTMLInputElement;
const clearLogsBtn = document.getElementById('clearLogsBtn') as HTMLButtonElement;
const logsContainer = document.getElementById('logsContainer') as HTMLDivElement;

// Update status display
function updateStatus(connected: boolean, debugUrl?: string): void {
  statusDot.className = `status-dot ${connected ? 'connected' : 'disconnected'}`;
  statusText.textContent = connected ? `Connected to ${debugUrl}` : 'Disconnected';
  connectBtn.disabled = connected;
  disconnectBtn.disabled = !connected;
}

// Add log entry to display
function addLogEntry(entry: LogEntry): void {
  const timestamp = entry.timestamp instanceof Date
    ? entry.timestamp.toLocaleTimeString()
    : new Date(entry.timestamp).toLocaleTimeString();

  const entryEl = document.createElement('div');
  entryEl.className = `log-entry ${entry.level}`;
  entryEl.innerHTML = `
    <span class="timestamp">${timestamp}</span>
    <span class="level">[${entry.level.toUpperCase()}]</span>
    <span class="message">${escapeHtml(entry.message)}</span>
  `;

  logsContainer.appendChild(entryEl);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load initial status
async function loadStatus(): Promise<void> {
  try {
    const status = await window.tabnab.getStatus();
    updateStatus(status.connected, status.debugUrl);

    // Update port input
    const config = await window.tabnab.getConfig();
    if (config.chromeDebugPort) {
      portInput.value = String(config.chromeDebugPort);
    }
  } catch (error) {
    console.error('Failed to load status:', error);
    updateStatus(false);
  }
}

// Load existing logs
async function loadLogs(): Promise<void> {
  try {
    const logs = await window.tabnab.getLogs();
    logsContainer.innerHTML = '';
    logs.forEach(addLogEntry);
  } catch (error) {
    console.error('Failed to load logs:', error);
  }
}

// Event handlers
connectBtn.addEventListener('click', async () => {
  connectBtn.disabled = true;
  statusText.textContent = 'Connecting...';

  try {
    // Update port first
    const port = parseInt(portInput.value, 10);
    if (port > 0 && port < 65536) {
      await window.tabnab.updateConfig({ chromeDebugPort: port });
    }

    const result = await window.tabnab.connect();
    updateStatus(result.connected);

    if (!result.connected && result.error) {
      addLogEntry({
        timestamp: new Date(),
        level: 'error',
        message: result.error,
      });
    }
  } catch (error) {
    updateStatus(false);
    addLogEntry({
      timestamp: new Date(),
      level: 'error',
      message: `Connection failed: ${error}`,
    });
  }
});

disconnectBtn.addEventListener('click', async () => {
  disconnectBtn.disabled = true;

  try {
    await window.tabnab.disconnect();
    updateStatus(false);
  } catch (error) {
    console.error('Disconnect failed:', error);
  }
});

clearLogsBtn.addEventListener('click', async () => {
  try {
    await window.tabnab.clearLogs();
    logsContainer.innerHTML = '';
  } catch (error) {
    console.error('Failed to clear logs:', error);
  }
});

portInput.addEventListener('change', async () => {
  const port = parseInt(portInput.value, 10);
  if (port > 0 && port < 65536) {
    try {
      await window.tabnab.updateConfig({ chromeDebugPort: port });
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  }
});

// Subscribe to log updates
const unsubscribe = window.tabnab.onLogEntry((entry) => {
  addLogEntry(entry);
});

// Cleanup on unload
window.addEventListener('unload', () => {
  unsubscribe();
});

// Initialize
loadStatus();
loadLogs();

// Periodically refresh status
setInterval(loadStatus, 5000);
