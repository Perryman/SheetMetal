import initWasm, { 
    WasmProject, 
    WasmRuntime, 
    init_js_callback_bridge 
} from "./vendor/baml/baml_schema_build.js";

const vfs = new Map();
// Initial BAML content for testing
vfs.set('/main.baml', `
client<llm> OpenRouter {
  provider "openai-generic"
  options {
    base_url "https://openrouter.ai/api/v1"
    api_key env.OPENROUTER_API_KEY
    model "kwaipilot/kat-coder-pro:free"
    headers {
      "HTTP-Referer" "http://localhost"
      "X-Title" "SheetMetal"
    }
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
`);

const settings = {
    apiKeyInput: document.getElementById('api-key-input'),
    modelInput: document.getElementById('model-input'),
    modelList: document.getElementById('model-list'),
    freeOnlyCheckbox: document.getElementById('free-only-checkbox'),
};

const ui = {
    fileList: document.getElementById('file-list'),
    editor: document.getElementById('editor'),
    output: document.getElementById('output'),
    runBtn: document.getElementById('run-btn')
};

let activeFile = '/main.baml';
let ALL_MODELS = [];

function loadSettings() {
    const savedKey = localStorage.getItem("openrouter_api_key");
    if (savedKey) settings.apiKeyInput.value = savedKey;

    const savedModel = localStorage.getItem("openrouter_model");
    if (savedModel) settings.modelInput.value = savedModel;
    
    const savedFreeOnly = localStorage.getItem("openrouter_free_only");
    if (savedFreeOnly !== null) {
        settings.freeOnlyCheckbox.checked = savedFreeOnly === 'true';
    }
}

function saveSettings() {
    localStorage.setItem("openrouter_api_key", settings.apiKeyInput.value);
    localStorage.setItem("openrouter_model", settings.modelInput.value);
    localStorage.setItem("openrouter_free_only", settings.freeOnlyCheckbox.checked);
}

// Update the editor content when model changes
function updateEditorModel(newModel) {
    if (!newModel) return;
    
    const currentContent = ui.editor.value;
    // Regex to find: model "anything"
    const updated = currentContent.replace(
        /model\s+\"[^\"]+\"/,
        `model "${newModel}"`
    );
    
    if (updated !== currentContent) {
        ui.editor.value = updated;
        vfs.set(activeFile, updated);
    }
}

async function fetchOpenRouterModels() {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/models");
        const json = await res.json();
        ALL_MODELS = json.data
            .map(m => ({
                id: m.id,
                name: m.name || m.id,
                free: m.pricing && parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0
            }))
            .sort((a, b) => a.id.localeCompare(b.id));

        return ALL_MODELS;
    } catch (err) {
        console.error("Failed to fetch models:", err);
        return [];
    }
}

async function populateModelList() {
    if (ALL_MODELS.length === 0) {
        await fetchOpenRouterModels();
    }

    const freeOnly = settings.freeOnlyCheckbox?.checked;

    const filtered = ALL_MODELS.filter(m => {
        if (freeOnly && !m.free) return false;
        return true;
    });

    settings.modelList.innerHTML = "";
    filtered.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        // Datalist label is visible in some browsers
        opt.label = m.free ? "(free)" : ""; 
        settings.modelList.appendChild(opt);
    });
}

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

