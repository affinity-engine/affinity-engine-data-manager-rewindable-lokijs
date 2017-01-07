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

moduleFor('service:affinity-engine/data-manager-rewindable-lokijs', 'Unit | Service | affinity engine/rewindable save state manager', {
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

test('saves returns a promise of all saves namespaced to engineId', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });
  const store = service.get('store');

  run(() => {
    store.createRecord('affinity-engine/local-save', { engineId }).save().then(() => {
      return store.createRecord('affinity-engine/local-save', { engineId }).save();
    }).then(() => {
      return store.createRecord('affinity-engine/local-save', { engineId: 'bar' }).save();
    }).then(() => {
      return service.get('saves');
    }).then((saves) => {
      assert.equal(saves.get('length'), 2, 'is correctly filtered');
      assert.equal(saves.get('firstObject.constructor.modelName'), 'affinity-engine/local-save', 'correct model');
    });
  });
});

test('mostRecentSave returns a promise of the most recent save', function(assert) {
  assert.expect(2);

  const engineId = 'foo';
  const service = this.subject({ engineId });
  const store = service.get('store');

  run(() => {
    store.createRecord('affinity-engine/local-save', { engineId, name: 'foo' }).save().then(() => {
      return store.createRecord('affinity-engine/local-save', { engineId, name: 'bar' }).save();
    }).then(() => {
      return store.createRecord('affinity-engine/local-save', { engineId, name: 'baz' }).save();
    }).then(() => {
      return service.get('mostRecentSave');
    }).then((mostRecentSave) => {
      assert.equal(mostRecentSave.get('name'), 'baz', 'using createdAt');

      return store.peekRecord('affinity-engine/local-save', 2).save();
    }).then((mostRecentSave) => {
      assert.equal(mostRecentSave.get('name'), 'bar', 'using updatedAt');
    });
  });
});

test('shouldCreateSave creates a save', function(assert) {
  assert.expect(5);

  const engineId = 'foo';
  const version = '1.0.0';
  const statePoints = [{}, {}, { foo: 1, bar: 1 }];
  const activeState = { foo: 2, baz: 2 };
  const name = 'nom';
  const options = { autosave: true };
  const service = this.subject({ activeState, engineId, statePoints, version });
  const store = service.get('store');

  run(() => {
    publisher.get('eBus').publish('shouldCreateSave', name, options);
  });

  next(() => {
    store.findRecord('affinity-engine/local-save', 1).then((record) => {
      assert.deepEqual(record.get('statePoints'), [{}, {}, { foo: 1, bar: 1 }], 'statePoints are correct');
      assert.equal(record.get('engineId'), engineId, 'engineId is correct');
      assert.equal(record.get('name'), name, 'name is correct');
      assert.equal(record.get('version'), version, 'version is correct');
      assert.equal(record.get('autosave'), true, 'options applied correctly');
    })
  });
});

test('shouldUpdateSave updates a save', function(assert) {
  assert.expect(5);

  const engineId = 'foo';
  const version = '1.0.0';
  const statePoints = [{}, {}, { foo: 1, bar: 1 }];
  const activeState = { foo: 2, baz: 2 };
  const name = 'nom';
  const options = { autosave: true };
  const service = this.subject({ activeState, engineId, statePoints, version });
  const store = service.get('store');

  run(() => {
    store.createRecord('affinity-engine/local-save', { name, engineId: 'bar', statePoints: [{ blah: 'blah' }]}).save().then((record) => {
      publisher.get('eBus').publish('shouldUpdateSave', record, options);
    });
  });

  next(() => {
    store.findRecord('affinity-engine/local-save', 1).then((record) => {
      assert.deepEqual(record.get('statePoints'), [{}, {}, { foo: 1, bar: 1 }], 'statePoints are correct');
      assert.equal(record.get('engineId'), engineId, 'engineId is correct');
      assert.equal(record.get('name'), name, 'name is correct');
      assert.equal(record.get('version'), version, 'version is correct');
      assert.equal(record.get('autosave'), true, 'options applied correctly');
    })
  });
});

test('shouldDeleteSave deletes a save', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const service = this.subject({ engineId });
  const store = service.get('store');

  run(() => {
    store.createRecord('affinity-engine/local-save', { engineId }).save().then((record) => {
      publisher.get('eBus').publish('shouldDeleteSave', record);
    });
  });

  next(() => {
    store.findAll('affinity-engine/local-save').then((records) => {
      assert.equal(records.get('length'), 0, 'record deleted');
    })
  });
});

test('shouldLoadSave reloads the record and then triggers shouldLoadLatestStatePoint', function(assert) {
  assert.expect(1);

  const engineId = 'foo';
  const statePoints = ['foo', 'bar', 'baz'];
  const service = this.subject({ engineId });
  const store = service.get('store');

  assert.willPublish('shouldLoadLatestStatePoint', [statePoints], 'shouldLoadLatestStatePoint with reloaded statePoints');

  run(() => {
    store.createRecord('affinity-engine/local-save', { engineId, statePoints }).save().then((record) => {
      record.set('statePoints', ['oooops']);

      publisher.get('eBus').publish('shouldLoadSave', record);
    });
  });
});
