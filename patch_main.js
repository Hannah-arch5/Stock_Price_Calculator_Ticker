const fs = require('fs');
let content = fs.readFileSync('main.js', 'utf8');

content = content.replace(
    /ipcMain\.on\('toggle-window-size', \(\) => \{[\s\S]*?\}\);/g,
    `ipcMain.on('toggle-window-size', () => {
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
    });`
);

fs.writeFileSync('main.js', content);
