const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            const recoveredData = [
                {
                    symbol: '603618',
                    records: [
                        { id: Date.now(), type: 'Base', inputs: { basePrice: '57.21', percentChange: '', targetPrice: '45.00', moveDown: true }, result: '21.32%', isUp: false },
                        { id: Date.now()+1, type: 'Base', inputs: { basePrice: '50.86', percentChange: '13', targetPrice: '', moveDown: false }, result: '57.47', isUp: true },
                        { id: Date.now()+2, type: 'Note', text: '周一9:15挂单53.9 - 400买入', urgency: 'orange' }
                    ]
                },
                { symbol: '三角', records: [{ id: Date.now()+3, type: 'Note', text: '恢复的数据' }] },
                { symbol: '工业', records: [{ id: Date.now()+4, type: 'Note', text: '恢复的数据' }] },
                { symbol: '润起', records: [{ id: Date.now()+5, type: 'Note', text: '恢复的数据' }] },
                { symbol: '中国', records: [{ id: Date.now()+6, type: 'Note', text: '恢复的数据' }] },
                { symbol: '东方', records: [{ id: Date.now()+7, type: 'Note', text: '恢复的数据' }] },
                { symbol: '钧达', records: [{ id: Date.now()+8, type: 'Note', text: '恢复的数据' }] },
                { symbol: '福鞍', records: [{ id: Date.now()+9, type: 'Note', text: '恢复的数据' }] },
                { symbol: '科士达', records: [{ id: Date.now()+10, type: 'Note', text: '恢复的数据' }] },
                { symbol: '航发', records: [{ id: Date.now()+11, type: 'Note', text: '恢复的数据' }] },
                { symbol: '双良', records: [{ id: Date.now()+12, type: 'Note', text: '恢复的数据' }] }
            ];
            localStorage.setItem('calcHistory', JSON.stringify(recoveredData));
            localStorage.setItem('calcHistoryVersion', '2');
            localStorage.removeItem('history-v9');
        `).then(() => {
            app.quit();
        });
    });
});
