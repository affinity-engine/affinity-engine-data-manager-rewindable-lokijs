import Ember from 'ember';
import { configurable } from 'affinity-engine';
import multiton from 'ember-multiton-service';

const {
  Service,
  computed,
  get,
  getProperties,
  run
} = Ember;

const { inject: { service } } = Ember;

const configurationTiers = [
  'config.attrs.plugin.dataManager',
  'config.attrs'
];

export default Service.extend({
  store: service(),

  config: multiton('affinity-engine/config', 'engineId'),
  eBus: multiton('message-bus', 'engineId'),

  maxAutosaves: configurable(configurationTiers, 'maxAutosaves'),

  init(...args) {
    this._super(...args);

    get(this, 'eBus').subscribe('shouldWriteAutosave', this, this.writeAutosave);
  },

  autosaves: computed({
    get() {
      const engineId = get(this, 'engineId');

      return get(this, 'store').query('affinity-engine/local-save', {
        engineId,
        isAutosave: true
      });
    }
  }).readOnly().volatile(),

  writeAutosave() {
    get(this, 'autosaves').then((autosaves) => {
      run(() => {
        const { eBus, maxAutosaves } = getProperties(this, 'eBus', 'maxAutosaves');

        if (maxAutosaves > get(autosaves, 'length')) {
          eBus.publish('shouldCreateSave', '', { isAutosave: true });
        } else if (maxAutosaves > 0) {
          const autosave = autosaves.sortBy('updated').get('firstObject');

          eBus.publish('shouldUpdateSave', autosave);
        }
      });
    });
  }
});
