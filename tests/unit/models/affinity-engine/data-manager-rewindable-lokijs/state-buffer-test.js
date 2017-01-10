import StateBuffer from 'affinity-engine-data-manager-rewindable-lokijs/affinity-engine/data-manager-rewindable-lokijs/state-buffer';
import { module, test } from 'qunit';

module('Unit | Model | affinity engine/rewindable save adapter/state buffer');

test('stateBuffer proxies the content', function(assert) {
  assert.expect(7);

  const content = {};
  const stateBuffer = StateBuffer.create({ content });

  stateBuffer.toggleProperty('foo');
  assert.ok(content.foo, 'toggleProperty is proxied');

  stateBuffer.set('foo', 5);
  assert.equal(content.foo, 5, 'set is proxied');

  stateBuffer.setProperties({ bar: 'alpha', baz: 'beta' });
  assert.deepEqual(content, { foo: 5, bar: 'alpha', baz: 'beta' }, 'setProperties is proxied');

  assert.equal(stateBuffer.get('foo'), content.foo, 'get is proxied');
  assert.deepEqual(stateBuffer.getProperties('foo', 'bar'), { foo: 5, bar: 'alpha' }, 'getProperties is proxied');

  stateBuffer.incrementProperty('foo', 5);
  assert.equal(content.foo, 10, 'incrementProperty is proxied');

  stateBuffer.decrementProperty('foo', 5);
  assert.equal(content.foo, 5, 'decrementProperty is proxied');
});

test('stateBuffer can set max values', function(assert) {
  assert.expect(6);

  const stateBuffer = StateBuffer.create({ content: { bar: 0, baz: { alpha: 0} } });

  stateBuffer.max('bar', 5);
  stateBuffer.max('baz.alpha', 7);
  stateBuffer.set('bar', 10);
  stateBuffer.set('baz.alpha', 10);

  assert.equal(stateBuffer.get('bar'), 5, 'cannot be set above max');
  assert.equal(stateBuffer.get('baz.alpha'), 7, 'nested cannot be set above max');

  stateBuffer.set('bar', 0);
  stateBuffer.set('baz.alpha', 0);
  stateBuffer.setProperties({ bar: 10, baz: { alpha: 10 } });

  assert.equal(stateBuffer.get('bar'), 5, 'cannot be setProperties above max');
  assert.equal(stateBuffer.get('baz.alpha'), 7, 'nested cannot be setProperties above max');

  stateBuffer.set('bar', 0);
  stateBuffer.set('baz.alpha', 0);
  stateBuffer.incrementProperty('bar', 10);
  stateBuffer.incrementProperty('baz.alpha', 10);

  assert.equal(stateBuffer.get('bar'), 5, 'cannot be incremented above max');
  assert.equal(stateBuffer.get('baz.alpha'), 7, 'nested cannot be incremented above max');
});

test('stateBuffer can set min values', function(assert) {
  assert.expect(6);

  const stateBuffer = StateBuffer.create({ content: { bar: 0, baz: { alpha: 0} } });

  stateBuffer.min('bar', -5);
  stateBuffer.min('baz.alpha', -7);
  stateBuffer.set('bar', -10);
  stateBuffer.set('baz.alpha', -10);

  assert.equal(stateBuffer.get('bar'), -5, 'cannot be set below min');
  assert.equal(stateBuffer.get('baz.alpha'), -7, 'nested cannot be set below min');

  stateBuffer.set('bar', 0);
  stateBuffer.set('baz.alpha', 0);
  stateBuffer.setProperties({ bar: -10, baz: { alpha: -10 } });

  assert.equal(stateBuffer.get('bar'), -5, 'cannot be setProperties below min');
  assert.equal(stateBuffer.get('baz.alpha'), -7, 'nested cannot be setProperties below min');

  stateBuffer.set('bar', 0);
  stateBuffer.set('baz.alpha', 0);
  stateBuffer.decrementProperty('bar', 10);
  stateBuffer.decrementProperty('baz.alpha', 10);

  assert.equal(stateBuffer.get('bar'), -5, 'cannot be decremented below min');
  assert.equal(stateBuffer.get('baz.alpha'), -7, 'nested cannot be decremented below min');
});
