import Ember from 'ember';
import { nativeCopy } from 'affinity-engine';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  Service,
  assign,
  computed,
  get,
  getProperties,
  isEmpty,
  run,
  setProperties
} = Ember;

const { reads } = computed;

const { RSVP: { Promise } } = Ember;
const { inject: { service } } = Ember;

export default Service.extend(BusPublisherMixin, BusSubscriberMixin, {
  version: '0.0.0',

  store: service(),

  activeStateManager: multiton('affinity-engine/data-manager-rewindable-lokijs/active-state-manager', 'engineId'),
  autosaveManager: multiton('affinity-engine/data-manager-rewindable-lokijs/autosave-manager', 'engineId'),
  statePointManager: multiton('affinity-engine/data-manager-rewindable-lokijs/state-point-manager', 'engineId'),

  activeState: reads('activeStateManager.activeState'),
  statePoints: reads('statePointManager.statePoints'),

  getStateValue(key) {
    return get(this, `activeState.${key}`);
  },

  init(...args) {
    this._super(...args);

    // initialize managers
    getProperties(this, 'activeStateManager', 'autosaveManager', 'statePointManager');

    const engineId = get(this, 'engineId');

    this.on(`ae:${engineId}:shouldCreateSave`, this, this._createRecord);
    this.on(`ae:${engineId}:shouldUpdateSave`, this, this._updateRecord);
    this.on(`ae:${engineId}:shouldDeleteSave`, this, this._deleteRecord);
    this.on(`ae:${engineId}:shouldLoadSave`, this, this._loadRecord);
  },

  mostRecentSave: computed({
    get() {
      return new Promise((resolve) => {
        get(this, 'saves').then((saves) => {
          run(() => {
            resolve(saves.sortBy('updated').reverseObjects().get('firstObject'));
          });
        });
      });
    }
  }).volatile(),

  saves: computed({
    get() {
      const engineId = get(this, 'engineId');

      return get(this, 'store').query('affinity-engine/local-save', {
        engineId
      });
    }
  }).readOnly().volatile(),

  _createRecord(name, options = {}) {
    const engineId = get(this, 'engineId');
    const version = get(this, 'version');
    const statePoints = this._getCurrentStatePoints();

    get(this, 'store').createRecord('affinity-engine/local-save', {
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

    this.publish(`ae:${get(this, 'engineId')}:main:shouldLoadLatestStatePoint`, nativeCopy(get(record, 'statePoints')));
  },

  _getCurrentStatePoints() {
    const statePoints = nativeCopy(get(this, 'statePoints'));
    const activeState = nativeCopy(get(this, 'activeState'));

    if (isEmpty(statePoints)) { statePoints.push({}); }

    const lastIndex = statePoints.length - 1;

    statePoints[lastIndex] = assign({}, statePoints[lastIndex], activeState);

    return statePoints;
  }
});
