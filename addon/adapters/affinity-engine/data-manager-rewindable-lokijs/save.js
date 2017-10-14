import { LokiJSAdapter } from 'ember-lokijs';

export default LokiJSAdapter.extend({
  indices: ['dataGroup', 'isAutosave'],
  lokiOptions: {
    adapter: new LokiIndexedAdapter()
  }
});
