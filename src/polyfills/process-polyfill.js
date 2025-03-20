/**
 * Process polyfill for browser environments
 */

const process = {
  env: {},
  version: 'v16.0.0',
  versions: { node: '16.0.0' },
  platform: 'browser',
  arch: 'browser',
  nextTick: (callback, ...args) => {
    setTimeout(() => callback(...args), 0);
  },
  cwd: () => '/',
};

// Export the process polyfill
export default process; 