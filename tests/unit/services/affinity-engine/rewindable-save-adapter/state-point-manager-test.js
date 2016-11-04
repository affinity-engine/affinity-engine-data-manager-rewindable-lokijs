import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { deepStub, initialize as initializeEngine } from 'affinity-engine';
import { initializeQUnitAssertions } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  getOwner
} = Ember;

const Publisher = Ember.Object.extend({ eBus: multiton('message-bus', 'engineId'), engineId: 'foo' });
let publisher;

moduleFor('service:affinity-engine/data-manager-rewindable-lokijs/state-point-manager', 'Unit | Service | affinity engine/rewindable save adapter/state point manager', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeEngine(appInstance);
    initializeQUnitAssertions(appInstance, 'eBus', Ember.Object.extend({ eBus: multiton('message-bus', 'engineId'), engineId: 'foo' }));
    appInstance.register('ember-message-bus:publisher', Publisher);
    publisher = appInstance.lookup('ember-message-bus:publisher');
  }
});

test('restartingEngine resets the statePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, statePoints: ['foo'] });

  publisher.get('eBus').publish('restartingEngine');

  assert.deepEqual(service.get('statePoints'), [], 'statePoints got reset');
});

test('shouldLoadLatestStatePoint sets the statePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, statePoints: ['foo'] });

  publisher.get('eBus').publish('shouldLoadLatestStatePoint', ['bar']);

  assert.deepEqual(service.get('statePoints'), ['bar'], 'statePoints got set');
});

test('shouldFileActiveState pushes the activeState to the statePoints', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });
  const state = { foo: 'bar' };

  publisher.get('eBus').publish('rsa:shouldFileActiveState', state);

  assert.deepEqual(service.get('statePoints'), [{ foo: 'bar' }], 'activeState got filed');
  assert.ok(state !== service.get('statePoints')[1], 'cloned');
});

test('shouldFileActiveState shifts old state points if they exceed maxStatePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, maxStatePoints: 3, statePoints: [1, 2, 3] });

  publisher.get('eBus').publish('rsa:shouldFileActiveState', { });

  assert.deepEqual(service.get('statePoints'), [2, 3, { }], 'activeState got filed and shifted');
});

const configurationTiers = [
  'config.attrs.plugin.dataManager',
  'config.attrs.global'
];

configurationTiers.forEach((tier) => {
  test(`maxStatePoints is defined by ${tier}`, function(assert) {
    assert.expect(1);

    const config = deepStub(tier, 'maxStatePoints', 123);
    const service = this.subject({ config, engineId: 'foo' });

    assert.equal(service.get('maxStatePoints', 123, 'maxStatePoints is correct'))
  });
});
