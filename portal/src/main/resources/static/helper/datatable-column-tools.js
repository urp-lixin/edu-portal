var i18nYesOrNoColumn = function (fieldName) {
  var column = {
    "data": fieldName,
    "render": function (field) {
        if (window.LOCALE === 'zh') {
          return field.data == null ? ' ' : (field.data ? "是" : "否")
        }
        if (window.LOCALE === 'en') {
          return field.data == null ? ' ' : (field.data ? "yes" : "no")
        }
    }
  }
  return column;
}

var checkboxColumn = function (fieldName, checkboxName) {
  var column = {
    "data": fieldName,
    "render": function (field) {
      return '<input type="checkbox" name="' + checkboxName + '" value="' + field.data + '"/>';
    }
  }
  return column;
}

var linkColumn = function (fieldName, infoUrl, baseURI, $form) {
  var column = {
    "data": fieldName,
    "render": function (field, row, allDataList, settings) {
      var url = window.CONTEXT_PATH + infoUrl + row.data.id + "?REDIRECT_URL=" +
        encodeURIComponent(baseURI + $form.getQueryString());
      return '<a href="' + url + '">' + field.data + '</a>';
    }
  }
  return column;
}
