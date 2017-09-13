import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { deepStub, initialize as initializeEngine } from 'affinity-engine';

const {
  getOwner
} = Ember;

moduleFor('service:affinity-engine/data-manager-rewindable-lokijs/data-group-manager', 'Unit | Service | affinity engine/rewindable save adapter/data id manager', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeEngine(appInstance);
  }
});

test('dataGroup returns the engineId if no config is defined', function(assert) {
  assert.expect(1);

  const service = this.subject({ engineId: 'foo' });

  assert.equal(service.get('dataGroup'), 'foo', 'uses the engineId');
});

const configurationTiers = [
  'config.attrs.plugin.dataManager.attrs',
  'config.attrs.all.attrs'
];

configurationTiers.forEach((tier) => {
  test(`dataGroup is defined by ${tier}`, function(assert) {
    assert.expect(1);

    const { config } = deepStub(tier, { dataGroup: 'bar' });
    const service = this.subject({ config, engineId: 'foo' });

    assert.equal(service.get('dataGroup'), 'bar', 'dataGroup is correct');
  });
});
