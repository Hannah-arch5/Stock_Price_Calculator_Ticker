let notebookData = [];
let activeNoteId = null;
let draggedItemInfo = null; // { id, type }

function generateId() { return 'id-' + Math.random().toString(36).substr(2, 9); }

function loadNotebookData() {
    try {
        const data = localStorage.getItem('geminiNotebooksData');
        if (data) {
            notebookData = JSON.parse(data);
        } else {
            // Default mock data
            notebookData = [
                {
                    id: generateId(),
                    type: 'folder',
                    title: 'My Notes',
                    isOpen: true,
                    children: [
                        { id: generateId(), type: 'note', title: 'Default Note', content: 'Welcome to your notebook!' }
                    ]
                }
            ];
            saveNotebookData();
        }
    } catch (e) {
        console.error("Failed to load notebook data:", e);
    }
}

function saveNotebookData() {
    localStorage.setItem('geminiNotebooksData', JSON.stringify(notebookData));
}

function findNodeInfo(nodes, id, parentList = null, index = -1) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) return { node: nodes[i], parentList: parentList || nodes, index: i };
        if (nodes[i].children) {
            const res = findNodeInfo(nodes[i].children, id, nodes[i].children);
            if (res) return res;
        }
    }
    return null;
}

function inlineEdit(el, defaultText, placeholder, onComplete) {
    const span = el.querySelector('span.node-title');
    if (!span) return;
    
    span.style.display = 'none';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultText;
    input.placeholder = placeholder;
    input.className = 'input-minimal';
    input.style.width = '140px';
    input.style.marginLeft = '4px';
    input.style.fontFamily = "'JetBrains Mono', monospace";
    input.style.fontSize = '0.75rem';
    input.style.padding = '0px 4px';
    input.style.color = 'var(--fg)';
    input.style.background = 'transparent';
    input.style.border = '1px solid var(--accent)';
    input.style.borderRadius = '3px';
    input.style.outline = 'none';
    
    // Prevent dragstart
    input.addEventListener('mousedown', e => e.stopPropagation());
    input.addEventListener('click', e => e.stopPropagation());
    input.addEventListener('dblclick', e => e.stopPropagation());
    
    el.insertBefore(input, span);
    
    input.focus();
    input.select();
    
    let finished = false;
    const finish = (save) => {
        if (finished) return;
        finished = true;
        const val = input.value.trim();
        input.remove();
        span.style.display = '';
        if (save && val) {
            onComplete(val);
        } else {
            onComplete(null);
        }
    };
    
    input.addEventListener('blur', () => finish(true));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finish(true);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            finish(false);
        }
    });
}

const notebookTreeContainer = document.getElementById('notebook-tree-container');
const notebookEl = document.getElementById('chat-notebook');

