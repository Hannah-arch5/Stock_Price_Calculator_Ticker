const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Restore the ::before logic
const targetStr = `.list-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: opacity var(--transition-fast) cubic-bezier(0.2, 0.8, 0.2, 1), padding-left var(--transition, 0.3s), background-color var(--transition, 0.3s);
}

.list-row:hover {
  background-color: #111;
  padding-left: 1rem;
}

.list-row.highlighted {
  background-color: #2a2a2a;
}

.list-row.highlighted::after {
  content: '';
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 0;
  width: 2px;
  background-color: var(--fg);
  border-radius: 2px;
}`;

const newCss = `.list-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: opacity var(--transition-fast) cubic-bezier(0.2, 0.8, 0.2, 1), padding-left var(--transition, 0.3s);
}

.list-row:hover {
  padding-left: 1rem;
}

.list-row::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -0.75rem;
  right: -0.75rem;
  background-color: transparent;
  z-index: -1;
  transition: background-color var(--transition, 0.3s);
}

.list-row:hover::before {
  background-color: #111;
}

.list-row.highlighted::before {
  background-color: #2a2a2a;
}

.list-row.highlighted::after {
  content: '';
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: -0.75rem;
  width: 2px;
  background-color: var(--fg);
  border-radius: 2px;
}`;

css = css.replace(targetStr, newCss);

// Also restore light theme styles
const lightTarget = `body.light-theme .list-row:hover { background-color: #f5f5f5; }
body.light-theme .list-row.highlighted { background-color: #ebebeb; }`;

const lightNew = `body.light-theme .list-row:hover::before { background-color: #f5f5f5; }
body.light-theme .list-row.highlighted::before { background-color: #ebebeb; }`;

css = css.replace(lightTarget, lightNew);

fs.writeFileSync('styles.css', css);
console.log('Restored list-row ::before');
