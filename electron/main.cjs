
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

function logError(msg, err) {
  try {
    const logPath = path.join(app.getPath('userData'), 'renderer-load-error.log');
    const errorMsg = `[${new Date().toISOString()}] ${msg}: ${err && err.stack ? err.stack : err || ''}\n`;
    fs.appendFileSync(logPath, errorMsg);
    console.error(msg, err);
  } catch (e) {
    // If logging fails, print to console
    console.error('Failed to write error log:', e);
  }
}

function logInfo(msg) {
  try {
    const logPath = path.join(app.getPath('userData'), 'renderer-load-error.log');
    const infoMsg = `[${new Date().toISOString()}] INFO: ${msg}\n`;
    fs.appendFileSync(logPath, infoMsg);
    console.log(msg);
  } catch (e) {
    console.error('Failed to write info log:', e);
  }
}

process.on('uncaughtException', (err) => {
  logError('Uncaught Exception', err);
});

process.on('unhandledRejection', (reason) => {
  logError('Unhandled Rejection', reason);
});

logInfo('Electron main process starting');

function createWindow() {
  logInfo('Creating main window');
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    logInfo('Loading dev server at http://localhost:5173/');
    win.loadURL('http://localhost:5173/');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    logInfo('Loading file: ' + indexPath);
    win.loadFile(indexPath).catch((err) => {
      logError('Failed to load index.html', err);
    });
  }

  win.on('ready-to-show', () => {
    logInfo('Main window ready to show');
  });
  win.on('show', () => {
    logInfo('Main window shown');
  });
  win.webContents.on('did-finish-load', () => {
    logInfo('Renderer finished loading');
  });
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    logError(`Renderer failed to load: ${errorDescription} (${errorCode}) at ${validatedURL}`);
  });
}

app.whenReady().then(() => {
  logInfo('App ready event');
  createWindow();

  app.on('activate', () => {
    logInfo('App activate event');
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  logInfo('All windows closed');
  if (process.platform !== 'darwin') app.quit();
});
