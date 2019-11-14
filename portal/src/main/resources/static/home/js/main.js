/**
 * Created by wx on 17-3-24.
 */
var refreshViews = function (bizType, bizTypes, personName) {

  require.config({
    baseUrl: window.CONTEXT_PATH + '/static/home/js',

    paths: {
      text: window.CONTEXT_PATH + '/static/eams-ui/js/text'
    }
  });
  require([
    'views/toolbarTabView',
    'views/calenderView',
    'views/teachWeekView',
  ], function ( ToolbarTabView, CalenderView,  TeachWeekView) {
    var eventBus = _.extend({}, Backbone.Events);

 
    var toolbarTabView = new ToolbarTabView({
      eventBus: eventBus
    });
    var calenderView = new CalenderView;
    var teachWeekView = new TeachWeekView({
      bizType: bizType,
      eventBus: eventBus
    });

  });

};
