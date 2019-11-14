/**
 * Created by wx on 17-4-13.
 */
define([], function () {

  var lastLoginInfo = {

    getAccountLoginInfo: function () {
      $.ajax({
        url: window.CONTEXT_PATH + '/home/get-account-login-info',
        type: "GET",
        success: function (results) {
          if (results) {
            $("#lastLoginData").append(results.loginDateTime);
            $("#lastLoginIp").append('<span>' + results.loginIp + '</span>');
            $("#lastLoginDevice").append('<span>' + results.loginUa + '</span>');
          } else {
            $("#loginInfo").html("<p>这是您第一次登录本系统！</p>")
          }
        }
      });
    }
  };

  return lastLoginInfo;

});