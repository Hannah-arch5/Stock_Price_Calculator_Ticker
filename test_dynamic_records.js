const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
    mainWindow.loadFile('index.html');
    mainWindow.webContents.on('console-message', (event, level, message) => {
        require('fs').appendFileSync('dyn_test.log', `[${level}] ${message}\n`);
    });
    setTimeout(() => app.quit(), 5000);
});
