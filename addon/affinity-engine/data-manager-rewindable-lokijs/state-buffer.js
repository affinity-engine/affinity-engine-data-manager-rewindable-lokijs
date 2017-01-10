import Ember from 'ember';

const {
  get,
  isPresent,
  set,
  typeOf
} = Ember;

const addToMap = function addToMap(map, key, value) {
  const segments = key.split('.');
  const lastIndex = segments.length - 1;

  segments.reduce((map, section, index) => {
    return lastIndex === index ? set(map, section, value) : get(map, section) || set(map, section, {});
  }, map);
};

export default Ember.ObjectProxy.extend({
  decrementProperty(key, amount = 1) {
    return this.set(key, (get(this, key) || 0) - amount);
  },

  incrementProperty(key, amount = 1) {
    return this.set(key, (get(this, key) || 0) + amount);
  },

  set(key, value) {
    return set(get(this, 'content'), key, this._getCappedNumber(key, value));
  },

  setProperties(hash) {
    return this._deepSet(hash);
  },

  _deepSet(hash, path) {
    return Object.keys(hash).reduce((accumulator, key) => {
      const fullPath = path ? `${path}.${key}` : key;
      const value = get(hash, key);

      accumulator[key] = this.set(fullPath, typeOf(value) === 'object' ? this._deepSet(value, fullPath) : value);

      return accumulator;
    }, {});
  },

  max(key, value) {
    const maxMap = this.get('_maxMap') || this.set('_maxMap', {});

    addToMap(maxMap, key, value);
  },

  min(key, value) {
    const minMap = this.get('_minMap') || this.set('_minMap', {});

    addToMap(minMap, key, value);
  },

  _getCappedNumber(key, value) {
    if (typeOf(value) === 'number') {
      const max = this.get(`_maxMap.${key}`);
      const min = this.get(`_minMap.${key}`);

      if (isPresent(max) && value > max) {
        return max;
      } else if (isPresent(min) && value < min) {
        return min;
      }
    }

    return value
  }
});
