const fs = require('fs');
// read script.js
let code = fs.readFileSync('script.js', 'utf8');

const debugCode = `
            item.addEventListener('click', (e) => {
                try {
                    const fs = require('fs');
                    const os = require('os');
                    const logPath = os.homedir() + '/Desktop/ticker_debug.txt';
                    let log = "--- CLICK EVENT ---\n";
                    log += "Target class: " + e.target.className + "\n";
                    log += "Target HTML: " + e.target.outerHTML + "\n";
                    log += "Has editable-toggle: " + !!e.target.closest('.editable-toggle') + "\n";
                    log += "Has edit-trigger-val: " + !!e.target.closest('.edit-trigger-val') + "\n";
                    log += "Record inputs: " + JSON.stringify(record.inputs) + "\n";
                    log += "Item HTML: " + item.innerHTML + "\n";
                    fs.appendFileSync(logPath, log + "\n");
                } catch (err) {}
`;

code = code.replace("item.addEventListener('click', (e) => {", debugCode);
fs.writeFileSync('script.js', code);
