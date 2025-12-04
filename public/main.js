import { StateManager } from './core/state.js';
import { UIManager } from './ui/events.js';
import { LayoutManager } from './ui/layout.js';
import { BamlRuntime } from './core/runtime.js';

async function init() {
    console.log('SheetMetal core online');

    const state = new StateManager();
    
    // Runtime writes output via callback.
    // We defer the UI reference because it's not created yet.
    let uiRef = null;
    const runtime = new BamlRuntime((text, type) => {
        if (uiRef) uiRef.appendOutput(text, type);
        else console.log(text);
    });
    
    const layout = new LayoutManager();
    const ui = new UIManager(state, runtime, layout);
    uiRef = ui; // Link runtime callback

    // Initialize Sequence
    state.init();
    ui.init(); // Binds events, layout, initial render
}

init().catch(console.error);
