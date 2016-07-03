import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { initialize as initializeEngine } from 'affinity-engine';

const {
  getOwner
} = Ember;

moduleFor('service:affinity-engine/save-state-manager', 'Unit | Service | affinity engine/save state manager', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeEngine(appInstance);
  }
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
