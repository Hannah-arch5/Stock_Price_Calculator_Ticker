// Global state
let currentCurrency = '¥';
let historyRecords = [];
let historyVersion = null;
// DOM Elements
const historyListEl = document.getElementById('history-list');
const currencyRadios = document.getElementsByName('currency');
const currencySymbols = document.querySelectorAll('.currency-symbol');

// Persistence Logic
function saveState() {
    // Strip runtime-only fields that should not persist between sessions
    const cleanRecords = historyRecords.map(group => {
        const { newsLoaded, newsTimeout, klineMetrics, ...cleanGroup } = group;
        return cleanGroup;
    });
    const stateObj = {
        historyRecords: cleanRecords,
        historyVersion: '2',
        calcInputs: {
            currency: currentCurrency,
            stock1: stockSymbol1Input.value,
            basePrice: basePriceInput.value,
            moveDown: document.getElementById('move-down').checked,
            percentChange: percentageChangeInput.value,
            stock2: stockSymbol2Input.value,
            initialPrice: initialPriceInput.value,
            finalPrice: finalPriceInput.value
        }
    };
    if (window.electronAPI && window.electronAPI.saveData) {
        window.electronAPI.saveData(JSON.stringify(stateObj));
    } else {
        localStorage.setItem('calcHistory', JSON.stringify(cleanRecords));
        localStorage.setItem('calcHistoryVersion', '2');
        localStorage.setItem('calcInputs', JSON.stringify(stateObj.calcInputs));
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
let isRenderingHistory = false;

// History Logic
function renderHistory() {
    if (isRenderingHistory) return;
    isRenderingHistory = true;

    try {
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
            
            let tagText = group.symbol;
            if (group.name) {
                const cleanName = group.name.replace(/\s+/g, '');
                tagText = cleanName.length <= 3 ? cleanName : cleanName.substring(0, 2);
            }
            tag.textContent = tagText;
            
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
        titleEl.className = 'group-title-container';
        
        if (group.symbol !== 'Uncategorized') {
            const linkA = document.createElement('a');
            linkA.href = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(group.symbol)}`;
            linkA.className = 'stock-link';
            linkA.target = '_blank';
            
            const codeSpan = document.createElement('span');
            codeSpan.className = 'stock-code';
            codeSpan.textContent = group.symbol;
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'stock-name';
            nameSpan.textContent = group.name ? group.name : '';
            nameSpan.style.marginLeft = '8px';
            
            linkA.appendChild(codeSpan);
            titleEl.appendChild(linkA);
            titleEl.appendChild(nameSpan);
            
            // Prevent link navigation on double click
            let clickTimeout = null;
            linkA.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;
                e.preventDefault();
                if (clickTimeout) {
                    clearTimeout(clickTimeout);
                    clickTimeout = null;
                } else {
                    clickTimeout = setTimeout(() => {
                        window.open(linkA.href, '_blank');
                        clickTimeout = null;
                    }, 250);
                }
            });
            
            const makeEditable = (spanEl, initialValue, onSave) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'edit-symbol-input mono';
                input.value = initialValue;
                input.style.fontSize = 'inherit';
                input.style.fontWeight = 'inherit';
                input.style.color = 'inherit';
                input.style.background = 'transparent';
                input.style.border = '1px solid var(--border-color)';
                input.style.borderRadius = '4px';
                input.style.outline = 'none';
                input.style.width = '100px';
                input.style.padding = '0 4px';
                input.style.margin = '0';
                
                spanEl.textContent = '';
                spanEl.appendChild(input);
                input.focus();
                input.select();
                
                let saved = false;
                const finishEdit = () => {
                    if (saved) return;
                    saved = true;
                    onSave(input.value);
                };
                
                input.addEventListener('blur', finishEdit);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') finishEdit();
                    if (e.key === 'Escape') {
                        saved = true;
                        onSave(initialValue); // cancel
                    }
                });
            };

            codeSpan.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                if (codeSpan.querySelector('input')) return;
                makeEditable(codeSpan, group.symbol, (newVal) => {
                    newVal = newVal.trim().toUpperCase();
                    if (newVal && newVal !== group.symbol) {
                        group.symbol = newVal;
                        group.records.forEach(r => r.symbol = newVal);
                        group.name = '';
                        group.nameFetched = false;
                        
                        const existingGroupIndex = historyRecords.findIndex(g => g !== group && g.symbol === newVal);
                        if (existingGroupIndex !== -1) {
                            historyRecords[existingGroupIndex].records.unshift(...group.records);
                            historyRecords = historyRecords.filter(g => g !== group);
                        }
                        saveState();
                        renderHistory();
                    } else {
                        codeSpan.textContent = group.symbol;
                    }
                });
            });
            
            nameSpan.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                if (nameSpan.querySelector('input')) return;
                makeEditable(nameSpan, group.name || '', (newVal) => {
                    newVal = newVal.trim();
                    if (newVal !== (group.name || '')) {
                        group.name = newVal;
                        saveState();
                        renderHistory();
                    } else {
                        nameSpan.textContent = group.name || '';
                    }
                });
            });

            if (!group.name && !group.nameFetched) {
                group.nameFetched = true;
                fetchStockName(group.symbol).then(name => {
                    if (name) {
                        group.name = name;
                        saveState();
                        renderHistory();
                    }
                });
            }
        } else {
            titleEl.textContent = group.symbol;
        }
            
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

            if (applyDynamicBindings(group, record)) {
                recalculateRecord(record);
            }
            
            let formattedDetails = record.details;
            if (formattedDetails && formattedDetails.includes(' | ')) {
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
                
                // Inline editing logic removed to prevent interference with double-click highlighting
                
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
                if (e.target.closest('.edit-type-input')) return;
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
        
        const newsPanel = document.createElement('div');
        newsPanel.className = 'group-news-panel';
        newsPanel.id = `news-panel-${groupIndex}`;
        newsPanel.innerHTML = '<div style="font-size: 0.7rem; color: var(--fg-dim);">Loading insights...</div>';

        const memoArea = document.createElement('div');
        memoArea.className = 'group-memo-area';
        
        memoArea.innerHTML = `
            <div class="memo-timeframes">
                <label><span class="tf-label"><span>W</span><span>:</span></span> <input type="text" class="tf-input mono" data-tf="tf_w" value="${group.tf_w || ''}"></label>
                <label><span class="tf-label"><span>D</span><span>:</span></span> <input type="text" class="tf-input mono" data-tf="tf_d" value="${group.tf_d || ''}"></label>
                <label><span class="tf-label"><span>30</span><span>:</span></span> <input type="text" class="tf-input mono" data-tf="tf_30" value="${group.tf_30 || ''}"></label>
            </div>
            <textarea class="group-note mono" placeholder="Add notes...">${group.note || ''}</textarea>
        `;
        
        clearTimeout(group.newsTimeout);
        // Reset newsLoaded so news is always fetched on app start/re-render
        group.newsLoaded = false;
        group.newsTimeout = setTimeout(() => {
            if (!group.newsLoaded) {
                loadStockNews(group.symbol, groupIndex);
                group.newsLoaded = true;
            }
            if (!group.klineMetrics) {
                loadKlineMetrics(group, groupIndex);
            }
        }, 200);
        
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
        
        noteEl.addEventListener('input', () => {
            noteEl.style.height = 'auto';
            noteEl.style.height = (noteEl.scrollHeight) + 'px';
        });
        
        setTimeout(() => {
            if (noteEl.scrollHeight > 0) {
                noteEl.style.height = 'auto';
                noteEl.style.height = (noteEl.scrollHeight) + 'px';
            }
        }, 0);

        groupEl.appendChild(headerEl);
        groupEl.appendChild(newsPanel);
        groupEl.appendChild(memoArea);
        groupEl.appendChild(listEl);
        historyListEl.appendChild(groupEl);
    });
    } finally {
        isRenderingHistory = false;
    }
}

function recalculateRecord(record) {
    if (record.inputs && record.inputs.base !== undefined) {
        const base = record.inputs.base;
        const perc = record.inputs.perc;
        const multiplier = record.inputs.isUp ? (1 + perc / 100) : (1 - perc / 100);
        const result = base * multiplier;
        record.result = `${record.currency || ''}${formatCurrency(result)}`;
        const recCurrency = record.currency || (record.result && record.result.includes('$') ? '$' : '¥');
        const upDownText = record.inputs.isUp ? 'Up' : 'Down';
        record.details = `<span>Base: ${recCurrency}${base}</span><span>${upDownText} ${perc}%</span>`;
    } else if (record.inputs && record.inputs.initial !== undefined) {
        const initial = record.inputs.initial;
        const final = record.inputs.final;
        const pctDecimal = (final - initial) / initial;
        record.result = `${Math.abs(pctDecimal * 100).toFixed(2)}%`;
        record.isUp = pctDecimal > 0;
        const recCurrency = record.currency || (record.result && record.result.includes('$') ? '$' : '¥');
        record.details = `<span>Base: ${recCurrency}${initial}</span><span>Target: ${recCurrency}${final}</span>`;
    }
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

async function fetchStockName(symbol) {
    if (!symbol || symbol === 'Uncategorized') return '';
    try {
        const url = `https://smartbox.gtimg.cn/s3/?v=2&q=${symbol}&t=all`;
        let text;
        if (window.electronAPI && window.electronAPI.fetchFinancialData) {
            text = await window.electronAPI.fetchFinancialData(url);
        } else {
            const res = await fetch(url);
            text = await res.text();
        }
        
        const match = text.match(/v_hint="(.*?)"/);
        if (match && match[1]) {
            const parts = match[1].split('^')[0].split('~');
            if (parts.length >= 3) {
                return JSON.parse('"' + parts[2] + '"');
            }
        }
    } catch (e) {
        console.error('Failed to fetch stock name', e);
    }
    return '';
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

const exportHistoryBtn = document.getElementById('export-history-btn');
if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', () => {
        if (historyRecords.length === 0) return;
        
        let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>Ticker History Export</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
                h1 { border-bottom: 2px solid #333; padding-bottom: 5px; }
                .group { margin-bottom: 30px; }
                .group-title { font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #000; }
                .group-note { font-style: italic; color: #666; margin-bottom: 10px; white-space: pre-wrap; }
                .record-item { margin-bottom: 5px; }
                .record-type { font-weight: bold; margin-right: 10px; }
            </style>
        </head>
        <body>
            <h1>Ticker History Export</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <hr>
        `;
        
        historyRecords.forEach(group => {
            htmlContent += `<div class="group">`;
            htmlContent += `<div class="group-title">${group.symbol}</div>`;
            if (group.tf_w || group.tf_d || group.tf_30) {
                htmlContent += `<div class="group-note" style="margin-bottom: 5px; font-weight: bold;">`;
                if (group.tf_w) htmlContent += `W: ${group.tf_w} &nbsp;&nbsp;`;
                if (group.tf_d) htmlContent += `D: ${group.tf_d} &nbsp;&nbsp;`;
                if (group.tf_30) htmlContent += `30: ${group.tf_30}`;
                htmlContent += `</div>`;
            }
            if (group.note) {
                htmlContent += `<div class="group-note">${group.note.replace(/\n/g, '<br>')}</div>`;
            }
            htmlContent += `<ul>`;
            group.records.forEach(record => {
                let detailsText = record.details.replace(/<\/span><span>/g, ' | ').replace(/<[^>]+>/g, '');
                let typeText = record.type;
                
                const recCurrency = record.currency || (record.result && record.result.includes('$') ? '$' : '¥');
                const upColor = recCurrency === '¥' ? '#ff453a' : '#32d74b';
                const downColor = recCurrency === '¥' ? '#32d74b' : '#ff453a';
                const resultColor = record.isUp ? upColor : downColor;
                
                htmlContent += `<li class="record-item">
                    <span class="record-type">[${typeText}]</span> 
                    <span>${detailsText}</span> 
                    <strong>&rarr; <span style="color: ${resultColor};">${record.result}</span></strong>
                </li>`;
            });
            htmlContent += `</ul></div>`;
        });
        
        htmlContent += `</body></html>`;
        
        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ticker_Export_${new Date().toISOString().slice(0,10)}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        mode: 'target',
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
        mode: 'percentage',
        symbol: stockSymbol2Input.value.trim().toUpperCase(),
        details: `<span>Base: ${currentCurrency}${initial}</span><span>Target: ${currentCurrency}${final}</span>`,
        result: `${Math.abs(currentPercentage).toFixed(2)}%`,
        isUp: currentPercentage > 0,
        inputs: { initial, final },
        currency: currentCurrency
    });
});

function populateForm(record) {
    let isPercentage = false;
    if (record.mode === 'percentage') {
        isPercentage = true;
    } else if (record.inputs && record.inputs.initial !== undefined) {
        isPercentage = true;
    } else if (record.result && record.result.includes('%')) {
        isPercentage = true;
    } else if (record.type === 'Percentage Delta' || record.type === 'Percentage Change') {
        isPercentage = true;
    }

    if (!isPercentage) {
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
    } else {
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
async function initializeData() {
    let stateObj = null;
    
    // 1. Try to load from IPC file storage
    if (window.electronAPI && window.electronAPI.loadData) {
        try {
            const dataStr = await window.electronAPI.loadData();
            if (dataStr) {
                stateObj = JSON.parse(dataStr);
            }
        } catch (e) {
            console.error('[DATA] Failed to load/parse IPC data:', e);
        }
    }
    
    // 2. Fallback to localStorage for initial migration
    if (!stateObj) {
        historyRecords = JSON.parse(localStorage.getItem('calcHistory')) || [];
        historyVersion = localStorage.getItem('calcHistoryVersion');
        
        if (!historyVersion) {
            historyRecords.reverse();
            historyVersion = '2';
        }
        
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
        }
        
        const savedInputs = JSON.parse(localStorage.getItem('calcInputs'));
        stateObj = {
            historyRecords: historyRecords,
            historyVersion: historyVersion,
            calcInputs: savedInputs
        };
        
        // Save immediately to migrate to file storage
        if (historyRecords.length > 0) {
            setTimeout(saveState, 500); 
        }
    } else {
        historyRecords = stateObj.historyRecords || [];
        historyVersion = stateObj.historyVersion;
    }
    
    // Populate UI from calcInputs
    const saved = stateObj.calcInputs;
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

    updateCurrency();
    renderHistory();
}

initializeData();

// Auto-select text in input fields on focus
document.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
    input.addEventListener('focus', function() {
        this.select();
    });
});

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle-btn');
if (themeToggleBtn) {
    const savedTheme = localStorage.getItem('ticker-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('ticker-theme', 'light');
        } else {
            localStorage.setItem('ticker-theme', 'dark');
        }
    });
}

// Split View Drag Logic
const resizer = document.getElementById('split-resizer');
const controlPanel = document.querySelector('.control-panel');

if (resizer && controlPanel) {
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    // Load saved width
    const savedLeftWidth = localStorage.getItem('calcLeftPanelWidth');
    if (savedLeftWidth) {
        controlPanel.style.setProperty('--left-flex', `0 0 ${savedLeftWidth}px`);
    } else {
        // Emulate 1fr / 1.2fr ratio
        controlPanel.style.setProperty('--left-flex', `0 0 45.45%`);
    }

    resizer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startWidth = controlPanel.getBoundingClientRect().width;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        let newWidth = startWidth + dx;
        
        // Enforce left panel min width
        if (newWidth < 235) newWidth = 235;

        // Enforce right panel min width (281px)
        const splitView = document.querySelector('.split-view');
        const splitViewWidth = splitView.getBoundingClientRect().width;
        const resizerWidth = resizer.getBoundingClientRect().width;
        
        const maxLeftWidth = splitViewWidth - resizerWidth - 281;
        if (newWidth > maxLeftWidth) newWidth = maxLeftWidth;

        controlPanel.style.setProperty('--left-flex', `0 0 ${newWidth}px`);
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            // Save width
            const finalWidth = controlPanel.getBoundingClientRect().width;
            localStorage.setItem('calcLeftPanelWidth', finalWidth);
        }
    });
}

// Window Size Toggle Button
const sizeToggleBtn = document.getElementById('size-toggle-btn');
if (sizeToggleBtn && window.electronAPI) {
    sizeToggleBtn.addEventListener('click', () => {
        window.electronAPI.toggleWindowSize();
    });
}

// Fetch and render stock news
async function loadStockNews(symbol, groupIndex) {
    const panel = document.getElementById(`news-panel-${groupIndex}`);
    if (!panel) return;
    
    const match = symbol.match(/\d{4,6}/);
    if (!match) {
        panel.innerHTML = '<div style="font-size: 0.7rem; color: var(--fg-dim);">No news available.</div>';
        return;
    }
    const code = match[0];
    
    try {
        const url = `https://np-anotice-stock.eastmoney.com/api/security/ann?sr=-1&page_size=5&page_index=1&ann_type=A&client_source=WEB&stock_list=${code}&f_node=1`;
        
        let jsonStr;
        if (window.electronAPI && window.electronAPI.fetchFinancialData) {
            jsonStr = await window.electronAPI.fetchFinancialData(url);
        } else {
            const res = await fetch(url);
            jsonStr = await res.text();
        }
        
        const data = JSON.parse(jsonStr);
        if (!data || !data.data || !data.data.list || data.data.list.length === 0) {
            panel.innerHTML = '<div style="font-size: 0.7rem; color: var(--fg-dim);">No recent announcements.</div>';
            return;
        }
        
        let html = `
            <div class="news-section">
                <h4>最新公告</h4>
                <div class="news-list">
        `;
        
        data.data.list.forEach(item => {
            const tag = item.columns && item.columns[0] ? item.columns[0].column_name : '公告';
            const title = item.title;
            const link = `https://data.eastmoney.com/notices/detail/${code}/${item.art_code}.html`;
            
            html += `
                <a href="${link}" class="news-item" target="_blank">
                    <span class="news-tag">【${tag}】</span>
                    <span class="news-text">${title}</span>
                </a>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        panel.innerHTML = html;
        
    } catch (e) {
        console.error('Failed to load news for', symbol, e);
        panel.innerHTML = '<div style="font-size: 0.7rem; color: var(--fg-dim);">Failed to load insights.</div>';
    }
}


// ---------------------------------------------------------
// Background K-Line Metrics Fetching
// ---------------------------------------------------------

function getTencentSymbol(c) {
    let codeMatch = c.match(/[A-Za-z0-9]+/);
    if (!codeMatch) return null;
    let code = codeMatch[0].toLowerCase();
    if (/^\d{6}$/.test(code)) return (code.startsWith('6') || code.startsWith('9')) ? `sh${code}` : `sz${code}`;
    if (/^\d{5}$/.test(code)) return `hk${code}`; 
    return `us${code.toUpperCase()}`;
}

async function loadKlineMetrics(group, groupIndex) {
    const tsym = getTencentSymbol(group.symbol);
    if (!tsym) return;

    if (!group.klineMetrics) {
        group.klineMetrics = {
            m5: { high: null, low: null },
            m30: { high: null, low: null },
            day: { high: null, low: null },
            week: { high: null, low: null }
        };
    }

    const fetchKline = async (type, intervalParam) => {
        const isAShare = tsym.startsWith('sh') || tsym.startsWith('sz');
        
        if (isAShare) {
            let scale = 5;
            let datalen = 320;
            if (type === 'm5') { scale = 5; datalen = 320; }
            else if (type === 'm30') { scale = 30; datalen = 320; }
            else if (type === 'day') { scale = 240; datalen = 320; }
            else if (type === 'week') { scale = 1200; datalen = 320; }
            
            const url = `https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketData.getKLineData?symbol=${tsym}&scale=${scale}&ma=no&datalen=${datalen}`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (data && Array.isArray(data) && data.length > 0) {
                    let maxHigh = -Infinity;
                    let minLow = Infinity;
                    for (let i = 0; i < data.length; i++) {
                        const h = parseFloat(data[i].high);
                        const l = parseFloat(data[i].low);
                        if (h > maxHigh) maxHigh = h;
                        if (l < minLow) minLow = l;
                    }
                    return { high: maxHigh, low: minLow };
                }
            } catch (e) {
                console.error(`Failed to fetch Sina ${type} for ${tsym}`, e);
            }
        } else {
            const endpoint = (type === 'm5' || type === 'm30') ? 'mkline' : 'kline';
            const url = `https://ifzq.gtimg.cn/appstock/app/kline/${endpoint}?param=${tsym},${intervalParam},,,320,`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (data && data.code === 0 && data.data && data.data[tsym] && data.data[tsym][intervalParam]) {
                    const arr = data.data[tsym][intervalParam];
                    if (arr.length > 0) {
                        let maxHigh = -Infinity;
                        let minLow = Infinity;
                        for (let i = 0; i < arr.length; i++) {
                            const h = parseFloat(arr[i][3]);
                            const l = parseFloat(arr[i][4]);
                            if (h > maxHigh) maxHigh = h;
                            if (l < minLow) minLow = l;
                        }
                        return { high: maxHigh, low: minLow };
                    }
                }
            } catch (e) {
                console.error(`Failed to fetch Tencent ${type} for ${tsym}`, e);
            }
        }
        return { high: null, low: null };
    };

    const [m5, m30, day, week] = await Promise.all([
        fetchKline('m5', 'm5'),
        fetchKline('m30', 'm30'),
        fetchKline('day', 'day'),
        fetchKline('week', 'week')
    ]);

    group.klineMetrics = { m5, m30, day, week };
    
    // Update any dynamically bound records in the UI now that data is fresh
    updateDynamicRecords(group, groupIndex);
}

// ---------------------------------------------------------
// Dynamic Record Bindings
// ---------------------------------------------------------

function applyDynamicBindings(group, record) {
    if (!group.klineMetrics) return false;
    
    // Rule 1: D线追踪 (D has fallen) -> Base = 30m High, Target = 5m Low
    if (record.type.includes('目前D已经跌') && group.klineMetrics.m30.high !== null && group.klineMetrics.m5.low !== null) {
        record.inputs = {
            initial: group.klineMetrics.m30.high,
            final: group.klineMetrics.m5.low
        };
        const diff = record.inputs.final - record.inputs.initial;
        record.isUp = diff >= 0;
        record.percentage = ((Math.abs(diff) / record.inputs.initial) * 100).toFixed(2) + '%';
        record.result = record.percentage;
        const recCurrency = record.currency || (record.result && record.result.includes('$') ? '$' : '¥');
        record.details = `Base: ${recCurrency}${record.inputs.initial.toFixed(2)} | Target: ${recCurrency}${record.inputs.final.toFixed(2)}`;
        return true;
    }
    
    return false;
}

function updateDynamicRecords(group, groupIndex) {
    if (!group.klineMetrics) return;
    const groupEl = document.getElementById(`group-${groupIndex}`);
    if (!groupEl) return;
    
    let hasUpdates = false;
    const recordEls = groupEl.querySelectorAll('.editorial-list > .item');
    recordEls.forEach((item, recIndex) => {
        const record = group.records[recIndex];
        const wasUpdated = applyDynamicBindings(group, record);
        
        if (wasUpdated) {
            hasUpdates = true;
            recalculateRecord(record);
            
            // Update the UI directly to avoid focus loss
            const recCurrency = record.currency || (record.result && record.result.includes('$') ? '$' : '¥');
            const infoSpan = item.querySelector('.info');
            if (infoSpan) {
                infoSpan.innerHTML = record.details;
            }
            
            const upColor = recCurrency === '¥' ? '#ff453a' : '#32d74b';
            const downColor = recCurrency === '¥' ? '#32d74b' : '#ff453a';
            
            const resultDiv = item.querySelector('.col-result');
            if (resultDiv) {
                resultDiv.style.color = record.isUp ? upColor : downColor;
                resultDiv.innerHTML = record.result;
            }
            
            // Seamlessly update top calculator if this record is currently selected
            if (typeof editingGroupIndex !== 'undefined' && editingGroupIndex === groupIndex && editingRecordIndex === recIndex) {
                const initialInput = document.getElementById('initial-input');
                const finalInput = document.getElementById('final-input');
                const resultEl = document.getElementById('result');
                if (initialInput && finalInput && resultEl) {
                    if (document.activeElement !== initialInput) initialInput.value = record.inputs.initial;
                    if (document.activeElement !== finalInput) finalInput.value = record.inputs.final;
                    resultEl.textContent = record.result;
                    resultEl.style.color = record.isUp ? upColor : downColor;
                }
            }
        }
    });
    
    if (hasUpdates) {
        saveState(); // Ensure the dynamically updated values are saved
    }
}

// Background polling for real-time updates
setInterval(() => {
    historyRecords.forEach((group, groupIndex) => {
        // Find if this group has any dynamic records before fetching
        const hasDynamic = group.records.some(r => r.type.includes('目前D已经跌') || r.type.includes('30卖点2') || r.type.includes('D卖点1'));
        if (hasDynamic) {
            loadKlineMetrics(group, groupIndex);
        }
    });
}, 3000); // Check for updates every 3 seconds

