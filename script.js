// Global state
let currentCurrency = '¥';
let historyRecords = JSON.parse(localStorage.getItem('calcHistory')) || [];
let historyVersion = localStorage.getItem('calcHistoryVersion');

if (!historyVersion) {
    historyRecords.reverse();
    localStorage.setItem('calcHistoryVersion', '2');
}

// Migrate flat array to grouped array
if (historyRecords.length > 0 && !historyRecords[0].records) {
    const grouped = {};
    historyRecords.forEach(record => {
        const sym = record.symbol || 'Uncategorized';
        if (!grouped[sym]) grouped[sym] = [];
        grouped[sym].push(record);
    });
    historyRecords = Object.keys(grouped).map(sym => ({
        symbol: sym,
        records: grouped[sym]
    }));
    localStorage.setItem('calcHistory', JSON.stringify(historyRecords));
}

// DOM Elements
const historyListEl = document.getElementById('history-list');
const currencyRadios = document.getElementsByName('currency');
const currencySymbols = document.querySelectorAll('.currency-symbol');

// Persistence Logic
function saveState() {
    localStorage.setItem('calcHistory', JSON.stringify(historyRecords));
    localStorage.setItem('calcHistoryVersion', '2');
    localStorage.setItem('calcInputs', JSON.stringify({
        currency: currentCurrency,
        stock1: stockSymbol1Input.value,
        basePrice: basePriceInput.value,
        moveDown: document.getElementById('move-down').checked,
        percentChange: percentageChangeInput.value,
        stock2: stockSymbol2Input.value,
        initialPrice: initialPriceInput.value,
        finalPrice: finalPriceInput.value
    }));
}

function loadState() {
    const saved = JSON.parse(localStorage.getItem('calcInputs'));
    if (saved) {
        if (saved.currency === '$') {
            document.getElementById('currency-usd').checked = true;
        } else {
            document.getElementById('currency-cny').checked = true;
        }
        
        stockSymbol1Input.value = saved.stock1 || '';
        basePriceInput.value = saved.basePrice || '';
        if (saved.moveDown) {
            document.getElementById('move-down').checked = true;
        } else {
            document.getElementById('move-up').checked = true;
        }
        percentageChangeInput.value = saved.percentChange || '';
        
        stockSymbol2Input.value = saved.stock2 || '';
        initialPriceInput.value = saved.initialPrice || '';
        finalPriceInput.value = saved.finalPrice || '';
    }
}

// Currency Switcher Logic
function updateCurrency() {
    let selected = 'CNY';
    for (const radio of currencyRadios) {
        if (radio.checked) {
            selected = radio.value;
            break;
        }
    }

    currentCurrency = selected === 'CNY' ? '¥' : '$';
    
    if (currentCurrency === '¥') {
        document.documentElement.style.setProperty('--up-color', '#ff453a');
        document.documentElement.style.setProperty('--down-color', '#32d74b');
    } else {
        document.documentElement.style.setProperty('--up-color', '#32d74b');
        document.documentElement.style.setProperty('--down-color', '#ff453a');
    }

    currencySymbols.forEach(symbol => {
        symbol.textContent = currentCurrency;
    });

    calculateTargetPrice();
    calculatePercentage();
    saveState();
}

currencyRadios.forEach(radio => radio.addEventListener('change', updateCurrency));

function formatCurrency(value) {
    return value.toFixed(4).replace(/\.?0+$/, ''); 
}

// Removed tab switching logic as requested

// Mode 1: Target Price Logic
const stockSymbol1Input = document.getElementById('stock-symbol-1');
const basePriceInput = document.getElementById('base-price');
const movementRadios = document.getElementsByName('movement');
const percentageChangeInput = document.getElementById('percentage-change');
const targetResultEl = document.getElementById('target-result');
const saveTargetBtn = document.getElementById('save-target-btn');
const clearTargetBtn = document.getElementById('clear-target-btn');
const reuseTargetBtn = document.getElementById('reuse-target-btn');
const reuseBaseBtn = document.getElementById('reuse-base-btn');

