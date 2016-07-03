/*jshint node:true*/
module.exports = {
  description: 'blueprint for affinity-engine-rewindable-save-adapter',

  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addAddonToProject({ name: 'ember-moment' });
  }
};
