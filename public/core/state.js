import { showToast } from '../lib/utils.js';

const DEFAULT_FILE_CONTENT = `client<llm> OpenRouter {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "kwaipilot/kat-coder-pro:free"
  }
}

class Analysis {
  sentiment "positive" | "neutral" | "negative"
  topics string[] @description("Key topics discussed")
}

function Analyze(text: string) -> Analysis {
  client OpenRouter
  prompt #"\n    Analyze this text:
    \"{{ text }}\"\n    \n    {{ ctx.output_format }}
  "#
}

test MyTest {
  functions [Analyze]
  args {
    text "I loved the new update, but the battery life is terrible now."
  }
}
`;

export class StateManager {
    /**
     * Centralized State Store
     * 
     * Architecture:
     * - Uses a simple Pub/Sub pattern (`subscribe`/`notify`) to decouple UI from data.
     * - Avoids heavy frameworks (Redux/Signals) to adhere to "Progressive Minimalism".
     * - VFS is currently an in-memory Map for simplicity, but the interface abstracts this
     *   so it can be swapped for IndexedDB or File System Access API later.
     * 
     * File Validation:
     * - Enforces strict alphanumeric naming to prevent path traversal and XSS risks.
     * - Rejects `..` and requires forward slashes for consistency.
     */
    constructor() {
        this.vfs = new Map();
        this.activeFile = '/main.baml';
        this.models = [];
        this.themeMode = 'dark';
        
        // Event listeners
        this.listeners = new Set();
    }

    init() {
        if (this.vfs.size === 0) {
            this.vfs.set('/main.baml', DEFAULT_FILE_CONTENT);
        }

        this.themeMode = localStorage.getItem('theme_mode') || 'dark';
        this.applyTheme(this.themeMode);
    }

    subscribe(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
    notify(e, d) { this.listeners.forEach(cb => cb(e, d)); }

    // --- VFS ---
    getFiles() { return Array.from(this.vfs.entries()); }
    getFileKeys() { return Array.from(this.vfs.keys()).sort(); }
    getFileContent(f) { return this.vfs.get(f); }
    
    setActiveFile(f) {
        if (this.vfs.has(f)) {
            this.activeFile = f;
            this.notify('activeFileChanged', f);
        }
    }

    createFile(name, content = '// New BAML file\n') {
        const clean = name.trim();
        if (!/^[a-zA-Z0-9._-]+$/.test(clean.replace(/^\//, ''))) throw new Error("Invalid characters.");
        const path = clean.startsWith('/') ? clean : '/' + clean;
        if (path.includes('..')) throw new Error("No directory traversal.");
        if (this.vfs.has(path)) throw new Error("Exists.");
        
        this.vfs.set(path, content);
        this.notify('fileCreated', path);
        return path;
    }

    updateFile(f, c) { if (this.vfs.has(f)) this.vfs.set(f, c); }
    
    deleteFile(f) {
        if (f === '/main.baml') return false;
        if (this.vfs.delete(f)) {
            this.notify('fileDeleted', f);
            if (this.activeFile === f) this.setActiveFile('/main.baml');
            return true;
        }
        return false;
    }

    // --- Settings & Secrets ---
    getSetting(key) {
        return localStorage.getItem(key);
    }

    saveSetting(key, val) {
        localStorage.setItem(key, val);
        this.notify('settingChanged', { key, val });
    }

    // --- Theme ---
    setTheme(mode) {
        this.themeMode = mode;
        localStorage.setItem('theme_mode', mode);
        this.applyTheme(mode);
        this.notify('themeChanged', mode);
    }

    cycleTheme() {
        const next = this.themeMode === 'system' ? 'dark' : (this.themeMode === 'dark' ? 'light' : 'system');
        this.setTheme(next);
    }

    applyTheme(mode) {
        const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.body.classList.toggle('dark-mode', dark);
        document.body.classList.toggle('light-mode', !dark);
    }

    // --- Models ---
    async fetchModels() {
        try {
            const res = await fetch("https://openrouter.ai/api/v1/models");
            const json = await res.json();
            this.models = json.data
                .map(m => ({
                    id: m.id,
                    name: m.name || m.id,
                    free: m.pricing && parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0
                }))
                .sort((a, b) => a.id.localeCompare(b.id));
            this.notify('modelsLoaded', this.models);
        } catch (e) { console.error(e); }
    }

    getFilteredModels(freeOnly) {
        return this.models.filter(m => freeOnly ? m.free : true);
    }
}