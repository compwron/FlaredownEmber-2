import Ember from 'ember';
import * as d3 from "d3";

/* no-unexpected-multiline: "error" */

const {
  get,
  set,
  Mixin,
  isEmpty,
  computed,
  getProperties,
} = Ember;

export default Mixin.create({
  tagName: 'g',
  classNames: 'chart',
  attributeBindings: ['transform'],

  transform: computed('height', 'padding', 'chartOffset', function() {
    return `translate(0,${get(this, 'chartOffset')})`;
  }),

  nestedTransform: computed('height', 'startAt', 'data', function() {
    return `translate(${ - parseFloat(get(this, 'xScale')( get(this, 'startAt') ) )}, 5)`;
  }),

  xDomain: computed('data', function() {
    return d3.extent(get(this, 'data'), d => d.x);
  }),

  xScale: computed('data', function() {
    return(
      d3
        .time
        .scale()
        .range([0, get(this, 'width')])
        .domain(get(this, 'xDomain'))
    );
  }),

  lineData: computed('data', function() {
    return get(this, 'data').reject(item => isEmpty(item.y));
  }),

  /*eslint-disable no-unexpected-multiline*/
  lineFunction: computed('lineData', function() {
    return(
      d3
        .svg
        .line()
        .x(this.getX.bind(this))
        .y(this.getY.bind(this))
        .interpolate('linear')
        (get(this, 'lineData'))
    );
  }),
  /*eslint-enable no-unexpected-multiline*/

  getX(d) {
    return get(this, 'xScale')(d.x);
  },

  getY(d) {
    return get(this, 'yScale')(d.y) - 4; // minus radius
  },

  actions: {
    openPointTooltip(point) {
      set(this, 'openPointTooltip', true);
      set(this, 'currentPoint', point);
    },

    closePointTooltip() {
      set(this, 'openPointTooltip', false);
      set(this, 'currentPoint', null);
    },

    hideChart() {
      const {
        name,
        category,
        chartsVisibilityService,
      } = getProperties(this, 'name', 'category', 'chartsVisibilityService');

      chartsVisibilityService.setVisibility(false, category, name);
    },
  }
});
