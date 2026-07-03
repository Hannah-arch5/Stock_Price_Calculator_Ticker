const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const stateFile = path.join(app.getPath('userData'), 'window-state-v9.json');
    let state = { width: 600, height: 1180 }; // Fallback defaults
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
            preload: path.join(__dirname, 'preload.js'),
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

    // Toggle window size logic
    let isDefaultSize = (mainWindow.getBounds().width === 600 && mainWindow.getBounds().height === 1180);
    let previousBounds = null;

    ipcMain.on('toggle-window-size', () => {
        const bounds = mainWindow.getBounds();
        const currentlyDefault = (bounds.width === 600 && bounds.height === 1180);
        
        if (currentlyDefault) {
            if (previousBounds) {
                mainWindow.setBounds(previousBounds);
            }
        } else {
            previousBounds = bounds;
            mainWindow.setBounds({ width: 600, height: 1180 });
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('fetch-financial-data', async (event, url) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error('Fetch error:', error);
            return { error: error.message };
        }
    });

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
