/**
 * Created by wx on 17-3-24.
 */
define([], function () {

  var ShortcutModel = Backbone.Model.extend({
    defaults: function () {
      return {
        id: null,
        title: '',
        href: '',
        permCode: ''
      }
    }
  });

  return ShortcutModel;
});