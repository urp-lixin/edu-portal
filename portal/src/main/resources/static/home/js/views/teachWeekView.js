/**
 * Created by wx on 17-3-24.
 */

define([
  'services/teachWeekService'
], function (TeachWeek) {
  'use strict';

  var TeachWeekView = Backbone.View.extend({
    el: $("#teachWeek"),
    initialize: function (options) {
      this.bizTypeId = options.bizType.id;
      this.eventBus = options.eventBus;
      this.listenTo(this.eventBus, 'bizType:change', this.render);
      this.render();
    },
    render: function (id) {
      $("#teachWeek").empty();
      var _self = this;
      var bizTypeId = _self.bizTypeId;
      if (id != undefined) {
        bizTypeId = id;
      }
      TeachWeek.getCurrentTeachWeek(bizTypeId);
    }
  });
  return TeachWeekView;
});