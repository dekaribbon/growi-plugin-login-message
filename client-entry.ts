import { activate, deactivate } from './src';

declare global {
  interface Window {
    pluginActivators: Record<string, { activate: () => void; deactivate?: () => void }>;
  }
}

if (window.pluginActivators == null) {
  window.pluginActivators = {};
}
window.pluginActivators['growi-plugin-login-message'] = {
  activate,
  deactivate,
};

// Self-activate: on the login page GrowiPluginsActivator is not rendered,
// so activate() is never called by GROWI's plugin system.
activate();
