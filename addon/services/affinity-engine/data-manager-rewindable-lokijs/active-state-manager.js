import Ember from 'ember';
import multiton from 'ember-multiton-service';

const {
  Service,
  assign,
  computed,
  get,
  set,
  setProperties
} = Ember;

export default Service.extend({
  activeState: computed(() => {
    return {};
  }),

  eBus: multiton('message-bus', 'engineId'),

  init(...args) {
    this._super(...args);

    const eBus = get(this, 'eBus');

    eBus.subscribe('shouldFileActiveState', this, this._shouldFileActiveState);
    eBus.subscribe('restartingEngine', this, this._reset);
    eBus.subscribe('shouldLoadLatestStatePoint', this, this._loadLatestStatePoint);

    eBus.subscribe('shouldSetStateValue', this, this._setStateValue);
    eBus.subscribe('shouldSetStateValues', this, this._setStateValues);
    eBus.subscribe('shouldDecrementStateValue', this, this._decrementStateValue);
    eBus.subscribe('shouldIncrementStateValue', this, this._incrementStateValue);
    eBus.subscribe('shouldToggleStateValue', this, this._toggleStateValue);
    eBus.subscribe('shouldDeleteStateValue', this, this._deleteStateValue);
  },

  _reset() {
    set(this, 'activeState', {});
  },

  _shouldFileActiveState() {
    get(this, 'eBus').publish('rsa:shouldFileActiveState', get(this, 'activeState'));
  },

  _loadLatestStatePoint(statePoints) {
    const activeState = assign({}, statePoints[statePoints.length - 1]) || {};

    set(this, 'activeState', activeState);
  },

  _setStateValue(key, value) {
    set(this, `activeState.${key}`, value);
  },

  _setStateValues(properties) {
    setProperties(get(this, 'activeState'), properties);
  },

  _decrementStateValue(key, amount) {
    this.decrementProperty(`activeState.${key}`, amount);
  },

  _incrementStateValue(key, amount) {
    this.incrementProperty(`activeState.${key}`, amount);
  },

  _toggleStateValue(key) {
    this.toggleProperty(`activeState.${key}`);
  },

  _deleteStateValue(key) {
    this._setStateValue(key, undefined);
  }
});
