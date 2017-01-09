import StateBuffer from 'affinity-engine-data-manager-rewindable-lokijs/models/affinity-engine/data-manager-rewindable-lokijs/state-buffer';
import { module, test } from 'qunit';

module('Unit | Model | affinity engine/rewindable save adapter/state buffer');

test('stateBuffer can set max values', function(assert) {
  assert.expect(2);

  const stateBuffer = StateBuffer.create({ bar: 1 });

  stateBuffer.max('bar', 5);
  stateBuffer.set('bar', 10);

  assert.equal(stateBuffer.get('bar'), 5, 'cannot be set above max');

  stateBuffer.incrementProperty('bar', 5);

  assert.equal(stateBuffer.get('bar'), 5, 'cannot be incremented above max');
});

test('stateBuffer can set min values', function(assert) {
  assert.expect(2);

  const stateBuffer = StateBuffer.create({ bar: 1 });

  stateBuffer.min('bar', -5);
  stateBuffer.set('bar', -10);

  assert.equal(stateBuffer.get('bar'), -5, 'cannot be set below min');

  stateBuffer.decrementProperty('bar', 5);

  assert.equal(stateBuffer.get('bar'), -5, 'cannot be decremented below min');
});
