/**
 * Created by wx on 17-3-24.
 */

define([
    'services/loginCountService'
], function (LoginCountService) {
  'use strict';

  var LoginCountView = Backbone.View.extend({
    el: $("#loginCount"),
    initialize: function () {
      this.render();
    },
    render: function () {
      LoginCountService.getLoginCount();
      return this;
    }
  });
  return LoginCountView;
});