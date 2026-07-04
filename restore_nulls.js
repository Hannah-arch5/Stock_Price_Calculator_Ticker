const fs = require('fs');
const os = require('os');
const path = require('path');

const FIXED_USER_DATA = path.join(os.homedir(), 'Library', 'Application Support', 'ticker');
const DATA_FILE = path.join(FIXED_USER_DATA, 'app-data-v1.json');
const BACKUP_FILE = DATA_FILE + '.backup';

if (!fs.existsSync(BACKUP_FILE)) {
    console.log("No backup found!");
    process.exit(1);
}

const backupStr = fs.readFileSync(BACKUP_FILE, 'utf8');
const backupState = JSON.parse(backupStr);

const currentStr = fs.readFileSync(DATA_FILE, 'utf8');
let currentState = JSON.parse(currentStr);

let restoredCount = 0;

currentState.historyRecords.forEach((group, gIdx) => {
    group.records.forEach((record, rIdx) => {
        if (record.inputs && record.inputs.final === null) {
            // Find the original record in the backup
            const origGroup = backupState.historyRecords.find(g => g.symbol === group.symbol);
            if (origGroup) {
                // We assume same index or matching type/details
                // Since array length shouldn't have changed, we can try index matching
                const origRecord = origGroup.records[rIdx];
                if (origRecord && origRecord.type === record.type) {
                    console.log(`Found corrupted record: ${record.type}. Restoring from backup...`);
                    
                    // The original details string (before any corruption)
                    const origDetails = origRecord.details;
                    
                    // Parse properly using capture group [1]
                    const initialMatch = origDetails.match(/Base:\s*.\s*([\d.]+)/);
                    const finalMatch = origDetails.match(/Target:\s*.\s*([\d.]+)/);
                    
                    if (initialMatch && finalMatch) {
                        record.inputs.initial = parseFloat(initialMatch[1]);
                        record.inputs.final = parseFloat(finalMatch[1]); // FIX THE TYPO IN THE FIX SCRIPT!
                        changed = true;
                        
                        record.details = origDetails;
                        // Also restore the result since it was corrupted to 100%
                        record.result = origRecord.result;
                        record.isUp = origRecord.isUp;
                        
                        restoredCount++;
                    }
                }
            }
        }
    });
});

console.log(`Restored ${restoredCount} null records.`);
fs.writeFileSync(DATA_FILE, JSON.stringify(currentState));
