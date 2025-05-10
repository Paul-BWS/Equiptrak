/**
 * Node.js polyfills for browser environment
 * This file provides browser-compatible versions of Node.js built-ins
 */

// Create a safer approach to polyfills that doesn't modify global objects directly

// Buffer polyfill
class BufferPolyfill {
  static from(data: string | any[] | ArrayBuffer): any {
    if (typeof data === 'string') {
      return new TextEncoder().encode(data);
    }
    return data;
  }

  static isBuffer(obj: any): boolean {
    return false;
  }

  static alloc(size: number): Uint8Array {
    return new Uint8Array(size);
  }

  static toString(buffer: Uint8Array, encoding?: string): string {
    return new TextDecoder().decode(buffer);
  }
}

// Process polyfill
const processPolyfill = {
  env: {},
  version: 'v16.0.0',
  versions: { node: '16.0.0' },
  platform: 'browser',
  arch: 'browser',
};

// Crypto polyfill (minimal)
const cryptoPolyfill = {
  randomBytes: (size: number) => {
    const array = new Uint8Array(size);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < size; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return array;
  }
};

// Export the polyfills for direct import where needed
export { BufferPolyfill as Buffer, processPolyfill as process, cryptoPolyfill as crypto }; 