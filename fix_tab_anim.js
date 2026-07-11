const fs = require('fs');
let js = fs.readFileSync('main_script.js', 'utf8');

const oldTarget = `        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.classList.add('active');
            
            replayAllAnimations();
        }`;

const newTarget = `        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.classList.add('active');
            
            targetContent.classList.add('disable-animations');
            targetContent.offsetHeight; // trigger reflow
            targetContent.classList.remove('disable-animations');
        }`;

if (js.includes(oldTarget)) {
    js = js.replace(oldTarget, newTarget);
    fs.writeFileSync('main_script.js', js);
    console.log('Fixed targetContent animation replay');
} else {
    console.log('Could not find target block in main_script.js');
}
