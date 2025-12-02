let wasm;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

export function enable_logs() {
    wasm.enable_logs();
}

/**
 * @returns {string}
 */
export function version() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.version();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * @param {string} path
 * @param {string} text
 * @returns {string | undefined}
 */
export function format_document(path, text) {
    const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.format_document(ptr0, len0, ptr1, len1);
    let v3;
    if (ret[0] !== 0) {
        v3 = getStringFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v3;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

export function on_wasm_init() {
    wasm.on_wasm_init();
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * This allows us to invoke JS callbacks from Rust.
 *
 * We need to do this as a wildly hacky workaround because (1) wasm in the webview is sandboxed and doesn't have easy
 * access to env vars and (2) js_sys::Value is not Send which causes a bunch of painful issues with tokio, since
 * the compiler-generated futures need to be Send even though we don't use web workers.
 * @param {Function} load_aws_creds_cb
 * @param {Function} load_gcp_creds_cb
 */
export function init_js_callback_bridge(load_aws_creds_cb, load_gcp_creds_cb) {
    wasm.init_js_callback_bridge(load_aws_creds_cb, load_gcp_creds_cb);
}

function wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1) {
    wasm.wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1);
}

function wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1) {
    wasm.wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1);
}

function wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1) {
    wasm.wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1);
}

function wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1) {
    wasm.wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1);
}

function wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1) {
    wasm.wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______(arg0, arg1);
}

function wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke___wasm_bindgen_ea049f8341f88ca3___JsValue_____(arg0, arg1, arg2) {
    wasm.wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke___wasm_bindgen_ea049f8341f88ca3___JsValue_____(arg0, arg1, arg2);
}

function wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke___wasm_bindgen_ea049f8341f88ca3___JsValue__wasm_bindgen_ea049f8341f88ca3___JsValue_____(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke___wasm_bindgen_ea049f8341f88ca3___JsValue__wasm_bindgen_ea049f8341f88ca3___JsValue_____(arg0, arg1, arg2, arg3);
}

/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6}
 */
export const TestStatus = Object.freeze({
    Passed: 0, "0": "Passed",
    LLMFailure: 1, "1": "LLMFailure",
    ParseFailure: 2, "2": "ParseFailure",
    FinishReasonFailed: 3, "3": "FinishReasonFailed",
    ConstraintsFailed: 4, "4": "ConstraintsFailed",
    AssertFailed: 5, "5": "AssertFailed",
    UnableToRun: 6, "6": "UnableToRun",
});
/**
 * @enum {0 | 1 | 2}
 */
export const WasmChatMessagePartMediaType = Object.freeze({
    Url: 0, "0": "Url",
    File: 1, "1": "File",
    Error: 2, "2": "Error",
});
/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5}
 */
export const WasmControlFlowNodeType = Object.freeze({
    FunctionRoot: 0, "0": "FunctionRoot",
    HeaderContextEnter: 1, "1": "HeaderContextEnter",
    BranchGroup: 2, "2": "BranchGroup",
    BranchArm: 3, "3": "BranchArm",
    Loop: 4, "4": "Loop",
    OtherScope: 5, "5": "OtherScope",
});
/**
 * @enum {0 | 1}
 */
export const WasmFunctionKind = Object.freeze({
    Llm: 0, "0": "Llm",
    Expr: 1, "1": "Expr",
});

const __wbindgen_enum_RequestCache = ["default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached"];

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const IntoUnderlyingByteSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingbytesource_free(ptr >>> 0, 1));

export class IntoUnderlyingByteSource {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingByteSourceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingbytesource_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get autoAllocateChunkSize() {
        const ret = wasm.intounderlyingbytesource_autoAllocateChunkSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {ReadableByteStreamController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingbytesource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    /**
     * @param {ReadableByteStreamController} controller
     */
    start(controller) {
        wasm.intounderlyingbytesource_start(this.__wbg_ptr, controller);
    }
    /**
     * @returns {string}
     */
    get type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.intounderlyingbytesource_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingbytesource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingByteSource.prototype[Symbol.dispose] = IntoUnderlyingByteSource.prototype.free;

const IntoUnderlyingSinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsink_free(ptr >>> 0, 1));

export class IntoUnderlyingSink {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSinkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsink_free(ptr, 0);
    }
    /**
     * @param {any} reason
     * @returns {Promise<any>}
     */
    abort(reason) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_abort(ptr, reason);
        return ret;
    }
    /**
     * @returns {Promise<any>}
     */
    close() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_close(ptr);
        return ret;
    }
    /**
     * @param {any} chunk
     * @returns {Promise<any>}
     */
    write(chunk) {
        const ret = wasm.intounderlyingsink_write(this.__wbg_ptr, chunk);
        return ret;
    }
}
if (Symbol.dispose) IntoUnderlyingSink.prototype[Symbol.dispose] = IntoUnderlyingSink.prototype.free;

const IntoUnderlyingSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsource_free(ptr >>> 0, 1));

export class IntoUnderlyingSource {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSourceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsource_free(ptr, 0);
    }
    /**
     * @param {ReadableStreamDefaultController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingsource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingsource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingSource.prototype[Symbol.dispose] = IntoUnderlyingSource.prototype.free;

const SerializableOrchestratorNodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_serializableorchestratornode_free(ptr >>> 0, 1));

export class SerializableOrchestratorNode {

    toJSON() {
        return {
            provider: this.provider,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SerializableOrchestratorNodeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_serializableorchestratornode_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get provider() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_serializableorchestratornode_provider(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set provider(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_serializableorchestratornode_provider(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) SerializableOrchestratorNode.prototype[Symbol.dispose] = SerializableOrchestratorNode.prototype.free;

const SymbolLocationFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_symbollocation_free(ptr >>> 0, 1));

export class SymbolLocation {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SymbolLocation.prototype);
        obj.__wbg_ptr = ptr;
        SymbolLocationFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SymbolLocationFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_symbollocation_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get uri() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_symbollocation_uri(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set uri(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_serializableorchestratornode_provider(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get start_line() {
        const ret = wasm.__wbg_get_symbollocation_start_line(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set start_line(arg0) {
        wasm.__wbg_set_symbollocation_start_line(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get start_character() {
        const ret = wasm.__wbg_get_symbollocation_start_character(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set start_character(arg0) {
        wasm.__wbg_set_symbollocation_start_character(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get end_line() {
        const ret = wasm.__wbg_get_symbollocation_end_line(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set end_line(arg0) {
        wasm.__wbg_set_symbollocation_end_line(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get end_character() {
        const ret = wasm.__wbg_get_symbollocation_end_character(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set end_character(arg0) {
        wasm.__wbg_set_symbollocation_end_character(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) SymbolLocation.prototype[Symbol.dispose] = SymbolLocation.prototype.free;

const WasmCallContextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmcallcontext_free(ptr >>> 0, 1));

export class WasmCallContext {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmCallContextFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmcallcontext_free(ptr, 0);
    }
    /**
     * @param {number | null} [node_index]
     */
    set node_index(node_index) {
        wasm.wasmcallcontext_set_node_index(this.__wbg_ptr, isLikeNone(node_index) ? 0x100000001 : (node_index) >>> 0);
    }
    constructor() {
        const ret = wasm.wasmcallcontext_new();
        this.__wbg_ptr = ret >>> 0;
        WasmCallContextFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) WasmCallContext.prototype[Symbol.dispose] = WasmCallContext.prototype.free;

const WasmChatMessageFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmchatmessage_free(ptr >>> 0, 1));

export class WasmChatMessage {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmChatMessage.prototype);
        obj.__wbg_ptr = ptr;
        WasmChatMessageFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmChatMessageFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmchatmessage_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get role() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmchatmessage_role(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmChatMessagePart[]}
     */
    get parts() {
        const ret = wasm.__wbg_get_wasmchatmessage_parts(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) WasmChatMessage.prototype[Symbol.dispose] = WasmChatMessage.prototype.free;

const WasmChatMessagePartFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmchatmessagepart_free(ptr >>> 0, 1));

