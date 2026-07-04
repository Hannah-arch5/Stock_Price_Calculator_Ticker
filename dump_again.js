const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
    mainWindow.loadFile('index.html');
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
            }
            require('fs').writeFileSync('dump_again.json', JSON.stringify(data, null, 2));
        `).then(() => app.quit());
    });
});
