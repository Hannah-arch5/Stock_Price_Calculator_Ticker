const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/transition:\s*background-color\s+var\(--transition,\s*0\.3s\),\s*padding-left\s+var\(--transition,\s*0\.3s\);/g, 
                  'transition: background-color var(--transition-fast), padding-left var(--transition-slow);');

css = css.replace(/transition:\s*opacity\s+var\(--transition-fast\)\s+cubic-bezier\(0\.2,\s*0\.8,\s*0\.2,\s*1\),\s*padding-left\s+var\(--transition,\s*0\.3s\);/g, 
                  'transition: opacity var(--transition-fast) cubic-bezier(0.2, 0.8, 0.2, 1), padding-left var(--transition-slow);');

css = css.replace(/transition:\s*background-color\s+var\(--transition,\s*0\.3s\);/g,
                  'transition: background-color var(--transition-fast);');

fs.writeFileSync('styles.css', css);
console.log('Fixed transitions');
