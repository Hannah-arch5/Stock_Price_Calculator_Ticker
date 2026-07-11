const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldTabs = `                    <div class="research-tabs">
                        <button class="research-tab active" data-target="zotero-view">Zotero</button>
                        <button class="research-tab" data-target="pdf-view" id="pdf-tab" style="display: none;">PDF Reader</button>
                        <button class="research-tab" data-target="gemini-view">Gemini</button>`;

const newTabs = `                    <div class="research-tabs">
                        <button class="research-tab active" data-target="zotero-view">Zotero</button>
                        <button class="research-tab" data-target="pdf-view" id="pdf-tab">PDF Reader</button>
                        <button class="research-tab" data-target="gemini-view">Gemini</button>
                        <button class="research-tab" data-target="domestic-view">DOMESTIC</button>
                        <button class="research-tab" data-target="watchlist-view">WATCHLIST</button>`;

html = html.replace(oldTabs, newTabs);

const settingsViewEnd = `                        <!-- Settings View -->
                        <div class="research-content-area hidden" id="settings-view">
                            <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem;">
                                <div>
                                    <h3 class="mono" style="margin-bottom: 0.5rem; color: var(--fg-dim);">API Key</h3>
                                    <input type="password" id="gemini-api-key-input" class="input-minimal" placeholder="Enter Gemini API Key..." style="width: 100%;">
                                </div>
                                <button id="save-settings-btn" class="btn-minimal">Save Settings</button>
                                <div id="settings-status" class="mono" style="color: var(--positive); display: none;">Settings saved</div>
                            </div>
                        </div>
                    </div>`;

const newViews = `                        <!-- Settings View -->
                        <div class="research-content-area hidden" id="settings-view">
                            <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem;">
                                <div>
                                    <h3 class="mono" style="margin-bottom: 0.5rem; color: var(--fg-dim);">API Key</h3>
                                    <input type="password" id="gemini-api-key-input" class="input-minimal" placeholder="Enter Gemini API Key..." style="width: 100%;">
                                </div>
                                <button id="save-settings-btn" class="btn-minimal">Save Settings</button>
                                <div id="settings-status" class="mono" style="color: var(--positive); display: none;">Settings saved</div>
                            </div>
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
                        </div>
                    </div>`;

html = html.replace(settingsViewEnd, newViews);

fs.writeFileSync('index.html', html);
console.log('Updated tabs and views');
