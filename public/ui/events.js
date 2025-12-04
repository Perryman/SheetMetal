import { get, on, create, clear } from './dom.js';
import { showToast, syntaxHighlight } from '../lib/utils.js';

/**
 * Event & View Manager
 * Binds UI events to State actions and renders the view.
 */
export class UIManager {
    constructor(state, runtime, layout) {
        this.state = state;
        this.runtime = runtime;
        this.layout = layout;
        
        // Cache elements
        this.els = {
            settingsToggle: get('settings-toggle'),
            themeToggle: get('theme-toggle'),
            settingsPanel: get('settings-panel'),
            
            fileList: get('file-list'),
            addFileBtn: get('add-file-btn'),
            newFileInputContainer: get('new-file-input-container'),
            newFileInput: get('new-file-input'),
            editor: get('editor'),
            
            output: get('output'),
            clearOutputBtn: get('clear-output-btn'),
            runBtn: get('run-btn'),
            
            // Settings
            apiKeyInput: get('api-key-input'),
            apiKeyStatus: get('api-key-status'),
            apiKeyClear: get('api-key-clear'),
            modelInput: get('model-input'),
            modelList: get('model-list'),
            modelStatus: get('model-status'),
            freeOnlyCheckbox: get('free-only-checkbox'),
            
            sheetsToggle: get('sheets-enable-toggle'),
            sheetsConfig: get('sheets-config'),
            sheetsKeyInput: get('sheets-key-input'),
            sheetsKeyStatus: get('sheets-key-status'),
            sheetsKeyClear: get('sheets-key-clear'),
            sheetUrlInput: get('sheet-url-input'),
            sheetUrlStatus: get('sheet-url-status'),
            sheetUrlClear: get('sheet-url-clear'),
            
            resetFilesBtn: get('reset-files-btn'),
            clearAllBtn: get('clear-all-btn'),
        };

        this.state.subscribe((e, d) => this.handleState(e, d));
    }

    init() {
        this.bindGlobalEvents();
        this.bindSettingsEvents();
        this.bindFileEvents();
        
        this.layout.init();
        this.renderFileList();
        this.renderSettings(); // Initial state
        
        // Init editor
        const content = this.state.getFileContent(this.state.activeFile);
        this.els.editor.value = content || '';
        
        this.state.fetchModels();
    }

    handleState(event, data) {
        switch(event) {
            case 'activeFileChanged':
                this.renderFileList();
                this.els.editor.value = this.state.getFileContent(data) || '';
                break;
            case 'fileCreated':
            case 'fileDeleted':
                this.renderFileList();
                break;
            case 'themeChanged':
                this.updateThemeIcon(data);
                break;
            case 'settingChanged':
                this.renderSettings();
                break;
            case 'modelsLoaded':
                this.populateModelList();
                break;
        }
    }

    // --- Rendering ---

    updateThemeIcon(mode) {
        const icon = this.els.themeToggle.querySelector('.icon');
        if (mode === 'system') icon.textContent = '◐';
        else if (mode === 'dark') icon.textContent = '☾';
        else icon.textContent = '☀';
    }

    updateStatus(input, indicator) {
        if (input.value && input.value.trim().length > 0) {
            indicator.classList.add('active');
            indicator.textContent = '●';
            indicator.title = "Saved";
        } else {
            indicator.classList.remove('active');
            indicator.textContent = '●';
            indicator.title = "Empty";
        }
    }

    renderSettings() {
        const s = this.state;
        const e = this.els;

        // Sync inputs with state if empty (initial load)
        if (!e.apiKeyInput.value) e.apiKeyInput.value = s.getSetting("openrouter_api_key") || '';
        this.updateStatus(e.apiKeyInput, e.apiKeyStatus);

        if (!e.modelInput.value) e.modelInput.value = s.getSetting("openrouter_model") || '';
        this.updateStatus(e.modelInput, e.modelStatus);

        const savedFreeOnly = s.getSetting("openrouter_free_only");
        if (savedFreeOnly !== null) e.freeOnlyCheckbox.checked = savedFreeOnly === 'true';

        const sheetsEnabled = s.getSetting("sheets_enabled") === 'true';
        e.sheetsToggle.checked = sheetsEnabled;
        e.sheetsConfig.classList.toggle('hidden', !sheetsEnabled);

        if (!e.sheetsKeyInput.value) e.sheetsKeyInput.value = s.getSetting("sheets_api_key") || '';
        this.updateStatus(e.sheetsKeyInput, e.sheetsKeyStatus);

        if (!e.sheetUrlInput.value) e.sheetUrlInput.value = s.getSetting("sheets_url") || '';
        this.updateStatus(e.sheetUrlInput, e.sheetUrlStatus);

        // Panel Visibility
        const panelOpen = s.getSetting("settings_panel_open");
        const hasKey = !!s.getSetting("openrouter_api_key");
        if (!hasKey || panelOpen === 'true') {
            e.settingsPanel.classList.remove('hidden');
            e.settingsToggle.classList.add('active');
        }
    }

    populateModelList() {
        const freeOnly = this.els.freeOnlyCheckbox.checked;
        const models = this.state.getFilteredModels(freeOnly);
        clear(this.els.modelList);
        
        models.forEach(m => {
            const opt = create('option');
            opt.value = m.id;
            opt.label = m.free ? "(free)" : ""; 
            this.els.modelList.appendChild(opt);
        });
    }

