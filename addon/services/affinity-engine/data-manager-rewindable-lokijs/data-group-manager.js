import Ember from 'ember';
import { configurable } from 'affinity-engine';
import multiton from 'ember-multiton-service';

const {
  Service,
  computed,
  get
} = Ember;

const configurationTiers = [
  'plugin.dataManager',
  'all'
];

export default Service.extend({
  config: multiton('affinity-engine/config', 'engineId'),

  _dataGroup: configurable(configurationTiers, 'dataGroup'),

  dataGroup: computed('engineId', '_dataGroup', {
    get() {
      return get(this, '_dataGroup') || get(this, 'engineId');
    }
  })
});
