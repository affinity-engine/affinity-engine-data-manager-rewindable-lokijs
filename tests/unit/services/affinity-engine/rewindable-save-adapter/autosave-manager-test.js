import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { deepStub, initialize as initializeEngine } from 'affinity-engine';
import { initializeQUnitAssertions } from 'ember-message-bus';
import multiton from 'ember-multiton-service';

const {
  getOwner,
  run
} = Ember;

const Publisher = Ember.Object.extend({ eBus: multiton('message-bus', 'engineId'), engineId: 'foo' });
let publisher;

moduleFor('service:affinity-engine/data-manager-rewindable-lokijs/autosave-manager', 'Unit | Service | affinity engine/rewindable save adapter/autosave manager', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    localStorage.clear();

    initializeEngine(appInstance);
    initializeQUnitAssertions(appInstance, 'eBus', Ember.Object.extend({ eBus: multiton('message-bus', 'engineId'), engineId: 'foo' }));
    appInstance.register('ember-message-bus:publisher', Publisher);
    publisher = appInstance.lookup('ember-message-bus:publisher');
  }
});

test('`autosaves` returns a filtered list of saves that are autosaves with the correct engineId', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId });
  const store = service.get('store');

  run(() => {
    store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save().then(() => {
      return store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save();
    }).then(() => {
      return store.createRecord('affinity-engine/local-save', { isAutosave: false, engineId }).save();
    }).then(() => {
      return store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId: 'bar' }).save();
    }).then(() => {
      return service.get('autosaves');
    }).then((autosaves) => {
      assert.equal(autosaves.get('length'), 2, 'list is filtered');
    });
  });
});

test('`shouldWriteAutosave` creates a new autosave if maxAutosaves has not been reached', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, maxAutosaves: 3 });
  const store = service.get('store');

  assert.willPublish('shouldCreateSave', ['', { isAutosave: true }], 'shouldCreateSave was triggered');
  assert.willNotPublish('shouldUpdateSave', 'shouldUpdateSave should not be triggered');

  run(() => {
    store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save().then(() => {
      return store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save();
    }).then(() => {
      publisher.get('eBus').publish('shouldWriteAutosave');
    });
  });
});

test('`shouldWriteAutosave` updates the oldest autosave if maxAutosaves has been reached', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, maxAutosaves: 3 });
  const store = service.get('store');

  assert.willNotPublish('shouldCreateSave', 'shouldCreateSave was not triggered');
  assert.willPublish('shouldUpdateSave', 'shouldUpdateSave was triggered');

  run(() => {
    store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save().then(() => {
      return store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save();
    }).then(() => {
      return store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save();
    }).then(() => {
      publisher.get('eBus').publish('shouldWriteAutosave');
    });
  });
});

const configurationTiers = [
  'config.attrs.autosaveManager',
  'config.attrs.dataManager',
  'config.attrs.globals'
];

configurationTiers.forEach((tier) => {
  test(`maxAutosaves is defined by ${tier}`, function(assert) {
    assert.expect(1);

    const config = deepStub(tier, 'maxAutosaves', 123);
    const service = this.subject({ config, engineId: 'foo' });

    assert.equal(service.get('maxAutosaves', 123, 'maxAutosaves is correct'))
  });
});
