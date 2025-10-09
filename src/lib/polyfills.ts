// Polyfills for server-side rendering
/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).self === 'undefined') {
  (globalThis as any).self = globalThis;
}

if (typeof global !== 'undefined' && typeof (global as any).self === 'undefined') {
  (global as any).self = global;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export {};