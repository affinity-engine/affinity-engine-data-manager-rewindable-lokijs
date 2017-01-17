import Ember from 'ember';
import multiton from 'ember-multiton-service';

const {
  Service,
  computed,
  get,
  getProperties,
  set
} = Ember;

const { inject: { service } } = Ember;

const { alias, reads } = computed;

export default Service.extend({
  store: service(),
  dataGroupManager: multiton('affinity-engine/data-manager-rewindable-lokijs/data-group-manager', 'engineId'),
  eBus: multiton('message-bus', 'engineId'),

  data: alias('sharedData.dataMap'),
  dataGroup: reads('dataGroupManager.dataGroup'),

  init(...args) {
    this._super(...args);

    get(this, 'eBus').subscribe('shouldPersistSharedData', this, this._persistSharedData);

    this._setSharedData();
  },

  _setSharedData() {
    const { dataGroup, store } = getProperties(this, 'dataGroup', 'store');

    store.queryRecord('affinity-engine/data-manager-rewindable-lokijs/shared-data', { dataGroup }).
      then((sharedData) => set(this, 'sharedData', sharedData)).
      catch(() => {
        store.createRecord('affinity-engine/data-manager-rewindable-lokijs/shared-data', {
          dataGroup,
          dataMap: {}
        }).save().then((sharedData) => set(this, 'sharedData', sharedData));
      });
  },

  _persistSharedData() {
    get(this, 'sharedData').save();
  }
});
