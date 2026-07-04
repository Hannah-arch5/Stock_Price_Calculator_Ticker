const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
    mainWindow.loadFile('index.html');
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        require('fs').appendFileSync('app_errors.log', `[${level}] ${message} (${sourceId}:${line})\n`);
    });
    mainWindow.webContents.on('did-finish-load', () => {
        setTimeout(() => app.quit(), 2000);
    });
});
