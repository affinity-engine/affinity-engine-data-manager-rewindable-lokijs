import Ember from 'ember';
import { MultitonIdsMixin, configurable } from 'affinity-engine';
import { BusSubscriberMixin } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  Service,
  computed,
  get,
  set
} = Ember;

const configurationTiers = [
  'config.attrs.saveStateManager',
  'config.attrs.globals'
];

export default Service.extend(BusSubscriberMixin, MultitonIdsMixin, {
  config: multiton('affinity-engine/config', 'engineId'),

  maxStatePoints: configurable(configurationTiers, 'maxStatePoints'),

  statePoints: computed(() => []),

  init(...args) {
    this._super(...args);

    const engineId = get(this, 'engineId');

    this.on(`ae:rsa:${engineId}:shouldResetEngine`, this, this._reset);

    this.on(`ae:${engineId}:shouldLoadLatestStatePoint`, this, this._loadStatePoints);
    this.on(`ae:rsa:${engineId}:shouldFileActiveState`, this, this._shouldFileActiveState);
  },

  _reset() {
    set(this, 'statePoints', []);
  },

  _loadStatePoints(statePoints) {
    set(this, 'statePoints', statePoints);
  },

  _shouldFileActiveState(activeState) {
    const maxStatePoints = get(this, 'maxStatePoints');
    const statePoints = get(this, 'statePoints');

    statePoints.push(activeState);

    while (statePoints.length > maxStatePoints) {
      statePoints.shift();
    }
  }
});
