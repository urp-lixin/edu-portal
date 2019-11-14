$(function () {

  $.fn.extend({
    /**
     * 用来初始化search结果页面的bootstrap semi-auto table
     *
     * @param boxName 每行数据里的checkbox的name
     * @param menus     菜单
     * @param _sorts_    排序状态
     * @param _page_  分页信息
     * @param currentURI    当前页面的URI
     * @param colOrderArrangable    是否可以调整列顺序
     * @param colResizable    是否可以调整列宽度
     */
    initSearchResultTable: function (boxName, menus, _sorts_, _page_, currentURI, colOrderArrangable, colResizable, options) {
      var defaults = {
        menuBarWrapperClass: "col-sm-12 col-md-8 semi-auto-table-menubar",
        paginatorWrapperClass: "col-sm-12 col-md-4 semi-auto-table-paginator",
        columnOption: {
          showColumnSelect: true
        },
        rowType: 'checkbox',
        useDataTable: true
      }

      var options = $.extend({}, defaults, options);
      var pageChangeFunction = pageChangeFunctionFactory(window.CONTEXT_PATH + currentURI);
      var sortChangeFunction = sortChangeFunctionFactory(window.CONTEXT_PATH + currentURI);

      //排序
      var sortOption = {};
      if (_sorts_) {
        for (var i = 0; i < _sorts_.length; i++) {
          var field = _sorts_[i].field;
          var type = _sorts_[i].typeString.toLowerCase();
          sortOption[field] = type;
        }
      }

      //分页
      var pageOption = false;
      if (_page_) {
        pageOption = {
          currentPage: _page_.currentPage,
          rowsPerPage: _page_.rowsPerPage,
          totalPages: _page_.totalPages,
          totalRows: _page_.totalRows
        };
      }

      //调整列宽和列顺序
      var col_resizable = false;
      if (colResizable != null) {
        col_resizable = colResizable;
      }
      var col_order_arrangable = false;
      if (colOrderArrangable != null) {
        col_order_arrangable = colOrderArrangable;
      }
      var rowOpiton = boxName ? { inputName: boxName, type: options.rowType } : { showSelectAll: false };
      $(this).semiAutoTable({
        colOrderArrangable: col_order_arrangable,
        colResizable: col_resizable,
        rowOption: rowOpiton,
        columnOption: options.columnOption,
        sortOption: sortOption,
        menus: menus,
        pageOption: pageOption,
        menuBarWrapperClass: options.menuBarWrapperClass,
        paginatorWrapperClass: options.paginatorWrapperClass,
        saveStatus: {
          enabled: true,
          key: currentURI.substring(0, currentURI.indexOf("/search") + ("/search").length)
        },
        fixedHeader: false,
        useDataTable: options.useDataTable
      })
        .on('pageChange', pageChangeFunction)
        .on('sortChange', sortChangeFunction);

      $(this).show();

      function sortChangeFunctionFactory(url) {
        return function (event, sortObject) {

          var params = {};

          for (var key in sortObject) {
            if (sortObject[key] == 'none') {
              params['sort__'] = null;
              break;
            }
            params['sort__'] = key + "," + sortObject[key];
          }

          FormUtil.get({
            form: $("<form></form>"),
            url: url,
            params: params
          });
        }

      }

      function pageChangeFunctionFactory(url) {
        return function (event, pageObject) {
          localStorage.setItem('_page_rowsPerPage', pageObject.rowsPerPage);
          var params = {};
          params['queryPage__'] = pageObject.currentPage + "," + pageObject.rowsPerPage;

          FormUtil.get({
            form: $("<form></form>"),
            url: url,
            params: params
          });
        }

      }
    }
  });
});