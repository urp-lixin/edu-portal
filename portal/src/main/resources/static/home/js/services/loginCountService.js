/**
 * Created by wx on 17-4-13.
 */

define([], function () {
  
  var loginCount = {
    getLoginCount: function () {
      $.ajax({
        url: window.CONTEXT_PATH + '/home/get-login-count',
        type: "GET",
        success: function (result) {
          $("#counts").html('<label>' + result + '</label>');
        }
      });
    }
  }
  return loginCount;

});