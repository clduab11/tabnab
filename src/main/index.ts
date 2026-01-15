import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, Menu, nativeImage, Tray } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray: Tray | null = null;
let mcpServerProcess: ReturnType<typeof spawn> | null = null;

function createTray(): void {
  // Create a simple icon for the menu bar (16x16 transparent PNG)
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVDiNpZM9S8NQFIafm3y0SZq0aRoLC4KDg4uCk5ODi6Og/gD/gIubk4I4ODkIIiJu/gB/goiDg4ODi4uLgyAIpbSlTZuPJjdJbyy1Q5XaQc/ycl7e8x4OV+LxmPwPJBIJrNVqxMutra0XwzBQFAXLshBC4Ht+LwCyLLPf6XRYXl7+AlKpFKqq8vjwwPzcHACe5xGNRukHABzHIRaLcX19TSwWA8D3fYIgQJIkpFqtxs7ODqZp/gCKomDbNpZl0Wg0mJqaAmAwGFCv17m8vGR8fPwHGB0dZXp6munpaSzLYm5uDsMwqFQq7O/vozFwHIfT01Pu7u44Pj7GdV0qlQqWZWEYBtls9hdQq9U4Ojri/PycdDpNsVikVCqh6zrFYpFisYht23Q6HRRFQdd1crkct7e3LC0tkclkKBQK3Nzc8A2wRNrJUKH5OwAAAABJRU5ErkJggg=='
  );

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'TabNab - Chrome MCP Server',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Status: Running',
      enabled: false,
    },
    {
      label: 'Port: 9222',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Restart Server',
      click: () => {
        restartMCPServer();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('TabNab MCP Server');
  tray.setContextMenu(contextMenu);
}

function startMCPServer(): void {
  // Start the MCP server as a child process
  const serverPath = path.join(__dirname, '..', 'mcp', 'index.js');

  mcpServerProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: process.env,
  });

  mcpServerProcess.stdout?.on('data', (data) => {
    console.log(`MCP Server: ${data}`);
  });

  mcpServerProcess.stderr?.on('data', (data) => {
    console.error(`MCP Server Error: ${data}`);
  });

  mcpServerProcess.on('close', (code) => {
    console.log(`MCP Server process exited with code ${code}`);
    mcpServerProcess = null;
  });
}

function stopMCPServer(): void {
  if (mcpServerProcess) {
    mcpServerProcess.kill();
    mcpServerProcess = null;
  }
}

function restartMCPServer(): void {
  stopMCPServer();
  setTimeout(() => {
    startMCPServer();
  }, 1000);
}

app.whenReady().then(() => {
  createTray();
  // Note: MCP server is typically started by the MCP client (like Claude Desktop)
  // not by the Electron app itself
  console.log('TabNab menu bar app is ready');
});

app.on('window-all-closed', () => {
  // Prevent the app from quitting when all windows are closed
  // On macOS, keep the app running in the menu bar
});

app.on('before-quit', () => {
  stopMCPServer();
});

// Handle macOS dock icon
if (process.platform === 'darwin') {
  app.dock?.hide();
}
