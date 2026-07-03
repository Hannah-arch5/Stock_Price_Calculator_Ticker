const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    toggleWindowSize: () => ipcRenderer.send('toggle-window-size')
});