const { app, BrowserWindow } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173/')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    win.loadFile(indexPath).catch((err) => {
      const fs = require('fs');
      const logPath = path.join(app.getPath('userData'), 'renderer-load-error.log');
      const errorMsg = `[${new Date().toISOString()}] Failed to load index.html: ${err.stack || err}\n`;
      fs.appendFileSync(logPath, errorMsg);
      console.error('Failed to load renderer:', err);
    });
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
