const fs = require('fs');
const path = require('path');
const dbPath = path.join(process.env.HOME, 'Library/Application Support/Ticker/Local Storage/leveldb');
const files = fs.readdirSync(dbPath);

let bestJson = '';
let maxLen = 0;

for (const file of files) {
    if (file.endsWith('.ldb') || file.endsWith('.log')) {
        const content = fs.readFileSync(path.join(dbPath, file), 'utf8');
        // Find all JSON arrays that contain "603618" or "symbol"
        const regex = /\[\{.*?\}\]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const str = match[0];
            if (str.includes('603618') && str.length > maxLen) {
                // Try parsing
                try {
                    const parsed = JSON.parse(str);
                    if (Array.isArray(parsed) && parsed.length > 2) { // the old data had many items
                        bestJson = str;
                        maxLen = str.length;
                    }
                } catch (e) {}
            }
        }
    }
}
if (bestJson) {
    fs.writeFileSync('recovered_data.json', bestJson);
    console.log('Recovered JSON length:', bestJson.length);
} else {
    console.log('No data found');
}
