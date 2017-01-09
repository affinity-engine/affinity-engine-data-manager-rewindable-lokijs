import Ember from 'ember';
import { nativeCopy } from 'affinity-engine';
import multiton from 'ember-multiton-service';

const {
  Service,
  computed,
  get,
  getProperties,
  run,
  setProperties
} = Ember;

const { alias, reads } = computed;

const { RSVP: { Promise } } = Ember;
const { inject: { service } } = Ember;

export default Service.extend({
  version: '0.0.0',

  store: service(),

  autosaveManager: multiton('affinity-engine/data-manager-rewindable-lokijs/autosave-manager', 'engineId'),
  eBus: multiton('message-bus', 'engineId'),
  metaDataManager: multiton('affinity-engine/data-manager-rewindable-lokijs/meta-data-manager', 'engineId'),
  statePointManager: multiton('affinity-engine/data-manager-rewindable-lokijs/state-point-manager', 'engineId'),

  statePoints: reads('statePointManager.statePoints'),
  data: alias('statePointManager.stateBuffer'),
  metaData: alias('metaDataManager.data'),

  init(...args) {
    this._super(...args);

    // initialize managers
    getProperties(this, 'autosaveManager', 'metaDataManager', 'statePointManager');

    const eBus = get(this, 'eBus');

    eBus.subscribe('shouldCreateSave', this, this._createRecord);
    eBus.subscribe('shouldUpdateSave', this, this._updateRecord);
    eBus.subscribe('shouldDeleteSave', this, this._deleteRecord);
    eBus.subscribe('shouldLoadSave', this, this._loadRecord);
  },

  mostRecentSave: computed('saves.@each.update', {
    get() {
      return new Promise((resolve) => {
        get(this, 'saves').then((saves) => {
          run(() => {
            resolve(saves.sortBy('updated').reverseObjects().get('firstObject'));
          });
        });
      });
    }
  }),

  saves: computed('engineid', {
    get() {
      const engineId = get(this, 'engineId');

      return get(this, 'store').query('affinity-engine/data-manager-rewindable-lokijs/save', {
        engineId
      });
    }
  }).readOnly().volatile(),

  _createRecord(name, options = {}) {
    const engineId = get(this, 'engineId');
    const version = get(this, 'version');
    const statePoints = this._getCurrentStatePoints();

    get(this, 'store').createRecord('affinity-engine/data-manager-rewindable-lokijs/save', {
      engineId,
      name,
      statePoints,
      version,
      ...options
    }).save();
  },

  _updateRecord(record, options = {}) {
    const engineId = get(this, 'engineId');
    const version = get(this, 'version');
    const statePoints = this._getCurrentStatePoints();

    setProperties(record, {
      engineId,
      statePoints,
      version,
      ...options
    });

    record.save();
  },

  _deleteRecord(record) {
    record.destroyRecord();
  },

  _loadRecord(record) {
    record.rollbackAttributes();

    get(this, 'eBus').publish('shouldLoadLatestStatePoint', nativeCopy(get(record, 'statePoints')));
  },

  _getCurrentStatePoints() {
    return nativeCopy(get(this, 'statePoints'));
  }
});
