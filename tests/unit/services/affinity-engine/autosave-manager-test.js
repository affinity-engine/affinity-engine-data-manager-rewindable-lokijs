import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { initialize as initializeEngine } from 'affinity-engine';

const {
  getOwner
} = Ember;

moduleFor('service:affinity-engine/autosave-manager', 'Unit | Service | affinity engine/autosave manager', {
  integration: true,

  beforeEacher() {
    const appInstance = getOwner(this);

    initializeEngine(appInstance);
  }
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
