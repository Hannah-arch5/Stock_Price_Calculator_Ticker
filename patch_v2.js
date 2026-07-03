const fs = require('fs');

let content = fs.readFileSync('script.js', 'utf8');

// 1. Replace formattedDetails logic
const oldFormatted = `            let formattedDetails = record.details;
            if (formattedDetails.includes(' | ')) {
                const parts = formattedDetails.split(' | ');
                formattedDetails = \`<span>\${parts[0]}</span><span>\${parts[1]}</span>\`;
            }`;

const newFormatted = `            let formattedDetails = record.details;
            
            if (!record.inputs) {
                if (record.type === 'Target Price' || record.type === 'Target Projection' || record.details.includes('Up ') || record.details.includes('Down ')) {
                    const baseMatch = record.details.match(/Base:\\s*.\\s*([\\d.]+)/);
                    const percMatch = record.details.match(/(Up|Down)\\s+([\\d.]+)%/);
                    if (baseMatch && percMatch) {
                        record.inputs = {
                            base: parseFloat(baseMatch[1]),
                            perc: parseFloat(percMatch[2]),
                            isUp: percMatch[1] === 'Up'
                        };
                    }
                } else {
                    const initialMatch = record.details.match(/Base:\\s*.\\s*([\\d.]+)/);
                    const finalMatch = record.details.match(/Target:\\s*.\\s*([\\d.]+)/);
                    if (initialMatch && finalMatch) {
                        record.inputs = {
                            initial: parseFloat(initialMatch[1]),
                            final: parseFloat(finalMatch[2])
                        };
                    }
                }
            }

            if (record.inputs && record.inputs.base !== undefined) {
                const upDownText = record.inputs.isUp ? 'Up' : 'Down';
                formattedDetails = \`<span class="edit-trigger-val" data-field="base">Base: \${recCurrency}<span class="edit-container-val">\${record.inputs.base}</span></span><span><span class="editable-toggle" data-field="isUp">\${upDownText}</span> <span class="edit-trigger-val" data-field="perc"><span class="edit-container-val">\${record.inputs.perc}</span>%</span></span>\`;
            } else if (record.inputs && record.inputs.initial !== undefined) {
                formattedDetails = \`<span class="edit-trigger-val" data-field="initial">Base: \${recCurrency}<span class="edit-container-val">\${record.inputs.initial}</span></span><span class="edit-trigger-val" data-field="final">Target: \${recCurrency}<span class="edit-container-val">\${record.inputs.final}</span></span>\`;
            } else {
                if (formattedDetails.includes(' | ')) {
                    const parts = formattedDetails.split(' | ');
                    formattedDetails = \`<span>\${parts[0]}</span><span>\${parts[1]}</span>\`;
                }
            }`;
content = content.replace(oldFormatted, newFormatted);

// 2. Add click listener logic
const oldClick = `            item.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn') || e.target.closest('.row-delete')) return;
                
                if (e.detail === 1) {
                    item.clickTimer = setTimeout(() => {
                        populateForm(record);
                    }, 200);
                }
            });`;

const newClick = `            item.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn') || e.target.closest('.row-delete')) return;
                
                const editableToggle = e.target.closest('.editable-toggle');
                if (editableToggle && record.inputs) {
                    record.inputs.isUp = !record.inputs.isUp;
                    record.isUp = record.inputs.isUp;
                    recalculateRecord(record);
                    saveState();
                    renderHistory();
                    return;
                }

                const editTrigger = e.target.closest('.edit-trigger-val');
                if (editTrigger && record.inputs) {
                    const editContainer = editTrigger.querySelector('.edit-container-val');
                    if (!editContainer || editContainer.querySelector('.edit-val-input')) return;
                    
                    const field = editTrigger.dataset.field;
                    const originalVal = record.inputs[field];
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.step = 'any';
                    input.className = 'edit-val-input mono';
                    input.value = originalVal;
                    input.style.fontSize = 'inherit';
                    input.style.fontWeight = 'inherit';
                    input.style.color = 'inherit';
                    input.style.background = 'transparent';
                    input.style.border = 'none';
                    input.style.outline = 'none';
                    input.style.width = Math.max(30, originalVal.toString().length * 8 + 10) + 'px';
                    input.style.padding = '0';
                    input.style.margin = '0';
                    
                    editContainer.innerHTML = '';
                    editContainer.appendChild(input);
                    input.focus();
                    input.select();
                    
                    let saved = false;
                    const saveNewVal = () => {
                        if (saved) return;
                        saved = true;
                        const newVal = parseFloat(input.value);
                        if (!isNaN(newVal) && newVal !== originalVal) {
                            record.inputs[field] = newVal;
                            recalculateRecord(record);
                            saveState();
                        }
                        renderHistory();
                    };
                    
                    input.addEventListener('blur', saveNewVal);
                    input.addEventListener('keydown', (ke) => {
                        if (ke.key === 'Enter') {
                            input.blur();
                        }
                        if (ke.key === 'Escape') {
                            input.value = originalVal;
                            input.blur();
                        }
                    });
                    return;
                }

                if (e.detail === 1) {
                    item.clickTimer = setTimeout(() => {
                        populateForm(record);
                    }, 200);
                }
            });`;
content = content.replace(oldClick, newClick);

// 3. Add recalculateRecord at the end
const recalc = `
function recalculateRecord(record) {
    if (record.inputs && record.inputs.base !== undefined) {
        const base = record.inputs.base;
        const perc = record.inputs.perc;
        const multiplier = record.inputs.isUp ? (1 + perc / 100) : (1 - perc / 100);
        const result = base * multiplier;
        record.result = \`\${record.currency || ''}\${formatCurrency(result)}\`;
        const recCurrency = record.currency || (record.result && record.result.includes('$') ? '$' : '¥');
        const upDownText = record.inputs.isUp ? 'Up' : 'Down';
        record.details = \`<span>Base: \${recCurrency}\${base}</span><span>\${upDownText} \${perc}%</span>\`;
    } else if (record.inputs && record.inputs.initial !== undefined) {
        const initial = record.inputs.initial;
        const final = record.inputs.final;
        const pctDecimal = (final - initial) / initial;
        record.result = \`\${Math.abs(pctDecimal * 100).toFixed(2)}%\`;
        record.isUp = pctDecimal > 0;
        const recCurrency = record.currency || (record.result && record.result.includes('$') ? '$' : '¥');
        record.details = \`<span>Base: \${recCurrency}\${initial}</span><span>Target: \${recCurrency}\${final}</span>\`;
    }
}
`;
if (!content.includes('function recalculateRecord')) {
    content += recalc;
}

fs.writeFileSync('script.js', content);
console.log('Patch applied successfully.');
