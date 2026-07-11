const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                    <button class="btn-minimal save-btn" id="save-settings-btn" style="margin-top: 2rem;">Save Settings</button>
                </div>`;

const newViews = `                    <button class="btn-minimal save-btn" id="save-settings-btn" style="margin-top: 2rem;">Save Settings</button>
                </div>

                <!-- Domestic View -->
                <div class="research-content-area hidden" id="domestic-view" style="overflow-y: auto;">
                    <div class="feed-column" id="domestic-feed" style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem;">
                        <div class="mono" style="color: var(--fg-dim);">Loading global macro news...</div>
                    </div>
                </div>

                <!-- Watchlist View -->
                <div class="research-content-area hidden" id="watchlist-view" style="overflow-y: auto; padding: 1rem;">
                    <div class="input-row" style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                        <input type="text" id="watchlist-symbols-input" class="input-minimal" style="width: 100%; font-size: 1.25rem;" placeholder="WATCHLIST (e.g. 600519, 000858)">
                        <button id="watchlist-load-btn" class="btn-minimal">LOAD</button>
                    </div>
                    <div id="watchlist-feed" style="display: flex; flex-direction: column; gap: 3rem;">
                        <div class="mono" style="color: var(--fg-dim);">Enter ticker symbols to load news.</div>
                    </div>
                </div>`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, newViews);
    fs.writeFileSync('index.html', html);
    console.log('Successfully injected DOMESTIC and WATCHLIST HTML views');
} else {
    console.log('Target string not found');
}
