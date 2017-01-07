import Ember from 'ember';
import { configurable } from 'affinity-engine';
import multiton from 'ember-multiton-service';

const {
  Service,
  assign,
  computed,
  get,
  getProperties,
  set
} = Ember;

const configurationTiers = [
  'config.attrs.plugin.dataManager',
  'config.attrs.global'
];

export default Service.extend({
  config: multiton('affinity-engine/config', 'engineId'),
  eBus: multiton('message-bus', 'engineId'),

  maxStatePoints: configurable(configurationTiers, 'maxStatePoints'),

  statePoints: computed(() => Ember.A([])),
  activeState: computed('statePoints.lastObject', {
    get() {
      return assign({}, get(this, 'statePoints.lastObject'));
    }
  }),

  init(...args) {
    this._super(...args);

    const eBus = get(this, 'eBus');

    eBus.subscribe('restartingEngine', this, this._reset);
    eBus.subscribe('shouldLoadLatestStatePoint', this, this._loadStatePoints);
    eBus.subscribe('shouldFileActiveState', this, this._shouldFileActiveState);
  },

  _reset() {
    set(this, 'statePoints', Ember.A([]));
  },

  _loadStatePoints(statePoints) {
    set(this, 'statePoints', Ember.A(statePoints));
  },

  _shouldFileActiveState() {
    const { activeState, maxStatePoints, statePoints } = getProperties(this, 'activeState', 'maxStatePoints', 'statePoints');

    statePoints.pushObject(assign({}, activeState));

    while (statePoints.length > maxStatePoints) {
      statePoints.shiftObject();
    }
  }
});
