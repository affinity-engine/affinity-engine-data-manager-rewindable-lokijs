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

const { alias } = computed;

export default Service.extend({
  store: service(),
  eBus: multiton('message-bus', 'engineId'),

  data: alias('sharedData.dataMap'),

  init(...args) {
    this._super(...args);

    get(this, 'eBus').subscribe('shouldPersistSharedData', this, this._persistSharedData);

    this._setSharedData();
  },

  _setSharedData() {
    const { engineId, store } = getProperties(this, 'engineId', 'store');

    store.queryRecord('affinity-engine/data-manager-rewindable-lokijs/shared-data', { engineId }).
      then((sharedData) => set(this, 'sharedData', sharedData)).
      catch(() => {
        store.createRecord('affinity-engine/data-manager-rewindable-lokijs/shared-data', {
          engineId,
          dataMap: {}
        }).save().then((sharedData) => set(this, 'sharedData', sharedData));
      });
  },

  _persistSharedData() {
    get(this, 'sharedData').save();
  }
});
