const fs = require('fs');
let js = fs.readFileSync('main_script.js', 'utf8');

const dragDropJS = `
// === Drag and Drop Tabs ===
const tabsContainer = document.querySelector('.research-tabs');
let draggedTab = null;

function setupDragAndDrop() {
    const tabs = document.querySelectorAll('.research-tab');
    tabs.forEach(tab => {
        tab.setAttribute('draggable', true);
        
        // Remove old listeners if any by cloning (not really needed if we only run once, but safe)
        
        tab.addEventListener('dragstart', function(e) {
            draggedTab = this;
            setTimeout(() => this.style.opacity = '0.5', 0);
        });
        
        tab.addEventListener('dragend', function() {
            draggedTab = null;
            this.style.opacity = '1';
        });
        
        tab.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        tab.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(1.05)';
        });
        
        tab.addEventListener('dragleave', function() {
            this.style.transform = '';
        });
        
        tab.addEventListener('drop', function(e) {
            this.style.transform = '';
            if (draggedTab && draggedTab !== this) {
                const allTabs = [...tabsContainer.querySelectorAll('.research-tab')];
                const draggedIdx = allTabs.indexOf(draggedTab);
                const droppedIdx = allTabs.indexOf(this);
                
                if (draggedIdx < droppedIdx) {
                    this.parentNode.insertBefore(draggedTab, this.nextSibling);
                } else {
                    this.parentNode.insertBefore(draggedTab, this);
                }
            }
        });
    });
}
setupDragAndDrop();
`;

if (!js.includes('setupDragAndDrop')) {
    js += dragDropJS;
    fs.writeFileSync('main_script.js', js);
    console.log('Added drag and drop logic');
}
