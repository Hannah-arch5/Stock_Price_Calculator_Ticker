// Global state
let currentCurrency = '¥';
let historyRecords = JSON.parse(localStorage.getItem('calcHistory')) || [];

// DOM Elements
const historyListEl = document.getElementById('history-list');
const currencyRadios = document.getElementsByName('currency');
const currencySymbols = document.querySelectorAll('.currency-symbol');

// Persistence Logic
function saveState() {
    localStorage.setItem('calcHistory', JSON.stringify(historyRecords));
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

let currentPercentage = 0;

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
    
    // Render in reverse chronological order (newest first)
    [...historyRecords].reverse().forEach((record, index) => {
        const trueIndex = historyRecords.length - 1 - index;
        
        const item = document.createElement('div');
        item.className = 'history-item';
        
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
            <button class="delete-btn" title="Delete" onclick="deleteHistory(${trueIndex})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
            </button>
        `;
        
        historyListEl.appendChild(item);
    });
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

    historyRecords.push({
        type: 'Target Price',
        symbol: stockSymbol1Input.value.trim().toUpperCase(),
        details: `Base: ${currentCurrency}${base} | ${currentTargetIsUp ? 'Up' : 'Down'} ${perc}%`,
        result: `${currentCurrency}${formatCurrency(currentTargetPrice)}`,
        isUp: currentTargetIsUp
    });
    saveState();
    renderHistory();
});

savePercentageBtn.addEventListener('click', () => {
    const initial = parseFloat(initialPriceInput.value);
    const final = parseFloat(finalPriceInput.value);
    if (isNaN(initial) || isNaN(final) || initial === 0) return;

    historyRecords.push({
        type: 'Percentage Change',
        symbol: stockSymbol2Input.value.trim().toUpperCase(),
        details: `Base: ${currentCurrency}${initial} | Target: ${currentCurrency}${final}`,
        result: `${Math.abs(currentPercentage).toFixed(2)}%`,
        isUp: currentPercentage > 0
    });
    saveState();
    renderHistory();
});

// Initial Setup
loadState();
updateCurrency();
renderHistory();
