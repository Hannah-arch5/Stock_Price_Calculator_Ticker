const fs = require('fs');
let js = fs.readFileSync('main_script.js', 'utf8');

const navToggleCode = `        if (text === 'SCREENER') {
            if (researchPanel) {
                const rect = researchPanel.getBoundingClientRect();
                researchPanel.style.flex = \`0 0 \${rect.width}px\`;
            }
            document.body.classList.add('screener-active');
            document.body.classList.remove('reverse-active');
            navItemsScreener.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
            replayAllAnimations();
        } else if (text === 'REVERSE') {
            if (researchPanel) {
                const rect = researchPanel.getBoundingClientRect();
                researchPanel.style.flex = \`0 0 \${rect.width}px\`;
            }
            document.body.classList.add('reverse-active');
            document.body.classList.remove('screener-active');
            navItemsScreener.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
            replayAllAnimations();
        } else if (text === 'INSIGHTS') {
            if (researchPanel) {
                researchPanel.style.flex = ''; // Restore original flex
            }
            document.body.classList.remove('screener-active');
            document.body.classList.remove('reverse-active');
            navItemsScreener.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
            replayAllAnimations();
        }`;

// Replace the screener nav toggle logic
const oldNavToggle = `        if (text === 'SCREENER') {
            if (researchPanel) {
                const rect = researchPanel.getBoundingClientRect();
                researchPanel.style.flex = \`0 0 \${rect.width}px\`;
            }
            document.body.classList.add('screener-active');
            navItemsScreener.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
            replayAllAnimations();
        } else if (text === 'INSIGHTS') {
            if (researchPanel) {
                researchPanel.style.flex = ''; // Restore original flex
            }
            document.body.classList.remove('screener-active');
            navItemsScreener.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
            replayAllAnimations();
        }`;

if (js.includes(oldNavToggle)) {
    js = js.replace(oldNavToggle, navToggleCode);
    console.log('Replaced nav toggle logic');
}

// Add executeReverse function
if (!js.includes('function executeReverse')) {
    const reverseJS = `
const reverseBtn = document.getElementById('reverse-execute-btn');
const reverseSymbols = document.getElementById('reverse-symbols');
const reverseResults = document.getElementById('reverse-results');

if (reverseBtn) {
    reverseBtn.addEventListener('click', executeReverse);
}

async function executeReverse() {
    if (reverseBtn.disabled) return;
    const symbolsInput = reverseSymbols.value.trim();
    if (!symbolsInput) return;
    
    const symbols = symbolsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (symbols.length === 0) return;

    reverseBtn.disabled = true;
    reverseBtn.innerText = 'Analyzing...';
    reverseResults.innerHTML = '';
    
    try {
        const url = "http://82.push2.eastmoney.com/api/qt/clist/get?pn=1&pz=5000&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048&fields=f12,f14,f2,f3,f9,f23";
        let res;
        if (window.electronAPI && window.electronAPI.fetchFinancialData) {
            res = await window.electronAPI.fetchFinancialData(url);
        } else {
            const resp = await fetch(url);
            res = await resp.json();
        }
        
        let data = typeof res === 'string' ? JSON.parse(res) : res;
        let diff = data?.data?.diff || [];
        
        let validPE = [];
        let validPB = [];
        
        for (const item of diff) {
            if (symbols.includes(item.f12)) {
                if (item.f9 !== '-' && item.f9 != null) validPE.push(parseFloat(item.f9));
                if (item.f23 !== '-' && item.f23 != null) validPB.push(parseFloat(item.f23));
            }
        }
        
        if (validPE.length === 0 && validPB.length === 0) {
            reverseResults.innerHTML = '<div class="negative mono animate-fade" style="margin-top: 2rem; font-size: 1.5rem; opacity: 0; animation-delay: 0.1s; animation-fill-mode: forwards;">未能在市场中找到指定的股票数据或无可用的估值数据</div>';
        } else {
            const avgPE = validPE.length > 0 ? (validPE.reduce((a,b) => a+b, 0) / validPE.length).toFixed(2) : 'N/A';
            const avgPB = validPB.length > 0 ? (validPB.reduce((a,b) => a+b, 0) / validPB.length).toFixed(2) : 'N/A';
            
            reverseResults.innerHTML = \`
                <div class="analysis-grid animate-slide-up" style="animation-delay: 0.1s; opacity: 0; animation-fill-mode: forwards;">
                  <div class="metric-card"><div class="metric-label">Average P/E Dynamic</div><div class="metric-value">\${avgPE}</div></div>
                  <div class="metric-card"><div class="metric-label">Average P/B Ratio</div><div class="metric-value">\${avgPB}</div></div>
                </div>
            \`;
        }
    } catch (e) {
        console.error(e);
        reverseResults.innerHTML = \`<div class="negative mono animate-fade" style="margin-top: 2rem; font-size: 1.5rem; opacity: 0; animation-delay: 0.1s; animation-fill-mode: forwards;">请求失败: \${e.message}</div>\`;
    } finally {
        reverseBtn.disabled = false;
        reverseBtn.innerText = 'Discover';
    }
}
`;
    js += reverseJS;
    console.log('Added executeReverse');
}

fs.writeFileSync('main_script.js', js);
