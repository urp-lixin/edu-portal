/**
 * Created by wx on 17-4-10.
 */
define([], function () {
  var menuData = {
    getMenu: function (bizTypeId) {

      var queryParam = {};
      if (bizTypeId) {
        queryParam['bizTypeId'] = bizTypeId;
      }
      var menus = [];  //拉菜单
      $.ajax({
        url: window.CONTEXT_PATH + '/home/menu.json',
        data: queryParam,
        async: false,
        type: "GET",
        success: function (results) {
          var home = {
            "id": "0",
            "parentId": "",
            "title": $("#home_page_title").html(),
            "href": $("#e-home-iframe").attr("src"),
            "appendDivider": false
          };

          menus.push(home);
          for (var i = 0; i < results.length; i++) {
            menus.push(results[i]);
          }
        },
        error: function (response) {
        }
      });
      return menus;
    }
  }
  return menuData;
})