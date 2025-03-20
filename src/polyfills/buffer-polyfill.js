/**
 * Buffer polyfill for browser environments
 */

class BufferPolyfill {
  static from(data) {
    if (typeof data === 'string') {
      return new TextEncoder().encode(data);
    }
    return data;
  }

  static isBuffer(obj) {
    return false;
  }

  static alloc(size) {
    return new Uint8Array(size);
  }
}

// Add toString method to the prototype
BufferPolyfill.prototype.toString = function(encoding) {
  return new TextDecoder().decode(this);
};

// Export the Buffer polyfill
export default BufferPolyfill;
export { BufferPolyfill as Buffer }; 