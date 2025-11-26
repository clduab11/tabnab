import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('tabnab', {
  // Status
  getStatus: () => ipcRenderer.invoke('get-status'),
  connect: () => ipcRenderer.invoke('connect'),
  disconnect: () => ipcRenderer.invoke('disconnect'),

  // Config
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: (config: Record<string, unknown>) => ipcRenderer.invoke('update-config', config),

  // Logs
  getLogs: () => ipcRenderer.invoke('get-logs'),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),

  // Log listener
  onLogEntry: (callback: (entry: { timestamp: string; level: string; message: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, entry: { timestamp: string; level: string; message: string }) => {
      callback(entry);
    };
    ipcRenderer.on('log-entry', handler);
    return () => {
      ipcRenderer.removeListener('log-entry', handler);
    };
  },
});

// Type declaration for the exposed API
declare global {
  interface Window {
    tabnab: {
      getStatus: () => Promise<{
        connected: boolean;
        debugUrl: string;
        config: Record<string, unknown>;
      }>;
      connect: () => Promise<{ connected: boolean; error?: string }>;
      disconnect: () => Promise<{ connected: boolean }>;
      getConfig: () => Promise<Record<string, unknown>>;
      updateConfig: (config: Record<string, unknown>) => Promise<Record<string, unknown>>;
      getLogs: () => Promise<Array<{ timestamp: Date; level: string; message: string }>>;
      clearLogs: () => Promise<{ success: boolean }>;
      onLogEntry: (
        callback: (entry: { timestamp: string; level: string; message: string }) => void
      ) => () => void;
    };
  }
}
