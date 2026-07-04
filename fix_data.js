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
                        { id: Date.now(), type: 'Target Projection', details: 'Base: ¥57.21 | Down 21.32%', result: '45.00', isUp: false, inputs: { base: 57.21, perc: 21.32, isUp: false } },
                        { id: Date.now()+1, type: 'Percentage Delta', details: 'Base: ¥50.86 | Target: ¥57.47', result: '13.00%', isUp: true, inputs: { initial: 50.86, final: 57.47 } },
                        { id: Date.now()+2, type: 'Memo', details: '周一9:15挂单53.9 - 400买入', result: '', isUp: true, inputs: { base: 53.9, perc: 0, isUp: true } }
                    ]
                },
                { symbol: '三角', records: [{ id: Date.now()+3, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] },
                { symbol: '工业', records: [{ id: Date.now()+4, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] },
                { symbol: '润起', records: [{ id: Date.now()+5, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] },
                { symbol: '中国', records: [{ id: Date.now()+6, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] },
                { symbol: '东方', records: [{ id: Date.now()+7, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] },
                { symbol: '钧达', records: [{ id: Date.now()+8, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] },
                { symbol: '福鞍', records: [{ id: Date.now()+9, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] },
                { symbol: '科士达', records: [{ id: Date.now()+10, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] },
                { symbol: '航发', records: [{ id: Date.now()+11, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] },
                { symbol: '双良', records: [{ id: Date.now()+12, type: 'Memo', details: '恢复的空数据', result: '', isUp: true, inputs: { base: 0, perc: 0, isUp: true } }] }
            ];
            localStorage.setItem('calcHistory', JSON.stringify(recoveredData));
            localStorage.setItem('calcHistoryVersion', '2');
            localStorage.removeItem('history-v9');
        `).then(() => {
            app.quit();
        });
    });
});
