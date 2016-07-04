import Ember from 'ember';
import { MultitonIdsMixin, nativeCopy } from 'affinity-engine';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  Service,
  computed,
  get,
  getProperties,
  merge,
  run,
  setProperties
} = Ember;

const { reads } = computed;

const { RSVP: { Promise } } = Ember;
const { inject: { service } } = Ember;

export default Service.extend(BusPublisherMixin, BusSubscriberMixin, MultitonIdsMixin, {
  version: '0.0.0',

  store: service(),

  activeStateManager: multiton('affinity-engine/rewindable-save-adapater/active-state-manager', 'engineId'),
  autosaveManager: multiton('affinity-engine/rewindable-save-adapater/autosave-manager', 'engineId'),
  statePointManager: multiton('affinity-engine/rewindable-save-adapater/state-point-manager', 'engineId'),

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

    this.on(`ae:${engineId}:saveIsCreating`, this, this.createRecord);
    this.on(`ae:${engineId}:saveIsUpdating`, this, this.updateRecord);
    this.on(`ae:${engineId}:saveIsDestroying`, this, this.deleteRecord);
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

  createRecord(name, options) {
    const engineId = get(this, 'engineId');
    const version = get(this, 'version');
    const statePoints = this._getCurrentStatePoints();

    get(this, 'store').createRecord('affinity-engine/local-save', {
      name,
      statePoints,
      engineId,
      version,
      ...options
    }).save();
  },

  updateRecord(record, options) {
    const engineId = get(this, 'engineId');
    const version = get(this, 'version');
    const statePoints = this._getCurrentStatePoints();

    setProperties(record, {
      statePoints,
      engineId,
      version,
      ...options
    });

    record.save();
  },

  _getCurrentStatePoints() {
    const statePoints = nativeCopy(get(this, 'statePoints'));
    const activeState = nativeCopy(get(this, 'activeState'));

    merge(statePoints[statePoints.length - 1], activeState);

    return statePoints;
  },

  deleteRecord(record) {
    record.destroyRecord();
  },

  loadRecord(record) {
    record.reload();

    const {
      activeState,
      statePoints
    } = getProperties(record, 'activeState', 'statePoints');

    setProperties(this, {
      activeState: nativeCopy(activeState),
      statePoints: nativeCopy(statePoints)
    });
  }
});
