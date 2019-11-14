/**
 * Created by wx on 17-3-24.
 */

define([], function () {
  'use strict';

  var CalenderView = Backbone.View.extend({
    el: $("#calendarDiv"),
    initialize: function () {
      this.render();
    },
    render: function () {
      var calendar = $("#calendarDiv").datetimepicker({
        inline: true,
        showClear: false,
        showClose: false,
        showTodayButton: false
      });
      this.$el.append(calendar);
    }
  });
  return CalenderView;
})
