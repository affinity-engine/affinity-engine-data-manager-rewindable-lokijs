import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';
import moment from 'moment';
import { LokiJSModelMixin } from 'ember-lokijs';

const {
  computed,
  get
} = Ember;

const { inject: { service } } = Ember;

export default Model.extend(LokiJSModelMixin, {
  isAutosave: attr('boolean'),
  name: attr('string'),
  statePoints: attr(),
  engineId: attr('string'),

  i18n: service(),

  activeState: computed('statePoints.[]', {
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

  fullName: computed('name', 'activeState.sceneName', 'updated', {
    get() {
      let name = get(this, 'name') || get(this, 'activeState.sceneName');

      if (get(this, 'isAutosave')) {
        const autoTranslation = get(this, 'i18n').t('affinity-engine.local-save.auto');

        name = `${autoTranslation}: ${name}`;
      }

      return `${name}, ${moment(get(this, 'updated')).format('MM/DD/YY h:mm:ss A')}`;
    }
  })
});
