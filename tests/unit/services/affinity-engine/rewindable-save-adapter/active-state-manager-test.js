import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { initialize as initializeEngine } from 'affinity-engine';
import { initializeQUnitAssertions } from 'ember-message-bus';

const {
  getOwner
} = Ember;

moduleFor('service:affinity-engine/rewindable-save-adapter/active-state-manager', 'Unit | Service | affinity engine/rewindable save adapter/active state manager', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeEngine(appInstance);
    initializeQUnitAssertions(appInstance);
  }
});

test('shouldResetEngine resets the activeState', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, activeState: { foo: 'bar' } });

  service.trigger(`ae:rsa:${engineId}:shouldResetEngine`);

  assert.deepEqual(service.get('activeState'), {}, 'activeState got reset');
});

test('shouldLoadLatestStatePoint loads the last argument', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  service.trigger(`ae:${engineId}:shouldLoadLatestStatePoint`, Ember.A(['foo', 'bar', 'baz']));

  assert.equal(service.get('activeState'), 'baz', 'last item in array was loaded');
});

test('settingStateValue sets a key value pair on activeState', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  service.trigger(`ae:${engineId}:settingStateValue`, 'foo', 'bar');

  assert.equal(service.get('activeState.foo'), 'bar', 'value was set');

  service.trigger(`ae:${engineId}:settingStateValue`, 'foo', 'baz');

  assert.equal(service.get('activeState.foo'), 'baz', 'value was overwritten');
});

test('settingStateValues sets the provided properties on activeState', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  service.trigger(`ae:${engineId}:settingStateValues`, { foo: 1, bar: 1 });

  assert.deepEqual(service.get('activeState'), { foo: 1, bar: 1 }, 'value was set');

  service.trigger(`ae:${engineId}:settingStateValues`, { foo: 2, baz: 2 });

  assert.deepEqual(service.get('activeState'), { foo: 2, bar: 1, baz: 2 }, 'value was added and changed');
});

test('decrementingStateValue decreases the stateValue', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  service.trigger(`ae:${engineId}:decrementingStateValue`, 'foo');

  assert.deepEqual(service.get('activeState.foo'), -1, 'initializes value if blank');

  service.trigger(`ae:${engineId}:decrementingStateValue`, 'foo', 5);

  assert.deepEqual(service.get('activeState.foo'), -6, 'accepts additional values');
});

test('incrementingStateValue increases the stateValue', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  service.trigger(`ae:${engineId}:incrementingStateValue`, 'foo');

  assert.deepEqual(service.get('activeState.foo'), 1, 'initializes value if blank');

  service.trigger(`ae:${engineId}:incrementingStateValue`, 'foo', 5);

  assert.deepEqual(service.get('activeState.foo'), 6, 'accepts additional values');
});

test('togglingStateValue toggles the stateValue', function(assert) {
  assert.expect(3);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  service.trigger(`ae:${engineId}:togglingStateValue`, 'foo');

  assert.deepEqual(service.get('activeState.foo'), true, 'initializes value to true');

  service.trigger(`ae:${engineId}:togglingStateValue`, 'foo');

  assert.deepEqual(service.get('activeState.foo'), false, 'toggles to false');

  service.trigger(`ae:${engineId}:togglingStateValue`, 'foo');

  assert.deepEqual(service.get('activeState.foo'), true, 'toggles to true');
});

test('deletingStateValue deletes a stateValue', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, activeState: { foo: 'bar' } });

  service.trigger(`ae:${engineId}:deletingStateValue`, 'foo');

  assert.deepEqual(service.get('activeState.foo'), undefined, 'removed value');
});
