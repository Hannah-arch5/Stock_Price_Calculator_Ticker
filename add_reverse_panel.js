const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const screenerHTML = `            <div id="screener-panel" style="display: none; flex-direction: column; flex: 1;">`;

const reverseHTML = `            <div id="reverse-panel" style="display: none; flex-direction: column; flex: 1; padding: 2rem;">
                <h1 class="animate-title" style="font-size: clamp(32px, 6vw, 64px); font-weight: 900; letter-spacing: -0.04em; line-height: 0.9; text-transform: uppercase; margin-bottom: 2rem;">Reverse<br/>Engineer</h1>
                <div class="input-row animate-fade" style="margin-bottom: 2rem;">
                    <input type="text" id="reverse-symbols" class="input-minimal-lg" style="width: 500px;" placeholder="TICKERS (COMMA SEPARATED)">
                    <button id="reverse-execute-btn" class="btn-minimal-lg">Discover</button>
                </div>
                <div id="reverse-results" style="flex: 1;"></div>
            </div>

            <div id="screener-panel" style="display: none; flex-direction: column; flex: 1;">`;

if (!html.includes('id="reverse-panel"')) {
    html = html.replace(screenerHTML, reverseHTML);
    fs.writeFileSync('index.html', html);
    console.log('Added Reverse panel to index.html');
}

let css = fs.readFileSync('styles.css', 'utf8');
if (!css.includes('.reverse-active')) {
    css += `
/* === Reverse Mode Layout Toggles === */
body.reverse-active .control-panel,
body.reverse-active .ledger-panel,
body.reverse-active #split-resizer {
  display: none !important;
}
body.reverse-active #main-logo {
  animation: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none;
}
body.reverse-active #reverse-panel {
  display: flex !important;
  animation: panelFade 0.8s ease-out forwards;
}

/* Reverse Engineer UI */
.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-top: 4rem;
}

.metric-card {
  border-top: 1px solid var(--border);
  padding-top: 2rem;
}

.metric-label {
  font-size: 1rem;
  color: var(--fg-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.metric-value {
  font-size: 5vw;
  font-weight: 200;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}
`;
    fs.writeFileSync('styles.css', css);
    console.log('Added Reverse CSS');
}
