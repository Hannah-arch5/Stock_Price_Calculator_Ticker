const fs = require('fs');
const path = require('path');
const dbPath = path.join(process.env.HOME, 'Library/Application Support/Ticker/Local Storage/leveldb');
const files = fs.readdirSync(dbPath);

for (const file of files) {
    if (file.endsWith('.ldb') || file.endsWith('.log')) {
        const content = fs.readFileSync(path.join(dbPath, file));
        const str = content.toString('utf8');
        let idx = -1;
        while ((idx = str.indexOf('calcHistory', idx + 1)) !== -1) {
            const start = Math.max(0, idx - 50);
            const end = Math.min(str.length, idx + 5000);
            console.log(`--- MATCH in ${file} ---`);
            console.log(str.substring(start, end).replace(/[^ -~]/g, ''));
        }
    }
}
