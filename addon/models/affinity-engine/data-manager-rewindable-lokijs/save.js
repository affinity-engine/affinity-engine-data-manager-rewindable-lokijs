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
  'plugin.dataManager',
  'all'
];

export default Model.extend(LokiJSModelMixin, {
  isAutosave: attr('boolean'),
  name: attr('string'),
  statePoints: attr(),
  dataGroup: attr('string'),
  engineId: attr('string'),

  config: multiton('affinity-engine/config', 'engineId'),
  translator: registrant('affinity-engine/translator'),

  dateFormat: configurable(configurationTiers, 'dateFormat'),

  lastState: computed('statePoints.lastObject', {
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

  fullName: computed('name', 'lastState.sceneName', {
    get() {
      let name = get(this, 'name') || get(this, 'lastState.sceneName');

      if (get(this, 'isAutosave')) {
        const autoTranslation = get(this, 'translator').translate('affinity-engine.plugins.data-manager.autosave');

        name = isPresent(name) ? `<em>${autoTranslation}</em> ${name}` : autoTranslation;
      }

      return name;
    }
  }),

  formattedDate: computed('updated', {
    get() {
      return get(this, 'translator').formatDate(get(this, 'updated'), get(this, 'dateFormat'));
    }
  }),

  fullNameAndDate: computed('fullName', 'formattedDate', {
    get() {
      return `${get(this, 'fullName')}: ${get(this, 'formattedDate')}`;
    }
  })
});
