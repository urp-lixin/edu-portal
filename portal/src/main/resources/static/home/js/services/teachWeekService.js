/**
 * Created by wx on 17-4-13.
 */

define([], function () {
  var teachWeek = {
    getCurrentTeachWeek: function (bizTypeId) {
      var currentTeachWeek = null;

      $.ajax({
        url: window.CONTEXT_PATH + '/home/get-current-teach-week',
        data: {
          bizTypeId: bizTypeId
        },
        type: "GET",
        success: function (result) {
          if (result != null) {
            $("#teachWeek").append('<p>第' + result + '教学周</p>')
          }
        }
      });
    }
  }
  return teachWeek;
});