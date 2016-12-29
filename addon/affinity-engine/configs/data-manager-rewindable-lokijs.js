export default {
  priority: 2,
  plugin: {
    dataManager: {
      maxAutosaves: 3,
      maxStatePoints: false
    }
  },
  registrant: {
    'affinity-engine': {
      'data-manager': {
        path: 'service:affinity-engine/data-manager-rewindable-lokijs'
      }
    }
  }
};
