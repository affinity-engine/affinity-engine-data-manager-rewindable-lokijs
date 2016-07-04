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

test('gameIsResetting resets the statePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, statePoints: ['foo'] });

  service.trigger(`ae:rsa:${engineId}:gameIsResetting`);

  assert.deepEqual(service.get('statePoints'), [], 'statePoints got reset');
});

test('gameIsRewinding sets the statePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, statePoints: ['foo'] });

  service.trigger(`ae:${engineId}:gameIsRewinding`, ['bar']);

  assert.deepEqual(service.get('statePoints'), ['bar'], 'statePoints got set');
});

test('shouldFileActiveState pushes the activeState to the statePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId });

  service.trigger(`ae:${engineId}:shouldFileActiveState`, 'foo');

  assert.deepEqual(service.get('statePoints'), ['foo'], 'activeState got filed');
});

test('shouldFileActiveState shifts old state points if they exceed maxStatePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, maxStatePoints: 3, statePoints: [1, 2, 3] });

  service.trigger(`ae:${engineId}:shouldFileActiveState`, 4);

  assert.deepEqual(service.get('statePoints'), [2, 3, 4], 'activeState got filed and shifted');
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