export class WasmChatMessagePart {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmChatMessagePart.prototype);
        obj.__wbg_ptr = ptr;
        WasmChatMessagePartFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmChatMessagePartFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmchatmessagepart_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    is_pdf() {
        const ret = wasm.wasmchatmessagepart_is_pdf(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {string | undefined}
     */
    as_text() {
        const ret = wasm.wasmchatmessagepart_as_text(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {boolean}
     */
    is_text() {
        const ret = wasm.wasmchatmessagepart_is_text(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {WasmChatMessagePartMedia | undefined}
     */
    as_media() {
        const ret = wasm.wasmchatmessagepart_as_media(this.__wbg_ptr);
        return ret === 0 ? undefined : WasmChatMessagePartMedia.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    is_audio() {
        const ret = wasm.wasmchatmessagepart_is_audio(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    is_image() {
        const ret = wasm.wasmchatmessagepart_is_image(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    is_video() {
        const ret = wasm.wasmchatmessagepart_is_video(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {WasmPrompt} prompt
     * @returns {string | undefined}
     */
    json_meta(prompt) {
        _assertClass(prompt, WasmPrompt);
        const ret = wasm.wasmchatmessagepart_json_meta(this.__wbg_ptr, prompt.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
}
if (Symbol.dispose) WasmChatMessagePart.prototype[Symbol.dispose] = WasmChatMessagePart.prototype.free;

const WasmChatMessagePartMediaFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmchatmessagepartmedia_free(ptr >>> 0, 1));

export class WasmChatMessagePartMedia {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmChatMessagePartMedia.prototype);
        obj.__wbg_ptr = ptr;
        WasmChatMessagePartMediaFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmChatMessagePartMediaFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmchatmessagepartmedia_free(ptr, 0);
    }
    /**
     * @returns {WasmChatMessagePartMediaType}
     */
    get type() {
        const ret = wasm.__wbg_get_wasmchatmessagepartmedia_type(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {WasmChatMessagePartMediaType} arg0
     */
    set type(arg0) {
        wasm.__wbg_set_wasmchatmessagepartmedia_type(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get content() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmchatmessagepartmedia_content(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set content(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmchatmessagepartmedia_content(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) WasmChatMessagePartMedia.prototype[Symbol.dispose] = WasmChatMessagePartMedia.prototype.free;

const WasmControlFlowEdgeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmcontrolflowedge_free(ptr >>> 0, 1));

export class WasmControlFlowEdge {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmControlFlowEdge.prototype);
        obj.__wbg_ptr = ptr;
        WasmControlFlowEdgeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            src: this.src,
            dst: this.dst,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmControlFlowEdgeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmcontrolflowedge_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get src() {
        const ret = wasm.__wbg_get_wasmcontrolflowedge_src(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get dst() {
        const ret = wasm.__wbg_get_wasmcontrolflowedge_dst(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) WasmControlFlowEdge.prototype[Symbol.dispose] = WasmControlFlowEdge.prototype.free;

const WasmControlFlowGraphFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmcontrolflowgraph_free(ptr >>> 0, 1));

export class WasmControlFlowGraph {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmControlFlowGraph.prototype);
        obj.__wbg_ptr = ptr;
        WasmControlFlowGraphFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            nodes: this.nodes,
            edges: this.edges,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmControlFlowGraphFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmcontrolflowgraph_free(ptr, 0);
    }
    /**
     * @returns {WasmControlFlowNode[]}
     */
    get nodes() {
        const ret = wasm.__wbg_get_wasmcontrolflowgraph_nodes(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {WasmControlFlowEdge[]}
     */
    get edges() {
        const ret = wasm.__wbg_get_wasmcontrolflowgraph_edges(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) WasmControlFlowGraph.prototype[Symbol.dispose] = WasmControlFlowGraph.prototype.free;

const WasmControlFlowNodeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmcontrolflownode_free(ptr >>> 0, 1));

export class WasmControlFlowNode {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmControlFlowNode.prototype);
        obj.__wbg_ptr = ptr;
        WasmControlFlowNodeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            id: this.id,
            parent_id: this.parent_id,
            lexical_id: this.lexical_id,
            label: this.label,
            span: this.span,
            node_type: this.node_type,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmControlFlowNodeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmcontrolflownode_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get id() {
        const ret = wasm.__wbg_get_wasmcontrolflownode_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number | undefined}
     */
    get parent_id() {
        const ret = wasm.__wbg_get_wasmcontrolflownode_parent_id(this.__wbg_ptr);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * @returns {string}
     */
    get lexical_id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmcontrolflownode_lexical_id(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get label() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmcontrolflownode_label(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmSpan}
     */
    get span() {
        const ret = wasm.__wbg_get_wasmcontrolflownode_span(this.__wbg_ptr);
        return WasmSpan.__wrap(ret);
    }
    /**
     * @returns {WasmControlFlowNodeType}
     */
    get node_type() {
        const ret = wasm.__wbg_get_wasmcontrolflownode_node_type(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) WasmControlFlowNode.prototype[Symbol.dispose] = WasmControlFlowNode.prototype.free;

const WasmDiagnosticErrorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmdiagnosticerror_free(ptr >>> 0, 1));

export class WasmDiagnosticError {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmDiagnosticError.prototype);
        obj.__wbg_ptr = ptr;
        WasmDiagnosticErrorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            all_files: this.all_files,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmDiagnosticErrorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmdiagnosticerror_free(ptr, 0);
    }
    /**
     * @returns {string[]}
     */
    get all_files() {
        const ret = wasm.__wbg_get_wasmdiagnosticerror_all_files(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string[]} arg0
     */
    set all_files(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmdiagnosticerror_all_files(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {WasmError[]}
     */
    errors() {
        const ret = wasm.wasmdiagnosticerror_errors(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) WasmDiagnosticError.prototype[Symbol.dispose] = WasmDiagnosticError.prototype.free;

const WasmEntityAtPositionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmentityatposition_free(ptr >>> 0, 1));

export class WasmEntityAtPosition {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmEntityAtPosition.prototype);
        obj.__wbg_ptr = ptr;
        WasmEntityAtPositionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            entity_type: this.entity_type,
            entity_name: this.entity_name,
            function_name: this.function_name,
            span: this.span,
            function_type: this.function_type,
            node_id: this.node_id,
            node_label: this.node_label,
            test_name: this.test_name,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmEntityAtPositionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmentityatposition_free(ptr, 0);
    }
    /**
     * The type of entity: "function", "node", or "test"
     * @returns {string}
     */
    get entity_type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmentityatposition_entity_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The name of the entity (function name, node label, or test name)
     * @returns {string}
     */
    get entity_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmentityatposition_entity_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * The name of the function this entity belongs to.
     * For function entities, this equals entity_name.
     * For node entities, this is the parent function name.
     * For test entities, this is the parent function name.
     * @returns {string}
     */
    get function_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmentityatposition_function_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmSpan}
     */
    get span() {
        const ret = wasm.__wbg_get_wasmentityatposition_span(this.__wbg_ptr);
        return WasmSpan.__wrap(ret);
    }
    /**
     * @returns {WasmFunctionKind | undefined}
     */
    get function_type() {
        const ret = wasm.__wbg_get_wasmentityatposition_function_type(this.__wbg_ptr);
        return ret === 2 ? undefined : ret;
    }
    /**
     * @returns {string | undefined}
     */
    get node_id() {
        const ret = wasm.__wbg_get_wasmentityatposition_node_id(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get node_label() {
        const ret = wasm.__wbg_get_wasmentityatposition_node_label(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * For test entities, the name of the test case
     * @returns {string | undefined}
     */
    get test_name() {
        const ret = wasm.__wbg_get_wasmentityatposition_test_name(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
}
if (Symbol.dispose) WasmEntityAtPosition.prototype[Symbol.dispose] = WasmEntityAtPosition.prototype.free;

const WasmErrorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmerror_free(ptr >>> 0, 1));

export class WasmError {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmError.prototype);
        obj.__wbg_ptr = ptr;
        WasmErrorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            type: this.type,
            file_path: this.file_path,
            start_ch: this.start_ch,
            end_ch: this.end_ch,
            start_line: this.start_line,
            start_column: this.start_column,
            end_line: this.end_line,
            end_column: this.end_column,
            message: this.message,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmErrorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmerror_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmerror_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get file_path() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmerror_file_path(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get start_ch() {
        const ret = wasm.__wbg_get_wasmerror_start_ch(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get end_ch() {
        const ret = wasm.__wbg_get_wasmerror_end_ch(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get start_line() {
        const ret = wasm.__wbg_get_wasmerror_start_line(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get start_column() {
        const ret = wasm.__wbg_get_wasmerror_start_column(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get end_line() {
        const ret = wasm.__wbg_get_wasmerror_end_line(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get end_column() {
        const ret = wasm.__wbg_get_wasmerror_end_column(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    get message() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmerror_message(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmError.prototype[Symbol.dispose] = WasmError.prototype.free;

const WasmFunctionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmfunction_free(ptr >>> 0, 1));

export class WasmFunction {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmFunction.prototype);
        obj.__wbg_ptr = ptr;
        WasmFunctionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            name: this.name,
            span: this.span,
            function_type: this.function_type,
            test_cases: this.test_cases,
            test_snippet: this.test_snippet,
            signature: this.signature,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmFunctionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmfunction_free(ptr, 0);
    }
    /**
     * @param {WasmRuntime} rt
     * @param {string} test_name
     * @param {WasmCallContext} wasm_call_context
     * @param {Function} get_baml_src_cb
     * @param {object} env
     * @returns {Promise<WasmPrompt>}
     */
    render_prompt_for_test(rt, test_name, wasm_call_context, get_baml_src_cb, env) {
        _assertClass(rt, WasmRuntime);
        const ptr0 = passStringToWasm0(test_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(wasm_call_context, WasmCallContext);
        const ret = wasm.wasmfunction_render_prompt_for_test(this.__wbg_ptr, rt.__wbg_ptr, ptr0, len0, wasm_call_context.__wbg_ptr, get_baml_src_cb, env);
        return ret;
    }
    /**
     * @param {WasmRuntime} rt
     * @param {string} test_name
     * @param {WasmCallContext} wasm_call_context
     * @param {boolean} stream
     * @param {boolean} expand_images
     * @param {Function} get_baml_src_cb
     * @param {object} env
     * @param {boolean} expose_secrets
     * @returns {Promise<string>}
     */
    render_raw_curl_for_test(rt, test_name, wasm_call_context, stream, expand_images, get_baml_src_cb, env, expose_secrets) {
        _assertClass(rt, WasmRuntime);
        const ptr0 = passStringToWasm0(test_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(wasm_call_context, WasmCallContext);
        const ret = wasm.wasmfunction_render_raw_curl_for_test(this.__wbg_ptr, rt.__wbg_ptr, ptr0, len0, wasm_call_context.__wbg_ptr, stream, expand_images, get_baml_src_cb, env, expose_secrets);
        return ret;
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmfunction_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmSpan}
     */
    get span() {
        const ret = wasm.__wbg_get_wasmfunction_span(this.__wbg_ptr);
        return WasmSpan.__wrap(ret);
    }
    /**
     * @returns {WasmFunctionKind}
     */
    get function_type() {
        const ret = wasm.__wbg_get_wasmfunction_function_type(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {WasmTestCase[]}
     */
    get test_cases() {
        const ret = wasm.__wbg_get_wasmfunction_test_cases(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string}
     */
    get test_snippet() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmfunction_test_snippet(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get signature() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmfunction_signature(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {WasmRuntime} rt
     * @returns {string}
     */
    client_name(rt) {
        let deferred2_0;
        let deferred2_1;
        try {
            _assertClass(rt, WasmRuntime);
            const ret = wasm.wasmfunction_client_name(this.__wbg_ptr, rt.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {WasmRuntime} rt
     * @returns {string}
     */
    function_graph(rt) {
        let deferred2_0;
        let deferred2_1;
        try {
            _assertClass(rt, WasmRuntime);
            const ret = wasm.wasmfunction_function_graph(this.__wbg_ptr, rt.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {WasmRuntime} rt
     * @returns {WasmControlFlowGraph}
     */
    function_graph_v2(rt) {
        _assertClass(rt, WasmRuntime);
        const ret = wasm.wasmfunction_function_graph_v2(this.__wbg_ptr, rt.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmControlFlowGraph.__wrap(ret[0]);
    }
    /**
     * @param {WasmRuntime} rt
     * @returns {WasmScope[]}
     */
    orchestration_graph(rt) {
        _assertClass(rt, WasmRuntime);
        const ret = wasm.wasmfunction_orchestration_graph(this.__wbg_ptr, rt.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) WasmFunction.prototype[Symbol.dispose] = WasmFunction.prototype.free;

const WasmFunctionResponseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmfunctionresponse_free(ptr >>> 0, 1));

export class WasmFunctionResponse {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmFunctionResponse.prototype);
        obj.__wbg_ptr = ptr;
        WasmFunctionResponseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmFunctionResponseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmfunctionresponse_free(ptr, 0);
    }
    /**
     * @returns {WasmLLMFailure | undefined}
     */
    llm_failure() {
        const ret = wasm.wasmfunctionresponse_llm_failure(this.__wbg_ptr);
        return ret === 0 ? undefined : WasmLLMFailure.__wrap(ret);
    }
    /**
     * @returns {WasmLLMResponse | undefined}
     */
    llm_response() {
        const ret = wasm.wasmfunctionresponse_llm_response(this.__wbg_ptr);
        return ret === 0 ? undefined : WasmLLMResponse.__wrap(ret);
    }
    /**
     * @returns {WasmFunctionTestPair}
     */
    func_test_pair() {
        const ret = wasm.wasmfunctionresponse_func_test_pair(this.__wbg_ptr);
        return WasmFunctionTestPair.__wrap(ret);
    }
    /**
     * @returns {string | undefined}
     */
    parsed_response() {
        const ret = wasm.wasmfunctionresponse_parsed_response(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
}
if (Symbol.dispose) WasmFunctionResponse.prototype[Symbol.dispose] = WasmFunctionResponse.prototype.free;

const WasmFunctionTestPairFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmfunctiontestpair_free(ptr >>> 0, 1));

export class WasmFunctionTestPair {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmFunctionTestPair.prototype);
        obj.__wbg_ptr = ptr;
        WasmFunctionTestPairFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            function_name: this.function_name,
            test_name: this.test_name,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmFunctionTestPairFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmfunctiontestpair_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get function_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmfunctiontestpair_function_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get test_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmfunctiontestpair_test_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmFunctionTestPair.prototype[Symbol.dispose] = WasmFunctionTestPair.prototype.free;

const WasmGeneratedFileFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmgeneratedfile_free(ptr >>> 0, 1));

export class WasmGeneratedFile {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmGeneratedFile.prototype);
        obj.__wbg_ptr = ptr;
        WasmGeneratedFileFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            path_in_output_dir: this.path_in_output_dir,
            contents: this.contents,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmGeneratedFileFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmgeneratedfile_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get path_in_output_dir() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmgeneratedfile_path_in_output_dir(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get contents() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmgeneratedfile_contents(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmGeneratedFile.prototype[Symbol.dispose] = WasmGeneratedFile.prototype.free;

const WasmGeneratorConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmgeneratorconfig_free(ptr >>> 0, 1));

export class WasmGeneratorConfig {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmGeneratorConfig.prototype);
        obj.__wbg_ptr = ptr;
        WasmGeneratorConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            output_type: this.output_type,
            version: this.version,
            span: this.span,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmGeneratorConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmgeneratorconfig_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get output_type() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmgeneratorconfig_output_type(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get version() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmgeneratorconfig_version(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmSpan}
     */
    get span() {
        const ret = wasm.__wbg_get_wasmgeneratorconfig_span(this.__wbg_ptr);
        return WasmSpan.__wrap(ret);
    }
}
if (Symbol.dispose) WasmGeneratorConfig.prototype[Symbol.dispose] = WasmGeneratorConfig.prototype.free;

const WasmGeneratorOutputFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmgeneratoroutput_free(ptr >>> 0, 1));

export class WasmGeneratorOutput {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmGeneratorOutput.prototype);
        obj.__wbg_ptr = ptr;
        WasmGeneratorOutputFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            output_dir: this.output_dir,
            output_dir_relative_to_baml_src: this.output_dir_relative_to_baml_src,
            files: this.files,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmGeneratorOutputFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmgeneratoroutput_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get output_dir() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmgeneratoroutput_output_dir(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get output_dir_relative_to_baml_src() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmgeneratoroutput_output_dir_relative_to_baml_src(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmGeneratedFile[]}
     */
    get files() {
        const ret = wasm.__wbg_get_wasmgeneratoroutput_files(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) WasmGeneratorOutput.prototype[Symbol.dispose] = WasmGeneratorOutput.prototype.free;

const WasmLLMFailureFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmllmfailure_free(ptr >>> 0, 1));

export class WasmLLMFailure {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmLLMFailure.prototype);
        obj.__wbg_ptr = ptr;
        WasmLLMFailureFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            model: this.model,
            start_time_unix_ms: this.start_time_unix_ms,
            latency_ms: this.latency_ms,
            message: this.message,
            code: this.code,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmLLMFailureFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmllmfailure_free(ptr, 0);
    }
    /**
     * @returns {string | undefined}
     */
    get model() {
        const ret = wasm.__wbg_get_wasmllmfailure_model(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {string | null} [arg0]
     */
    set model(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmllmfailure_model(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {bigint}
     */
    get start_time_unix_ms() {
        const ret = wasm.__wbg_get_wasmllmfailure_start_time_unix_ms(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} arg0
     */
    set start_time_unix_ms(arg0) {
        wasm.__wbg_set_wasmllmfailure_start_time_unix_ms(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {bigint}
     */
    get latency_ms() {
        const ret = wasm.__wbg_get_wasmllmfailure_latency_ms(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} arg0
     */
    set latency_ms(arg0) {
        wasm.__wbg_set_wasmllmfailure_latency_ms(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {string}
     */
    get message() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmllmfailure_message(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set message(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmllmfailure_message(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get code() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmllmfailure_code(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set code(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmllmfailure_code(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    client_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmllmfailure_client_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmPrompt}
     */
    prompt() {
        const ret = wasm.wasmllmfailure_prompt(this.__wbg_ptr);
        return WasmPrompt.__wrap(ret);
    }
}
if (Symbol.dispose) WasmLLMFailure.prototype[Symbol.dispose] = WasmLLMFailure.prototype.free;

const WasmLLMResponseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmllmresponse_free(ptr >>> 0, 1));

export class WasmLLMResponse {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmLLMResponse.prototype);
        obj.__wbg_ptr = ptr;
        WasmLLMResponseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            model: this.model,
            content: this.content,
            start_time_unix_ms: this.start_time_unix_ms,
            latency_ms: this.latency_ms,
            input_tokens: this.input_tokens,
            output_tokens: this.output_tokens,
            total_tokens: this.total_tokens,
            stop_reason: this.stop_reason,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmLLMResponseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmllmresponse_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get model() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmllmresponse_model(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set model(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmllmresponse_model(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get content() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmllmresponse_content(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set content(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmllmresponse_content(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {bigint}
     */
    get start_time_unix_ms() {
        const ret = wasm.__wbg_get_wasmllmresponse_start_time_unix_ms(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} arg0
     */
    set start_time_unix_ms(arg0) {
        wasm.__wbg_set_wasmllmresponse_start_time_unix_ms(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {bigint}
     */
    get latency_ms() {
        const ret = wasm.__wbg_get_wasmllmresponse_latency_ms(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} arg0
     */
    set latency_ms(arg0) {
        wasm.__wbg_set_wasmllmresponse_latency_ms(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {bigint | undefined}
     */
    get input_tokens() {
        const ret = wasm.__wbg_get_wasmllmresponse_input_tokens(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1]);
    }
    /**
     * @param {bigint | null} [arg0]
     */
    set input_tokens(arg0) {
        wasm.__wbg_set_wasmllmresponse_input_tokens(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
    /**
     * @returns {bigint | undefined}
     */
    get output_tokens() {
        const ret = wasm.__wbg_get_wasmllmresponse_output_tokens(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1]);
    }
    /**
     * @param {bigint | null} [arg0]
     */
    set output_tokens(arg0) {
        wasm.__wbg_set_wasmllmresponse_output_tokens(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
    /**
     * @returns {bigint | undefined}
     */
    get total_tokens() {
        const ret = wasm.__wbg_get_wasmllmresponse_total_tokens(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1]);
    }
    /**
     * @param {bigint | null} [arg0]
     */
    set total_tokens(arg0) {
        wasm.__wbg_set_wasmllmresponse_total_tokens(this.__wbg_ptr, !isLikeNone(arg0), isLikeNone(arg0) ? BigInt(0) : arg0);
    }
    /**
     * @returns {string | undefined}
     */
    get stop_reason() {
        const ret = wasm.__wbg_get_wasmllmresponse_stop_reason(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {string | null} [arg0]
     */
    set stop_reason(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmllmresponse_stop_reason(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    client_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmllmresponse_client_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmPrompt}
     */
    prompt() {
        const ret = wasm.wasmllmresponse_prompt(this.__wbg_ptr);
        return WasmPrompt.__wrap(ret);
    }
}
if (Symbol.dispose) WasmLLMResponse.prototype[Symbol.dispose] = WasmLLMResponse.prototype.free;

const WasmParamFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmparam_free(ptr >>> 0, 1));

export class WasmParam {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmParam.prototype);
        obj.__wbg_ptr = ptr;
        WasmParamFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            name: this.name,
            value: this.value,
            error: this.error,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmParamFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmparam_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmparam_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string | undefined}
     */
    get value() {
        const ret = wasm.__wbg_get_wasmparam_value(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get error() {
        const ret = wasm.__wbg_get_wasmparam_error(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
}
if (Symbol.dispose) WasmParam.prototype[Symbol.dispose] = WasmParam.prototype.free;

const WasmParentFunctionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmparentfunction_free(ptr >>> 0, 1));

export class WasmParentFunction {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmParentFunction.prototype);
        obj.__wbg_ptr = ptr;
        WasmParentFunctionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            start: this.start,
            end: this.end,
            name: this.name,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmParentFunctionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmparentfunction_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get start() {
        const ret = wasm.__wbg_get_symbollocation_start_line(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get end() {
        const ret = wasm.__wbg_get_symbollocation_start_character(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmparentfunction_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmParentFunction.prototype[Symbol.dispose] = WasmParentFunction.prototype.free;

const WasmParsedTestResponseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmparsedtestresponse_free(ptr >>> 0, 1));

export class WasmParsedTestResponse {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmParsedTestResponse.prototype);
        obj.__wbg_ptr = ptr;
        WasmParsedTestResponseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            value: this.value,
            check_count: this.check_count,
            explanation: this.explanation,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmParsedTestResponseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmparsedtestresponse_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get value() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmparsedtestresponse_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get check_count() {
        const ret = wasm.__wbg_get_symbollocation_end_character(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * JSON-string of the explanation, if there were any ParsingErrors
     * @returns {string | undefined}
     */
    get explanation() {
        const ret = wasm.__wbg_get_wasmparsedtestresponse_explanation(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
}
if (Symbol.dispose) WasmParsedTestResponse.prototype[Symbol.dispose] = WasmParsedTestResponse.prototype.free;

const WasmProjectFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmproject_free(ptr >>> 0, 1));

export class WasmProject {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmProject.prototype);
        obj.__wbg_ptr = ptr;
        WasmProjectFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            root_dir_name: this.root_dir_name,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmProjectFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmproject_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get root_dir_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmproject_root_dir_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {WasmRuntime} rt
     * @returns {WasmDiagnosticError}
     */
    diagnostics(rt) {
        _assertClass(rt, WasmRuntime);
        const ret = wasm.wasmproject_diagnostics(this.__wbg_ptr, rt.__wbg_ptr);
        return WasmDiagnosticError.__wrap(ret);
    }
    /**
     * @param {string} name
     * @param {string | null} [content]
     */
    update_file(name, content) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(content) ? 0 : passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        wasm.wasmproject_update_file(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
    /**
     * @param {boolean | null} [no_version_check]
     * @returns {WasmGeneratorOutput[]}
     */
    run_generators(no_version_check) {
        const ret = wasm.wasmproject_run_generators(this.__wbg_ptr, isLikeNone(no_version_check) ? 0xFFFFFF : no_version_check ? 1 : 0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string} name
     * @param {string | null} [content]
     */
    set_unsaved_file(name, content) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(content) ? 0 : passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        wasm.wasmproject_set_unsaved_file(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
    /**
     * @param {string} root_dir_name
     * @param {any} files
     * @returns {WasmProject}
     */
    static new(root_dir_name, files) {
        const ptr0 = passStringToWasm0(root_dir_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmproject_new(ptr0, len0, files);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmProject.__wrap(ret[0]);
    }
    /**
     * @returns {string[]}
     */
    files() {
        const ret = wasm.wasmproject_files(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {any} env_vars
     * @param {any} feature_flags
     * @returns {WasmRuntime}
     */
    runtime(env_vars, feature_flags) {
        const ret = wasm.wasmproject_runtime(this.__wbg_ptr, env_vars, feature_flags);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmRuntime.__wrap(ret[0]);
    }
    /**
     * @param {string} name
     * @param {string} content
     */
    save_file(name, content) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.wasmproject_save_file(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
}
if (Symbol.dispose) WasmProject.prototype[Symbol.dispose] = WasmProject.prototype.free;

const WasmPromptFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmprompt_free(ptr >>> 0, 1));

export class WasmPrompt {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmPrompt.prototype);
        obj.__wbg_ptr = ptr;
        WasmPromptFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmPromptFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmprompt_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get client_name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmprompt_client_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set client_name(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_wasmprompt_client_name(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {boolean}
     */
    is_completion() {
        const ret = wasm.wasmprompt_is_completion(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {WasmChatMessage[] | undefined}
     */
    as_chat() {
        const ret = wasm.wasmprompt_as_chat(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {boolean}
     */
    is_chat() {
        const ret = wasm.wasmprompt_is_chat(this.__wbg_ptr);
        return ret !== 0;
    }
}
if (Symbol.dispose) WasmPrompt.prototype[Symbol.dispose] = WasmPrompt.prototype.free;

const WasmRuntimeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmruntime_free(ptr >>> 0, 1));

export class WasmRuntime {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmRuntime.prototype);
        obj.__wbg_ptr = ptr;
        WasmRuntimeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmRuntimeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmruntime_free(ptr, 0);
    }
    /**
     * @param {Array<any>} function_test_pairs
     * @param {Function} on_partial_response
     * @param {Function} get_baml_src_cb
     * @param {object} env
     * @param {object | null | undefined} abort_signal
     * @param {Function} watch_handler
     * @param {boolean | null} [parallel]
     * @returns {Promise<WasmTestResponses>}
     */
    run_tests(function_test_pairs, on_partial_response, get_baml_src_cb, env, abort_signal, watch_handler, parallel) {
        const ret = wasm.wasmruntime_run_tests(this.__wbg_ptr, function_test_pairs, on_partial_response, get_baml_src_cb, env, isLikeNone(abort_signal) ? 0 : addToExternrefTable0(abort_signal), watch_handler, isLikeNone(parallel) ? 0xFFFFFF : parallel ? 1 : 0);
        return ret;
    }
    /**
     * @param {string} generator_version
     * @param {string} current_version
     * @param {string} generator_type
     * @param {string} version_check_mode
     * @param {string} generator_language
     * @param {boolean} is_diagnostic
     * @returns {string | undefined}
     */
    static check_version(generator_version, current_version, generator_type, version_check_mode, generator_language, is_diagnostic) {
        const ptr0 = passStringToWasm0(generator_version, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(current_version, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(generator_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(version_check_mode, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(generator_language, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_check_version(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, is_diagnostic);
        let v6;
        if (ret[0] !== 0) {
            v6 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v6;
    }
    /**
     * @param {string} symbol
     * @returns {boolean}
     */
    is_valid_enum(symbol) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_is_valid_enum(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * @param {string} symbol
     * @returns {boolean}
     */
    is_valid_class(symbol) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_is_valid_class(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * @returns {WasmFunction[]}
     */
    list_functions() {
        const ret = wasm.wasmruntime_list_functions(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {WasmTestCase[]}
     */
    list_testcases() {
        const ret = wasm.wasmruntime_list_testcases(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {WasmGeneratorConfig[]}
     */
    list_generators() {
        const ret = wasm.wasmruntime_list_generators(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string} symbol
     * @returns {boolean}
     */
    is_valid_function(symbol) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_is_valid_function(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * @returns {string[]}
     */
    required_env_vars() {
        const ret = wasm.wasmruntime_required_env_vars(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string} symbol
     * @returns {SymbolLocation | undefined}
     */
    search_for_symbol(symbol) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_search_for_symbol(this.__wbg_ptr, ptr0, len0);
        return ret === 0 ? undefined : SymbolLocation.__wrap(ret);
    }
    /**
     * @param {number} cursor_idx
     * @returns {boolean}
     */
    check_if_in_prompt(cursor_idx) {
        const ret = wasm.wasmruntime_check_if_in_prompt(this.__wbg_ptr, cursor_idx);
        return ret !== 0;
    }
    /**
     * @param {string} symbol
     * @returns {boolean}
     */
    is_valid_type_alias(symbol) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_is_valid_type_alias(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * @param {string} file_name
     * @param {number} cursor_idx
     * @returns {WasmEntityAtPosition | undefined}
     */
    get_entity_at_position(file_name, cursor_idx) {
        const ptr0 = passStringToWasm0(file_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_get_entity_at_position(this.__wbg_ptr, ptr0, len0, cursor_idx);
        return ret === 0 ? undefined : WasmEntityAtPosition.__wrap(ret);
    }
    /**
     * @param {string} file_name
     * @param {string} selected_func
     * @param {number} cursor_idx
     * @returns {WasmFunction | undefined}
     */
    get_function_at_position(file_name, selected_func, cursor_idx) {
        const ptr0 = passStringToWasm0(file_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(selected_func, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_get_function_at_position(this.__wbg_ptr, ptr0, len0, ptr1, len1, cursor_idx);
        return ret === 0 ? undefined : WasmFunction.__wrap(ret);
    }
    /**
     * @param {string} file_name
     * @param {number} cursor_idx
     * @returns {WasmParentFunction | undefined}
     */
    get_function_of_testcase(file_name, cursor_idx) {
        const ptr0 = passStringToWasm0(file_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_get_function_of_testcase(this.__wbg_ptr, ptr0, len0, cursor_idx);
        return ret === 0 ? undefined : WasmParentFunction.__wrap(ret);
    }
    /**
     * @param {string} symbol
     * @returns {SymbolLocation[]}
     */
    search_for_enum_locations(symbol) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_search_for_enum_locations(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * @param {WasmFunction} parent_function
     * @param {number} cursor_idx
     * @returns {WasmTestCase | undefined}
     */
    get_testcase_from_position(parent_function, cursor_idx) {
        _assertClass(parent_function, WasmFunction);
        var ptr0 = parent_function.__destroy_into_raw();
        const ret = wasm.wasmruntime_get_testcase_from_position(this.__wbg_ptr, ptr0, cursor_idx);
        return ret === 0 ? undefined : WasmTestCase.__wrap(ret);
    }
    /**
     * @param {string} symbol
     * @returns {SymbolLocation[]}
     */
    search_for_class_locations(symbol) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_search_for_class_locations(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * @param {string} symbol
     * @returns {SymbolLocation[]}
     */
    search_for_type_alias_locations(symbol) {
        const ptr0 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmruntime_search_for_type_alias_locations(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
}
if (Symbol.dispose) WasmRuntime.prototype[Symbol.dispose] = WasmRuntime.prototype.free;

const WasmScopeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmscope_free(ptr >>> 0, 1));

export class WasmScope {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmScope.prototype);
        obj.__wbg_ptr = ptr;
        WasmScopeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmScopeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmscope_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    get_orchestration_scope_info() {
        const ret = wasm.wasmscope_get_orchestration_scope_info(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {string}
     */
    name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmscope_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WasmScope.prototype[Symbol.dispose] = WasmScope.prototype.free;

const WasmSpanFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmspan_free(ptr >>> 0, 1));

export class WasmSpan {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmSpan.prototype);
        obj.__wbg_ptr = ptr;
        WasmSpanFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            file_path: this.file_path,
            start: this.start,
            end: this.end,
            start_line: this.start_line,
            start_column: this.start_column,
            end_line: this.end_line,
            end_column: this.end_column,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSpanFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmspan_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get file_path() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmspan_file_path(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get start() {
        const ret = wasm.__wbg_get_symbollocation_start_line(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get end() {
        const ret = wasm.__wbg_get_symbollocation_start_character(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get start_line() {
        const ret = wasm.__wbg_get_symbollocation_end_line(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get start_column() {
        const ret = wasm.__wbg_get_symbollocation_end_character(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get end_line() {
        const ret = wasm.__wbg_get_wasmspan_end_line(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get end_column() {
        const ret = wasm.__wbg_get_wasmspan_end_column(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) WasmSpan.prototype[Symbol.dispose] = WasmSpan.prototype.free;

const WasmTestCaseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtestcase_free(ptr >>> 0, 1));

export class WasmTestCase {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTestCase.prototype);
        obj.__wbg_ptr = ptr;
        WasmTestCaseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
            name: this.name,
            inputs: this.inputs,
            error: this.error,
            span: this.span,
            function_type: this.function_type,
            parent_functions: this.parent_functions,
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTestCaseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtestcase_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_wasmtestcase_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {WasmParam[]}
     */
    get inputs() {
        const ret = wasm.__wbg_get_wasmtestcase_inputs(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {string | undefined}
     */
    get error() {
        const ret = wasm.__wbg_get_wasmtestcase_error(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {WasmSpan}
     */
    get span() {
        const ret = wasm.__wbg_get_wasmgeneratorconfig_span(this.__wbg_ptr);
        return WasmSpan.__wrap(ret);
    }
    /**
     * @returns {WasmFunctionKind}
     */
    get function_type() {
        const ret = wasm.__wbg_get_wasmfunction_function_type(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {WasmParentFunction[]}
     */
    get parent_functions() {
        const ret = wasm.__wbg_get_wasmtestcase_parent_functions(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) WasmTestCase.prototype[Symbol.dispose] = WasmTestCase.prototype.free;

const WasmTestResponseFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtestresponse_free(ptr >>> 0, 1));

export class WasmTestResponse {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTestResponse.prototype);
        obj.__wbg_ptr = ptr;
        WasmTestResponseFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTestResponseFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtestresponse_free(ptr, 0);
    }
    /**
     * @returns {WasmLLMFailure | undefined}
     */
    llm_failure() {
        const ret = wasm.wasmtestresponse_llm_failure(this.__wbg_ptr);
        return ret === 0 ? undefined : WasmLLMFailure.__wrap(ret);
    }
    /**
     * @returns {WasmLLMResponse | undefined}
     */
    llm_response() {
        const ret = wasm.wasmtestresponse_llm_response(this.__wbg_ptr);
        return ret === 0 ? undefined : WasmLLMResponse.__wrap(ret);
    }
    /**
     * @returns {WasmFunctionTestPair}
     */
    func_test_pair() {
        const ret = wasm.wasmtestresponse_func_test_pair(this.__wbg_ptr);
        return WasmFunctionTestPair.__wrap(ret);
    }
    /**
     * @returns {string | undefined}
     */
    failure_message() {
        const ret = wasm.wasmtestresponse_failure_message(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @returns {WasmParsedTestResponse | undefined}
     */
    parsed_response() {
        const ret = wasm.wasmtestresponse_parsed_response(this.__wbg_ptr);
        return ret === 0 ? undefined : WasmParsedTestResponse.__wrap(ret);
    }
    /**
     * @returns {TestStatus}
     */
    status() {
        const ret = wasm.wasmtestresponse_status(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {string | undefined}
     */
    trace_url() {
        const ret = wasm.wasmtestresponse_trace_url(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
}
if (Symbol.dispose) WasmTestResponse.prototype[Symbol.dispose] = WasmTestResponse.prototype.free;

const WasmTestResponsesFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtestresponses_free(ptr >>> 0, 1));

export class WasmTestResponses {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTestResponses.prototype);
        obj.__wbg_ptr = ptr;
        WasmTestResponsesFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    toJSON() {
        return {
        };
    }

    toString() {
        return JSON.stringify(this);
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTestResponsesFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtestresponses_free(ptr, 0);
    }
    /**
     * @returns {WasmTestResponse | undefined}
     */
    yield_next() {
        const ret = wasm.wasmtestresponses_yield_next(this.__wbg_ptr);
        return ret === 0 ? undefined : WasmTestResponse.__wrap(ret);
    }
}
if (Symbol.dispose) WasmTestResponses.prototype[Symbol.dispose] = WasmTestResponses.prototype.free;

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_Error_e83987f665cf5504 = function(arg0, arg1) {
        const ret = Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___onWasmPanic_3392d4bf4b91d35f = function(arg0, arg1) {
        __onWasmPanic(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg___wbindgen_boolean_get_6d5a1ee65bab5f68 = function(arg0) {
        const v = arg0;
        const ret = typeof(v) === 'boolean' ? v : undefined;
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
    };
    imports.wbg.__wbg___wbindgen_debug_string_df47ffb5e35e6763 = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_in_bb933bd9e1b3bc0f = function(arg0, arg1) {
        const ret = arg0 in arg1;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_function_ee8a6c5833c90377 = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_null_5e69f72e906cc57c = function(arg0) {
        const ret = arg0 === null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_object_c818261d21f283a4 = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_string_fbb76cb2940daafd = function(arg0) {
        const ret = typeof(arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_2d472862bd29a478 = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_jsval_loose_eq_b664b38a2f582147 = function(arg0, arg1) {
        const ret = arg0 == arg1;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_number_get_a20bf9b85341449d = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg___wbindgen_string_get_e4f06c90489ad01b = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_throw_b855445ff6a94295 = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg__wbg_cb_unref_2454a539ea5790d9 = function(arg0) {
        arg0._wbg_cb_unref();
    };
    imports.wbg.__wbg_abort_28ad55c5825b004d = function(arg0, arg1) {
        arg0.abort(arg1);
    };
    imports.wbg.__wbg_abort_e7eb059f72f9ed0c = function(arg0) {
        arg0.abort();
    };
    imports.wbg.__wbg_aborted_5324479d548fefa2 = function(arg0) {
        const ret = arg0.aborted;
        return ret;
    };
    imports.wbg.__wbg_append_b577eb3a177bc0fa = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_arrayBuffer_b375eccb84b4ddf3 = function() { return handleError(function (arg0) {
        const ret = arg0.arrayBuffer();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_body_587542b2fd8e06c0 = function(arg0) {
        const ret = arg0.body;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_buffer_ccc4520b36d3ccf4 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_byobRequest_2344e6975f27456e = function(arg0) {
        const ret = arg0.byobRequest;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_byteLength_bcd42e4025299788 = function(arg0) {
        const ret = arg0.byteLength;
        return ret;
    };
    imports.wbg.__wbg_byteOffset_ca3a6cf7944b364b = function(arg0) {
        const ret = arg0.byteOffset;
        return ret;
    };
    imports.wbg.__wbg_call_525440f72fbfc0ea = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_e762c39fa8ea36bf = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_cancel_48ab6f9dc366e369 = function(arg0) {
        const ret = arg0.cancel();
        return ret;
    };
    imports.wbg.__wbg_catch_943836faa5d29bfb = function(arg0, arg1) {
        const ret = arg0.catch(arg1);
        return ret;
    };
    imports.wbg.__wbg_clearTimeout_5a54f8841c30079a = function(arg0) {
        const ret = clearTimeout(arg0);
        return ret;
    };
    imports.wbg.__wbg_clearTimeout_6222fede17abcb1a = function(arg0) {
        const ret = clearTimeout(arg0);
        return ret;
    };
    imports.wbg.__wbg_clearTimeout_96804de0ab838f26 = function(arg0) {
        const ret = clearTimeout(arg0);
        return ret;
    };
    imports.wbg.__wbg_close_5a6caed3231b68cd = function() { return handleError(function (arg0) {
        arg0.close();
    }, arguments) };
    imports.wbg.__wbg_close_6956df845478561a = function() { return handleError(function (arg0) {
        arg0.close();
    }, arguments) };
    imports.wbg.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
        const ret = arg0.crypto;
        return ret;
    };
    imports.wbg.__wbg_crypto_f5dce82c355d159f = function() { return handleError(function (arg0) {
        const ret = arg0.crypto;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_debug_e55e1461940eb14d = function(arg0, arg1, arg2, arg3) {
        console.debug(arg0, arg1, arg2, arg3);
    };
    imports.wbg.__wbg_done_2042aa2670fb1db1 = function(arg0) {
        const ret = arg0.done;
        return ret;
    };
    imports.wbg.__wbg_done_9e178b857484d3df = function(arg0) {
        const ret = arg0.done;
        return ret;
    };
    imports.wbg.__wbg_enqueue_7b18a650aec77898 = function() { return handleError(function (arg0, arg1) {
        arg0.enqueue(arg1);
    }, arguments) };
    imports.wbg.__wbg_entries_e171b586f8f6bdbf = function(arg0) {
        const ret = Object.entries(arg0);
        return ret;
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_error_a7f8fbb0523dae15 = function(arg0) {
        console.error(arg0);
    };
    imports.wbg.__wbg_error_d8b22cf4e59a6791 = function(arg0, arg1, arg2, arg3) {
        console.error(arg0, arg1, arg2, arg3);
    };
    imports.wbg.__wbg_fetch_f156d10be9a5c88a = function(arg0) {
        const ret = fetch(arg0);
        return ret;
    };
    imports.wbg.__wbg_fetch_f8ba0e29a9d6de0d = function(arg0, arg1) {
        const ret = arg0.fetch(arg1);
        return ret;
    };
    imports.wbg.__wbg_getRandomValues_3d90134a348e46b3 = function() { return handleError(function (arg0, arg1) {
        globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError(function (arg0, arg1) {
        arg0.getRandomValues(arg1);
    }, arguments) };
    imports.wbg.__wbg_getReader_f5255c829ee10d2f = function() { return handleError(function (arg0) {
        const ret = arg0.getReader();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_getTime_14776bfb48a1bff9 = function(arg0) {
        const ret = arg0.getTime();
        return ret;
    };
    imports.wbg.__wbg_getTimezoneOffset_d391cb11d54969f8 = function(arg0) {
        const ret = arg0.getTimezoneOffset();
        return ret;
    };
    imports.wbg.__wbg_get_7bed016f185add81 = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_get_efcb449f58ec27c2 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_with_ref_key_1dc361bd10053bfe = function(arg0, arg1) {
        const ret = arg0[arg1];
        return ret;
    };
    imports.wbg.__wbg_has_787fafc980c3ccdb = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_headers_b87d7eaba61c3278 = function(arg0) {
        const ret = arg0.headers;
        return ret;
    };
    imports.wbg.__wbg_importKey_2be19189a1451235 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        const ret = arg0.importKey(getStringFromWasm0(arg1, arg2), arg3, arg4, arg5 !== 0, arg6);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_info_68cd5b51ef7e5137 = function(arg0, arg1, arg2, arg3) {
        console.info(arg0, arg1, arg2, arg3);
    };
    imports.wbg.__wbg_instanceof_AbortSignal_87bdb94157c9e488 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof AbortSignal;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_70beb1189ca63b38 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Error_a944ec10920129e2 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Error;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Response_f4f3e87e07f3135c = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Response;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_20c8e73002f7af98 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Window_4846dbb3de56c84c = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_96e0af9891d0945d = function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    };
    imports.wbg.__wbg_iterator_e5822695327a3c39 = function() {
        const ret = Symbol.iterator;
        return ret;
    };
    imports.wbg.__wbg_length_69bca3cb64fc8748 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_cdd215e10d9dd507 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_log_45eb3a49e7cdcb64 = function(arg0, arg1, arg2, arg3) {
        console.log(arg0, arg1, arg2, arg3);
    };
    imports.wbg.__wbg_log_8cec76766b8c0e33 = function(arg0) {
        console.log(arg0);
    };
    imports.wbg.__wbg_message_1ee258909d7264fd = function(arg0) {
        const ret = arg0.message;
        return ret;
    };
    imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
        const ret = arg0.msCrypto;
        return ret;
    };
    imports.wbg.__wbg_name_4810447ab1aad468 = function(arg0) {
        const ret = arg0.name;
        return ret;
    };
    imports.wbg.__wbg_navigator_971384882e8ea23a = function(arg0) {
        const ret = arg0.navigator;
        return ret;
    };
    imports.wbg.__wbg_new_0_f9740686d739025c = function() {
        const ret = new Date();
        return ret;
    };
    imports.wbg.__wbg_new_1acc0b6eea89d040 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_2531773dac38ebb3 = function() { return handleError(function () {
        const ret = new AbortController();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_3c3d849046688a66 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke___wasm_bindgen_ea049f8341f88ca3___JsValue__wasm_bindgen_ea049f8341f88ca3___JsValue_____(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return ret;
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_new_5a79be3ab53b8aa5 = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_68651c719dcda04e = function() {
        const ret = new Map();
        return ret;
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_new_93d9417ed3fb115d = function(arg0) {
        const ret = new Date(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_9edf9838a2def39c = function() { return handleError(function () {
        const ret = new Headers();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_a7442b4b19c1a356 = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_e17d9f43105b08be = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_from_slice_92f4d78ca282a2d2 = function(arg0, arg1) {
        const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_no_args_ee98eee5275000a4 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_with_byte_offset_and_length_46e3e6a5e9f9e89b = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_with_length_01aa0dc35aa13543 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_with_str_and_init_0ae7728b6ec367b1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_next_020810e0ae8ebcb0 = function() { return handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_next_2c826fe5dfec6b6a = function(arg0) {
        const ret = arg0.next;
        return ret;
    };
    imports.wbg.__wbg_node_905d3e251edff8a2 = function(arg0) {
        const ret = arg0.node;
        return ret;
    };
    imports.wbg.__wbg_now_0dc4920a47cf7280 = function(arg0) {
        const ret = arg0.now();
        return ret;
    };
    imports.wbg.__wbg_now_2c95c9de01293173 = function(arg0) {
        const ret = arg0.now();
        return ret;
    };
    imports.wbg.__wbg_now_698fd875f24e9a0f = function() { return handleError(function () {
        const ret = Date.now();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_now_793306c526e2e3b6 = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_performance_6adc3b899e448a23 = function(arg0) {
        const ret = arg0.performance;
        return ret;
    };
    imports.wbg.__wbg_performance_7a3ffd0b17f663ad = function(arg0) {
        const ret = arg0.performance;
        return ret;
    };
    imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
        const ret = arg0.process;
        return ret;
    };
    imports.wbg.__wbg_prototypesetcall_2a6620b6922694b2 = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
    };
    imports.wbg.__wbg_push_df81a39d04db858c = function(arg0, arg1) {
        const ret = arg0.push(arg1);
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_34d692c25c47d05b = function(arg0) {
        const ret = arg0.queueMicrotask;
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_9d76cacb20c84d58 = function(arg0) {
        queueMicrotask(arg0);
    };
    imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError(function (arg0, arg1) {
        arg0.randomFillSync(arg1);
    }, arguments) };
    imports.wbg.__wbg_read_48f1593df542f968 = function(arg0) {
        const ret = arg0.read();
        return ret;
    };
    imports.wbg.__wbg_releaseLock_5d0b5a68887b891d = function(arg0) {
        arg0.releaseLock();
    };
    imports.wbg.__wbg_require_60cc747a6bc5215a = function() { return handleError(function () {
        const ret = module.require;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_resolve_caf97c30b83f7053 = function(arg0) {
        const ret = Promise.resolve(arg0);
        return ret;
    };
    imports.wbg.__wbg_respond_0f4dbf5386f5c73e = function() { return handleError(function (arg0, arg1) {
        arg0.respond(arg1 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_setTimeout_2b339866a2aa3789 = function(arg0, arg1) {
        const ret = setTimeout(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_setTimeout_63008613644b07af = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.setTimeout(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_db2dbaeefb6f39c7 = function() { return handleError(function (arg0, arg1) {
        const ret = setTimeout(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_eefe7f4c234b0c6b = function() { return handleError(function (arg0, arg1) {
        const ret = setTimeout(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_9e6516df7b7d0f19 = function(arg0, arg1, arg2) {
        arg0.set(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_set_body_3c365989753d61f4 = function(arg0, arg1) {
        arg0.body = arg1;
    };
    imports.wbg.__wbg_set_c2abbebe8b9ebee1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_cache_2f9deb19b92b81e3 = function(arg0, arg1) {
        arg0.cache = __wbindgen_enum_RequestCache[arg1];
    };
    imports.wbg.__wbg_set_credentials_f621cd2d85c0c228 = function(arg0, arg1) {
        arg0.credentials = __wbindgen_enum_RequestCredentials[arg1];
    };
    imports.wbg.__wbg_set_headers_6926da238cd32ee4 = function(arg0, arg1) {
        arg0.headers = arg1;
    };
    imports.wbg.__wbg_set_method_c02d8cbbe204ac2d = function(arg0, arg1, arg2) {
        arg0.method = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_mode_52ef73cfa79639cb = function(arg0, arg1) {
        arg0.mode = __wbindgen_enum_RequestMode[arg1];
    };
    imports.wbg.__wbg_set_onabort_c8a1775b0cf5c7db = function(arg0, arg1) {
        arg0.onabort = arg1;
    };
    imports.wbg.__wbg_set_signal_dda2cf7ccb6bee0f = function(arg0, arg1) {
        arg0.signal = arg1;
    };
    imports.wbg.__wbg_sign_0077f2aabd37825a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = arg0.sign(arg1, arg2, getArrayU8FromWasm0(arg3, arg4));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_signal_4db5aa055bf9eb9a = function(arg0) {
        const ret = arg0.signal;
        return ret;
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_89e1d9ac6a1b250e = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_8b530f326a9e48ac = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_6fdf4b64710cc91b = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_b45bfc5a37f6cfa2 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_status_de7eed5a7a5bfd5d = function(arg0) {
        const ret = arg0.status;
        return ret;
    };
    imports.wbg.__wbg_stringify_b5fb28f6465d9c3e = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_subarray_480600f3d6a9f26c = function(arg0, arg1, arg2) {
        const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_subtle_a158c8cba320b8ed = function(arg0) {
        const ret = arg0.subtle;
        return ret;
    };
    imports.wbg.__wbg_symbollocation_new = function(arg0) {
        const ret = SymbolLocation.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_text_dc33c15c17bdfb52 = function() { return handleError(function (arg0) {
        const ret = arg0.text();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_then_4f46f6544e6b4a28 = function(arg0, arg1) {
        const ret = arg0.then(arg1);
        return ret;
    };
    imports.wbg.__wbg_then_70d05cf780a18d77 = function(arg0, arg1, arg2) {
        const ret = arg0.then(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_url_b36d2a5008eb056f = function(arg0, arg1) {
        const ret = arg1.url;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_userAgent_b20949aa6be940a6 = function() { return handleError(function (arg0, arg1) {
        const ret = arg1.userAgent;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_value_692627309814bb8c = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbg_value_e5170ceef06c5805 = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbg_versions_c01dfd4722a88165 = function(arg0) {
        const ret = arg0.versions;
        return ret;
    };
    imports.wbg.__wbg_view_f6c15ac9fed63bbd = function(arg0) {
        const ret = arg0.view;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_warn_8f5b5437666d0885 = function(arg0, arg1, arg2, arg3) {
        console.warn(arg0, arg1, arg2, arg3);
    };
    imports.wbg.__wbg_wasmchatmessage_new = function(arg0) {
        const ret = WasmChatMessage.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmchatmessagepart_new = function(arg0) {
        const ret = WasmChatMessagePart.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmcontrolflowedge_new = function(arg0) {
        const ret = WasmControlFlowEdge.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmcontrolflownode_new = function(arg0) {
        const ret = WasmControlFlowNode.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmdiagnosticerror_new = function(arg0) {
        const ret = WasmDiagnosticError.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmerror_new = function(arg0) {
        const ret = WasmError.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmfunction_new = function(arg0) {
        const ret = WasmFunction.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmfunctionresponse_new = function(arg0) {
        const ret = WasmFunctionResponse.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmgeneratedfile_new = function(arg0) {
        const ret = WasmGeneratedFile.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmgeneratorconfig_new = function(arg0) {
        const ret = WasmGeneratorConfig.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmgeneratoroutput_new = function(arg0) {
        const ret = WasmGeneratorOutput.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmparam_new = function(arg0) {
        const ret = WasmParam.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmparentfunction_new = function(arg0) {
        const ret = WasmParentFunction.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmprompt_new = function(arg0) {
        const ret = WasmPrompt.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmscope_new = function(arg0) {
        const ret = WasmScope.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmtestcase_new = function(arg0) {
        const ret = WasmTestCase.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_wasmtestresponses_new = function(arg0) {
        const ret = WasmTestResponses.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_2e7bd9abf436cd69 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 8080, function: Function { arguments: [], shim_idx: 8081, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_ea049f8341f88ca3___closure__destroy___dyn_core_66a0c75b29bc39a___ops__function__FnMut_____Output_______, wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______);
        return ret;
    };
    imports.wbg.__wbindgen_cast_3f3ebc150ddd9d5a = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 2849, function: Function { arguments: [], shim_idx: 2850, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_ea049f8341f88ca3___closure__destroy___dyn_core_66a0c75b29bc39a___ops__function__FnMut_____Output_______, wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______);
        return ret;
    };
    imports.wbg.__wbindgen_cast_4bacac3f32614913 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 425, function: Function { arguments: [], shim_idx: 426, ret: Unit, inner_ret: Some(Unit) }, mutable: false }) -> Externref`.
        const ret = makeClosure(arg0, arg1, wasm.wasm_bindgen_ea049f8341f88ca3___closure__destroy___dyn_core_66a0c75b29bc39a___ops__function__Fn_____Output_______, wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______);
        return ret;
    };
    imports.wbg.__wbindgen_cast_7529d836212197e7 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 9515, function: Function { arguments: [Externref], shim_idx: 9516, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_ea049f8341f88ca3___closure__destroy___dyn_core_66a0c75b29bc39a___ops__function__FnMut__wasm_bindgen_ea049f8341f88ca3___JsValue____Output_______, wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke___wasm_bindgen_ea049f8341f88ca3___JsValue_____);
        return ret;
    };
    imports.wbg.__wbindgen_cast_a4f6925d953b379f = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 8086, function: Function { arguments: [], shim_idx: 8087, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_ea049f8341f88ca3___closure__destroy___dyn_core_66a0c75b29bc39a___ops__function__FnMut_____Output_______, wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______);
        return ret;
    };
    imports.wbg.__wbindgen_cast_cb9088102bce6b30 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
        const ret = getArrayU8FromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
        // Cast intrinsic for `F64 -> Externref`.
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_cast_d84f2f1e75083819 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 9469, function: Function { arguments: [], shim_idx: 9470, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_ea049f8341f88ca3___closure__destroy___dyn_core_66a0c75b29bc39a___ops__function__FnMut_____Output_______, wasm_bindgen_ea049f8341f88ca3___convert__closures_____invoke______);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_externrefs;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('baml_schema_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