// Minimal runner for SheetMetal
async function testBamlRuntime() {
  console.log("Loading BAML WASM…");
  ui.output.textContent = "Loading BAML WASM…\n";
  
  init_js_callback_bridge(
    () => Promise.resolve({}),
    () => Promise.resolve({})
  );

  // Load VFS contents
  let bamlSource = vfs.get("/main.baml");
  
  // Ensure runtime model matches input (safety net)
  if (settings.modelInput.value) {
      bamlSource = bamlSource.replace(
        /model\s+\"[^\"]+\"/,
        `model "${settings.modelInput.value}"`
      );
  }
  
  console.log("Source:", bamlSource);

  const files = [
    ["/main.baml", bamlSource]
  ];

  console.log("Creating project…");
  ui.output.textContent += "Creating project…\n";
  
  try {
      const project = WasmProject.new("./", files);

      const envVars = {
        OPENROUTER_API_KEY: settings.apiKeyInput.value,
        BOUNDARY_PROXY_URL: "https://fiddle-proxy.fly.dev"
      };

      console.log("Creating runtime…");
      ui.output.textContent += "Creating runtime…\n";
      const runtime = project.runtime(envVars, []);

      console.log("Checking diagnostics…");
      const diags = project.diagnostics(runtime);
      if (diags.errors && diags.errors().length > 0) {
        console.error("BAML parse errors:", diags.errors());
        ui.output.textContent += "BAML parse errors:\n" + JSON.stringify(diags.errors(), null, 2);
        return;
      } else {
        ui.output.textContent += "Diagnostics passed.\n";
      }

      // Replace with your function + inputs
      // Note: functionName must match what's in /main.baml
      const testCase = {
        functionName: "Analyze",
        testName: "MyTest",
        inputs: { text: "I loved the new update, but the battery life is terrible now." } 
      };

      console.log("Running test…");
      ui.output.textContent += "Running test (check console for partials)…\n";

      const iterator = await runtime.run_tests(
        [testCase],
        (partial) => {
          try {
            const llm = partial.llm_response();
            if (llm) console.log("[stream]", llm.content);
          } catch (e) {
            console.warn("Partial parse error:", e);
          }
        },
        (url) => Promise.resolve(""), // no media loader yet
        envVars,
        null,
        () => {}, 
        false
      );

      // Pull final response(s)
      let result;
      while ((result = iterator.yield_next()) !== undefined) {
        console.log("Final status:", result.status());
        ui.output.textContent += "Final status: " + result.status() + "\n";
        
        const parsed = result.parsed_response();
        if (parsed) {
            console.log("Parsed:", parsed.value);
            ui.output.textContent += "Parsed Value: " + parsed.value + "\n";
        }
        
        const llm = result.llm_response();
        if (llm) {
            console.log("Raw LLM text:", llm.content);
            ui.output.textContent += "Raw LLM Content: " + llm.content + "\n";
        }
        
        const failure = result.failure_message();
        if (failure) {
             console.log("Failure message:", failure);
             ui.output.textContent += "Failure: " + failure + "\n";
        }
      }

      console.log("Done.");
      ui.output.textContent += "Done.";

  } catch (e) {
      console.error("Runtime error:", e);

      try {
          // Attempt to extract errors if it's a WasmDiagnosticError
          if (typeof e.errors === 'function') {
              const errors = e.errors();
              console.log("WASM DIAGNOSTICS:", errors);
              ui.output.textContent += "Diagnostics:\n" + JSON.stringify(errors, null, 2);
          } else {
              // Fallback for standard errors
              ui.output.textContent += "Runtime error: " + e.toString();
          }
      } catch (innerErr) {
          // Fallback if e.errors() fails or doesn't exist
          console.warn("Failed to extract diagnostics:", innerErr);
          ui.output.textContent += "Runtime error: " + e.toString();
      }
  }
}

function run() {
    // Hook Run button to our new harness
    testBamlRuntime();
}

async function init() {
    console.log('SheetMetal core online');
    
    // Setup editor listener
    ui.editor.addEventListener('input', (e) => {
        if (activeFile) {
            vfs.set(activeFile, e.target.value);
        }
    });

    // Setup run listener
    ui.runBtn.addEventListener('click', run);
    
    // Settings listeners
    settings.apiKeyInput.addEventListener("input", saveSettings);
    
    settings.modelInput.addEventListener("input", () => {
        saveSettings();
        // When user types/selects, we could update editor
        // But datalist input fires on every keypress
        // Let's check if the value matches a known model ID exactly?
        // Or just update anyway. 
        updateEditorModel(settings.modelInput.value);
    });
    
    settings.freeOnlyCheckbox.addEventListener("change", () => {
        populateModelList();
        saveSettings();
    });

    // Initial render
    openFile(activeFile);
    
    // Populate dropdown
    loadSettings(); // Load checkboxes first
    await populateModelList();
    
    // Expose for debugging
    window.testBamlRuntime = testBamlRuntime;
}

(async function() {
    await initWasm();
    console.log("BAML WASM runtime loaded");

    init();
})();
