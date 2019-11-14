$(function () {

  var toolbarHeight = 40;

  var headerBorderHeight = 1;

  var headerHeight = 30;

  var paddingHeight = 15;

  $.fn.extend({
    /**
     * 用来初始化search结果页面的bootstrap semi-auto table
     *
     * @param boxName 每行数据里的checkbox的name
     * @param menus     菜单
     * @param currentURI    当前页面的URI
     * @param colOrderArrangable    是否可以调整列顺序
     * @param colResizable    是否可以调整列宽度
     * @param renderOption    表格字段。假设传来的数据是[{id: 1, name: "zhangsan"}],下面的例子表示第一行第一列为1，第一行第二列为"zhangsan"
     *                        {
                                columns: [
                                  { "data": "id" },
                                  { "data": "name" }
                                ]
                              },
     * @param tableData       表格数据:
     *                        可以是data: []
     *                        也可以是ajax: ""
     * @param drawCallback    画表格的回调函数（每画一次表格，调用一次该函数）
     */
    initSearchTable: function (boxName, menus, currentURI, colOrderArrangable, colResizable, renderOption,
                                     tableData, drawCallback) {
      var defaults = {
        menuBarWrapperClass: "col-sm-12 col-md-8 semi-auto-table-menubar",
        paginatorWrapperClass: "col-sm-12 col-md-4 semi-auto-table-paginator",
        columnOption: {
          showColumnSelect: true
        },
        rowType: 'checkbox'
      }

      var options = $.extend({}, defaults, renderOption);
      var pageChangeFunction = pageChangeFunctionFactory();
      var sortChangeFunction = sortChangeFunctionFactory();

      //初始化排序
      var sortOption = {};

      //初始化分页
      var pageOption =  {
        currentPage: 1,
        rowsPerPage: 20
      };

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

      var $table = $(this);
      $(this).semiAutoTable({
        columns: options.columns,
        ajax: tableData.ajax,
        data: tableData.data,
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
          key: currentURI.substring(0, (currentURI.indexOf("?") == -1) ? currentURI.length : currentURI.indexOf("?"))
        },
        fixedHeader: {
          enabled: false,
          scrollY: $(window.frameElement).height() - toolbarHeight - 2*headerBorderHeight - headerHeight - paddingHeight
        },
        completeTableCallback: function(json) {
          $table.semiAutoTable('updatePaginator', json._page_);
          $table.semiAutoTable('updateSortBy', $table.genSortOption(json._sorts_));
        },
        reDrawCallback: function(json, isLoading) {
          if (json && json._sorts_) {
            $table.semiAutoTable('updateSortBy', $table.genSortOption(json._sorts_));
          }
          if (json && json._page_) {
            $table.semiAutoTable('updatePaginator', json._page_);
          }

          if (drawCallback) {
            drawCallback.call($table, isLoading);
          }
        }
      })
        .on('pageChange', pageChangeFunction)
        .on('sortChange', sortChangeFunction);

      $(this).show();

      function sortChangeFunctionFactory() {
        return function (event, sortObject) {

          var params = {};

          for (var key in sortObject) {
            if (sortObject[key] == 'none') {
              params['sort__'] = null;
              break;
            }
            params['sort__'] = key + "," + sortObject[key];
          }

          $table.reLoad(null, params);

        }

      }

      function pageChangeFunctionFactory() {
        return function (event, pageObject) {
          localStorage.setItem('_page_rowsPerPage', pageObject.rowsPerPage);

          $table.reLoad(pageObject, null);

        }

      }

      var leftOffset = $(".left-search").width() + 10;
      $(".dataTables_scrollBody").scroll(function ()
      {
        $(".dataTables_scrollHead").offset({ left: leftOffset-1*this.scrollLeft });
      });
    },

    /**
     * 与jquery ajax写法一样
     * @param dataType    string:"data"||"ajax"
     *                   模式为data表示：发请求得到表格数据，并给初始化table
     *                   模式为ajax表示：初始化table是内部自己调用请求得到需要的数据
     */
    loadData: function(dataType, option){
      if (dataType === 'ajax') {
        return {ajax: option};
      }
      if (dataType === 'data') {
        var data = [];
        var param = {};
        for (var key in option) {
          param[key] = option[key];
        }
        param["success"] = function(res) {
          return res;
        }
        $.ajax(param);
      }
    },

    changeURL: function(url) {
      var dataTable = $(this).DataTable();
      var ajaxUrl = url;
      if (!url) {
        ajaxUrl = $(this).getUrl();
      }

      //保证每次拉取数据都有"正在加载"
      dataTable.clear();
      dataTable.settings()[0].iDraw = 0;
      dataTable.draw();

      //重新发ajax抓数据
      dataTable.ajax.url(ajaxUrl).load();
    },

    /**
     * 重新加载数据
     * @param pageObject    分页信息
     * @param sortOption    排序信息
     */
    reLoad: function(pageObject, sortOption) {

      var urlPrefix = this.getUrl();
      var ajaxUrl = "";
      if (pageObject && !$.isEmptyObject(pageObject)) {

        //拼接queryPage__
        if (urlPrefix.indexOf("queryPage__") != -1) {

          if ( urlPrefix.match(/queryPage__=(.*?)\&/) ) {
            ajaxUrl = urlPrefix.replace(/queryPage__=(.*?)\&/, "queryPage__=" + encodeURIComponent(pageObject.currentPage + "," + pageObject.rowsPerPage) + "&");
          } else if ( urlPrefix.match(/queryPage__=(.*?)$/) ) {
            ajaxUrl = urlPrefix.replace(/queryPage__=(.*?)$/, "queryPage__=" + encodeURIComponent(pageObject.currentPage + "," + pageObject.rowsPerPage));
          }

        } else {
          ajaxUrl = urlPrefix
            + ((urlPrefix.indexOf("?") == -1) ? "?" : "&")
            + "queryPage__=" + encodeURIComponent(pageObject.currentPage + "," + pageObject.rowsPerPage);
        }

      } else if (sortOption && !$.isEmptyObject(sortOption)) {

        //拼接sort__
        if (urlPrefix.indexOf("sort__") != -1) {
          var tempUrl = urlPrefix.substring(urlPrefix.indexOf("sort__") + "sort__".length);
          var urlSuffix = (tempUrl.indexOf("&") == -1) ? "" : tempUrl.substring(tempUrl.indexOf("&"));

          ajaxUrl = urlPrefix.substring(0, urlPrefix.indexOf("sort__"))
            + "sort__=" + encodeURIComponent(sortOption['sort__'])
            + urlSuffix;
        } else {
          ajaxUrl = urlPrefix
            + ((urlPrefix.indexOf("?") == -1) ? "?" : "&")
            + "sort__=" + encodeURIComponent(sortOption['sort__']);
        }

      }

      if (!ajaxUrl) {
        ajaxUrl = this.getUrl();
      }

      this.changeURL(ajaxUrl);
    },

    getUrl: function() {
      var dataTable = $(this).DataTable();
      if (!dataTable || !dataTable.ajax.url()) {
        return false;
      }
      return decodeURIComponent(dataTable.ajax.url());
    },

    genSortOption: function(_sorts_) {
      var sortOption = {};
      if (_sorts_) {
        for (var i = 0; i < _sorts_.length; i++) {
          var field = _sorts_[i].field;
          var type = _sorts_[i].typeString.toLowerCase();
          sortOption[field] = type;
        }
      }
      return sortOption;
    },

    isLoading: function() {
      return this.DataTable().settings()[0].iDraw <= 1
    }
  });
});
