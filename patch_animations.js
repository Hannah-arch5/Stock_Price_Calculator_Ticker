const fs = require('fs');
let js = fs.readFileSync('main_script.js', 'utf8');

// 1. Define the replayAllAnimations function at the top level
const funcDef = `\nfunction replayAllAnimations() {
    document.body.classList.add('disable-animations');
    document.body.offsetHeight; // trigger reflow
    document.body.classList.remove('disable-animations');
}\n`;

if (!js.includes('function replayAllAnimations')) {
    js = funcDef + js;
}

// 2. Add replayAllAnimations() to Screener toggles
const screenerTarget = `            document.body.classList.add('screener-active');
            navItemsScreener.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');`;
const screenerRep = `            document.body.classList.add('screener-active');
            navItemsScreener.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
            replayAllAnimations();`;
if (js.includes(screenerTarget)) { js = js.replace(screenerTarget, screenerRep); }

const insightsTarget = `            document.body.classList.remove('screener-active');
            navItemsScreener.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');`;
const insightsRep = `            document.body.classList.remove('screener-active');
            navItemsScreener.forEach(n => n.classList.remove('active'));
            e.target.classList.add('active');
            replayAllAnimations();`;
if (js.includes(insightsTarget)) { js = js.replace(insightsTarget, insightsRep); }

// 3. Add to Research tabs
const researchTarget = `            // Re-trigger animations for elements inside the newly active tab
            const animatedElements = targetContent.querySelectorAll('.animate-stagger-row, .zotero-collections-list, .zotero-resizer, .search-container, .search-bar, .memo-container');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                el.offsetHeight; // trigger reflow
                el.style.animation = null; 
            });`;
const researchRep = `            replayAllAnimations();`;
if (js.includes(researchTarget)) { js = js.replace(researchTarget, researchRep); }

fs.writeFileSync('main_script.js', js);
console.log('Patched JS to replay animations');
