const fs = require('fs');
const os = require('os');
const path = require('path');

const FIXED_USER_DATA = path.join(os.homedir(), 'Library', 'Application Support', 'ticker');
const DATA_FILE = path.join(FIXED_USER_DATA, 'app-data-v1.json');

const dataStr = fs.readFileSync(DATA_FILE, 'utf8');
let state = JSON.parse(dataStr);

state.historyRecords.forEach(group => {
    group.records.forEach(record => {
        // If inputs.final is somehow equal to initial, or details contains null
        if (record.details && record.details.includes('null')) {
            console.log(`Fixing corrupted record: ${record.type}`);
            
            if (record.percentage) {
                const perc = parseFloat(record.percentage) / 100;
                const initial = record.inputs.initial;
                let final;
                if (record.isUp) {
                    final = initial * (1 + perc);
                } else {
                    final = initial * (1 - perc);
                }
                
                // round to 2 decimals
                final = Math.round(final * 100) / 100;
                
                record.inputs.final = final;
                
                // Rebuild details and result
                const pctDecimal = (final - initial) / initial;
                record.result = `${Math.abs(pctDecimal * 100).toFixed(2)}%`;
                const recCurrency = record.currency || '¥';
                record.details = `<span class="edit-trigger-val" data-field="initial">Base: ${recCurrency}<span class="edit-container-val">${initial}</span></span><span class="edit-trigger-val" data-field="final">Target: ${recCurrency}<span class="edit-container-val">${final}</span></span>`;
                
                console.log(`Restored final to: ${final}`);
            }
        }
    });
});

fs.writeFileSync(DATA_FILE, JSON.stringify(state));
console.log("Corrupted results fixed.");
