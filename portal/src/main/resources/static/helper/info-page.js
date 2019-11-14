var pageBack = function(nameOrIds) {
  var backURL = "";
  for (var i in nameOrIds) {
    backURL = backURL || $("[name='" + nameOrIds[i] + "']").val() || $("." + nameOrIds[i]).val();
  }

  if (backURL && window.history && window.history.pushState) {
    // window.history.pushState(null, null, window.CONTEXT_PATH + backURL);
    // window.history.go(0);
    window.location.href = window.CONTEXT_PATH + backURL;
  } else {
    window.history.back();
  }
}

$(function() {
  $(".info-page dt").each(function() {
    $(this).attr('title', $(this).text());
  });

  $("#page-back").click(function (e) {
    e.preventDefault();
    pageBack(["REDIRECT_URL", "PARENT_URL"]);
  });


  $(".embed-iframe").css("height", $(window).height());
});