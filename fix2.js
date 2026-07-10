const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');
css = css.replace(/flex: var\(--research-flex, 1 1 300px\);/, 'flex: 1 1 auto;');
css = css.replace(/flex: var\(--research-flex, 1 1 350px\);/, 'flex: 1 1 auto;');
fs.writeFileSync('styles.css', css);

let js = fs.readFileSync('script.js', 'utf8');

// Replace handleMediaQuery to be extremely simple
const newMQL = `
function handleMediaQuery(e) {
    if (e.matches) {
        let savedMiddle = localStorage.getItem('calcMiddlePanelWidth');
        if (!savedMiddle) {
            savedMiddle = '600px'; 
        } else {
            savedMiddle = savedMiddle + 'px';
        }
        ledgerPanel.style.setProperty('--middle-width', savedMiddle);
    }
}
`;
js = js.replace(/function handleMediaQuery[\s\S]*?\}\n\}/, newMQL.trim());

// Remove research-flex initialization
js = js.replace(/const savedResearchWidth = localStorage.getItem\('calcResearchPanelWidth'\);\n\s+if \(savedResearchWidth\) \{\n\s+researchPanel.style.setProperty\('--research-flex', `0 0 \$\{savedResearchWidth\}px`\);\n\s+\} else \{\n\s+researchPanel.style.setProperty\('--research-flex', `0 0 350px`\);\n\s+\}/, '');

fs.writeFileSync('script.js', js);
