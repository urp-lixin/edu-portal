/**
 * Created by wx on 17-4-10.
 */
define([], function () {

  var Menu = Backbone.Model.extend({
    default: function () {
      return {
        id: null,
        title: '',
        href: '',
        parentId: null,
        permCode: '',
        appendDivider: false
      }
    }
  })
  return Menu;

});