// Global state
let currentCurrency = '¥';
let historyRecords = JSON.parse(localStorage.getItem('calcHistory')) || [];
let historyVersion = localStorage.getItem('calcHistoryVersion');

if (!historyVersion) {
    historyRecords.reverse();
    localStorage.setItem('calcHistoryVersion', '2');
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
    
    // Switch colors based on currency:
    // CNY: Up = Red (#dc2626), Down = Green (#059669)
    // USD: Up = Green (#059669), Down = Red (#dc2626)
    if (currentCurrency === '¥') {
        document.documentElement.style.setProperty('--up-color', '#dc2626');
        document.documentElement.style.setProperty('--up-bg', '#fee2e2');
        document.documentElement.style.setProperty('--down-color', '#059669');
        document.documentElement.style.setProperty('--down-bg', '#d1fae5');
    } else {
        document.documentElement.style.setProperty('--up-color', '#059669');
        document.documentElement.style.setProperty('--up-bg', '#d1fae5');
        document.documentElement.style.setProperty('--down-color', '#dc2626');
        document.documentElement.style.setProperty('--down-bg', '#fee2e2');
    }

    // Update all static labels
    currencySymbols.forEach(symbol => {
        symbol.textContent = currentCurrency;
    });

    // Recalculate to update formatted strings in results
    calculateTargetPrice();
    calculatePercentage();
    saveState();
}

currencyRadios.forEach(radio => radio.addEventListener('change', updateCurrency));

// Helper: format currency
function formatCurrency(value) {
    return value.toFixed(4).replace(/\.?0+$/, ''); 
}

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

// Target Price State
let currentTargetPrice = 0;
let currentTargetIsUp = true;

