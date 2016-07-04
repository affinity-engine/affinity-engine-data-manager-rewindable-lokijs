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

  statePoints: computed(() => Ember.A()),

  init(...args) {
    this._super(...args);

    const engineId = get(this, 'engineId');

    this.on(`ae:rsa:${engineId}:gameIsResetting`, this, this.reset);

    this.on(`ae:${engineId}:shouldFileActiveState`, this, this.shouldFileActiveState);
    this.on(`ae:${engineId}:gameIsRewinding`, this, this.loadStatePoint);
  },

  reset() {
    set(this, 'statePoints', Ember.A());
  },

  shouldFileActiveState(activeState) {
    const maxStatePoints = get(this, 'maxStatePoints');
    const statePoints = get(this, 'statePoints');

    statePoints.pushObject(activeState);

    while (statePoints.length > maxStatePoints) {
      statePoints.shiftObject();
    }
  },

  loadStatePoint(statePoints) {
    set(this, 'statePoints', statePoints);
  }
});
