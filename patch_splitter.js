const fs = require('fs');

// Patch index.html
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('id="split-resizer"')) {
    html = html.replace(/<\/section>\s*<!-- Right: History/g, '</section>\n            \n            <div class="resizer" id="split-resizer"></div>\n\n            <!-- Right: History');
    fs.writeFileSync('index.html', html);
}

// Patch styles.css
let css = fs.readFileSync('styles.css', 'utf8');
if (!css.includes('.resizer {')) {
    css = css.replace(/(\.split-view\s*\{[^}]*?)display:\s*grid;[^}]*?gap:\s*6vw;/s, '$1display: flex;\n  flex-direction: row;');
    css = css.replace(/(\.control-panel\s*\{[^}]*?)(\})/s, '$1flex: var(--left-flex, 0 0 235px);\n  min-width: 235px;\n$2');
    css = css.replace(/(\.ledger-panel\s*\{[^}]*?)(\})/s, '$1flex: var(--right-flex, 1 1 281px);\n  min-width: 281px;\n$2');
    
    const resizerCss = `
.resizer {
  width: 6vw;
  flex-shrink: 0;
  cursor: col-resize;
  position: relative;
  z-index: 10;
}
.resizer::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 10%;
  bottom: 10%;
  width: 1px;
  background-color: var(--fg-dim);
  opacity: 0.1; /* very subtle visual hint */
}
`;
    css += resizerCss;
    fs.writeFileSync('styles.css', css);
}

// Patch script.js
let js = fs.readFileSync('script.js', 'utf8');
if (!js.includes("document.getElementById('split-resizer')")) {
    const dragLogic = `
// Split View Drag Logic
const resizer = document.getElementById('split-resizer');
const controlPanel = document.querySelector('.control-panel');

if (resizer && controlPanel) {
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    // Load saved width
    const savedLeftWidth = localStorage.getItem('calcLeftPanelWidth');
    if (savedLeftWidth) {
        controlPanel.style.setProperty('--left-flex', \`0 0 \${savedLeftWidth}px\`);
    } else {
        // Emulate 1fr / 1.2fr ratio
        controlPanel.style.setProperty('--left-flex', \`0 0 45.45%\`);
    }

    resizer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startWidth = controlPanel.getBoundingClientRect().width;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        let newWidth = startWidth + dx;
        
        // Enforce left panel min width
        if (newWidth < 235) newWidth = 235;

        // Enforce right panel min width (281px)
        const splitView = document.querySelector('.split-view');
        const splitViewWidth = splitView.getBoundingClientRect().width;
        const resizerWidth = resizer.getBoundingClientRect().width;
        
        const maxLeftWidth = splitViewWidth - resizerWidth - 281;
        if (newWidth > maxLeftWidth) newWidth = maxLeftWidth;

        controlPanel.style.setProperty('--left-flex', \`0 0 \${newWidth}px\`);
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            // Save width
            const finalWidth = controlPanel.getBoundingClientRect().width;
            localStorage.setItem('calcLeftPanelWidth', finalWidth);
        }
    });
}
`;
    fs.writeFileSync('script.js', js + dragLogic);
}
console.log('Patched Successfully');
