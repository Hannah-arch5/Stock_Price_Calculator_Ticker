const fs = require('fs');
let js = fs.readFileSync('main_script.js', 'utf8');

const targetStr = `        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.classList.add('active');
            
            targetContent.classList.add('disable-animations');
            targetContent.offsetHeight; // trigger reflow
            targetContent.classList.remove('disable-animations');
        }`;

const newTargetStr = `        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.classList.add('active');
            
            targetContent.classList.add('disable-animations');
            targetContent.offsetHeight; // trigger reflow
            targetContent.classList.remove('disable-animations');
            
            if (targetId === 'domestic-view') {
                fetchDomesticMacroNews();
            }
        }`;

if (js.includes(targetStr)) {
    js = js.replace(targetStr, newTargetStr);
    fs.writeFileSync('main_script.js', js);
    console.log('Fixed tab switch to call fetchDomesticMacroNews');
}
