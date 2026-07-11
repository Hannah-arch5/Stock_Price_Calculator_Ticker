const fs = require('fs');
let js = fs.readFileSync('main_script.js', 'utf8');

const funcs = `
// === New Tab Logic (Domestic & Watchlist) ===
const watchlistSymbolsInput = document.getElementById('watchlist-symbols-input');
const watchlistLoadBtn = document.getElementById('watchlist-load-btn');
const watchlistFeed = document.getElementById('watchlist-feed');
const domesticFeed = document.getElementById('domestic-feed');
let domesticLoaded = false;

if (watchlistLoadBtn) {
    watchlistLoadBtn.addEventListener('click', loadWatchlistNews);
}

async function fetchDomesticMacroNews() {
    if (domesticLoaded) return;
    try {
        const url = 'https://zhibo.sina.com.cn/api/zhibo/feed?page=1&page_size=50&zhibo_id=152';
        let res;
        if (window.electronAPI && window.electronAPI.fetchFinancialData) {
            res = await window.electronAPI.fetchFinancialData(url);
        } else {
            const resp = await fetch(url);
            res = await resp.json();
        }
        const data = typeof res === 'string' ? JSON.parse(res) : res;
        const list = data?.result?.data?.feed?.list || [];
        
        if (list.length === 0) {
            domesticFeed.innerHTML = '<div class="mono" style="color: var(--fg-dim);">No news available.</div>';
            return;
        }
        
        let html = '';
        list.forEach(item => {
            html += \`
                <div class="macro-news-item animate-fade">
                    <div class="news-time mono">\${item.create_time}</div>
                    <div class="news-content">\${item.rich_text}</div>
                </div>
            \`;
        });
        
        domesticFeed.innerHTML = html;
        domesticLoaded = true;
    } catch (e) {
        console.error(e);
        domesticFeed.innerHTML = \`<div class="mono negative">Error loading macro news: \${e.message}</div>\`;
    }
}

async function loadWatchlistNews() {
    if (!watchlistLoadBtn) return;
    const input = watchlistSymbolsInput.value.trim();
    if (!input) return;
    const symbols = input.split(',').map(s => s.trim()).filter(Boolean);
    if (symbols.length === 0) return;
    
    watchlistLoadBtn.disabled = true;
    watchlistLoadBtn.innerText = 'LOADING...';
    watchlistFeed.innerHTML = '';
    
    try {
        let html = '';
        for (const sym of symbols) {
            const url = \`https://np-anotice-stock.eastmoney.com/api/security/ann?sr=-1&page_size=10&page_index=1&ann_type=A&client_source=web&stock_list=\${sym}\`;
            let res;
            if (window.electronAPI && window.electronAPI.fetchFinancialData) {
                res = await window.electronAPI.fetchFinancialData(url);
            } else {
                const resp = await fetch(url);
                res = await resp.json();
            }
            const data = typeof res === 'string' ? JSON.parse(res) : res;
            const list = data?.data?.list || [];
            
            html += \`
                <div class="animate-slide-up" style="animation-fill-mode: forwards;">
                    <h3 class="mono" style="color: var(--fg-dim); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem;">\${sym}</h3>
            \`;
            
            if (list.length === 0) {
                html += \`<div class="mono" style="margin-bottom: 1rem;">No recent news.</div>\`;
            } else {
                list.forEach(item => {
                    html += \`
                        <div style="margin-bottom: 1rem;">
                            <div class="mono" style="font-size: 0.75rem; color: var(--fg-dim);">\${item.display_time}</div>
                            <div style="font-size: 1rem; font-weight: 300;">\${item.title}</div>
                        </div>
                    \`;
                });
            }
            html += '</div>';
        }
        watchlistFeed.innerHTML = html;
    } catch (e) {
        console.error(e);
        watchlistFeed.innerHTML = \`<div class="mono negative">Error loading watchlist news: \${e.message}</div>\`;
    } finally {
        watchlistLoadBtn.disabled = false;
        watchlistLoadBtn.innerText = 'LOAD';
    }
}
`;

if (!js.includes('fetchDomesticMacroNews')) {
    js += funcs;
    fs.writeFileSync('main_script.js', js);
    console.log('Added API functions');
}
