const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(
`.control-panel .section-title, 
.ledger-panel .panel-header, 
.research-header, 
.masthead h1 {
  animation: slideUpSlow 1s ease-out forwards;`,
`.control-panel .section-title, 
.ledger-panel .panel-header, 
.research-header {
  animation: slideUpSlow 1s ease-out forwards;`
);

css = css.replace(
`.masthead .nav-links,
.research-tabs, 
#zotero-header-controls {
  animation: fadeFast 0.6s ease-out forwards;`,
`.research-tabs, 
#zotero-header-controls {
  animation: fadeFast 0.6s ease-out forwards;`
);

fs.writeFileSync('styles.css', css);
console.log('Removed masthead animations');
