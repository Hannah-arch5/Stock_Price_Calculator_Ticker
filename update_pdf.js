const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldPdf = `<div class="research-content-area hidden" id="pdf-view" style="flex-direction: column;">
                            <div class="pdf-header">
                                <span class="mono" id="pdf-title" style="color: var(--fg-dim); font-size: 0.8rem; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></span>
                                <button class="btn-minimal" id="close-pdf-btn">Close PDF</button>
                            </div>
                            <div class="pdf-container" id="pdf-container"></div>
                        </div>`;

const newPdf = `<div class="research-content-area hidden" id="pdf-view" style="flex-direction: column;">
                            <div class="pdf-header">
                                <span class="mono" id="pdf-title" style="color: var(--fg-dim); font-size: 0.8rem; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">No PDF Loaded</span>
                                <button class="btn-minimal" id="close-pdf-btn">Close PDF</button>
                            </div>
                            <div class="pdf-container" id="pdf-container">
                                <div style="display: flex; height: 100%; align-items: center; justify-content: center; color: var(--fg-dim);" class="mono">
                                    Double click a paper in Zotero to open its PDF here.
                                </div>
                            </div>
                        </div>`;

html = html.replace(oldPdf, newPdf);
fs.writeFileSync('index.html', html);
console.log('Updated PDF view placeholder');
