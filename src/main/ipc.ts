import { ipcMain, BrowserWindow } from 'electron';
import { getBrowserConnection } from '../browser/connection';
import { defaultConfig, TabNabConfig } from '../mcp/types';

let config: TabNabConfig = { ...defaultConfig };
const logs: Array<{ timestamp: Date; level: string; message: string }> = [];
const MAX_LOGS = 1000;

export function setupIpcHandlers(): void {
  // Get current connection status
  ipcMain.handle('get-status', async () => {
    const browser = getBrowserConnection(config);
    return {
      connected: browser.isConnected(),
      debugUrl: browser.debugUrl,
      config,
    };
  });

  // Connect to Chrome
  ipcMain.handle('connect', async () => {
    const browser = getBrowserConnection(config);
    const state = await browser.connect();
    return state;
  });

  // Disconnect from Chrome
  ipcMain.handle('disconnect', async () => {
    const browser = getBrowserConnection(config);
    await browser.disconnect();
    return { connected: false };
  });

  // Get current config
  ipcMain.handle('get-config', () => {
    return config;
  });

  // Update config
  ipcMain.handle('update-config', (_event, newConfig: Partial<TabNabConfig>) => {
    config = { ...config, ...newConfig };
    return config;
  });

  // Get logs
  ipcMain.handle('get-logs', () => {
    return logs;
  });

  // Clear logs
  ipcMain.handle('clear-logs', () => {
    logs.length = 0;
    return { success: true };
  });
}

export function addLog(level: string, message: string): void {
  logs.push({
    timestamp: new Date(),
    level,
    message,
  });

  // Trim logs if too many
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // Notify all windows
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('log-entry', {
      timestamp: new Date().toISOString(),
      level,
      message,
    });
  });
}

export function getConfig(): TabNabConfig {
  return config;
}

export function setConfig(newConfig: Partial<TabNabConfig>): void {
  config = { ...config, ...newConfig };
}
