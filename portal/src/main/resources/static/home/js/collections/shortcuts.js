/**
 * Created by wx on 17-3-24.
 */
define([
  'models/shortcut'
], function (Shortcut) {

  var shortcuts = Backbone.Collection.extend({
    model: Shortcut,
    comparator: function (item) {
      return Number(item.get('id'));
    }
  });

  return shortcuts;
});