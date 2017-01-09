import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { initialize as initializeEngine } from 'affinity-engine';
import { initializeQUnitAssertions } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  getOwner,
  run
} = Ember;

const { next } = run;

const Publisher = Ember.Object.extend({ eBus: multiton('message-bus', 'engineId'), engineId: 'foo' });
let publisher;

moduleFor('service:affinity-engine/data-manager-rewindable-lokijs/shared-data-manager', 'Unit | Service | affinity engine/rewindable save adapter/shared data manager', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeEngine(appInstance);
    initializeQUnitAssertions(appInstance, 'eBus', Ember.Object.extend({ eBus: multiton('message-bus', 'engineId'), engineId: 'foo' }));
    appInstance.register('ember-message-bus:publisher', Publisher);
    publisher = appInstance.lookup('ember-message-bus:publisher');
  }
});

test('it creates or loads a shared state on init', function(assert) {
  assert.expect(1);

  const done = assert.async();
  const service = this.subject({ engineId: 'foo' });

  next(() => {
    assert.deepEqual(service.get('data'), {}, 'generates a blank data');

    done();
  });
});

test('shouldPersistMetaState saves the dataMap', function(assert) {
  assert.expect(2);

  const done = assert.async();
  const service = this.subject({ engineId: 'foo' });

  next(() => {
    service.set('metaState.engineId', 'bar');

    assert.ok(service.get('metaState.hasDirtyAttributes'), 'metaState is dirty');

    run(() => {
      publisher.get('eBus').publish('shouldPersistMetaState');

      next(() => {
        assert.ok(!service.get('metaState.hasDirtyAttributes'), 'metaState is saved');

        done();
      })
    });
  });
});