    renderFileList() {
        clear(this.els.fileList);
        const files = this.state.getFileKeys();
        const active = this.state.activeFile;

        for (const filename of files) {
            const div = create('div');
            if (filename === active) div.classList.add('active');
            
            const span = create('span', '', filename);
            div.appendChild(span);
            
            if (filename !== '/main.baml') {
                const delBtn = create('button', 'delete-file-btn', '✕');
                delBtn.title = 'Delete File';
                on(delBtn, 'click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${filename}?`)) {
                        this.state.deleteFile(filename);
                    }
                });
                div.appendChild(delBtn);
            }
            
            on(div, 'click', () => this.state.setActiveFile(filename));
            this.els.fileList.appendChild(div);
        }
    }

    appendOutput(text, type = 'text') {
        if (type === 'json') {
            // We append a new div for the JSON block to keep it structure
            const div = create('div');
            div.innerHTML = syntaxHighlight(text);
            this.els.output.appendChild(div);
        } else {
            // Append text node for safety and preserving existing behavior
            this.els.output.appendChild(document.createTextNode(text));
        }
        // Auto-scroll
        this.els.output.scrollTop = this.els.output.scrollHeight;
    }

    // --- Bindings ---

    bindGlobalEvents() {
        on(this.els.settingsToggle, 'click', () => {
            const isHidden = this.els.settingsPanel.classList.toggle('hidden');
            this.els.settingsToggle.classList.toggle('active', !isHidden);
            this.state.saveSetting("settings_panel_open", !isHidden);
        });

        on(this.els.themeToggle, 'click', () => this.state.cycleTheme());
    }

    bindSettingsEvents() {
        const s = this.state;
        const e = this.els;

        on(e.apiKeyInput, 'input', () => s.saveSetting("openrouter_api_key", e.apiKeyInput.value));
        on(e.apiKeyClear, 'click', () => {
            if(confirm('Clear Key?')) { e.apiKeyInput.value = ''; s.saveSetting("openrouter_api_key", ''); }
        });

        on(e.modelInput, 'input', () => {
            const val = e.modelInput.value;
            s.saveSetting("openrouter_model", val);
            // Update editor content if needed (regex replace)
            const current = e.editor.value;
            const updated = current.replace(/model\s+\"[^\"]+\"/, `model "${val}"`);
            if (updated !== current) {
                s.updateFile(s.activeFile, updated);
                e.editor.value = updated;
            }
        });

        on(e.freeOnlyCheckbox, 'change', () => {
            s.saveSetting("openrouter_free_only", e.freeOnlyCheckbox.checked);
            this.populateModelList();
        });

        on(e.sheetsToggle, 'change', () => s.saveSetting("sheets_enabled", e.sheetsToggle.checked));
        
        on(e.sheetsKeyInput, 'input', () => s.saveSetting("sheets_api_key", e.sheetsKeyInput.value));
        on(e.sheetsKeyClear, 'click', () => { e.sheetsKeyInput.value = ''; s.saveSetting("sheets_api_key", ''); });

        on(e.sheetUrlInput, 'input', () => s.saveSetting("sheets_url", e.sheetUrlInput.value));
        on(e.sheetUrlClear, 'click', () => { e.sheetUrlInput.value = ''; s.saveSetting("sheets_url", ''); });

        on(e.resetFilesBtn, 'click', () => {
            if(confirm('Reset defaults?')) { s.vfs.clear(); s.init(); s.setActiveFile('/main.baml'); }
        });
        
        on(e.clearAllBtn, 'click', () => {
            if(confirm('Clear everything?')) { localStorage.clear(); location.reload(); }
        });
    }

    bindFileEvents() {
        const s = this.state;
        const e = this.els;

        on(e.editor, 'input', (ev) => {
            if (s.activeFile) s.updateFile(s.activeFile, ev.target.value);
        });

        on(e.addFileBtn, 'click', () => {
            e.newFileInputContainer.classList.remove('hidden');
            e.newFileInput.focus();
        });

        on(e.newFileInput, 'keydown', (ev) => {
            if (ev.key === 'Enter') {
                const name = e.newFileInput.value.trim();
                if (name) {
                    try {
                        const newName = s.createFile(name);
                        s.setActiveFile(newName);
                        e.newFileInput.value = '';
                        e.newFileInputContainer.classList.add('hidden');
                    } catch (err) { showToast(err.message, "error"); }
                }
            } else if (ev.key === 'Escape') {
                e.newFileInputContainer.classList.add('hidden');
                e.newFileInput.value = '';
            }
        });

        on(e.clearOutputBtn, 'click', () => e.output.textContent = '');

        on(e.runBtn, 'click', async () => {
            e.output.textContent = '';
            e.runBtn.disabled = true;
            e.runBtn.textContent = "Running...";
            try {
                const envVars = {
                    OPENROUTER_API_KEY: s.getSetting("openrouter_api_key"),
                    BOUNDARY_PROXY_URL: "https://fiddle-proxy.fly.dev"
                };
                await this.runtime.runTest(s.getFiles(), s.activeFile, envVars);
            } catch (err) {
                this.appendOutput("Error: " + err.message);
            } finally {
                e.runBtn.disabled = false;
                e.runBtn.textContent = "▶ Run";
            }
        });
    }
}