reuseBaseBtn.addEventListener('click', () => {
    const currentBase = parseFloat(basePriceInput.value);
    const percentage = parseFloat(percentageChangeInput.value);
    
    if (!isNaN(currentBase) && currentBase > 0) {
        if (!isNaN(percentage)) {
            let isUp = true;
            for (const radio of movementRadios) {
                if (radio.checked && radio.value === 'down') {
                    isUp = false;
                    break;
                }
            }

            let newBase = currentBase;
            if (isUp) {
                newBase = currentBase / (1 + percentage / 100);
            } else {
                if (percentage !== 100) {
                    newBase = currentBase / (1 - percentage / 100);
                }
            }
            basePriceInput.value = formatCurrency(newBase);
        }
        handleInput();
    }
});

reuseTargetBtn.addEventListener('click', () => {
    if (currentTargetPrice > 0) {
        basePriceInput.value = formatCurrency(currentTargetPrice);
        handleInput();
    }
});

let currentTargetPrice = 0;
let currentTargetIsUp = true;

function calculateTargetPrice() {
    const basePrice = parseFloat(basePriceInput.value);
    const percentage = parseFloat(percentageChangeInput.value);
    
    let isUp = true;
    for (const radio of movementRadios) {
        if (radio.checked && radio.value === 'down') {
            isUp = false;
            break;
        }
    }

    currentTargetIsUp = isUp;

    if (isNaN(basePrice) || isNaN(percentage)) {
        targetResultEl.innerHTML = `<span class="currency-symbol">${currentCurrency}</span>0.00`;
        targetResultEl.className = 'result-value mono';
        currentTargetPrice = 0;
        return;
    }

    const multiplier = isUp ? (1 + percentage / 100) : (1 - percentage / 100);
    currentTargetPrice = basePrice * multiplier;

    targetResultEl.innerHTML = `<span class="currency-symbol">${currentCurrency}</span>${formatCurrency(currentTargetPrice)}`;
    
    if (isUp) {
        targetResultEl.className = 'result-value mono text-up';
    } else {
        targetResultEl.className = 'result-value mono text-down';
    }
}

// Mode 2: Percentage Logic
const stockSymbol2Input = document.getElementById('stock-symbol-2');
const initialPriceInput = document.getElementById('initial-price');
const finalPriceInput = document.getElementById('final-price');
const percentageResultEl = document.getElementById('percentage-result');
const percentageMovementTypeEl = document.getElementById('percentage-movement-type');
const savePercentageBtn = document.getElementById('save-percentage-btn');
const clearPercentageBtn = document.getElementById('clear-percentage-btn');
const reuseInitialBtn = document.getElementById('reuse-initial-btn');
const reuseFinalBtn = document.getElementById('reuse-final-btn');
const reuseCalcPercBtn = document.getElementById('reuse-calc-perc-btn');

reuseCalcPercBtn.addEventListener('click', () => {
    if (!isNaN(currentPercentage)) {
        percentageChangeInput.value = Math.abs(currentPercentage).toFixed(2);
        if (currentPercentage >= 0) {
            document.getElementById('move-up').checked = true;
        } else {
            document.getElementById('move-down').checked = true;
        }
        handleInput();
    }
});

reuseInitialBtn.addEventListener('click', () => {
    const initialVal = parseFloat(initialPriceInput.value);
    const finalVal = parseFloat(finalPriceInput.value);
    if (!isNaN(initialVal) && initialVal > 0 && !isNaN(finalVal)) {
        const pctDecimal = (finalVal - initialVal) / initialVal;
        if (pctDecimal === -1) return;
        
        const newFinal = initialVal;
        const newInitial = newFinal / (1 + pctDecimal);
        
        initialPriceInput.value = formatCurrency(newInitial);
        finalPriceInput.value = formatCurrency(newFinal);
        handleInput();
    }
});

reuseFinalBtn.addEventListener('click', () => {
    const initialVal = parseFloat(initialPriceInput.value);
    const finalVal = parseFloat(finalPriceInput.value);
    if (!isNaN(initialVal) && initialVal > 0 && !isNaN(finalVal) && finalVal > 0) {
        const pctDecimal = (finalVal - initialVal) / initialVal;
        
        const newInitial = finalVal;
        const newFinal = newInitial * (1 + pctDecimal);
        
        initialPriceInput.value = formatCurrency(newInitial);
        finalPriceInput.value = formatCurrency(newFinal);
        handleInput();
    }
});

