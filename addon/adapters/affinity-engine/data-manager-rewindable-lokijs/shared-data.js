import { LokiJSAdapter } from 'ember-lokijs';
import adapter from './adapter';

export default LokiJSAdapter.extend({
  indices: ['dataGroup'],
  lokiOptions: {
    adapter,
    env: 'BROWSER'
  }
});
