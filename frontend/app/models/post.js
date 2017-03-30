import DS from 'ember-data';
import Ember from 'ember';
import Postable from 'flaredown/models/postable';

const {
  attr,
  hasMany,
} = DS;

const {
  get,
  computed,
} = Ember;

export default Postable.extend({
  title: attr('string'),
  tagIds: attr(),
  foodIds: attr(),
  symptomIds: attr(),
  conditionIds: attr(),
  treatmentIds: attr(),
  commentsCount: attr('number'),

  tags: hasMany('tag', { async: false }),
  foods: hasMany('food', { async: false }),
  comments: hasMany('comment', { async: true }),
  symptoms: hasMany('symptom', { async: false }),
  conditions: hasMany('condition', { async: false }),
  treatments: hasMany('treatment', { async: false }),

  topics: computed('tags', 'foods', 'symptoms', 'conditions', 'treatments', function() {
    return [
      ...get(this, 'tags').toArray(),
      ...get(this, 'foods').toArray(),
      ...get(this, 'symptoms').toArray(),
      ...get(this, 'conditions').toArray(),
      ...get(this, 'treatments').toArray(),
    ].sortBy('name');
  }),

  addTopic(topic) {
    if (!get(this, topic.constructor.modelName.pluralize()).find(item => item === topic)) {
      this.manipulateTopic(topic, 'pushObject');
    }
  },

  removeTopic(topic) {
    this.manipulateTopic(topic, 'removeObject');
  },

  manipulateTopic(topic, action) {
    const id = parseInt(get(topic, 'id'));
    const type = topic.constructor.modelName;
    const idsKey = `${type}Ids`;

    get(this, idsKey)[action](id);
    get(this, type.pluralize())[action](topic);
  },
});
