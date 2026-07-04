const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Pin userData to a fixed path so data is always in the same place
// regardless of where the .app bundle is located
const FIXED_USER_DATA = path.join(os.homedir(), 'Library', 'Application Support', 'ticker');
app.setPath('userData', FIXED_USER_DATA);

const DATA_FILE = path.join(FIXED_USER_DATA, 'app-data-v1.json');

// Register ALL IPC handlers BEFORE the window is created
// so they are ready when the renderer loads script.js

ipcMain.handle('load-data', () => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const content = fs.readFileSync(DATA_FILE, 'utf8');
            console.log('[main] load-data: returning', content.length, 'chars');
            return content;
        }
        console.log('[main] load-data: file not found at', DATA_FILE);
    } catch(e) {
        console.error('[main] load-data error:', e);
    }
    return null;
});

ipcMain.on('save-data', (event, dataStr) => {
    try {
        fs.mkdirSync(FIXED_USER_DATA, { recursive: true });
        fs.writeFileSync(DATA_FILE, dataStr, 'utf8');
    } catch(e) {
        console.error('[main] save-data error:', e);
    }
});

const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

ipcMain.handle('fetch-yahoo', async (event, symbol) => {
    try {
        const result = await yahooFinance.quoteSummary(symbol, { modules: ['calendarEvents', 'summaryDetail', 'financialData', 'price'] });
        const news = await yahooFinance.search(symbol, { newsCount: 5 });
        return { quoteSummary: result, news: news.news };
    } catch (e) {
        console.error('[main] fetch-yahoo error:', e);
        return { error: e.message };
    }
});

ipcMain.handle('fetch-financial-data', async (event, url) => {
    try {
        const headers = url.includes('push2.eastmoney.com') 
            ? {} 
            : { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' };
            
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.text();
    } catch (error) {
        console.error('[main] fetch error:', error);
        return { error: error.message };
    }
});

function createWindow() {
    const stateFile = path.join(FIXED_USER_DATA, 'window-state-v9.json');
    let state = { width: 600, height: 1180 };
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
            contextIsolation: true,
            webSecurity: false
        }
    });

    mainWindow.loadFile('index.html');

    const saveWindowState = () => {
        try {
            const bounds = mainWindow.getBounds();
            fs.writeFileSync(stateFile, JSON.stringify(bounds));
        } catch(e) {}
    };

    mainWindow.on('resize', saveWindowState);
    mainWindow.on('move', saveWindowState);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

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
