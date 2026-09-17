const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Grace Church OS",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // dist/index.html கோப்பை லோட் செய்தல்
  win.loadFile(path.join(__dirname, '../dist/index.html'));

  // வெள்ளை திரை வந்தால் என்ன பிழை என்று உடனே பார்க்க DevTools-ஐ திறக்கவும்
  win.webContents.openDevTools();

  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});