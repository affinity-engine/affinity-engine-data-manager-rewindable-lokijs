export default {
  priority: 1,
  plugin: {
    dataManager: {
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
