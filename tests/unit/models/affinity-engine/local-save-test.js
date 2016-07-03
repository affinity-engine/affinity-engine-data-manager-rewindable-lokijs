import { moduleForModel, test } from 'ember-qunit';

moduleForModel('affinity-engine/local-save', 'Unit | Model | affinity engine/local save', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
