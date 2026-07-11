const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(
`.zotero-collections-list, 
.zotero-resizer,
.search-container, 
.search-bar, 
.memo-container {
  animation: slideUpFast 0.5s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
}`,
`.zotero-collections-list, 
.zotero-resizer,
.search-container, 
.search-bar, 
.memo-container {
  animation: fadeFast 0.6s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
}`
);

fs.writeFileSync('styles.css', css);
console.log('Fixed phase 3 animation in styles.css');
