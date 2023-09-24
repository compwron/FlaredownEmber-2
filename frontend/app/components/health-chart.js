import Ember from 'ember';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import Resizable from './chart/resizable';
import FieldsByUnits from 'flaredown/mixins/fields-by-units';
import DatesRetriever from 'flaredown/mixins/chart/dates-retriever';

const moment = extendMoment(Moment);

const {
  get,
  set,
  computed,
  observer,
  Component,
  getProperties,
  setProperties,
  run: {
    debounce,
    scheduleOnce,
  },
  inject: {
    service,
  },
  computed: {
    alias,
  },
} = Ember;

export default Component.extend(Resizable, FieldsByUnits, DatesRetriever, {
  chartSelectedDates: service(),

  classNames: ['health-chart'],

  checkins: [],
  trackables: [],
  flatHeight: 30,
  serieHeight: 75,
  seriePadding: 20,
  pixelsPerDate: 32,
  timelineHeight: 25,
  lastChartOffset: 0,
  lastChartHeight: 0,

  centeredDate: alias('chartSelectedDates.centeredDate'),
  hiddenCharts: alias('chartsVisibilityService.hiddenCharts'),
  pressureUnits: alias('session.currentUser.profile.pressureUnits'),
  timelineLength: alias('timeline.length'),
  visibilityFilter: alias('chartsVisibilityService.visibilityFilter'),

  updateTrackables: observer(
    'centeredDate',
    'chartLoaded',
    'chartsVisibilityService.payload.tags.@each.visible',
    'chartsVisibilityService.payload.foods.@each.visible',
    'chartsVisibilityService.payload.symptoms.@each.visible',
    'chartsVisibilityService.payload.conditions.@each.visible',
    'chartsVisibilityService.payload.treatments.@each.visible',
    'chartsVisibilityService.payload.weathersMeasures.@each.visible',
    'chartsVisibilityService.payload.harveyBradshawIndices.@each.visible',
    function() {
      debounce(this, this.fetchDataChart, 1000);
    }
  ),

  showChart: observer('chartToShow', function() {
    const { chartToShow, chartsVisibilityService } = getProperties(this, 'chartToShow', 'chartsVisibilityService');
    chartsVisibilityService.setVisibility(true, chartToShow.category, chartToShow.label);
  }),

  isChartEnablerDisabled: computed('hiddenCharts.length', function() {
    return get(this, 'hiddenCharts.length') === 0;
  }),

  chartEnablerPlaceholder: computed('isChartEnablerDisabled', function() {
    return get(this, 'isChartEnablerDisabled') ? "No charts to add" : "Add a chart";
  }),

  seriesLength: computed('series.weathersMeasures.length', 'trackables.length', function() {
    return get(this, 'trackables.length') + get(this, 'series.weathersMeasures.length');
  }),

  seriesWidth: computed('SVGWidth', function() {
    return get(this, 'SVGWidth') * 2;
  }),

  totalSeriesHeight: computed('lastChartOffset', 'lastChartHeight', function() {
    const {
      lastChartOffset,
      lastChartHeight,
      seriePadding,
    } = getProperties(this, 'lastChartOffset', 'lastChartHeight', 'seriePadding');

    return lastChartOffset + lastChartHeight + seriePadding;
  }),

  timeline: computed('checkins', 'startAt', 'endAt', function() {
    let timeline = Ember.A();

    moment.range(get(this, 'startAtWithCache'), get(this, 'endAtWithCache')).by('days', function(day) {
      timeline.pushObject(
        d3.time.format('%Y-%m-%d').parse(day.format("YYYY-MM-DD"))
      );
    });

    return timeline;
  }),

  SVGHeight: computed('timelineLength', 'totalSeriesHeight', function() {
    if(Ember.isPresent(get(this, 'totalSeriesHeight'))) {
      return get(this, 'totalSeriesHeight') + get(this, 'timelineHeight') + get(this, 'seriePadding');
    } else {
      return get(this, 'timelineHeight') + get(this, 'seriePadding');
    }
  }),

  SVGWidth: computed('checkins',function() {
    return this.$().width();
  }),

  observeFilterAndTrackables: observer(
    'trackables',
    'pressureUnits',
    'chartsVisibilityService.payload.tags.@each.visible',
    'chartsVisibilityService.payload.foods.@each.visible',
    'chartsVisibilityService.payload.symptoms.@each.visible',
    'chartsVisibilityService.payload.conditions.@each.visible',
    'chartsVisibilityService.payload.treatments.@each.visible',
    'chartsVisibilityService.payload.weathersMeasures.@each.visible',
    'chartsVisibilityService.payload.harveyBradshawIndices.@each.visible',
    function() {
      const {
        flatHeight,
        serieHeight,
        seriePadding,
        visibilityFilter,
      } = getProperties(this, 'flatHeight', 'serieHeight', 'seriePadding', 'visibilityFilter');

      let lastChartHeight = serieHeight;
      let chartOffset = 0 - lastChartHeight - seriePadding;
      let series = this.seriesWithBlanks(
        this.unpositionedSeries(visibilityFilter),
        visibilityFilter
      );

      series.conditions.forEach(item => {
        item.chartOffset = chartOffset += lastChartHeight + seriePadding;
      });

      series.symptoms.forEach(item => {
        item.chartOffset = chartOffset += lastChartHeight + seriePadding;
      });

      series.treatments.forEach((item, index) => {
        item.chartOffset = chartOffset += (index === 0 ? serieHeight : flatHeight) + seriePadding;
      });

      series.tags.forEach((item, index) => {
        let previousHeight = series.treatments.length === 0 && index === 0 ? serieHeight : flatHeight;

        item.chartOffset = chartOffset += previousHeight + seriePadding;
      });

      series.foods.forEach((item, index) => {
        let previousHeight = series.tags.length === 0 && series.treatments.length === 0 && index === 0 ?
          serieHeight
        :
          flatHeight;

        item.chartOffset = chartOffset += previousHeight + seriePadding;
      });

      if (series.treatments.length || series.tags.length || series.foods.length) {
        lastChartHeight = flatHeight;
      }

      const hbiCategory = visibilityFilter.harveyBradshawIndices;

      if (hbiCategory && hbiCategory['Harvey Bradshaw Index']) {
        series.harveyBradshawIndices.pushObject({
          name: 'Harvey Bradshaw Index',
          field: 'score',
          chartOffset: chartOffset += lastChartHeight + seriePadding,
        });

        lastChartHeight = serieHeight;
      }

      const weatherCategory = visibilityFilter.weathersMeasures;

      if (weatherCategory && weatherCategory['Avg daily humidity']) {
        series.weathersMeasures.pushObject({
          name: 'Avg daily humidity',
          unit: '%',
          field: 'humidity',
          chartOffset: chartOffset += lastChartHeight + seriePadding,
        });

        lastChartHeight = serieHeight;
      }

      if (weatherCategory && weatherCategory['Avg daily atmospheric pressure']) {
        series.weathersMeasures.pushObject({
          name: 'Avg daily atmospheric pressure',
          unit: get(this, 'pressureUnits'),
          field: this.pressureFieldByUnits(get(this, 'pressureUnits')),
          chartOffset: chartOffset += lastChartHeight + seriePadding,
        });

        lastChartHeight = serieHeight;
      }

      set(this, 'series', series);
      set(this, 'lastChartOffset', chartOffset);
      set(this, 'lastChartHeight', lastChartHeight);
    }
  ),

  unpositionedSeries(visibilityFilter) {
    let series = {
      conditions: [],
      symptoms:   [],
      treatments: [],
      tags: [],
      foods: [],
      harveyBradshawIndices: [],
      weathersMeasures: [],
    };

    get(this, 'trackables').forEach(item => {
      let name = get(item, 'name');
      let category = get(item, 'constructor.modelName').pluralize();
      let visibleCategory = visibilityFilter[category];

      if (visibleCategory && visibleCategory[name]) {
        series[category].pushObject({ chartOffset: 0, model: item });
      }
    });

    return series;
  },

  seriesWithBlanks(series, visibilityFilter) {
    let result = {
      conditions: [],
      symptoms:   [],
      treatments: [],
      tags: [],
      foods: [],
      harveyBradshawIndices: [],
      weathersMeasures: [],
    };

    Object.keys(visibilityFilter).forEach(categoryName => {
      const category = get(visibilityFilter, categoryName);

      Object.keys(category).forEach(chartName => {
        if (category[chartName] && series[categoryName]) {
          const chartFromSeries = series[categoryName].length && series[categoryName].findBy('model.name', chartName);

          result[categoryName].pushObject(chartFromSeries || {
            blank: true,
            chartOffset: 0,
            model: Ember.Object.create({
              name: chartName,
              fillClass: 'colorable-fill-35',
              strokeClass: 'colorable-stroke-35',
            }),
          });
        }
      });
    });

    return result;
  },

  didInsertElement() {
    this._super(...arguments);

    scheduleOnce('afterRender', this, this.fetchDataChart);
  },

  fetchDataChart() {
    const { endAt, startAt } = getProperties(this, 'endAt', 'startAt');

    const checkins = this.peekSortedCheckins();

    let payloadVersion = get(this, 'chartsVisibilityService.payloadVersion');
    let payloadDirection = get(this, 'chartsVisibilityService.payloadDirection');
    let oldPayloadVersion = get(this, 'oldPayloadVersion');

    if (
      (!oldPayloadVersion || !payloadDirection || payloadVersion === oldPayloadVersion) &&
      checkins.length &&
      endAt.isSameOrBefore(checkins.get('lastObject.date'), 'day') &&
      startAt.isSameOrAfter(checkins.get('firstObject.date'), 'day')
    ) {
      return this.isDestroyed ||
        (this.setChartsData() && setProperties(this, { chartLoaded: true, oldPayloadVersion: payloadVersion }));
    } else {
      const fetchOnlyQuery = get(this, 'chartsVisibilityService.fetchOnlyQuery');

      if (!Object.keys(fetchOnlyQuery).length) {
        return;
      }

      const { endAtWithCache, startAtWithCache } = getProperties(this, 'endAtWithCache', 'startAtWithCache');

      const query = {
        id: 'health',
        end_at: endAtWithCache.format("YYYY-MM-DD"),
        includes: fetchOnlyQuery,
        start_at: startAtWithCache.format("YYYY-MM-DD"),
      };

      return this
        .store
        .queryRecord('chart', query)
        .then(() => this.setChartsData())
        .then(() => this.isDestroyed || setProperties(this, { chartLoaded: true, oldPayloadVersion: payloadVersion }));
    }
  },

  setChartsData() {
    const tags = this.store.peekAll('tag').toArray();
    const foods = this.store.peekAll('food').toArray();
    const checkins = this.peekSortedCheckins();
    const symptoms = this.store.peekAll('symptom').toArray();
    const conditions = this.store.peekAll('condition').toArray();
    const treatments = this.store.peekAll('treatment').toArray();
    const harveyBradshawIndices = this.store.peekAll('harveyBradshawIndex').toArray();
    const trackables = [...conditions, ...symptoms, ...treatments, ...tags, ...foods, ...harveyBradshawIndices];

    return this.isDestroyed || setProperties(this, {checkins, trackables});
  },

  peekSortedCheckins() {
    return this
      .store
      .peekAll('checkin')
      .toArray()
      .sort(
        (a, b) => moment(get(a, 'date')).diff(get(b, 'date'), 'days')
      );
  },

  onResizeEnd() {
    this.fetchDataChart();
  },

  actions: {
    navigate(days) {
      let centeredDate = get(this, 'centeredDate');

      centeredDate = centeredDate ? moment(centeredDate) : get(this, 'endAt').subtract(get(this, 'daysRadius'), 'days');

      set(this, 'centeredDate', centeredDate.add(days, 'days'));
    },

    setCurrentDate(date) {
      get(this, 'onDateClicked')(date);
    },

    openInfoWindow(date, xPosition) {
      set(this, 'xPosition', xPosition);
      set(this, 'openInfoWindow', true);
    },

    closeInfoWindow() {
      set(this, 'xPosition', null);
      set(this, 'openInfoWindow', false);
    },
  },
});
