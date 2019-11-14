/**
 * Created by wx on 17-4-11.
 */
define([], function () {
  var permCodes = {
    
    getPermCodes: function (bizTypeId) {
      var currentPermCodes = [];
      $.ajax({
        url: window.CONTEXT_PATH + '/home/my-shortcut',
        data: {
          bizTypeId: bizTypeId
        },
        async: false,
        type: "GET",
        success: function (result) {
          if (result.length > 0) {
            currentPermCodes = result[0].split(',');
          }
        }
      });
      return currentPermCodes;
    }
  }
  return permCodes;

})