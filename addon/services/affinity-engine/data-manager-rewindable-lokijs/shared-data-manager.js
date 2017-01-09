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

  data: alias('metaState.dataMap'),

  init(...args) {
    this._super(...args);

    get(this, 'eBus').subscribe('shouldPersistMetaState', this, this._persistMetaState);

    this._setMetaState();
  },

  _setMetaState() {
    const { engineId, store } = getProperties(this, 'engineId', 'store');

    store.queryRecord('affinity-engine/data-manager-rewindable-lokijs/shared-data', { engineId }).
      then((metaState) => set(this, 'metaState', metaState)).
      catch(() => {
        store.createRecord('affinity-engine/data-manager-rewindable-lokijs/shared-data', {
          engineId,
          dataMap: {}
        }).save().then((metaState) => set(this, 'metaState', metaState));
      });
  },

  _persistMetaState() {
    get(this, 'metaState').save();
  }
});