let currentPercentage = 0;

function calculatePercentage() {
    const initialPrice = parseFloat(initialPriceInput.value);
    const finalPrice = parseFloat(finalPriceInput.value);

    if (isNaN(initialPrice) || isNaN(finalPrice) || initialPrice === 0) {
        percentageResultEl.textContent = '0.00%';
        percentageResultEl.className = 'result-value mono';
        percentageMovementTypeEl.textContent = '-';
        percentageMovementTypeEl.className = 'result-movement mono';
        currentPercentage = 0;
        return;
    }

    const difference = finalPrice - initialPrice;
    currentPercentage = (difference / initialPrice) * 100;
    
    const formattedPercentage = Math.abs(currentPercentage).toFixed(2) + '%';
    percentageResultEl.textContent = formattedPercentage;

    if (currentPercentage > 0) {
        percentageResultEl.className = 'result-value mono text-up';
        percentageMovementTypeEl.textContent = 'Up Rise';
        percentageMovementTypeEl.className = 'result-movement mono text-up';
    } else if (currentPercentage < 0) {
        percentageResultEl.className = 'result-value mono text-down';
        percentageMovementTypeEl.textContent = 'Down Fall';
        percentageMovementTypeEl.className = 'result-movement mono text-down';
    } else {
        percentageResultEl.className = 'result-value mono';
        percentageMovementTypeEl.textContent = 'No Change';
        percentageMovementTypeEl.className = 'result-movement mono';
    }
}

// Input Listeners
function handleInput() {
    calculateTargetPrice();
    calculatePercentage();
    saveState();
}

[
    stockSymbol1Input, basePriceInput, percentageChangeInput,
    stockSymbol2Input, initialPriceInput, finalPriceInput
].forEach(input => input.addEventListener('input', handleInput));

movementRadios.forEach(radio => radio.addEventListener('change', handleInput));

// Clear Buttons
clearTargetBtn.addEventListener('click', () => {
    stockSymbol1Input.value = '';
    basePriceInput.value = '';
    percentageChangeInput.value = '';
    document.getElementById('move-up').checked = true;
    handleInput();
});

clearPercentageBtn.addEventListener('click', () => {
    stockSymbol2Input.value = '';
    initialPriceInput.value = '';
    finalPriceInput.value = '';
    handleInput();
});

