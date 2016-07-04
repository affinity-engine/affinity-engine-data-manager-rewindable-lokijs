import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { initialize as initializeEngine } from 'affinity-engine';
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

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
