import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { deepStub, initialize as initializeEngine } from 'affinity-engine';
import { initializeQUnitAssertions } from 'ember-message-bus';

const {
  getOwner
} = Ember;

moduleFor('service:affinity-engine/rewindable-save-adapter/state-point-manager', 'Unit | Service | affinity engine/rewindable save adapter/state point manager', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeEngine(appInstance);
    initializeQUnitAssertions(appInstance);
  }
});

test('restartingEngine resets the statePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, statePoints: ['foo'] });

  service.trigger(`ae:${engineId}:restartingEngine`);

  assert.deepEqual(service.get('statePoints'), [{}], 'statePoints got reset');
});

test('shouldLoadLatestStatePoint sets the statePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, statePoints: ['foo'] });

  service.trigger(`ae:${engineId}:shouldLoadLatestStatePoint`, ['bar']);

  assert.deepEqual(service.get('statePoints'), ['bar'], 'statePoints got set');
});

test('shouldFileActiveState pushes the activeState to the statePoints', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });
  const state = { foo: 'bar' };

  service.trigger(`ae:rsa:${engineId}:shouldFileActiveState`, state);

  assert.deepEqual(service.get('statePoints'), [{}, { foo: 'bar' }], 'activeState got filed');
  assert.ok(state !== service.get('statePoints')[1], 'cloned');
});

test('shouldFileActiveState shifts old state points if they exceed maxStatePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, maxStatePoints: 3, statePoints: [1, 2, 3] });

  service.trigger(`ae:rsa:${engineId}:shouldFileActiveState`, { });

  assert.deepEqual(service.get('statePoints'), [2, 3, { }], 'activeState got filed and shifted');
});

const configurationTiers = [
  'config.attrs.saveStateManager',
  'config.attrs.globals'
];

configurationTiers.forEach((tier) => {
  test(`maxStatePoints is defined by ${tier}`, function(assert) {
    assert.expect(1);

    const config = deepStub(tier, 'maxStatePoints', 123);
    const service = this.subject({ config });

    assert.equal(service.get('maxStatePoints', 123, 'maxStatePoints is correct'))
  });
});
