const fs = require('fs');

// 1. Create preload.js
fs.writeFileSync('preload.js', `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    toggleWindowSize: () => ipcRenderer.send('toggle-window-size')
});`);

// 2. Patch main.js
let mainJs = fs.readFileSync('main.js', 'utf8');
if (!mainJs.includes('ipcMain.on(\'toggle-window-size\'')) {
    mainJs = mainJs.replace(/const \{ app, BrowserWindow, shell \} = require\('electron'\);/, "const { app, BrowserWindow, shell, ipcMain } = require('electron');");
    
    // WebPreferences
    mainJs = mainJs.replace(/webPreferences:\s*\{\s*nodeIntegration:\s*false,/, "webPreferences: {\n            preload: path.join(__dirname, 'preload.js'),\n            nodeIntegration: false,");
    
    // IPC logic
    const ipcLogic = `
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
`;
    mainJs = mainJs.replace(/        return \{ action: 'deny' \};\n    \}\);\n\}/, "        return { action: 'deny' };\n    });\n" + ipcLogic);
    
    fs.writeFileSync('main.js', mainJs);
}

// 3. Patch index.html
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('id="size-toggle-btn"')) {
    const btnHtml = `            <button id="size-toggle-btn" class="global-action-btn" title="Toggle Window Size">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
            </button>
            <button id="theme-toggle-btn"`;
            
    html = html.replace(/            <button id="theme-toggle-btn"/, btnHtml);
    fs.writeFileSync('index.html', html);
}

// 4. Patch script.js
let js = fs.readFileSync('script.js', 'utf8');
if (!js.includes('id="size-toggle-btn"')) {
    const jsLogic = `
// Window Size Toggle Button
const sizeToggleBtn = document.getElementById('size-toggle-btn');
if (sizeToggleBtn && window.electronAPI) {
    sizeToggleBtn.addEventListener('click', () => {
        window.electronAPI.toggleWindowSize();
    });
}
`;
    fs.writeFileSync('script.js', js + jsLogic);
}
console.log('Toggle patch applied successfully');
