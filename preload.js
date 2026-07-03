const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    toggleWindowSize: () => ipcRenderer.send('toggle-window-size'),
    fetchFinancialData: (url) => ipcRenderer.invoke('fetch-financial-data', url)
});
