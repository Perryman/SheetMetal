/* tslint:disable */
/* eslint-disable */
export function on_wasm_init(): void;
export function enable_logs(): void;
export function version(): string;
export function format_document(path: string, text: string): string | undefined;
/**
 * This allows us to invoke JS callbacks from Rust.
 *
 * We need to do this as a wildly hacky workaround because (1) wasm in the webview is sandboxed and doesn't have easy
 * access to env vars and (2) js_sys::Value is not Send which causes a bunch of painful issues with tokio, since
 * the compiler-generated futures need to be Send even though we don't use web workers.
 */
export function init_js_callback_bridge(load_aws_creds_cb: Function, load_gcp_creds_cb: Function): void;
export enum TestStatus {
  Passed = 0,
  LLMFailure = 1,
  ParseFailure = 2,
  FinishReasonFailed = 3,
  ConstraintsFailed = 4,
  AssertFailed = 5,
  UnableToRun = 6,
}
export enum WasmChatMessagePartMediaType {
  Url = 0,
  File = 1,
  Error = 2,
}
export enum WasmControlFlowNodeType {
  FunctionRoot = 0,
  HeaderContextEnter = 1,
  BranchGroup = 2,
  BranchArm = 3,
  Loop = 4,
  OtherScope = 5,
}
export enum WasmFunctionKind {
  Llm = 0,
  Expr = 1,
}
export class IntoUnderlyingByteSource {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  pull(controller: ReadableByteStreamController): Promise<any>;
  start(controller: ReadableByteStreamController): void;
  cancel(): void;
  readonly autoAllocateChunkSize: number;
  readonly type: string;
}
export class IntoUnderlyingSink {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  abort(reason: any): Promise<any>;
  close(): Promise<any>;
  write(chunk: any): Promise<any>;
}
export class IntoUnderlyingSource {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  pull(controller: ReadableStreamDefaultController): Promise<any>;
  cancel(): void;
}
export class SerializableOrchestratorNode {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  provider: string;
}
export class SymbolLocation {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  uri: string;
  start_line: number;
  start_character: number;
  end_line: number;
  end_character: number;
}
export class WasmCallContext {
  free(): void;
  [Symbol.dispose](): void;
  constructor();
  set node_index(value: number | null | undefined);
}
export class WasmChatMessage {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly role: string;
  readonly parts: WasmChatMessagePart[];
}
export class WasmChatMessagePart {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  is_pdf(): boolean;
  as_text(): string | undefined;
  is_text(): boolean;
  as_media(): WasmChatMessagePartMedia | undefined;
  is_audio(): boolean;
  is_image(): boolean;
  is_video(): boolean;
  json_meta(prompt: WasmPrompt): string | undefined;
}
export class WasmChatMessagePartMedia {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  type: WasmChatMessagePartMediaType;
  content: string;
}
export class WasmControlFlowEdge {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly src: number;
  readonly dst: number;
}
export class WasmControlFlowGraph {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly nodes: WasmControlFlowNode[];
  readonly edges: WasmControlFlowEdge[];
}
export class WasmControlFlowNode {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly id: number;
  readonly parent_id: number | undefined;
  readonly lexical_id: string;
  readonly label: string;
  readonly span: WasmSpan;
  readonly node_type: WasmControlFlowNodeType;
}
export class WasmDiagnosticError {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  errors(): WasmError[];
  all_files: string[];
}
export class WasmEntityAtPosition {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  /**
   * The type of entity: "function", "node", or "test"
   */
  readonly entity_type: string;
  /**
   * The name of the entity (function name, node label, or test name)
   */
  readonly entity_name: string;
  /**
   * The name of the function this entity belongs to.
   * For function entities, this equals entity_name.
   * For node entities, this is the parent function name.
   * For test entities, this is the parent function name.
   */
  readonly function_name: string;
  readonly span: WasmSpan;
  readonly function_type: WasmFunctionKind | undefined;
  readonly node_id: string | undefined;
  readonly node_label: string | undefined;
  /**
   * For test entities, the name of the test case
   */
  readonly test_name: string | undefined;
}
export class WasmError {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly type: string;
  readonly file_path: string;
  readonly start_ch: number;
  readonly end_ch: number;
  readonly start_line: number;
  readonly start_column: number;
  readonly end_line: number;
  readonly end_column: number;
  readonly message: string;
}
export class WasmFunction {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  client_name(rt: WasmRuntime): string;
  function_graph(rt: WasmRuntime): string;
  function_graph_v2(rt: WasmRuntime): WasmControlFlowGraph;
  orchestration_graph(rt: WasmRuntime): WasmScope[];
  render_prompt_for_test(rt: WasmRuntime, test_name: string, wasm_call_context: WasmCallContext, get_baml_src_cb: Function, env: object): Promise<WasmPrompt>;
  render_raw_curl_for_test(rt: WasmRuntime, test_name: string, wasm_call_context: WasmCallContext, stream: boolean, expand_images: boolean, get_baml_src_cb: Function, env: object, expose_secrets: boolean): Promise<string>;
  readonly name: string;
  readonly span: WasmSpan;
  readonly function_type: WasmFunctionKind;
  readonly test_cases: WasmTestCase[];
  readonly test_snippet: string;
  readonly signature: string;
}
export class WasmFunctionResponse {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  llm_failure(): WasmLLMFailure | undefined;
  llm_response(): WasmLLMResponse | undefined;
  func_test_pair(): WasmFunctionTestPair;
  parsed_response(): string | undefined;
}
export class WasmFunctionTestPair {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly function_name: string;
  readonly test_name: string;
}
export class WasmGeneratedFile {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly path_in_output_dir: string;
  readonly contents: string;
}
export class WasmGeneratorConfig {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly output_type: string;
  readonly version: string;
  readonly span: WasmSpan;
}
export class WasmGeneratorOutput {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly output_dir: string;
  readonly output_dir_relative_to_baml_src: string;
  readonly files: WasmGeneratedFile[];
}
export class WasmLLMFailure {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  client_name(): string;
  prompt(): WasmPrompt;
  get model(): string | undefined;
  set model(value: string | null | undefined);
  start_time_unix_ms: bigint;
  latency_ms: bigint;
  message: string;
  code: string;
}
export class WasmLLMResponse {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  client_name(): string;
  prompt(): WasmPrompt;
  model: string;
  content: string;
  start_time_unix_ms: bigint;
  latency_ms: bigint;
  get input_tokens(): bigint | undefined;
  set input_tokens(value: bigint | null | undefined);
  get output_tokens(): bigint | undefined;
  set output_tokens(value: bigint | null | undefined);
  get total_tokens(): bigint | undefined;
  set total_tokens(value: bigint | null | undefined);
  get stop_reason(): string | undefined;
  set stop_reason(value: string | null | undefined);
}
export class WasmParam {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly name: string;
  readonly value: string | undefined;
  readonly error: string | undefined;
}
export class WasmParentFunction {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly start: number;
  readonly end: number;
  readonly name: string;
}
export class WasmParsedTestResponse {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly value: string;
  readonly check_count: number;
  /**
   * JSON-string of the explanation, if there were any ParsingErrors
   */
  readonly explanation: string | undefined;
}
export class WasmProject {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  diagnostics(rt: WasmRuntime): WasmDiagnosticError;
  update_file(name: string, content?: string | null): void;
  run_generators(no_version_check?: boolean | null): WasmGeneratorOutput[];
  set_unsaved_file(name: string, content?: string | null): void;
  static new(root_dir_name: string, files: any): WasmProject;
  files(): string[];
  runtime(env_vars: any, feature_flags: any): WasmRuntime;
  save_file(name: string, content: string): void;
  readonly root_dir_name: string;
}
export class WasmPrompt {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  is_completion(): boolean;
  as_chat(): WasmChatMessage[] | undefined;
  is_chat(): boolean;
  client_name: string;
}
export class WasmRuntime {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  static check_version(generator_version: string, current_version: string, generator_type: string, version_check_mode: string, generator_language: string, is_diagnostic: boolean): string | undefined;
  is_valid_enum(symbol: string): boolean;
  is_valid_class(symbol: string): boolean;
  list_functions(): WasmFunction[];
  list_testcases(): WasmTestCase[];
  list_generators(): WasmGeneratorConfig[];
  is_valid_function(symbol: string): boolean;
  required_env_vars(): string[];
  search_for_symbol(symbol: string): SymbolLocation | undefined;
  check_if_in_prompt(cursor_idx: number): boolean;
  is_valid_type_alias(symbol: string): boolean;
  get_entity_at_position(file_name: string, cursor_idx: number): WasmEntityAtPosition | undefined;
  get_function_at_position(file_name: string, selected_func: string, cursor_idx: number): WasmFunction | undefined;
  get_function_of_testcase(file_name: string, cursor_idx: number): WasmParentFunction | undefined;
  search_for_enum_locations(symbol: string): SymbolLocation[];
  get_testcase_from_position(parent_function: WasmFunction, cursor_idx: number): WasmTestCase | undefined;
  search_for_class_locations(symbol: string): SymbolLocation[];
  search_for_type_alias_locations(symbol: string): SymbolLocation[];
  run_tests(function_test_pairs: Array<any>, on_partial_response: Function, get_baml_src_cb: Function, env: object, abort_signal: object | null | undefined, watch_handler: Function, parallel?: boolean | null): Promise<WasmTestResponses>;
}
export class WasmScope {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  get_orchestration_scope_info(): any;
  name(): string;
}
export class WasmSpan {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly file_path: string;
  readonly start: number;
  readonly end: number;
  readonly start_line: number;
  readonly start_column: number;
  readonly end_line: number;
  readonly end_column: number;
}
export class WasmTestCase {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  readonly name: string;
  readonly inputs: WasmParam[];
  readonly error: string | undefined;
  readonly span: WasmSpan;
  readonly function_type: WasmFunctionKind;
  readonly parent_functions: WasmParentFunction[];
}
export class WasmTestResponse {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  llm_failure(): WasmLLMFailure | undefined;
  llm_response(): WasmLLMResponse | undefined;
  func_test_pair(): WasmFunctionTestPair;
  failure_message(): string | undefined;
  parsed_response(): WasmParsedTestResponse | undefined;
  status(): TestStatus;
  trace_url(): string | undefined;
}
export class WasmTestResponses {
  private constructor();
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
  [Symbol.dispose](): void;
  yield_next(): WasmTestResponse | undefined;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_get_serializableorchestratornode_provider: (a: number) => [number, number];
  readonly __wbg_get_symbollocation_end_character: (a: number) => number;
  readonly __wbg_get_symbollocation_end_line: (a: number) => number;
  readonly __wbg_get_symbollocation_start_character: (a: number) => number;
  readonly __wbg_get_symbollocation_start_line: (a: number) => number;
  readonly __wbg_get_symbollocation_uri: (a: number) => [number, number];
  readonly __wbg_get_wasmcontrolflowedge_dst: (a: number) => number;
  readonly __wbg_get_wasmcontrolflowedge_src: (a: number) => number;
  readonly __wbg_get_wasmcontrolflowgraph_edges: (a: number) => [number, number];
  readonly __wbg_get_wasmcontrolflowgraph_nodes: (a: number) => [number, number];
  readonly __wbg_get_wasmcontrolflownode_id: (a: number) => number;
  readonly __wbg_get_wasmcontrolflownode_label: (a: number) => [number, number];
  readonly __wbg_get_wasmcontrolflownode_lexical_id: (a: number) => [number, number];
  readonly __wbg_get_wasmcontrolflownode_node_type: (a: number) => number;
  readonly __wbg_get_wasmcontrolflownode_parent_id: (a: number) => number;
  readonly __wbg_get_wasmcontrolflownode_span: (a: number) => number;
  readonly __wbg_get_wasmdiagnosticerror_all_files: (a: number) => [number, number];
  readonly __wbg_get_wasmentityatposition_entity_name: (a: number) => [number, number];
  readonly __wbg_get_wasmentityatposition_entity_type: (a: number) => [number, number];
  readonly __wbg_get_wasmentityatposition_function_name: (a: number) => [number, number];
  readonly __wbg_get_wasmentityatposition_function_type: (a: number) => number;
  readonly __wbg_get_wasmentityatposition_node_id: (a: number) => [number, number];
  readonly __wbg_get_wasmentityatposition_node_label: (a: number) => [number, number];
  readonly __wbg_get_wasmentityatposition_span: (a: number) => number;
  readonly __wbg_get_wasmentityatposition_test_name: (a: number) => [number, number];
  readonly __wbg_get_wasmerror_end_ch: (a: number) => number;
  readonly __wbg_get_wasmerror_end_column: (a: number) => number;
  readonly __wbg_get_wasmerror_end_line: (a: number) => number;
  readonly __wbg_get_wasmerror_file_path: (a: number) => [number, number];
  readonly __wbg_get_wasmerror_message: (a: number) => [number, number];
  readonly __wbg_get_wasmerror_start_ch: (a: number) => number;
  readonly __wbg_get_wasmerror_start_column: (a: number) => number;
  readonly __wbg_get_wasmerror_start_line: (a: number) => number;
  readonly __wbg_get_wasmerror_type: (a: number) => [number, number];
  readonly __wbg_get_wasmfunction_function_type: (a: number) => number;
  readonly __wbg_get_wasmfunction_name: (a: number) => [number, number];
  readonly __wbg_get_wasmfunction_signature: (a: number) => [number, number];
  readonly __wbg_get_wasmfunction_span: (a: number) => number;
  readonly __wbg_get_wasmfunction_test_cases: (a: number) => [number, number];
  readonly __wbg_get_wasmfunction_test_snippet: (a: number) => [number, number];
  readonly __wbg_get_wasmfunctiontestpair_function_name: (a: number) => [number, number];
  readonly __wbg_get_wasmfunctiontestpair_test_name: (a: number) => [number, number];
  readonly __wbg_get_wasmgeneratorconfig_output_type: (a: number) => [number, number];
  readonly __wbg_get_wasmgeneratorconfig_span: (a: number) => number;
  readonly __wbg_get_wasmgeneratorconfig_version: (a: number) => [number, number];
  readonly __wbg_get_wasmllmfailure_code: (a: number) => [number, number];
  readonly __wbg_get_wasmllmfailure_latency_ms: (a: number) => bigint;
  readonly __wbg_get_wasmllmfailure_message: (a: number) => [number, number];
  readonly __wbg_get_wasmllmfailure_start_time_unix_ms: (a: number) => bigint;
  readonly __wbg_get_wasmllmresponse_content: (a: number) => [number, number];
  readonly __wbg_get_wasmllmresponse_input_tokens: (a: number) => [number, bigint];
  readonly __wbg_get_wasmllmresponse_latency_ms: (a: number) => bigint;
  readonly __wbg_get_wasmllmresponse_model: (a: number) => [number, number];
  readonly __wbg_get_wasmllmresponse_output_tokens: (a: number) => [number, bigint];
  readonly __wbg_get_wasmllmresponse_start_time_unix_ms: (a: number) => bigint;
  readonly __wbg_get_wasmllmresponse_stop_reason: (a: number) => [number, number];
  readonly __wbg_get_wasmllmresponse_total_tokens: (a: number) => [number, bigint];
  readonly __wbg_get_wasmparam_error: (a: number) => [number, number];
  readonly __wbg_get_wasmparam_name: (a: number) => [number, number];
  readonly __wbg_get_wasmparam_value: (a: number) => [number, number];
  readonly __wbg_get_wasmparentfunction_name: (a: number) => [number, number];
  readonly __wbg_get_wasmparsedtestresponse_value: (a: number) => [number, number];
  readonly __wbg_get_wasmproject_root_dir_name: (a: number) => [number, number];
  readonly __wbg_get_wasmspan_end_column: (a: number) => number;
  readonly __wbg_get_wasmspan_end_line: (a: number) => number;
  readonly __wbg_get_wasmspan_file_path: (a: number) => [number, number];
  readonly __wbg_get_wasmtestcase_inputs: (a: number) => [number, number];
  readonly __wbg_get_wasmtestcase_name: (a: number) => [number, number];
  readonly __wbg_get_wasmtestcase_parent_functions: (a: number) => [number, number];
  readonly __wbg_serializableorchestratornode_free: (a: number, b: number) => void;
  readonly __wbg_set_serializableorchestratornode_provider: (a: number, b: number, c: number) => void;
  readonly __wbg_set_symbollocation_end_character: (a: number, b: number) => void;
  readonly __wbg_set_symbollocation_end_line: (a: number, b: number) => void;
  readonly __wbg_set_symbollocation_start_character: (a: number, b: number) => void;
  readonly __wbg_set_symbollocation_start_line: (a: number, b: number) => void;
  readonly __wbg_set_wasmdiagnosticerror_all_files: (a: number, b: number, c: number) => void;
  readonly __wbg_set_wasmllmfailure_code: (a: number, b: number, c: number) => void;
  readonly __wbg_set_wasmllmfailure_latency_ms: (a: number, b: bigint) => void;
  readonly __wbg_set_wasmllmfailure_message: (a: number, b: number, c: number) => void;
  readonly __wbg_set_wasmllmfailure_model: (a: number, b: number, c: number) => void;
  readonly __wbg_set_wasmllmfailure_start_time_unix_ms: (a: number, b: bigint) => void;
  readonly __wbg_set_wasmllmresponse_content: (a: number, b: number, c: number) => void;
  readonly __wbg_set_wasmllmresponse_input_tokens: (a: number, b: number, c: bigint) => void;
  readonly __wbg_set_wasmllmresponse_latency_ms: (a: number, b: bigint) => void;
  readonly __wbg_set_wasmllmresponse_model: (a: number, b: number, c: number) => void;
  readonly __wbg_set_wasmllmresponse_output_tokens: (a: number, b: number, c: bigint) => void;
  readonly __wbg_set_wasmllmresponse_start_time_unix_ms: (a: number, b: bigint) => void;
  readonly __wbg_set_wasmllmresponse_stop_reason: (a: number, b: number, c: number) => void;
  readonly __wbg_set_wasmllmresponse_total_tokens: (a: number, b: number, c: bigint) => void;
  readonly __wbg_symbollocation_free: (a: number, b: number) => void;
  readonly __wbg_wasmcallcontext_free: (a: number, b: number) => void;
  readonly __wbg_wasmcontrolflowedge_free: (a: number, b: number) => void;
  readonly __wbg_wasmcontrolflowgraph_free: (a: number, b: number) => void;
  readonly __wbg_wasmcontrolflownode_free: (a: number, b: number) => void;
  readonly __wbg_wasmdiagnosticerror_free: (a: number, b: number) => void;
  readonly __wbg_wasmentityatposition_free: (a: number, b: number) => void;
  readonly __wbg_wasmerror_free: (a: number, b: number) => void;
  readonly __wbg_wasmfunction_free: (a: number, b: number) => void;
  readonly __wbg_wasmfunctionresponse_free: (a: number, b: number) => void;
  readonly __wbg_wasmfunctiontestpair_free: (a: number, b: number) => void;
  readonly __wbg_wasmgeneratorconfig_free: (a: number, b: number) => void;
  readonly __wbg_wasmllmfailure_free: (a: number, b: number) => void;
  readonly __wbg_wasmllmresponse_free: (a: number, b: number) => void;
  readonly __wbg_wasmparam_free: (a: number, b: number) => void;
  readonly __wbg_wasmparentfunction_free: (a: number, b: number) => void;
  readonly __wbg_wasmparsedtestresponse_free: (a: number, b: number) => void;
  readonly __wbg_wasmproject_free: (a: number, b: number) => void;
  readonly __wbg_wasmruntime_free: (a: number, b: number) => void;
  readonly __wbg_wasmspan_free: (a: number, b: number) => void;
  readonly __wbg_wasmtestcase_free: (a: number, b: number) => void;
  readonly __wbg_wasmtestresponse_free: (a: number, b: number) => void;
  readonly __wbg_wasmtestresponses_free: (a: number, b: number) => void;
  readonly format_document: (a: number, b: number, c: number, d: number) => [number, number];
  readonly on_wasm_init: () => void;
  readonly version: () => [number, number];
  readonly wasmcallcontext_new: () => number;
  readonly wasmcallcontext_set_node_index: (a: number, b: number) => void;
  readonly wasmdiagnosticerror_errors: (a: number) => [number, number];
  readonly wasmfunction_client_name: (a: number, b: number) => [number, number, number, number];
  readonly wasmfunction_function_graph: (a: number, b: number) => [number, number, number, number];
  readonly wasmfunction_function_graph_v2: (a: number, b: number) => [number, number, number];
  readonly wasmfunction_orchestration_graph: (a: number, b: number) => [number, number, number, number];
  readonly wasmfunction_render_prompt_for_test: (a: number, b: number, c: number, d: number, e: number, f: any, g: any) => any;
  readonly wasmfunction_render_raw_curl_for_test: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: any, i: any, j: number) => any;
  readonly wasmfunctionresponse_func_test_pair: (a: number) => number;
  readonly wasmfunctionresponse_llm_failure: (a: number) => number;
  readonly wasmfunctionresponse_llm_response: (a: number) => number;
  readonly wasmfunctionresponse_parsed_response: (a: number) => [number, number];
  readonly wasmllmfailure_client_name: (a: number) => [number, number];
  readonly wasmllmfailure_prompt: (a: number) => number;
  readonly wasmllmresponse_client_name: (a: number) => [number, number];
  readonly wasmllmresponse_prompt: (a: number) => number;
  readonly wasmproject_diagnostics: (a: number, b: number) => number;
  readonly wasmproject_files: (a: number) => [number, number];
  readonly wasmproject_new: (a: number, b: number, c: any) => [number, number, number];
  readonly wasmproject_run_generators: (a: number, b: number) => [number, number, number, number];
  readonly wasmproject_runtime: (a: number, b: any, c: any) => [number, number, number];
  readonly wasmproject_save_file: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wasmproject_set_unsaved_file: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wasmproject_update_file: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wasmruntime_check_if_in_prompt: (a: number, b: number) => number;
  readonly wasmruntime_check_version: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number];
  readonly wasmruntime_get_entity_at_position: (a: number, b: number, c: number, d: number) => number;
  readonly wasmruntime_get_function_at_position: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly wasmruntime_get_function_of_testcase: (a: number, b: number, c: number, d: number) => number;
  readonly wasmruntime_get_testcase_from_position: (a: number, b: number, c: number) => number;
  readonly wasmruntime_is_valid_class: (a: number, b: number, c: number) => number;
  readonly wasmruntime_is_valid_enum: (a: number, b: number, c: number) => number;
  readonly wasmruntime_is_valid_function: (a: number, b: number, c: number) => number;
  readonly wasmruntime_is_valid_type_alias: (a: number, b: number, c: number) => number;
  readonly wasmruntime_list_functions: (a: number) => [number, number];
  readonly wasmruntime_list_generators: (a: number) => [number, number];
  readonly wasmruntime_list_testcases: (a: number) => [number, number];
  readonly wasmruntime_required_env_vars: (a: number) => [number, number];
  readonly wasmruntime_run_tests: (a: number, b: any, c: any, d: any, e: any, f: number, g: any, h: number) => any;
  readonly wasmruntime_search_for_class_locations: (a: number, b: number, c: number) => [number, number];
  readonly wasmruntime_search_for_enum_locations: (a: number, b: number, c: number) => [number, number];
  readonly wasmruntime_search_for_symbol: (a: number, b: number, c: number) => number;
  readonly wasmruntime_search_for_type_alias_locations: (a: number, b: number, c: number) => [number, number];
  readonly wasmtestresponse_failure_message: (a: number) => [number, number];
  readonly wasmtestresponse_func_test_pair: (a: number) => number;
  readonly wasmtestresponse_llm_failure: (a: number) => number;
  readonly wasmtestresponse_llm_response: (a: number) => number;
  readonly wasmtestresponse_parsed_response: (a: number) => number;
  readonly wasmtestresponse_status: (a: number) => number;
  readonly wasmtestresponse_trace_url: (a: number) => [number, number];
  readonly wasmtestresponses_yield_next: (a: number) => number;
  readonly enable_logs: () => void;
  readonly __wbg_get_wasmllmfailure_model: (a: number) => [number, number];
  readonly __wbg_get_wasmparsedtestresponse_explanation: (a: number) => [number, number];
  readonly __wbg_get_wasmtestcase_error: (a: number) => [number, number];
  readonly __wbg_set_symbollocation_uri: (a: number, b: number, c: number) => void;
  readonly __wbg_get_wasmtestcase_span: (a: number) => number;
  readonly __wbg_get_wasmtestcase_function_type: (a: number) => number;
  readonly __wbg_get_wasmparentfunction_end: (a: number) => number;
  readonly __wbg_get_wasmparentfunction_start: (a: number) => number;
  readonly __wbg_get_wasmparsedtestresponse_check_count: (a: number) => number;
  readonly __wbg_get_wasmspan_end: (a: number) => number;
  readonly __wbg_get_wasmspan_start: (a: number) => number;
  readonly __wbg_get_wasmspan_start_column: (a: number) => number;
  readonly __wbg_get_wasmspan_start_line: (a: number) => number;
  readonly __wbg_get_wasmgeneratedfile_contents: (a: number) => [number, number];
  readonly __wbg_get_wasmgeneratedfile_path_in_output_dir: (a: number) => [number, number];
  readonly __wbg_get_wasmgeneratoroutput_files: (a: number) => [number, number];
  readonly __wbg_get_wasmgeneratoroutput_output_dir: (a: number) => [number, number];
  readonly __wbg_get_wasmgeneratoroutput_output_dir_relative_to_baml_src: (a: number) => [number, number];
  readonly __wbg_wasmgeneratedfile_free: (a: number, b: number) => void;
  readonly __wbg_wasmgeneratoroutput_free: (a: number, b: number) => void;
  readonly init_js_callback_bridge: (a: any, b: any) => void;
  readonly __wbg_get_wasmchatmessage_parts: (a: number) => [number, number];
  readonly __wbg_get_wasmchatmessage_role: (a: number) => [number, number];
  readonly __wbg_get_wasmchatmessagepartmedia_content: (a: number) => [number, number];
  readonly __wbg_get_wasmchatmessagepartmedia_type: (a: number) => number;
  readonly __wbg_get_wasmprompt_client_name: (a: number) => [number, number];
  readonly __wbg_set_wasmchatmessagepartmedia_content: (a: number, b: number, c: number) => void;
  readonly __wbg_set_wasmchatmessagepartmedia_type: (a: number, b: number) => void;
  readonly __wbg_set_wasmprompt_client_name: (a: number, b: number, c: number) => void;
  readonly __wbg_wasmchatmessage_free: (a: number, b: number) => void;
  readonly __wbg_wasmchatmessagepart_free: (a: number, b: number) => void;
  readonly __wbg_wasmchatmessagepartmedia_free: (a: number, b: number) => void;
  readonly __wbg_wasmprompt_free: (a: number, b: number) => void;
  readonly __wbg_wasmscope_free: (a: number, b: number) => void;
  readonly wasmchatmessagepart_as_media: (a: number) => number;
  readonly wasmchatmessagepart_as_text: (a: number) => [number, number];
  readonly wasmchatmessagepart_is_audio: (a: number) => number;
  readonly wasmchatmessagepart_is_image: (a: number) => number;
  readonly wasmchatmessagepart_is_pdf: (a: number) => number;
  readonly wasmchatmessagepart_is_text: (a: number) => number;
  readonly wasmchatmessagepart_is_video: (a: number) => number;
  readonly wasmchatmessagepart_json_meta: (a: number, b: number) => [number, number];
  readonly wasmprompt_as_chat: (a: number) => [number, number];
  readonly wasmprompt_is_chat: (a: number) => number;
  readonly wasmprompt_is_completion: (a: number) => number;
  readonly wasmscope_get_orchestration_scope_info: (a: number) => any;
  readonly wasmscope_name: (a: number) => [number, number];
  readonly __wbg_intounderlyingsource_free: (a: number, b: number) => void;
  readonly intounderlyingsource_cancel: (a: number) => void;
  readonly intounderlyingsource_pull: (a: number, b: any) => any;
  readonly __wbg_intounderlyingsink_free: (a: number, b: number) => void;
  readonly intounderlyingsink_abort: (a: number, b: any) => any;
  readonly intounderlyingsink_close: (a: number) => any;
  readonly intounderlyingsink_write: (a: number, b: any) => any;
  readonly __wbg_intounderlyingbytesource_free: (a: number, b: number) => void;
  readonly intounderlyingbytesource_autoAllocateChunkSize: (a: number) => number;
  readonly intounderlyingbytesource_cancel: (a: number) => void;
  readonly intounderlyingbytesource_pull: (a: number, b: any) => any;
  readonly intounderlyingbytesource_start: (a: number, b: any) => void;
  readonly intounderlyingbytesource_type: (a: number) => [number, number];
  readonly wasm_bindgen__convert__closures_____invoke__h7251d8793c32594c: (a: number, b: number) => void;
  readonly wasm_bindgen__closure__destroy__hf7c5466bdf94839d: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h64679e3e56f25d91: (a: number, b: number) => void;
  readonly wasm_bindgen__closure__destroy__h4401eccbea04b0b3: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h85cb3b9df75f2f56: (a: number, b: number) => void;
  readonly wasm_bindgen__closure__destroy__h5048810dd7cddc79: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__hf5cb5040fecdb054: (a: number, b: number) => void;
  readonly wasm_bindgen__closure__destroy__hc481d2c31452a322: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h3ad416f0945c5bab: (a: number, b: number) => void;
  readonly wasm_bindgen__closure__destroy__hf1c79ea4be33ee36: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h2e9576bf86e61062: (a: number, b: number, c: any) => void;
  readonly wasm_bindgen__closure__destroy__hb7c1914bf85b0b3a: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h0b23e8f5ae02a74d: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
