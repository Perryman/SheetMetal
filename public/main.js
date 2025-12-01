const vfs = new Map();
vfs.set('/main.baml', '// main.baml structure');

const ui = {
    fileList: document.getElementById('file-list'),
    editor: document.getElementById('editor'),
    output: document.getElementById('output'),
    runBtn: document.getElementById('run-btn')
};

let activeFile = '/main.baml';

function renderFileList() {
    ui.fileList.innerHTML = '';
    for (const filename of vfs.keys()) {
        const div = document.createElement('div');
        div.textContent = filename;
        div.style.cursor = 'pointer';
        div.style.fontWeight = filename === activeFile ? 'bold' : 'normal';
        div.onclick = () => openFile(filename);
        ui.fileList.appendChild(div);
    }
}

function openFile(filename) {
    activeFile = filename;
    ui.editor.value = vfs.get(filename) || '';
    renderFileList();
}

function run() {
    if (activeFile) {
        const content = vfs.get(activeFile);
        ui.output.textContent = content;
    }
}

function init() {
    console.log('SheetMetal core online');
    
    // Setup editor listener
    ui.editor.addEventListener('input', (e) => {
        if (activeFile) {
            vfs.set(activeFile, e.target.value);
        }
    });

    // Setup run listener
    ui.runBtn.addEventListener('click', run);

    // Initial render
    openFile(activeFile);
}

init();