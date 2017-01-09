import { moduleForModel, test } from 'ember-qunit';

moduleForModel('affinity-engine/data-manager-rewindable-lokijs/shared-data', 'Unit | Model | affinity engine/data manager rewindable lokijs/shared data', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
