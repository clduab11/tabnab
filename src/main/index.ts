import { app, BrowserWindow, shell } from 'electron';
import * as path from 'path';
import { createTray, updateTrayStatus, destroyTray, setMainWindow, TrayCallbacks } from './tray';
import { setupIpcHandlers, addLog } from './ipc';
import { getBrowserConnection, resetBrowserConnection } from '../browser/connection';
import { createMcpServer } from '../mcp/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus window if user tries to open another instance
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    show: false, // Start hidden, show from tray
    frame: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the renderer
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Hide instead of close
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  setMainWindow(mainWindow);

  return mainWindow;
}

async function initializeBrowser(): Promise<void> {
  addLog('info', 'Attempting to connect to Chrome...');

  const browser = getBrowserConnection();
  const state = await browser.connect();

  if (state.connected) {
    addLog('info', `Connected to Chrome at ${state.debugUrl}`);
  } else {
    addLog('warn', `Failed to connect: ${state.error}`);
    addLog('info', 'TabNab will work once Chrome is started with --remote-debugging-port=9222');
  }
}

function setupTray(): void {
  const callbacks: TrayCallbacks = {
    onToggle: (enabled) => {
      addLog('info', `TabNab ${enabled ? 'enabled' : 'disabled'}`);
      if (enabled) {
        initializeBrowser();
      } else {
        resetBrowserConnection();
      }
    },
    onShowLogs: () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    onQuit: () => {
      isQuitting = true;
      app.quit();
    },
  };

  createTray(callbacks);

  // Update tray status periodically
  setInterval(() => {
    updateTrayStatus(callbacks);
  }, 5000);
}

async function startMcpServer(): Promise<void> {
  // Check if we're running in stdio mode (as MCP server)
  if (process.argv.includes('--mcp-stdio')) {
    addLog('info', 'Starting MCP server in stdio mode...');

    const server = createMcpServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);
    addLog('info', 'MCP server running on stdio');
  }
}

app.whenReady().then(async () => {
  // Setup IPC handlers first
  setupIpcHandlers();

  // Create the window (hidden initially)
  createWindow();

  // Setup tray
  setupTray();

  // Initialize browser connection
  await initializeBrowser();

  // Start MCP server if in stdio mode
  await startMcpServer();

  addLog('info', 'TabNab initialized successfully');

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit on window close (tray app)
  if (process.platform !== 'darwin') {
    // On non-macOS, we keep running in tray
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  destroyTray();
  resetBrowserConnection();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  addLog('error', `Uncaught exception: ${error.message}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  addLog('error', `Unhandled rejection: ${String(reason)}`);
});
