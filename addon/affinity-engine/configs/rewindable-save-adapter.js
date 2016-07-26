export default {
  priority: 1,
  plugin: {
    saveStateManager: {
      maxAutosaves: 3,
      maxStatePoints: false
    }
  },
  'affinity-engine': {
    'save-state-manager': {
      path: 'service:affinity-engine/rewindable-save-adapter'
    }
  }
};
