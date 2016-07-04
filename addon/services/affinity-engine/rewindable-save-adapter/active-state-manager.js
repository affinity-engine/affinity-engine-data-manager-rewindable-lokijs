import Ember from 'ember';
import { MultitonIdsMixin } from 'affinity-engine';
import { BusSubscriberMixin } from 'ember-message-bus';

const {
  Service,
  computed,
  get,
  set,
  setProperties
} = Ember;

export default Service.extend(BusSubscriberMixin, MultitonIdsMixin, {
  activeState: computed(() => {
    return {};
  }),

  init(...args) {
    this._super(...args);

    const engineId = get(this, 'engineId');

    this.on(`ae:rsa:${engineId}:gameIsResetting`, this, this._reset);

    this.on(`ae:${engineId}:gameIsRewinding`, this, this._loadLatestStatePoint);

    this.on(`ae:${engineId}:settingStateValue`, this, this._setStateValue);
    this.on(`ae:${engineId}:settingStateValues`, this, this._setStateValues);
    this.on(`ae:${engineId}:decrementingStateValue`, this, this._decrementStateValue);
    this.on(`ae:${engineId}:incrementingStateValue`, this, this._incrementStateValue);
    this.on(`ae:${engineId}:togglingStateValue`, this, this._toggleStateValue);
    this.on(`ae:${engineId}:deletingStateValue`, this, this._deleteStateValue);
  },

  _reset() {
    set(this, 'activeState', {});
  },

  _loadLatestStatePoint(statePoints) {
    const activeState = get(statePoints, 'lastObject');

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
