const fs = require('fs');
const path = require('path');
const snappy = require('snappy');
const dbPath = path.join(process.env.HOME, 'Library/Application Support/Ticker/Local Storage/leveldb');
const files = fs.readdirSync(dbPath);

for (const file of files) {
    if (file.endsWith('.ldb') || file.endsWith('.log')) {
        const buf = fs.readFileSync(path.join(dbPath, file));
        let idx = -1;
        // Search for 'calcHistory' in buffer
        const searchBuf = Buffer.from('calcHistory');
        while ((idx = buf.indexOf(searchBuf, idx + 1)) !== -1) {
            // Find the start of the block. Blocks in SSTable are usually 4KB.
            // But let's just try to find the snappy header.
            // Or just use the `classic-level` package to iterate over the whole DB?
            // No, classic-level only shows the latest keys.
            // Let's just output the buffer chunk around it to a file.
            const start = Math.max(0, idx - 100);
            const end = Math.min(buf.length, idx + 5000);
            const chunk = buf.slice(start, end);
            fs.writeFileSync(`chunk_${file}_${idx}.bin`, chunk);
            console.log(`Saved chunk_${file}_${idx}.bin`);
        }
    }
}
