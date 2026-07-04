const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    toggleWindowSize: () => ipcRenderer.send('toggle-window-size'),
    fetchFinancialData: (url) => ipcRenderer.invoke('fetch-financial-data', url),
    fetchYahoo: (symbol) => ipcRenderer.invoke('fetch-yahoo', symbol),
    loadData: () => ipcRenderer.invoke('load-data'),
    saveData: (dataStr) => ipcRenderer.send('save-data', dataStr),
    dumpLocalStorage: (data) => ipcRenderer.send('dump-local-storage', data)
});
