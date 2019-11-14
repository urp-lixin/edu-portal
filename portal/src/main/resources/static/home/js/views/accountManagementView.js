/**
 * Created by wx on 17-4-13.
 */
define([
  'text!templates/accountManagement-template.html'
], function (AccountManagementTemplate) {

  var AccountManagementView = Backbone.View.extend({
    el: $("#accountManagement"),
    template: _.template(AccountManagementTemplate),
    initialize: function (options) {
      this.personName = options.personName;
      this.eventBus = options.eventBus;
      this.$el.html(this.template);
      this.$el.find('.personName').html(this.personName);

    },
    events: {
      'click .accountProfile': 'accountProfile',
      'click .accountSetting': 'accountSetting'
    },
    accountProfile: function (e) {
      e.preventDefault();
      var $anchor = $(e.target);
      if (e.target.tagName != 'A') {
        $anchor = $(e.target).parent('a');
      }
      $anchor.attr('href', window.CONTEXT_PATH + '/my/profile');
      this.eventBus.trigger('fixedMenu:activated', $anchor, e);
    },

    accountSetting: function (e) {
      e.preventDefault();
      var $anchor = $(e.target);
      if (e.target.tagName != 'A') {
        $anchor = $(e.target).parent('a');
      }
      $anchor.attr('href', window.CONTEXT_PATH + '/my/account');
      this.eventBus.trigger('fixedMenu:activated', $anchor, e);
    }
  });
  return AccountManagementView;

});