function renderNotebookTree() {
    if (!notebookTreeContainer) return;
    notebookTreeContainer.innerHTML = '';
    
    // Add a root-level "+" button
    const rootHeader = document.createElement('div');
    rootHeader.style.display = 'flex';
    rootHeader.style.justifyContent = 'space-between';
    rootHeader.style.alignItems = 'center';
    rootHeader.style.padding = '0.35rem 0.5rem';
    rootHeader.style.color = 'var(--fg-dim)';
    rootHeader.style.fontSize = '0.75rem';
    rootHeader.style.fontFamily = "'JetBrains Mono', monospace";
    rootHeader.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    rootHeader.style.marginBottom = '5px';
    
    const rootTitle = document.createElement('span');
    rootTitle.innerText = 'WORKSPACE';
    
    const rootAddBtn = document.createElement('span');
    rootAddBtn.innerText = '+';
    rootAddBtn.style.cursor = 'pointer';
    rootAddBtn.title = 'New Root Folder';
    rootAddBtn.addEventListener('mouseenter', () => rootAddBtn.style.color = 'var(--fg)');
    rootAddBtn.addEventListener('mouseleave', () => rootAddBtn.style.color = 'var(--fg-dim)');
    rootAddBtn.addEventListener('click', () => {
        notebookData.push({ id: generateId(), type: 'folder', title: 'New Folder', isOpen: true, children: [], isEditing: true });
        renderNotebookTree();
    });
    
    rootHeader.appendChild(rootTitle);
    rootHeader.appendChild(rootAddBtn);
    notebookTreeContainer.appendChild(rootHeader);

    function buildDom(nodes, container, isRoot) {
        // Enforce alphabetical order
        nodes.sort((a, b) => a.title.localeCompare(b.title));
        
        nodes.forEach(node => {
            const wrapper = document.createElement('div');
            const el = document.createElement('div');
            el.className = `zotero-collection-item ${node.id === activeNoteId ? 'active' : ''}`;
            
            el.draggable = true;
            el.dataset.id = node.id;
            
            const hasChildren = node.type === 'folder';
            let toggleHtml = '<div class="zotero-collection-toggle" style="width: 20px;"></div>';
            if (hasChildren) {
                toggleHtml = `<div class="zotero-collection-toggle" style="width: 20px; font-size: 0.6rem;">${node.isOpen ? '▼' : '▶'}</div>`;
            } else if (!isRoot && !hasChildren) {
                toggleHtml = '<div class="zotero-collection-toggle" style="width: 20px;"></div>';
            }
            
            el.innerHTML = `${toggleHtml}<span class="node-title">${node.title.toUpperCase()}</span>`;
            
            // Inline actions container
            const actionsDiv = document.createElement('div');
            actionsDiv.style.marginLeft = 'auto';
            actionsDiv.style.display = 'none';
            actionsDiv.style.gap = '8px';
            actionsDiv.style.alignItems = 'center';
            actionsDiv.style.paddingLeft = '10px';

            if (node.type === 'folder') {
                const addBtn = document.createElement('span');
                addBtn.innerText = '+';
                addBtn.style.cursor = 'pointer';
                addBtn.style.color = 'var(--fg-dim)';
                addBtn.title = 'Add Subfolder';
                addBtn.addEventListener('mouseenter', () => addBtn.style.color = 'var(--fg)');
                addBtn.addEventListener('mouseleave', () => addBtn.style.color = 'var(--fg-dim)');
                addBtn.addEventListener('mousedown', (e) => e.stopPropagation()); // Prevent dragstart
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!node.children) node.children = [];
                    node.children.push({ id: generateId(), type: 'folder', title: 'New Folder', isOpen: true, children: [], isEditing: true });
                    node.isOpen = true;
                    renderNotebookTree();
                });
                actionsDiv.appendChild(addBtn);
            }

            const delBtn = document.createElement('span');
            delBtn.innerText = '×';
            delBtn.style.cursor = 'pointer';
            delBtn.style.color = 'var(--fg-dim)';
            delBtn.title = 'Delete';
            let deleteConfirmTimeout;
            delBtn.addEventListener('mouseenter', () => { if (delBtn.innerText === '×') delBtn.style.color = '#ff6b6b'; });
            delBtn.addEventListener('mouseleave', () => { if (delBtn.innerText === '×') delBtn.style.color = 'var(--fg-dim)'; });
            delBtn.addEventListener('mousedown', (e) => e.stopPropagation()); // Prevent dragstart
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (delBtn.innerText === '×') {
                    delBtn.innerText = 'Sure?';
                    delBtn.style.color = '#ff6b6b';
                    deleteConfirmTimeout = setTimeout(() => {
                        delBtn.innerText = '×';
                        delBtn.style.color = 'var(--fg-dim)';
                    }, 3000);
                } else {
                    clearTimeout(deleteConfirmTimeout);
                    const info = findNodeInfo(notebookData, node.id);
                    if (info) {
                        info.parentList.splice(info.index, 1);
                        if (activeNoteId === node.id) {
                            activeNoteId = null;
                            if (notebookEl) notebookEl.value = '';
                        }
                        saveNotebookData();
                        renderNotebookTree();
                    }
                }
            });
            actionsDiv.appendChild(delBtn);

            el.appendChild(actionsDiv);

            el.addEventListener('mouseenter', () => actionsDiv.style.display = 'flex');
            el.addEventListener('mouseleave', () => actionsDiv.style.display = 'none');
            
            wrapper.appendChild(el);
            
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'zotero-collection-children';
            if (node.isOpen) childrenContainer.classList.add('expanded');
            
            if (hasChildren) {
                const toggleBtn = el.querySelector('.zotero-collection-toggle');
                if (toggleBtn) {
                    toggleBtn.addEventListener('mousedown', (e) => e.stopPropagation());
                    toggleBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        node.isOpen = !node.isOpen;
                        saveNotebookData();
                        renderNotebookTree();
                    });
                }
                
                if (node.children) {
                    buildDom(node.children, childrenContainer, false);
                }
                wrapper.appendChild(childrenContainer);
            }
            
            // Click logic: select node
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                activeNoteId = node.id;
                if (node.type === 'note' && notebookEl) {
                    notebookEl.value = node.content || '';
                }
                
                // Update active class only within Notebook Tree
                if (notebookTreeContainer) {
                    notebookTreeContainer.querySelectorAll('.zotero-collection-item').forEach(i => i.classList.remove('active'));
                }
                el.classList.add('active');
            });

            // Double click to rename
            el.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                inlineEdit(el, node.title, 'Rename', (newTitle) => {
                    if (newTitle) {
                        node.title = newTitle;
                        saveNotebookData();
                        renderNotebookTree();
                    }
                });
            });
            
            // Drag and Drop
            el.addEventListener('dragstart', (e) => {
                draggedItemInfo = { id: node.id, type: node.type };
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => el.style.opacity = '0.5', 0);
            });
            
            el.addEventListener('dragend', () => {
                el.style.opacity = '1';
                draggedItemInfo = null;
            });
            
            el.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                el.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            
            el.addEventListener('dragleave', () => {
                el.style.backgroundColor = '';
            });
            
            el.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                el.style.backgroundColor = '';
                
                if (!draggedItemInfo || draggedItemInfo.id === node.id) return;
                
                const sourceInfo = findNodeInfo(notebookData, draggedItemInfo.id);
                if (!sourceInfo) return;
                
                sourceInfo.parentList.splice(sourceInfo.index, 1);
                
                if (node.type === 'folder') {
                    if (!node.children) node.children = [];
                    node.children.push(sourceInfo.node);
                    node.isOpen = true; 
                } else {
                    const targetInfo = findNodeInfo(notebookData, node.id);
                    if (targetInfo) {
                        targetInfo.parentList.splice(targetInfo.index + 1, 0, sourceInfo.node);
                    }
                }
                
                saveNotebookData();
                renderNotebookTree();
            });

            container.appendChild(wrapper);
            
            // If it's a newly created node, trigger inline edit instantly
            if (node.isEditing) {
                setTimeout(() => {
                    inlineEdit(el, '', 'Enter name...', (newTitle) => {
                        delete node.isEditing;
                        if (newTitle) {
                            node.title = newTitle;
                            saveNotebookData();
                            renderNotebookTree();
                        } else {
                            // Cancelled creation
                            const info = findNodeInfo(notebookData, node.id);
                            if (info) info.parentList.splice(info.index, 1);
                            renderNotebookTree();
                        }
                    });
                }, 0);
            }
        });
    }
    
    buildDom(notebookData, notebookTreeContainer, true);
}

