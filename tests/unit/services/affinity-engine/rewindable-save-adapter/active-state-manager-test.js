import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { initialize as initializeEngine } from 'affinity-engine';
import { initializeQUnitAssertions } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  getOwner
} = Ember;

const Publisher = Ember.Object.extend({ eBus: multiton('message-bus', 'engineId'), engineId: 'foo' });
let publisher;

moduleFor('service:affinity-engine/data-manager-rewindable-lokijs/active-state-manager', 'Unit | Service | affinity engine/rewindable save adapter/active state manager', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeEngine(appInstance);
    initializeQUnitAssertions(appInstance, 'eBus', Ember.Object.extend({ eBus: multiton('message-bus', 'engineId'), engineId: 'foo' }));
    appInstance.register('ember-message-bus:publisher', Publisher);
    publisher = appInstance.lookup('ember-message-bus:publisher');
  }
});

test('restartingEngine resets the activeState', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, activeState: { foo: 'bar' } });

  publisher.get('eBus').publish('restartingEngine');

  assert.deepEqual(service.get('activeState'), {}, 'activeState got reset');
});

test('shouldFileActiveState publishes the activeState internally', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const activeState = { foo: 'bar' };

  this.subject({ engineId, activeState });

  assert.willPublish('rsa:shouldFileActiveState', [activeState], 'shouldFileActiveState with activeState');

  publisher.get('eBus').publish('shouldFileActiveState');
});

test('shouldLoadLatestStatePoint loads the last argument', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  publisher.get('eBus').publish('shouldLoadLatestStatePoint', [{ foo: 'bar' }, { foo: 'baz' }]);

  assert.deepEqual(service.get('activeState'), { foo: 'baz' }, 'last item in array was loaded');
});

test('shouldSetStateValue sets a key value pair on activeState', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  publisher.get('eBus').publish('shouldSetStateValue', 'foo', 'bar');

  assert.equal(service.get('activeState.foo'), 'bar', 'value was set');

  publisher.get('eBus').publish('shouldSetStateValue', 'foo', 'baz');

  assert.equal(service.get('activeState.foo'), 'baz', 'value was overwritten');
});

test('shouldSetStateValues sets the provided properties on activeState', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  publisher.get('eBus').publish('shouldSetStateValues', { foo: 1, bar: 1 });

  assert.deepEqual(service.get('activeState'), { foo: 1, bar: 1 }, 'value was set');

  publisher.get('eBus').publish('shouldSetStateValues', { foo: 2, baz: 2 });

  assert.deepEqual(service.get('activeState'), { foo: 2, bar: 1, baz: 2 }, 'value was added and changed');
});

test('shouldDecrementStateValue decreases the stateValue', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  publisher.get('eBus').publish('shouldDecrementStateValue', 'foo');

  assert.deepEqual(service.get('activeState.foo'), -1, 'initializes value if blank');

  publisher.get('eBus').publish('shouldDecrementStateValue', 'foo', 5);

  assert.deepEqual(service.get('activeState.foo'), -6, 'accepts additional values');
});

test('shouldIncrementStateValue increases the stateValue', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  publisher.get('eBus').publish('shouldIncrementStateValue', 'foo');

  assert.deepEqual(service.get('activeState.foo'), 1, 'initializes value if blank');

  publisher.get('eBus').publish('shouldIncrementStateValue', 'foo', 5);

  assert.deepEqual(service.get('activeState.foo'), 6, 'accepts additional values');
});

test('shouldToggleStateValue toggles the stateValue', function(assert) {
  assert.expect(3);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  publisher.get('eBus').publish('shouldToggleStateValue', 'foo');

  assert.deepEqual(service.get('activeState.foo'), true, 'initializes value to true');

  publisher.get('eBus').publish('shouldToggleStateValue', 'foo');

  assert.deepEqual(service.get('activeState.foo'), false, 'toggles to false');

  publisher.get('eBus').publish('shouldToggleStateValue', 'foo');

  assert.deepEqual(service.get('activeState.foo'), true, 'toggles to true');
});

test('shouldDeleteStateValue deletes a stateValue', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, activeState: { foo: 'bar' } });

  publisher.get('eBus').publish('shouldDeleteStateValue', 'foo');

  assert.deepEqual(service.get('activeState.foo'), undefined, 'removed value');
});
