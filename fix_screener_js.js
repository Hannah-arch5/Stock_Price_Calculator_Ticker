const fs = require('fs');

let content = fs.readFileSync('main_script.js', 'utf8');

const screenerLogic = `
// ==========================================
// Screener Logic
// ==========================================
const navItems = document.querySelectorAll('.nav-item');
const screenerBtn = document.getElementById('screener-execute-btn');
const screenerMin = document.getElementById('screener-min');
const screenerMax = document.getElementById('screener-max');
const screenerResults = document.getElementById('screener-results');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const text = e.target.innerText.trim().toUpperCase();
        if (text === 'SCREENER') {
            document.body.classList.add('screener-active');
            navItems.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
        } else if (text === 'INSIGHTS') {
            document.body.classList.remove('screener-active');
            navItems.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
});

async function executeScreener() {
    if (screenerBtn.disabled) return;
    screenerBtn.disabled = true;
    screenerBtn.innerText = 'Processing...';
    screenerResults.innerHTML = '';
    
    const minP = parseFloat(screenerMin.value) || 0;
    const maxP = parseFloat(screenerMax.value) || 99999;
    
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
        
        // Filter by price
        const filtered = diff.filter(row => {
            const price = parseFloat(row.f2);
            if (isNaN(price)) return false;
            return price >= minP && price <= maxP;
        }).slice(0, 100);
        
        // Render
        filtered.forEach((row, idx) => {
            const div = document.createElement('div');
            div.className = 'list-row animate-slide-up';
            // Stagger animation
            div.style.animationDelay = \`\${(idx * 0.05).toFixed(2)}s\`;
            
            const change = parseFloat(row.f3) || 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            const changeSign = change > 0 ? '+' : '';
            
            div.innerHTML = \`
                <div class="row-col col-code">\${row.f12 || '-'}</div>
                <div class="row-col col-name">\${row.f14 || '-'}</div>
                <div class="row-col col-price">\${row.f2 === '-' ? '-' : row.f2}</div>
                <div class="row-col mono \${changeClass}">\${changeSign}\${row.f3 === '-' ? '0' : row.f3}%</div>
                <div class="row-col mono">\${row.f9 === '-' ? '-' : row.f9}</div>
                <div class="row-col mono">\${row.f23 === '-' ? '-' : row.f23}</div>
            \`;
            screenerResults.appendChild(div);
        });
        
    } catch(e) {
        console.error("Screener Error:", e);
        screenerResults.innerHTML = \`<div class="mono negative" style="padding: 2rem;">Error fetching data: \${e.message}</div>\`;
    }
    
    screenerBtn.disabled = false;
    screenerBtn.innerText = 'Execute';
}

if (screenerBtn) {
    screenerBtn.addEventListener('click', executeScreener);
}
`;

content += '\n' + screenerLogic;
fs.writeFileSync('main_script.js', content, 'utf8');
console.log('Done appending JS.');
