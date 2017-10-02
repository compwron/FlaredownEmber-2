import DS from 'ember-data';
import Ember from 'ember';

const {
  computed,
} = Ember;

export default DS.Model.extend({
  name: DS.attr('string'),
  startAt: DS.attr('string'),
  endAt: DS.attr('string'),
  includes: DS.attr('raw'),
});