// History Logic
function renderHistory() {
    const tagsEl = document.getElementById('quick-tags');
    if (tagsEl) tagsEl.innerHTML = '';

    if (historyRecords.length === 0) {
        historyListEl.innerHTML = '<p class="empty-history">No history yet.</p>';
        return;
    }

    historyListEl.innerHTML = '';
    
    historyRecords.forEach((group, groupIndex) => {
        if (tagsEl) {
            const tag = document.createElement('button');
            tag.className = 'quick-tag mono';
            tag.textContent = group.symbol;
            
            // Re-apply the priority dot color to the tag border/text if we want, or just leave it gray
            if (group.records[0] && group.records[0].urgency) {
                const colors = {
                    'green': '#32d74b',
                    'orange': '#ff9f0a',
                    'red': '#ff453a'
                };
                tag.style.color = colors[group.records[0].urgency];
                tag.style.borderColor = colors[group.records[0].urgency];
            }
            
            tag.draggable = true;
            tag.dataset.symbol = group.symbol;
            
            tag.addEventListener('dragstart', (e) => {
                if (e.target !== tag) return;
                tag.classList.add('dragging-tag');
                e.dataTransfer.effectAllowed = 'move';
            });

            tag.addEventListener('dragend', (e) => {
                if (e.target !== tag) return;
                tag.classList.remove('dragging-tag');
                updateArrayFromDOMTags();
                saveState();
                renderHistory();
            });

            tag.onclick = () => {
                const targetGroup = historyListEl.querySelector(`[data-symbol="${group.symbol}"]`);
                if (targetGroup) {
                    targetGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };
            tagsEl.appendChild(tag);
        }

        const memoArea = document.createElement('div');
        memoArea.className = 'group-memo-area';
        
        memoArea.innerHTML = `
            <div class="memo-timeframes">
                <label><span class="tf-label">W:</span> <input type="text" class="tf-input mono" data-tf="tf_w" value="${group.tf_w || ''}"></label>
                <label><span class="tf-label">D:</span> <input type="text" class="tf-input mono" data-tf="tf_d" value="${group.tf_d || ''}"></label>
                <label><span class="tf-label">30:</span> <input type="text" class="tf-input mono" data-tf="tf_30" value="${group.tf_30 || ''}"></label>
            </div>
            <textarea class="group-note mono" placeholder="Add notes...">${group.note || ''}</textarea>
        `;
        
        const tfInputs = memoArea.querySelectorAll('.tf-input');
        tfInputs.forEach(input => {
            input.addEventListener('blur', () => {
                const tfKey = input.getAttribute('data-tf');
                const newVal = input.value.trim();
                if (newVal !== (group[tfKey] || '')) {
                    group[tfKey] = newVal;
                    saveState();
                }
            });
        });
        
        const noteEl = memoArea.querySelector('textarea');
        noteEl.spellcheck = false;
        
        noteEl.addEventListener('blur', () => {
            const newNote = noteEl.value.trim();
            if (newNote !== (group.note || '')) {
                group.note = newNote;
                saveState();
            }
        });

        const groupEl = document.createElement('div');
        groupEl.className = 'history-group';
        groupEl.dataset.symbol = group.symbol;
        groupEl.draggable = true;
        
        groupEl.addEventListener('dragstart', (e) => {
            if (e.target !== groupEl) return;
            groupEl.classList.add('dragging-group');
            e.dataTransfer.effectAllowed = 'move';
        });

        groupEl.addEventListener('dragend', (e) => {
            if (e.target !== groupEl) return;
            groupEl.classList.remove('dragging-group');
            updateArrayFromDOM();
            saveState();
            renderHistory();
        });
        
        const headerEl = document.createElement('div');
        headerEl.className = 'group-header';
        
        const titleEl = document.createElement('div');
        titleEl.innerHTML = group.symbol !== 'Uncategorized' 
            ? `<a href="https://www.tradingview.com/chart/?symbol=${encodeURIComponent(group.symbol)}" class="stock-link" target="_blank">${group.symbol}</a>`
            : group.symbol;
            
        const deleteGroupBtn = document.createElement('button');
        deleteGroupBtn.className = 'delete-btn';
        deleteGroupBtn.title = 'Delete Group';
        deleteGroupBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        deleteGroupBtn.onclick = () => { deleteHistoryGroup(groupIndex); };
        
        const urgencyContainer = document.createElement('div');
        urgencyContainer.className = 'urgency-dots';
        
        const colors = ['green', 'orange', 'red'];
        colors.forEach((color) => {
            const dot = document.createElement('button');
            dot.className = `urgency-dot ${color}`;
            // If the first record has urgency, they all do, or group.records[0].urgency
            if (group.records[0].urgency === color) {
                dot.classList.add('selected');
            }
            dot.onclick = (e) => {
                e.stopPropagation();
                const isSelected = dot.classList.contains('selected');
                group.records.forEach(r => r.urgency = isSelected ? null : color);
                saveState();
                renderHistory();
            };
            urgencyContainer.appendChild(dot);
        });

        const headerActions = document.createElement('div');
        headerActions.className = 'header-actions';
        headerActions.appendChild(urgencyContainer);
        headerActions.appendChild(deleteGroupBtn);
        
        headerEl.appendChild(titleEl);
        headerEl.appendChild(headerActions);
        
        headerEl.addEventListener('dblclick', (e) => {
            if (e.target.closest('.delete-btn')) return;
            if (e.target.closest('.urgency-dot')) return;
            if (headerEl.querySelector('.edit-symbol-input')) return;
            
            const originalHTML = titleEl.innerHTML;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'edit-symbol-input mono';
            input.value = group.symbol !== 'Uncategorized' ? group.symbol : '';
            input.style.fontSize = 'inherit';
            input.style.fontWeight = 'inherit';
            input.style.color = 'inherit';
            input.style.background = 'transparent';
            input.style.border = 'none';
            input.style.outline = 'none';
            input.style.width = '120px';
            input.style.padding = '0';
            input.style.margin = '0';
            
            titleEl.innerHTML = '';
            titleEl.appendChild(input);
            input.focus();
            input.select();
            
            const saveNewSymbol = () => {
                const newSymbol = input.value.trim().toUpperCase();
                if (newSymbol && newSymbol !== group.symbol && newSymbol !== 'UNCATEGORIZED') {
                    group.symbol = newSymbol;
                    group.records.forEach(r => r.symbol = newSymbol);
                    
                    const existingGroupIndex = historyRecords.findIndex(g => g !== group && g.symbol === newSymbol);
                    if (existingGroupIndex !== -1) {
                        historyRecords[existingGroupIndex].records.unshift(...group.records);
                        historyRecords = historyRecords.filter(g => g !== group);
                    }
                    saveState();
                    renderHistory();
                } else {
                    titleEl.innerHTML = originalHTML;
                }
            };
            
            input.addEventListener('blur', saveNewSymbol);
            input.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') input.blur();
                else if (ev.key === 'Escape') titleEl.innerHTML = originalHTML;
            });
        });
            
        const listEl = document.createElement('div');
        listEl.className = 'group-list';
        
        group.records.forEach((record, itemIndex) => {
            const item = document.createElement('div');
            item.className = 'list-row history-item';
            if (record.highlighted) {
                item.classList.add('highlighted');
            }
            item.draggable = true;
            item.dataset.groupIndex = groupIndex;
            item.dataset.itemIndex = itemIndex;
            
            const recCurrency = record.currency || (record.result && record.result.includes('$') ? '$' : '¥');
            const upColor = recCurrency === '¥' ? '#ff453a' : '#32d74b';
            const downColor = recCurrency === '¥' ? '#32d74b' : '#ff453a';
            const resultColor = record.isUp ? upColor : downColor;

            let formattedDetails = record.details;
            if (formattedDetails.includes(' | ')) {
                const parts = formattedDetails.split(' | ');
                formattedDetails = `<span>${parts[0]}</span><span>${parts[1]}</span>`;
            }

            item.innerHTML = `
                <div class="col-details">
                    <span class="type">${record.type}</span>
                    <span class="info">${formattedDetails}</span>
                </div>
                <div class="col-result-group">
                    <div class="col-result mono" style="color: ${resultColor};">
                        ${record.result}
                    </div>
                    <input type="number" class="shares-inline-input mono" placeholder="Shares" value="${record.shares || ''}">
                </div>
                <div class="row-delete">
                    <button class="delete-btn item-delete-btn" title="Delete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
            
            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                updateArrayFromDOM();
                saveState();
                renderHistory();
            });

            item.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn') || e.target.closest('.row-delete')) return;
                
                if (e.detail === 1) {
                    item.clickTimer = setTimeout(() => {
                        populateForm(record);
                    }, 200);
                }
            });

            // Prevent drag from input
            const sharesInput = item.querySelector('.shares-inline-input');
            sharesInput.addEventListener('mousedown', e => e.stopPropagation());
            sharesInput.addEventListener('click', e => e.stopPropagation());
            
            // Save shares value on change/blur
            sharesInput.addEventListener('change', () => {
                record.shares = sharesInput.value;
                saveState();
            });

            item.addEventListener('dblclick', (e) => {
                clearTimeout(item.clickTimer);
                if (e.target.closest('.row-delete')) return;
                record.highlighted = !record.highlighted;
                saveState();
                renderHistory();
            });

            item.querySelector('.item-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHistory(groupIndex, itemIndex);
            });
            
            listEl.appendChild(item);
        });
        
        listEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            if (!draggingItem || draggingItem.closest('.group-list') !== listEl) return;
            
            const afterElement = getDragAfterElement(listEl, e.clientY);
            if (afterElement == null) {
                listEl.appendChild(draggingItem);
            } else {
                listEl.insertBefore(draggingItem, afterElement);
            }
        });
        
        groupEl.appendChild(headerEl);
        groupEl.appendChild(memoArea);
        groupEl.appendChild(listEl);
        historyListEl.appendChild(groupEl);
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.history-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

historyListEl.addEventListener('dragover', (e) => {
    const draggingGroup = document.querySelector('.dragging-group');
    if (!draggingGroup) return;
    
    e.preventDefault();
    const afterElement = getDragAfterGroup(historyListEl, e.clientY);
    if (afterElement == null) {
        historyListEl.appendChild(draggingGroup);
    } else {
        historyListEl.insertBefore(draggingGroup, afterElement);
    }
});

function getDragAfterGroup(container, y) {
    const draggableElements = [...container.querySelectorAll('.history-group:not(.dragging-group)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

const quickTagsContainer = document.getElementById('quick-tags');
if (quickTagsContainer) {
    quickTagsContainer.addEventListener('dragover', (e) => {
        const draggingTag = document.querySelector('.dragging-tag');
        if (!draggingTag) return;
        
        e.preventDefault();
        const afterElement = getDragAfterTag(quickTagsContainer, e.clientX, e.clientY);
        if (afterElement == null) {
            quickTagsContainer.appendChild(draggingTag);
        } else {
            quickTagsContainer.insertBefore(draggingTag, afterElement);
        }
    });
}

function getDragAfterTag(container, x, y) {
    const draggableElements = [...container.querySelectorAll('.quick-tag:not(.dragging-tag)')];
    
    for (const child of draggableElements) {
        const box = child.getBoundingClientRect();
        if (y >= box.top && y <= box.bottom) {
            if (x < box.left + box.width / 2) {
                return child;
            }
        } else if (y < box.top) {
            return child;
        }
    }
    return null;
}

function updateArrayFromDOMTags() {
    const tags = [...document.querySelectorAll('.quick-tag')];
    const newHistory = [];
    
    tags.forEach(tagEl => {
        const symbol = tagEl.dataset.symbol;
        const group = historyRecords.find(g => g.symbol === symbol);
        if (group) {
            newHistory.push(group);
        }
    });
    
    historyRecords.forEach(group => {
        if (!newHistory.find(g => g.symbol === group.symbol)) {
            newHistory.push(group);
        }
    });
    
    historyRecords = newHistory;
}

function updateArrayFromDOM() {
    const groups = [...historyListEl.querySelectorAll('.history-group')];
    const newHistory = [];
    groups.forEach(groupEl => {
        const symbol = groupEl.dataset.symbol;
        const originalGroup = historyRecords.find(g => g.symbol === symbol);
        const memoArea = groupEl.querySelector('.group-memo-area');
        const note = memoArea ? memoArea.querySelector('textarea').value : (originalGroup ? originalGroup.note : '');
        const tf_w = memoArea ? memoArea.querySelector('[data-tf="tf_w"]').value : (originalGroup ? originalGroup.tf_w : '');
        const tf_d = memoArea ? memoArea.querySelector('[data-tf="tf_d"]').value : (originalGroup ? originalGroup.tf_d : '');
        const tf_30 = memoArea ? memoArea.querySelector('[data-tf="tf_30"]').value : (originalGroup ? originalGroup.tf_30 : '');

        const items = [...groupEl.querySelectorAll('.history-item')];
        const records = items.map(item => {
            const originalGroupIndex = parseInt(item.dataset.groupIndex, 10);
            const originalItemIndex = parseInt(item.dataset.itemIndex, 10);
            const record = historyRecords[originalGroupIndex].records[originalItemIndex];
            
            const sharesInput = item.querySelector('.shares-inline-input');
            if (sharesInput) {
                record.shares = sharesInput.value;
            }
            
            return record;
        });
        if (records.length > 0) {
            newHistory.push({ symbol, records, note, tf_w, tf_d, tf_30 });
        }
    });
    
    historyRecords = newHistory;
}

window.deleteHistory = function(groupIndex, itemIndex) {
    historyRecords[groupIndex].records.splice(itemIndex, 1);
    if (historyRecords[groupIndex].records.length === 0) {
        historyRecords.splice(groupIndex, 1);
    }
    saveState();
    renderHistory();
};

window.deleteHistoryGroup = function(groupIndex) {
    historyRecords.splice(groupIndex, 1);
    saveState();
    renderHistory();
};

const clearAllHistoryBtn = document.getElementById('clear-all-history-btn');
if (clearAllHistoryBtn) {
    clearAllHistoryBtn.addEventListener('click', () => {
        historyRecords = [];
        saveState();
        renderHistory();
    });
}

function addRecordToHistory(record) {
    const sym = record.symbol || 'Uncategorized';
    let group = historyRecords.find(g => g.symbol === sym);
    if (!group) {
        historyRecords.unshift({ symbol: sym, records: [record] });
    } else {
        if (group.records.length > 0 && group.records[0].urgency) {
            record.urgency = group.records[0].urgency;
        }
        group.records.unshift(record);
        historyRecords = historyRecords.filter(g => g !== group);
        historyRecords.unshift(group);
    }
    saveState();
    renderHistory();
}

saveTargetBtn.addEventListener('click', () => {
    const base = parseFloat(basePriceInput.value);
    const perc = parseFloat(percentageChangeInput.value);
    if (isNaN(base) || isNaN(perc)) return;

    addRecordToHistory({
        type: 'Target Projection',
        symbol: stockSymbol1Input.value.trim().toUpperCase(),
        details: `<span>Base: ${currentCurrency}${base}</span><span>${currentTargetIsUp ? 'Up' : 'Down'} ${perc}%</span>`,
        result: `${currentCurrency}${formatCurrency(currentTargetPrice)}`,
        isUp: currentTargetIsUp,
        inputs: { base, perc, isUp: currentTargetIsUp },
        currency: currentCurrency
    });
});

savePercentageBtn.addEventListener('click', () => {
    const initial = parseFloat(initialPriceInput.value);
    const final = parseFloat(finalPriceInput.value);
    if (isNaN(initial) || isNaN(final) || initial === 0) return;

    addRecordToHistory({
        type: 'Percentage Delta',
        symbol: stockSymbol2Input.value.trim().toUpperCase(),
        details: `<span>Base: ${currentCurrency}${initial}</span><span>Target: ${currentCurrency}${final}</span>`,
        result: `${Math.abs(currentPercentage).toFixed(2)}%`,
        isUp: currentPercentage > 0,
        inputs: { initial, final },
        currency: currentCurrency
    });
});

function populateForm(record) {
    if (record.type === 'Target Projection' || record.type === 'Target Price') {
        stockSymbol1Input.value = record.symbol || '';
        if (record.inputs) {
            basePriceInput.value = record.inputs.base;
            percentageChangeInput.value = record.inputs.perc;
            document.getElementById(record.inputs.isUp ? 'move-up' : 'move-down').checked = true;
        } else {
            const baseMatch = record.details.match(/Base:\s*.\s*([\d.]+)/);
            const percMatch = record.details.match(/(Up|Down)\s+([\d.]+)%/);
            if (baseMatch) basePriceInput.value = baseMatch[1];
            if (percMatch) {
                document.getElementById(percMatch[1] === 'Up' ? 'move-up' : 'move-down').checked = true;
                percentageChangeInput.value = percMatch[2];
            }
        }
        handleInput();
    } else if (record.type === 'Percentage Delta' || record.type === 'Percentage Change') {
        stockSymbol2Input.value = record.symbol || '';
        if (record.inputs) {
            initialPriceInput.value = record.inputs.initial;
            finalPriceInput.value = record.inputs.final;
        } else {
            const initialMatch = record.details.match(/Base:\s*.\s*([\d.]+)/);
            const finalMatch = record.details.match(/Target:\s*.\s*([\d.]+)/);
            if (initialMatch) initialPriceInput.value = initialMatch[1];
            if (finalMatch) finalPriceInput.value = finalMatch[1];
        }
        handleInput();
    }
}

// Initial Setup
loadState();
updateCurrency();
renderHistory();

// Auto-select text in input fields on focus
document.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
    input.addEventListener('focus', function() {
        this.select();
    });
});
