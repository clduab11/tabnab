import { Tray, Menu, nativeImage, BrowserWindow, NativeImage } from 'electron';
import * as path from 'path';
import { getBrowserConnection } from '../browser/connection';

let tray: Tray | null = null;
let isEnabled = true;
let mainWindow: BrowserWindow | null = null;

export interface TrayCallbacks {
  onToggle: (enabled: boolean) => void;
  onShowLogs: () => void;
  onQuit: () => void;
}

export function createTray(callbacks: TrayCallbacks): Tray {
  // Create tray icon
  const iconPath = path.join(__dirname, '../../assets/tray-icon.png');

  // Create a simple icon if the file doesn't exist
  let icon: NativeImage;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      icon = createDefaultIcon();
    }
  } catch {
    icon = createDefaultIcon();
  }

  tray = new Tray(icon);
  tray.setToolTip('TabNab - Browser Bridge');

  updateTrayMenu(callbacks);

  return tray;
}

function createDefaultIcon(): NativeImage {
  // Create a simple 16x16 icon
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);

  // Fill with a simple colored circle pattern
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const centerX = size / 2;
      const centerY = size / 2;
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

      if (distance < size / 2 - 1) {
        // Inside circle - green/blue color
        buffer[idx] = 66;      // R
        buffer[idx + 1] = 133; // G
        buffer[idx + 2] = 244; // B
        buffer[idx + 3] = 255; // A
      } else {
        // Outside - transparent
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
      }
    }
  }

  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

function updateTrayMenu(callbacks: TrayCallbacks): void {
  if (!tray) return;

  const browser = getBrowserConnection();
  const isConnected = browser.isConnected();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'TabNab',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: `Status: ${isConnected ? 'Connected' : 'Disconnected'}`,
      enabled: false,
    },
    {
      label: isEnabled ? 'Disable' : 'Enable',
      click: () => {
        isEnabled = !isEnabled;
        callbacks.onToggle(isEnabled);
        updateTrayMenu(callbacks);
      },
    },
    { type: 'separator' },
    {
      label: 'View Logs',
      click: () => {
        callbacks.onShowLogs();
      },
    },
    {
      label: 'Reconnect to Chrome',
      click: async () => {
        const browser = getBrowserConnection();
        await browser.connect();
        updateTrayMenu(callbacks);
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        callbacks.onQuit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Update icon based on status
  if (isEnabled && isConnected) {
    tray.setToolTip('TabNab - Connected');
  } else if (isEnabled) {
    tray.setToolTip('TabNab - Disconnected');
  } else {
    tray.setToolTip('TabNab - Disabled');
  }
}

export function updateTrayStatus(callbacks: TrayCallbacks): void {
  updateTrayMenu(callbacks);
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

export function setMainWindow(window: BrowserWindow): void {
  mainWindow = window;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}
