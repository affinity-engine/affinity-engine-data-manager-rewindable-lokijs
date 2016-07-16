export default {
  priority: 1,
  saveStateManager: {
    maxStatePoints: false
  },
  autosaveManager: {
    maxAutosaves: 3
  },
  'affinity-engine': {
    'save-state-manager': {
      path: 'service:affinity-engine/rewindable-save-adapter'
    }
  }
};
