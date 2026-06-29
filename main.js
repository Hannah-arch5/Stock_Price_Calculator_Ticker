const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const stateFile = path.join(app.getPath('userData'), 'window-state.json');
    let state = { width: 500, height: 1200 }; // Fallback defaults
    try {
        if (fs.existsSync(stateFile)) {
            state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        }
    } catch(e) {}

    const mainWindow = new BrowserWindow({
        width: state.width,
        height: state.height,
        x: state.x,
        y: state.y,
        resizable: true,
        titleBarStyle: 'hiddenInset',
        alwaysOnTop: true,
        backgroundColor: '#030303',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');
    
    // Save state on resize and move
    const saveState = () => {
        try {
            const bounds = mainWindow.getBounds();
            fs.writeFileSync(stateFile, JSON.stringify(bounds));
        } catch(e) {}
    };

    mainWindow.on('resize', saveState);
    mainWindow.on('move', saveState);

    // Open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
