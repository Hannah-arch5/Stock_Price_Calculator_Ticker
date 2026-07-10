const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

ipcMain.handle('open-pdf-by-key', async (event, key) => {
    return new Promise((resolve) => {
        const pythonScript = app.isPackaged 
        ? path.join(process.resourcesPath, 'get_pdf_path.py')
        : path.join(__dirname, 'get_pdf_path.py');
        const cmd = `python3 "${pythonScript}" "${key}"`;
        
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error('[main] open-pdf-by-key error:', stderr || error.message);
                resolve(false);
                return;
            }
            try {
                const result = JSON.parse(stdout);
                if (result.success && result.pdfPath) {
                    let fullPath = result.pdfPath;
                    if (!path.isAbsolute(fullPath)) {
                        fullPath = path.join(os.homedir(), 'Zotero', 'storage', fullPath);
                    }
                    if (fs.existsSync(fullPath)) {
                        const pdfWin = new BrowserWindow({
                            width: 1000,
                            height: 800,
                            titleBarStyle: 'hiddenInset',
                            backgroundColor: '#030303',
                            webPreferences: {
                                plugins: true
                            }
                        });
                        pdfWin.loadFile(fullPath);
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.error('[main] open-pdf-by-key parse error:', e);
                resolve(false);
            }
        });
    });
});
