$(function () {

  var StudentSelect = function(ele, options) {
    this.$selectize = ele;
    this.fetch(options);
  }

  StudentSelect.prototype.fetch = function(options) {
    var url = options.contextPath + '/ws/student/query-by-term';
    if (options.hasDataPermission) {
      url = options.contextPath + '/ws/student-perm/query-by-term';
    }

    this.$selectize.selectize({
      valueField: 'id',
      searchField: options.fieldTemplate ? options.fieldTemplate.searchFields : [],
      items: options.items,
      create: false,
      render: {
        item: options.fieldTemplate ? options.fieldTemplate.itemTemplate : function () {return ''},
        option: options.fieldTemplate ? options.fieldTemplate.optionTemplate : function () {return ''}
      },
      load: function (query, callback) {
        if (!query.length) return callback();
        $.ajax({
          url: url,
          type: 'get',
          data: {
            term: query,
            bizTypeId: options.bizTypeId
          },
          error: function () {
            callback();
          },
          success: function (res) {
            var students = [];
            $.each(res, function() {
              students.push({
                id: this.id,
                code: this.code,
                personNameZh: this.person.nameZh,
                personNameEn: this.person.nameEn,
                idCardNumber: this.person.idCardNumber,
              });
            });
            callback(students);
          }
        });
      }
    });
  }

  $.fn.studentSelect = function(options) {
    options = $.extend({}, $.fn.studentSelect.defaults, options);
    new StudentSelect(this, options);
  }

  $.fn.studentSelect.defaults = {

    bizTypeId: null,

    //是否考虑数据级权限,默认考虑
    hasDataPermission: true,

    contextPath: window.CONTEXT_PATH || '',

    //searchField为数组,可以包括: code, personNameZh, personNameEn, idCardNumber
    //optionTemplate 为选项的显示格式,返回一个函数
    //itemTemplate  为选中选项的显示格式,返回一个函数
    fieldTemplate: {
      searchFields: ['code', 'personNameZh'],
      optionTemplate: function (item, escape) {
        return '<div>'
          + '<span>' + escape(item.code) + '(' + escape(item.personNameZh) + ')</span>'
          + '</div>';
      },
      itemTemplate: function(item, escape) {
        return '<div>'
          + '<span>' + escape(item.code) + '(' + escape(item.personNameZh) + ')</span>'
          + '</div>';
      }
    },

    //选中项,传id的数组
    items: []
  }

});