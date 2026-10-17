// jsdom doesn't provide TextEncoder/TextDecoder, but protobufjs (used by
// @deepstream/client) needs them when it loads.
import { TextDecoder, TextEncoder } from "util";

Object.assign(globalThis, { TextDecoder, TextEncoder });
