/**
 * Created by wx on 17-3-24.
 */
define([
  'services/lastLoginInfoService'
], function (LastLoginInfo) {
  'use strict';

  var LastLoginInfoView = Backbone.View.extend({
    el: $("#lastLoginInfo"),
    initialize: function () {
      this.render();
    },
    render: function () {
      LastLoginInfo.getAccountLoginInfo();
      return this;
    }
  });
  return LastLoginInfoView;
});