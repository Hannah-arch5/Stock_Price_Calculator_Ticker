const fs = require('fs');
const os = require('os');
const path = require('path');

const FIXED_USER_DATA = path.join(os.homedir(), 'Library', 'Application Support', 'ticker');
const DATA_FILE = path.join(FIXED_USER_DATA, 'app-data-v1.json');

if (!fs.existsSync(DATA_FILE)) {
    console.log("No data file found.");
    process.exit(0);
}

const dataStr = fs.readFileSync(DATA_FILE, 'utf8');
let state = JSON.parse(dataStr);
let modifiedCount = 0;
let parseFailures = 0;

state.historyRecords.forEach(group => {
    group.records.forEach(record => {
        let changed = false;
        
        // Ensure record.inputs exists if we can deduce it from record.details or existing inputs
        if (!record.inputs) {
            record.inputs = {};
            changed = true;
        }

        // 1. Percentage Delta
        if (record.type === 'Percentage Delta' || record.type === '30已经涨了' || record.type === '目前D已经跌') { // Some custom names
            // If they are percentage based comparisons
            if (record.details) {
                const initialMatch = record.details.match(/Base:\s*.\s*([\d.]+)/);
                const finalMatch = record.details.match(/Target:\s*.\s*([\d.]+)/);
                if (initialMatch && finalMatch) {
                    record.inputs.initial = parseFloat(initialMatch[1]);
                    record.inputs.final = parseFloat(finalMatch[2]);
                    changed = true;
                }
            }
        } 
        // 2. Target Projection / Price
        else {
            if (record.details && (record.details.includes('Up ') || record.details.includes('Down '))) {
                const baseMatch = record.details.match(/Base:\s*.\s*([\d.]+)/);
                const percMatch = record.details.match(/(Up|Down)\s+([\d.]+)%/);
                if (baseMatch && percMatch) {
                    record.inputs.base = parseFloat(baseMatch[1]);
                    record.inputs.perc = parseFloat(percMatch[2]);
                    record.inputs.isUp = (percMatch[1] === 'Up');
                    record.isUp = record.inputs.isUp;
                    changed = true;
                }
            }
        }
        
        // 3. Make sure record.details does NOT have the old raw span if we have inputs.
        // It's actually better to strip out the inline edit triggers if they exist, and then rebuild them.
        // But renderHistory does that dynamically! 
        // Wait, renderHistory DOES NOT update record.details. It just updates the item.innerHTML.
        // Wait, if record.details contains raw text (from old), renderHistory converts it, but does NOT save it.
        // That's fine! As long as record.inputs is PERFECT!

        if (changed) {
            modifiedCount++;
        }
        
        if (!record.inputs.base && !record.inputs.initial) {
            parseFailures++;
            console.log("Could not parse inputs for:", record.type, record.details);
        }
    });
});

console.log(`Modified ${modifiedCount} records. Parse failures: ${parseFailures}`);
fs.writeFileSync(DATA_FILE + '.backup', dataStr);
fs.writeFileSync(DATA_FILE, JSON.stringify(state));
console.log("Data fixed.");
