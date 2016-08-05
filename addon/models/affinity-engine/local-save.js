import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';
import { configurable, registrant } from 'affinity-engine';
import { LokiJSModelMixin } from 'ember-lokijs';
import multiton from 'ember-multiton-service';

const {
  computed,
  get,
  isPresent
} = Ember;

const configurationTiers = [
  'config.attrs.plugins.saveStateManager',
  'config.attrs'
];

export default Model.extend(LokiJSModelMixin, {
  isAutosave: attr('boolean'),
  name: attr('string'),
  statePoints: attr(),
  engineId: attr('string'),

  config: multiton('affinity-engine/config', 'engineId'),
  translator: registrant('affinity-engine/translator'),

  dateFormat: configurable(configurationTiers, 'dateFormat'),

  activeState: computed('statePoints.lastObject', {
    get() {
      const statePoints = get(this, 'statePoints');

      return statePoints[statePoints.length - 1];
    }
  }).readOnly(),

  updated: computed('meta.created', 'meta.updated', {
    get() {
      return get(this, 'meta.updated') || get(this, 'meta.created');
    }
  }).readOnly(),

  fullName: computed('name', 'activeState.sceneName', {
    get() {
      let name = get(this, 'name') || get(this, 'activeState.sceneName');

      if (get(this, 'isAutosave')) {
        const autoTranslation = get(this, 'translator').translate('affinity-engine.plugins.save-state-manager.autosave');

        name = isPresent(name) ? `${autoTranslation}: ${name}` : autoTranslation;
      }

      return name;
    }
  }),

  formattedDate: computed('updated', {
    get() {
      return get(this, 'translator').formatDate(get(this, 'updated'), get(this, 'dateFormat'));
    }
  })
});
