import Ember from 'ember';
import { configurable } from 'affinity-engine';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';
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
  'config.attrs.plugin.saveStateManager',
  'config.attrs'
];

export default Service.extend(BusPublisherMixin, BusSubscriberMixin, {
  store: service(),

  config: multiton('affinity-engine/config', 'engineId'),

  maxAutosaves: configurable(configurationTiers, 'maxAutosaves'),

  init(...args) {
    this._super(...args);

    const engineId = get(this, 'engineId');

    this.on(`ae:${engineId}:shouldWriteAutosave`, this, this.writeAutosave);
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
        const { engineId, maxAutosaves } = getProperties(this, 'engineId', 'maxAutosaves');

        if (maxAutosaves > get(autosaves, 'length')) {
          this.publish(`ae:${engineId}:shouldCreateSave`, '', { isAutosave: true });
        } else if (maxAutosaves > 0) {
          const autosave = autosaves.sortBy('updated').get('firstObject');

          this.publish(`ae:${engineId}:shouldUpdateSave`, autosave);
        }
      });
    });
  }
});
