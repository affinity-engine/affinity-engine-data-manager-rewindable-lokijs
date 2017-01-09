import { moduleForModel, test } from 'ember-qunit';

moduleForModel('affinity-engine/data-manager-rewindable-lokijs/save', 'Unit | Model | affinity engine/data manager rewindable lokijs/save', {
  // Specify the other units that are required for this test.
  needs: ['service:multiton-service-manager']
});

test('lastState returns the last of statePoints', function(assert) {
  assert.expect(1);

  const model = this.subject({ statePoints: ['foo', 'bar', 'baz' ]});

  assert.equal(model.get('lastState'), 'baz', 'is correct statePoint');
});

test('updated returns meta.updated if available', function(assert) {
  assert.expect(1);

  const model = this.subject({ meta: { updated: 'foo', created: 'bar' }});

  assert.equal(model.get('updated'), 'foo', 'is correct meta');
});

test('updated returns meta.created if there is no meta.updated', function(assert) {
  assert.expect(1);

  const model = this.subject({ meta: { created: 'bar' }});

  assert.equal(model.get('updated'), 'bar', 'is correct meta');
});
