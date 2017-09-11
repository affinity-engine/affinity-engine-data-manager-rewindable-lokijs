import Ember from 'ember';
import { nativeCopy } from 'affinity-engine';
import StateBuffer from 'affinity-engine-plugin-data-manager-rewindable-lokijs/affinity-engine/data-manager-rewindable-lokijs/state-buffer';
import multiton from 'ember-multiton-service';

const {
  Service,
  assign,
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
  dataGroupManager: multiton('affinity-engine/data-manager-rewindable-lokijs/data-group-manager', 'engineId'),
  eBus: multiton('message-bus', 'engineId'),
  sharedDataManager: multiton('affinity-engine/data-manager-rewindable-lokijs/shared-data-manager', 'engineId'),
  statePointManager: multiton('affinity-engine/data-manager-rewindable-lokijs/state-point-manager', 'engineId'),

  dataGroup: reads('dataGroupManager.dataGroup'),
  statePoints: reads('statePointManager.statePoints'),
  stateBuffer: alias('statePointManager.stateBuffer'),
  sharedData: alias('sharedDataManager.data'),

  data: computed('sharedData', 'stateBuffer', {
    get() {
      const { sharedData, stateBuffer } = getProperties(this, 'sharedData', 'stateBuffer');
      const persistSharedData = () => get(this, 'eBus').publish('shouldPersistSharedData');

      return StateBuffer.create({
        content: stateBuffer,
        getSharedData() {
          return StateBuffer.create({
            content: sharedData,
            save() {
              persistSharedData();
            }
          });
        }
      });
    }
  }),

  init(...args) {
    this._super(...args);

    // initialize managers
    getProperties(this, 'autosaveManager', 'sharedDataManager', 'statePointManager');

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

  saves: computed('dataGroup', {
    get() {
      const dataGroup = get(this, 'dataGroup');

      return get(this, 'store').query('affinity-engine/data-manager-rewindable-lokijs/save', {
        dataGroup
      });
    }
  }).readOnly().volatile(),

  _createRecord(name, options = {}) {
    const engineId = get(this, 'engineId');
    const dataGroup = get(this, 'dataGroup');
    const version = get(this, 'version');
    const statePoints = this._getCurrentStatePoints();

    get(this, 'store').createRecord('affinity-engine/data-manager-rewindable-lokijs/save', assign({
      engineId,
      dataGroup,
      name,
      statePoints,
      version
    }, options)).save();
  },

  _updateRecord(record, options = {}) {
    const engineId = get(this, 'engineId');
    const dataGroup = get(this, 'dataGroup');
    const version = get(this, 'version');
    const statePoints = this._getCurrentStatePoints();

    setProperties(record, assign({
      engineId,
      dataGroup,
      statePoints,
      version
    }, options));

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