// Event Listeners for Target Price Calculator
reuseBaseBtn.addEventListener('click', () => {
    const currentBase = parseFloat(basePriceInput.value);
    const percentage = parseFloat(percentageChangeInput.value);
    
    if (!isNaN(currentBase) && currentBase > 0) {
        if (!isNaN(percentage)) {
            // Determine movement direction
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
        // If percentage is NaN or 100% down, we just do handleInput
        handleInput();
    }
});

reuseTargetBtn.addEventListener('click', () => {
    if (currentTargetPrice > 0) {
        basePriceInput.value = formatCurrency(currentTargetPrice);
        handleInput();
    }
});

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
        targetResultEl.className = 'result-value';
        currentTargetPrice = 0;
        return;
    }

    const multiplier = isUp ? (1 + percentage / 100) : (1 - percentage / 100);
    currentTargetPrice = basePrice * multiplier;

    targetResultEl.innerHTML = `<span class="currency-symbol">${currentCurrency}</span>${formatCurrency(currentTargetPrice)}`;
    
    if (isUp) {
        targetResultEl.className = 'result-value text-up';
    } else {
        targetResultEl.className = 'result-value text-down';
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

let currentPercentage = 0;

// Event Listeners for Percentage Change Calculator
reuseInitialBtn.addEventListener('click', () => {
    const initialVal = parseFloat(initialPriceInput.value);
    const finalVal = parseFloat(finalPriceInput.value);
    if (!isNaN(initialVal) && initialVal > 0 && !isNaN(finalVal)) {
        const pctDecimal = (finalVal - initialVal) / initialVal;
        if (pctDecimal === -1) return; // prevent division by zero
        
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

function calculatePercentage() {
    const initialPrice = parseFloat(initialPriceInput.value);
    const finalPrice = parseFloat(finalPriceInput.value);

    if (isNaN(initialPrice) || isNaN(finalPrice) || initialPrice === 0) {
        percentageResultEl.textContent = '0.00%';
        percentageResultEl.className = 'result-value';
        percentageMovementTypeEl.textContent = '-';
        percentageMovementTypeEl.className = 'result-movement';
        currentPercentage = 0;
        return;
    }

    const difference = finalPrice - initialPrice;
    currentPercentage = (difference / initialPrice) * 100;
    
    const formattedPercentage = Math.abs(currentPercentage).toFixed(2) + '%';
    percentageResultEl.textContent = formattedPercentage;

    if (currentPercentage > 0) {
        percentageResultEl.className = 'result-value text-up';
        percentageMovementTypeEl.textContent = 'Up Rise';
        percentageMovementTypeEl.className = 'result-movement text-up';
    } else if (currentPercentage < 0) {
        percentageResultEl.className = 'result-value text-down';
        percentageMovementTypeEl.textContent = 'Down Fall';
        percentageMovementTypeEl.className = 'result-movement text-down';
    } else {
        percentageResultEl.className = 'result-value';
        percentageMovementTypeEl.textContent = 'No Change';
        percentageMovementTypeEl.className = 'result-movement';
    }
}

// Input Listeners (Trigger calculation & save state)
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

reuseTargetBtn.addEventListener('click', () => {
    if (currentTargetPrice > 0) {
        basePriceInput.value = formatCurrency(currentTargetPrice);
        handleInput();
    }
});

clearPercentageBtn.addEventListener('click', () => {
    stockSymbol2Input.value = '';
    initialPriceInput.value = '';
    finalPriceInput.value = '';
    handleInput();
});

// History Logic
function renderHistory() {
    if (historyRecords.length === 0) {
        historyListEl.innerHTML = '<p class="empty-history">No history yet. Save a calculation to see it here.</p>';
        return;
    }

    historyListEl.innerHTML = '';
    
    historyRecords.forEach((record, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.draggable = true;
        item.dataset.index = index;
        
        let stockHtml = record.symbol 
            ? `<a href="https://www.tradingview.com/chart/?symbol=${encodeURIComponent(record.symbol)}" class="stock-link" target="_blank">${record.symbol}</a> - ` 
            : '';
            
        let resultClass = record.isUp ? 'text-up' : 'text-down';

        item.innerHTML = `
            <div class="history-info">
                <div class="history-title">
                    ${stockHtml} ${record.type}
                </div>
                <div class="history-details">
                    ${record.details}
                </div>
            </div>
            <div class="history-result ${resultClass}">
                ${record.result}
            </div>
            <button class="delete-btn" title="Delete" onclick="deleteHistory(${index})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
            </button>
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
            if (e.target.closest('.delete-btn') || e.target.closest('.stock-link')) {
                return;
            }
            populateForm(record);
        });
        
        historyListEl.appendChild(item);
    });
}

historyListEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = historyListEl.querySelector('.dragging');
    if (!draggingItem) return;
    
    const afterElement = getDragAfterElement(historyListEl, e.clientY);
    if (afterElement == null) {
        historyListEl.appendChild(draggingItem);
    } else {
        historyListEl.insertBefore(draggingItem, afterElement);
    }
});

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

function updateArrayFromDOM() {
    const items = [...historyListEl.querySelectorAll('.history-item')];
    const newHistory = [];
    items.forEach(item => {
        const originalIndex = parseInt(item.dataset.index, 10);
        newHistory.push(historyRecords[originalIndex]);
    });
    historyRecords = newHistory;
}

window.deleteHistory = function(index) {
    historyRecords.splice(index, 1);
    saveState();
    renderHistory();
};

saveTargetBtn.addEventListener('click', () => {
    const base = parseFloat(basePriceInput.value);
    const perc = parseFloat(percentageChangeInput.value);
    if (isNaN(base) || isNaN(perc)) return;

    historyRecords.unshift({
        type: 'Target Price',
        symbol: stockSymbol1Input.value.trim().toUpperCase(),
        details: `Base: ${currentCurrency}${base} | ${currentTargetIsUp ? 'Up' : 'Down'} ${perc}%`,
        result: `${currentCurrency}${formatCurrency(currentTargetPrice)}`,
        isUp: currentTargetIsUp,
        inputs: { base, perc, isUp: currentTargetIsUp }
    });
    saveState();
    renderHistory();
});

savePercentageBtn.addEventListener('click', () => {
    const initial = parseFloat(initialPriceInput.value);
    const final = parseFloat(finalPriceInput.value);
    if (isNaN(initial) || isNaN(final) || initial === 0) return;

    historyRecords.unshift({
        type: 'Percentage Change',
        symbol: stockSymbol2Input.value.trim().toUpperCase(),
        details: `Base: ${currentCurrency}${initial} | Target: ${currentCurrency}${final}`,
        result: `${Math.abs(currentPercentage).toFixed(2)}%`,
        isUp: currentPercentage > 0,
        inputs: { initial, final }
    });
    saveState();
    renderHistory();
});

function populateForm(record) {
    if (record.type === 'Target Price') {
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
    } else if (record.type === 'Percentage Change') {
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
