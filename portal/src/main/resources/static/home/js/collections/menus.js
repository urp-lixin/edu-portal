/**
 * Created by wx on 17-4-10.
 */

define([
  'models/menu'
    ],
function (Menu) {

  var menus = Backbone.Collection.extend({
    model:Menu,
    comparator: function (item) {
      return Number(item.get('id'));
    }
  });
  return menus;


});