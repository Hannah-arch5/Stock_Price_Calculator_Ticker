const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// Modify the research-panel flex
css = css.replace(/flex: var\(--research-flex, 1 1 350px\);/, 'flex: 1 1 300px;');

// Add ledger-panel fixed width rule in media query
const mediaQueryIndex = css.indexOf('@media (min-width: 1400px) {');
if (mediaQueryIndex > -1) {
    const insertCSS = `
    .ledger-panel {
        flex: 0 0 var(--middle-width, 800px) !important;
    }
    `;
    css = css.slice(0, mediaQueryIndex + 28) + insertCSS + css.slice(mediaQueryIndex + 28);
}

fs.writeFileSync('styles.css', css);

let js = fs.readFileSync('script.js', 'utf8');

// Add media query listener to freeze middle panel width
const freezeLogic = `
// Middle Panel freeze logic
const splitView = document.querySelector('.split-view');
const ledgerPanel = document.querySelector('.ledger-panel');
const mql = window.matchMedia('(min-width: 1400px)');

function handleMediaQuery(e) {
    if (e.matches) {
        // Entering 3-panel mode
        // If we don't have a saved middle width, compute it based on current size
        let savedMiddle = localStorage.getItem('calcMiddlePanelWidth');
        if (!savedMiddle) {
            // Before it switches, it was flexing. Let's capture its width right before.
            // Actually it just switched. It might have snapped to 800px.
            // If it's the first time, let's set it to 1400 - left panel - 10
            const leftWidth = document.querySelector('.control-panel').getBoundingClientRect().width;
            savedMiddle = (1400 - leftWidth - 30) + 'px'; 
        } else {
            savedMiddle = savedMiddle + 'px';
        }
        ledgerPanel.style.setProperty('--middle-width', savedMiddle);
    } else {
        // Entering 2-panel mode
        // It goes back to flexing automatically via CSS (flex: 1 1 auto)
    }
}
mql.addListener(handleMediaQuery);
handleMediaQuery(mql);
`;

js = js.replace('// Research Panel Resizer', freezeLogic + '\n// Research Panel Resizer');

// Update researchResizer logic to modify middle-width instead of research-flex
const oldDragLogic = `
        researchPanel.style.setProperty('--research-flex', \`0 0 \${newWidth}px\`);
        localStorage.setItem('calcResearchPanelWidth', newWidth);
`;
const newDragLogic = `
        // Dragging the right resizer should change the MIDDLE panel's width, 
        // since the RIGHT panel is now flex: 1.
        // dx is negative if dragging left.
        // If we drag left, we are shrinking the middle panel.
        const currentMiddleWidth = parseFloat(getComputedStyle(ledgerPanel).getPropertyValue('--middle-width')) || 800;
        let newMiddleWidth = currentMiddleWidth - dx; // dx is researchStartX - e.clientX
        
        if (newMiddleWidth < 281) newMiddleWidth = 281;
        
        ledgerPanel.style.setProperty('--middle-width', \`\${newMiddleWidth}px\`);
        localStorage.setItem('calcMiddlePanelWidth', newMiddleWidth);
        
        researchStartX = e.clientX; // reset startX for continuous dragging
`;

js = js.replace(oldDragLogic, newDragLogic);

fs.writeFileSync('script.js', js);
