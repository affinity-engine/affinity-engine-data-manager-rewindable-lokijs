/*jshint node:true*/
module.exports = {
  description: 'blueprint for affinity-engine-data-manager-rewindable-lokijs',

  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addAddonToProject({ name: 'ember-moment' });
  }
};
