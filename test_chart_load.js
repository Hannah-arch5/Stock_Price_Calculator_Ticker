const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
    mainWindow.loadFile('index.html');
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        require('fs').appendFileSync('chart_test.log', `[${level}] ${message} (${sourceId}:${line})\n`);
    });
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            setTimeout(() => {
                const btn = document.querySelector('.chart-toggle-btn');
                if (btn) btn.click();
            }, 500);
        `);
        setTimeout(() => app.quit(), 3000);
    });
});