// Initial setup
loadNotebookData();
renderNotebookTree();

// Resizer logic
const nbResizer = document.getElementById('notebook-resizer');
let isNbResizing = false;
if (nbResizer && notebookTreeContainer) {
    nbResizer.addEventListener('mousedown', (e) => { 
        e.preventDefault();
        isNbResizing = true; 
        document.body.style.cursor = 'col-resize';
    });
    document.addEventListener('mousemove', (e) => {
        if (!isNbResizing) return;
        const containerRect = document.getElementById('gemini-view').getBoundingClientRect();
        let newWidth = e.clientX - containerRect.left;
        if (newWidth < 120) newWidth = 120;
        if (newWidth > 600) newWidth = 600;
        notebookTreeContainer.style.flex = `0 0 ${newWidth}px`;
    });
    document.addEventListener('mouseup', () => { 
        if (isNbResizing) {
            isNbResizing = false; 
            document.body.style.cursor = '';
        }
    });
}

// Vertical Resizer logic
const nbVResizer = document.getElementById('notebook-v-resizer');
const nbSection = document.getElementById('notebook-section');
let isNbVResizing = false;
if (nbVResizer && nbSection) {
    nbVResizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isNbVResizing = true;
        document.body.style.cursor = 'row-resize';
    });
    document.addEventListener('mousemove', (e) => {
        if (!isNbVResizing) return;
        const containerRect = document.getElementById('gemini-view').getBoundingClientRect();
        let newHeight = e.clientY - containerRect.top;
        if (newHeight < 100) newHeight = 100;
        // Don't let it exceed 80% of window height
        const maxHeight = window.innerHeight * 0.8;
        if (newHeight > maxHeight) newHeight = maxHeight;
        nbSection.style.flex = `0 0 ${newHeight}px`;
    });
    document.addEventListener('mouseup', () => {
        if (isNbVResizing) {
            isNbVResizing = false;
            document.body.style.cursor = '';
        }
    });
}

// Buttons
document.getElementById('notebook-save-btn')?.addEventListener('click', (e) => {
    const btn = e.target;
    if (!notebookEl) return;
    if (!notebookEl.value.trim()) {
        const originalText = btn.innerText;
        btn.innerText = "DRAFT IS EMPTY!";
        btn.style.color = "#ff6b6b";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.color = "var(--accent)";
        }, 2000);
        return;
    }
    
    const newNote = { id: generateId(), type: 'note', title: 'New Note', content: notebookEl.value, isEditing: true };
    
    // Put inside the first folder we find, or root
    let added = false;
    for (let node of notebookData) {
        if (node.type === 'folder') {
            if (!node.children) node.children = [];
            node.children.push(newNote);
            node.isOpen = true;
            added = true;
            break;
        }
    }
    if (!added) {
        notebookData.push(newNote);
    }
    
    activeNoteId = newNote.id;
    renderNotebookTree();
});

// Autosave active note
if (notebookEl) {
    notebookEl.addEventListener('input', () => {
        if (activeNoteId) {
            const info = findNodeInfo(notebookData, activeNoteId);
            if (info && info.node.type === 'note') {
                info.node.content = notebookEl.value;
                saveNotebookData();
            }
        }
    });
}
