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

test('stateBuffer returns a clone of the latest statePoint', function(assert) {
  assert.expect(4);

  const engineId = 'foo';
  const statePoint = { bar: 'baz' };
  const service = this.subject({ engineId, statePoints: Ember.A([statePoint]) });

  assert.deepEqual(service.get('stateBuffer'), statePoint, 'content is the same');
  assert.notEqual(service.get('stateBuffer'), statePoint, 'object is different');

  service.set('statePoints', Ember.A([{ babble: 'fish' }]));

  assert.deepEqual(service.get('stateBuffer'), { babble: 'fish' }, 'updates if statePoints changes');

  service.get('statePoints').pushObject({ ocra: 'corn' });

  assert.deepEqual(service.get('stateBuffer'), { ocra: 'corn' }, 'updates if statePoint length changes');
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

test('shouldFileStateBuffer pushes the stateBuffer to the statePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, statePoints: Ember.A([{ foo: 'bar' }]) });

  service.set('stateBuffer.baz', 'bumble');

  publisher.get('eBus').publish('shouldFileStateBuffer');

  assert.deepEqual(service.get('statePoints'), [{ foo: 'bar' }, { foo: 'bar', baz: 'bumble' }], 'stateBuffer got filed');
});

test('shouldFileStateBuffer shifts old state points if they exceed maxStatePoints', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, maxStatePoints: 3, statePoints: Ember.A([{ foo: 1 }, { foo: 2 }, { foo: 3 }]) });

  publisher.get('eBus').publish('shouldFileStateBuffer');

  assert.deepEqual(service.get('statePoints'), [{ foo: 2 }, { foo: 3 }, { foo: 3 }], 'stateBuffer got filed and shifted');
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
