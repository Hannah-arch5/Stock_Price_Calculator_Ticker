const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = '<section class="screener-panel" id="screener-panel"';

const reversePanelHTML = `
            <section id="reverse-panel" style="display: none; flex-direction: column; flex: 1; padding-right: 2rem; min-width: 0;">
                <h1 class="animate-title" style="font-size: clamp(32px, 6vw, 64px); font-weight: 900; letter-spacing: -0.04em; line-height: 0.9; text-transform: uppercase; margin-bottom: 2rem;">Reverse<br/>Engineer</h1>
                <div class="input-row animate-fade" style="margin-bottom: 2rem;">
                    <input type="text" id="reverse-symbols" class="input-minimal-lg" style="width: 500px; padding: 0.5rem 0;" placeholder="TICKERS (COMMA SEPARATED)">
                    <button id="reverse-execute-btn" class="btn-minimal-lg">Discover</button>
                </div>
                <div id="reverse-results" style="flex: 1; display: flex; flex-direction: column;"></div>
            </section>
`;

if (html.includes(targetStr) && !html.includes('id="reverse-panel"')) {
    html = html.replace(targetStr, reversePanelHTML + "\n            " + targetStr);
    fs.writeFileSync('index.html', html);
    console.log('Successfully inserted reverse-panel');
} else {
    console.log('Failed to insert. Target not found or already inserted.');
}
