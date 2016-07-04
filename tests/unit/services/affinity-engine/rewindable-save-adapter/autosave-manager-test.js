import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { deepStub, initialize as initializeEngine } from 'affinity-engine';
import { initializeQUnitAssertions } from 'ember-message-bus';

const {
  getOwner,
  run
} = Ember;

moduleFor('service:affinity-engine/rewindable-save-adapter/autosave-manager', 'Unit | Service | affinity engine/rewindable save adapter/autosave manager', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    localStorage.clear();

    initializeEngine(appInstance);
    initializeQUnitAssertions(appInstance);
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

  assert.willPublish(`ae:${engineId}:shouldCreateSave`, ['', { isAutosave: true }], 'shouldCreateSave was triggered');
  assert.willNotPublish(`ae:${engineId}:shouldUpdateSave`, 'shouldUpdateSave should not be triggered');

  run(() => {
    store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save().then(() => {
      return store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save();
    }).then(() => {
      service.trigger(`ae:${engineId}:shouldWriteAutosave`);
    });
  });
});

test('`shouldWriteAutosave` updates the oldest autosave if maxAutosaves has been reached', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId, maxAutosaves: 3 });
  const store = service.get('store');

  assert.willNotPublish(`ae:${engineId}:shouldCreateSave`, 'shouldCreateSave was not triggered');
  assert.willPublish(`ae:${engineId}:shouldUpdateSave`, 'shouldUpdateSave was triggered');

  run(() => {
    store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save().then(() => {
      return store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save();
    }).then(() => {
      return store.createRecord('affinity-engine/local-save', { isAutosave: true, engineId }).save();
    }).then(() => {
      service.trigger(`ae:${engineId}:shouldWriteAutosave`);
    });
  });
});

const configurationTiers = [
  'config.attrs.autosaveManager',
  'config.attrs.saveStateManager',
  'config.attrs.globals'
];

configurationTiers.forEach((tier) => {
  test(`maxAutosaves is defined by ${tier}`, function(assert) {
    assert.expect(1);

    const config = deepStub(tier, 'maxAutosaves', 123);
    const service = this.subject({ config });

    assert.equal(service.get('maxAutosaves', 123, 'maxAutosaves is correct'))
  });
});
