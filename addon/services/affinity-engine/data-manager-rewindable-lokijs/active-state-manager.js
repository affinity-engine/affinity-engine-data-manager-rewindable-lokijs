import Ember from 'ember';
import multiton from 'ember-multiton-service';

const {
  Service,
  assign,
  computed,
  get,
  isPresent,
  set,
  typeOf
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
    eBus.subscribe('shouldSetStateValueMax', this, this._setStateValueMax);
    eBus.subscribe('shouldSetStateValueMin', this, this._setStateValueMin);
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
    set(this, `activeState.${key}`, this._cappedNumber(key, value));
  },

  _setStateValueMax(key, value) {
    const maxMap = get(this, 'activeState._maxMap') || set(this, 'activeState._maxMap', {});

    this._addToMinMaxMap(maxMap, key, value);
  },

  _setStateValueMin(key, value) {
    const minMap = get(this, 'activeState._minMap') || set(this, 'activeState._minMap', {});

    this._addToMinMaxMap(minMap, key, value);
  },

  _addToMinMaxMap(map, key, value) {
    const segments = key.split('.');
    const lastIndex = segments.length - 1;

    segments.reduce((map, section, index) => {
      return lastIndex === index ? set(map, section, value) : get(map, section) || set(map, section, {});
    }, map);
  },

  _decrementStateValue(key, amount) {
    const newValue = this.decrementProperty(`activeState.${key}`, amount);

    this._setStateValue(key, newValue);
  },

  _incrementStateValue(key, amount) {
    const newValue = this.incrementProperty(`activeState.${key}`, amount);

    this._setStateValue(key, newValue);
  },

  _toggleStateValue(key) {
    this.toggleProperty(`activeState.${key}`);
  },

  _deleteStateValue(key) {
    this._setStateValue(key, undefined);
  },

  _cappedNumber(key, value) {
    if (typeOf(value) === 'number') {
      const max = get(this, `activeState._maxMap.${key}`);
      const min = get(this, `activeState._minMap.${key}`);

      if (isPresent(max) && value > max) {
        return max;
      } else if (isPresent(min) && value < min) {
        return min;
      }
    }

    return value
  }
});
