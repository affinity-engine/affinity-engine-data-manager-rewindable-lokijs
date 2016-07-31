import Ember from 'ember';
import { BusPublisherMixin, BusSubscriberMixin } from 'ember-message-bus';

const {
  Service,
  assign,
  computed,
  get,
  set,
  setProperties
} = Ember;

export default Service.extend(BusPublisherMixin, BusSubscriberMixin, {
  activeState: computed(() => {
    return {};
  }),

  init(...args) {
    this._super(...args);

    const engineId = get(this, 'engineId');

    this.on(`ae:${engineId}:restartingEngine`, this, this._reset);
    this.on(`ae:${engineId}:shouldFileActiveState`, this, this._shouldFileActiveState);
    this.on(`ae:${engineId}:shouldLoadLatestStatePoint`, this, this._loadLatestStatePoint);

    this.on(`ae:${engineId}:shouldSetStateValue`, this, this._setStateValue);
    this.on(`ae:${engineId}:shouldSetStateValues`, this, this._setStateValues);
    this.on(`ae:${engineId}:shouldDecrementStateValue`, this, this._decrementStateValue);
    this.on(`ae:${engineId}:shouldIncrementStateValue`, this, this._incrementStateValue);
    this.on(`ae:${engineId}:shouldToggleStateValue`, this, this._toggleStateValue);
    this.on(`ae:${engineId}:shouldDeleteStateValue`, this, this._deleteStateValue);
  },

  _reset() {
    set(this, 'activeState', {});
  },

  _shouldFileActiveState() {
    const engineId = get(this, 'engineId');

    this.publish(`ae:rsa:${engineId}:shouldFileActiveState`, get(this, 'activeState'));
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
