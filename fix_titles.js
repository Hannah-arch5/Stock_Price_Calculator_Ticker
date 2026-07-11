const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newStyle = 'font-size: 6vw; font-weight: 900; letter-spacing: -0.04em; line-height: 0.9; text-transform: uppercase; margin-bottom: 2rem;';

const screenerOld = 'style="font-size: 5vw; font-weight: 900; margin-bottom: 2rem; line-height: 0.9; text-transform: uppercase;">Market<br>Screener</h1>';
const screenerNew = 'style="' + newStyle + '">Market<br>Screener</h1>';

const reverseOld = 'style="font-size: clamp(32px, 6vw, 64px); font-weight: 900; letter-spacing: -0.04em; line-height: 0.9; text-transform: uppercase; margin-bottom: 2rem;">Reverse<br/>Engineer</h1>';
const reverseNew = 'style="' + newStyle + '">Reverse<br/>Engineer</h1>';

html = html.replace(screenerOld, screenerNew);
html = html.replace(reverseOld, reverseNew);

fs.writeFileSync('index.html', html);
console.log('Fixed titles');
