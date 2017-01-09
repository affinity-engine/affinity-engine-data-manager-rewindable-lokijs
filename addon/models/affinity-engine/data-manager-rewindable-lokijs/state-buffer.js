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

export default Ember.Object.extend({
  decrementProperty(key, amount = 1) {
    const min = get(this, `_minMap.${key}`);
    const currentValue = get(this, key);
    const newValue = currentValue - amount;

    return newValue < min ? min : newValue;
  },

  incrementProperty(key, amount = 1) {
    const max = get(this, `_maxMap.${key}`);
    const currentValue = get(this, key);
    const newValue = currentValue + amount;

    return newValue > max ? max : newValue;
  },

  set(key, value) {
    return this._super(key, this._getCappedNumber(key, value));
  },

  max(key, value) {
    const maxMap = get(this, '_maxMap') || set(this, '_maxMap', {});

    addToMap(maxMap, key, value);
  },

  min(key, value) {
    const minMap = get(this, '_minMap') || set(this, '_minMap', {});

    addToMap(minMap, key, value);
  },

  _getCappedNumber(key, value) {
    if (typeOf(value) === 'number') {
      const max = get(this, `_maxMap.${key}`);
      const min = get(this, `_minMap.${key}`);

      if (isPresent(max) && value > max) {
        return max;
      } else if (isPresent(min) && value < min) {
        return min;
      }
    }

    return value
  },

  toPojo() {
    return Object.keys(this).reduce((pojo, key) => {
      if (this.hasOwnProperty(key) && typeOf(get(this, key)) !== 'function') pojo[key] = get(this, key);

      return pojo;
    }, {});
  }
});
