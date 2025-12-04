import initWasm, { WasmProject, init_js_callback_bridge } from "../vendor/baml/baml_schema_build.js";

export class BamlRuntime {
    constructor(outputCallback) {
        this.outputCallback = outputCallback || console.log;
        this.initialized = false;
        this.initPromise = null;
    }

    async init() {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                this.outputCallback("Loading BAML WASM…\n");
                await initWasm();
                
                init_js_callback_bridge(
                    () => Promise.resolve({}),
                    () => Promise.resolve({})
                );
                
                this.initialized = true;
                this.outputCallback("BAML WASM runtime loaded.\n");
            } catch (e) {
                this.outputCallback(`Error loading WASM: ${e.message}\n`);
                throw e;
            } finally {
                this.initPromise = null;
            }
        })();

        return this.initPromise;
    }

    async runTest(files, activeFile, envVars) {
        if (!this.initialized) await this.init();
        
        const project = WasmProject.new("./", files);
        const runtime = project.runtime(envVars, []);
        const diags = project.diagnostics(runtime);
        
        if (diags.errors().length > 0) {
            const errorMsg = diags.errors().map(e => 
                `[${e.type}] ${e.message} at ${e.file_path}:${e.start_line}`
            ).join('\n');
            
            return { 
                success: false, 
                type: 'parse_error', 
                errors: errorMsg
            };
        }

        this.outputCallback("System status: Ready\n");

        // Strategy: Use WASM AST to reliably identify the test case associated with the active file,
        // then invoke the runtime with a plain object structure matching the Rust interface.
        const normalize = p => p.replace(/^[".\/]+/, '');
        const targetFile = normalize(activeFile);
        
        const functions = runtime.list_functions();
        let targetFunction = null;
        let targetTestName = null;

        for (const fn of functions) {
            for (const test of fn.test_cases) {
                if (normalize(test.span.file_path) === targetFile) {
                    targetFunction = fn.name;
                    targetTestName = test.name;
                    break;
                }
            }
            if (targetFunction) break;
        }

        if (!targetFunction) {
             throw new Error(`No tests found in ${activeFile} (checked ${functions.length} functions)`);
        }

        this.outputCallback(`Running test '${targetTestName}' on function '${targetFunction}'...\n`);

        const testCase = {
            functionName: targetFunction,
            testName: targetTestName,
            inputs: { text: "I loved the new update." }
        };

        const iterator = await runtime.run_tests(
            [testCase],
            (partial) => {
                try {
                    // Stream partial responses (future hook)
                    const llm = partial.llm_response();
                } catch (e) { /* ignore */ }
            },
            (url) => Promise.resolve(""),
            envVars,
            null,
            () => {}, 
            false
        );

        const results = [];
        let result;
        while ((result = iterator.yield_next()) !== undefined) {
            results.push(result);
            
            const parsed = result.parsed_response();
            if (parsed) {
                this.outputCallback("\n--- Structured Output ---\n");
                this.outputCallback(parsed, 'json');
                this.outputCallback("\n");
            }
            
            const failure = result.llm_failure(); // failure_message() might be on result or failure obj
            if (failure) {
                this.outputCallback("\n--- Failure ---\n");
                this.outputCallback(JSON.stringify(failure, null, 2), 'json'); // failures are objects usually
                this.outputCallback("\n");
            }
            
            const llm = result.llm_response();
            if (llm) {
                this.outputCallback("\n--- LLM Response ---\n");
                this.outputCallback(llm.content, 'json');
                this.outputCallback("\n");
            }
        }

        return { success: true, results };
    }
}