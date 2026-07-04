const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
    mainWindow.loadFile('index.html');
    mainWindow.webContents.on('console-message', (event, level, message) => {
        require('fs').appendFileSync('keys.log', message + '\n');
    });
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            setTimeout(() => {
                const chart = LightweightCharts.createChart(document.body);
                console.log("KEYS:", Object.keys(chart).join(', '));
            }, 500);
        `);
        setTimeout(() => app.quit(), 2000);
    });
});
