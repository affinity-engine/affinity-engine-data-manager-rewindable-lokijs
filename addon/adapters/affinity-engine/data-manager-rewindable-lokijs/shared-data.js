import { LokiJSAdapter } from 'ember-lokijs';

export default LokiJSAdapter.extend({
  indices: ['dataGroup'],
  lokiOptions: {
    adapter: new LokiIndexedAdapter()
  }
});
