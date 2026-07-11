const fs = require('fs');
let js = fs.readFileSync('main_script.js', 'utf8');

const targetStr = `        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.classList.add('active');
        }`;

const replacementStr = `        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.classList.add('active');
            
            // Re-trigger animations for elements inside the newly active tab
            const animatedElements = targetContent.querySelectorAll('.animate-stagger-row, .zotero-collections-list, .zotero-resizer, .search-container, .search-bar, .memo-container');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                el.offsetHeight; // trigger reflow
                el.style.animation = null; 
            });
        }`;

if(js.includes(targetStr)) {
    js = js.replace(targetStr, replacementStr);
    fs.writeFileSync('main_script.js', js);
    console.log('Fixed tab animations in main_script.js');
} else {
    console.log('Could not find target string in main_script.js');
}
