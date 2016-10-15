export default {
  priority: 1,
  plugin: {
    saveStateManager: {
      maxAutosaves: 3,
      maxStatePoints: false
    }
  },
  'affinity-engine': {
    'data-manager': {
      path: 'service:affinity-engine/data-manager-rewindable-lokijs'
    }
  }
};
