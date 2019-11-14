/**
 * Created by wx on 17-3-26.
 */
define([
  'text!templates/shortcutMenu-template.html'
], function (MenuTemplate) {
  'use strict';

  var shortcutMenuView = Backbone.View.extend({
    tagName: 'li',
    className: 'view form-control',
    template: _.template(MenuTemplate),
    initialize: function (options) {
      this.$el.html(this.template);
      this.title = options.title;
      this.viewId = options.viewId;
      this.eventBus = options.eventBus;
      this.$el.find('label').html(this.title);
    },

    events: {
      'click .destroy': 'delete'
    },
    delete: function () {
      this.eventBus.trigger('shortcut:delete', this.viewId, 'delete')
    }

  });
  return shortcutMenuView;
})