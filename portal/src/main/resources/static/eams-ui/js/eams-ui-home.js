/* ========================================================================
 * eams-home 其他ui
 * ======================================================================== */
$(function() {

  // date ticker
  var $dateTicker = $('#date-ticker');
  (function refreshDate() {

    var date = moment();
    $dateTicker.text(date.format('YYYY-MM-DD'));

    setTimeout(refreshDate, 1000 * 60);

  })();

  //
  // clock ticker
  // ------------------------------------------------
  var $hour = $('#clock-ticker .hour');
  var $minute = $('#clock-ticker .minute');
  var $second = $('#clock-ticker .second');

  (function refreshClock() {

    var date = moment();
    $hour.text(date.format('HH'));
    $minute.text(date.format('mm'));
    $second.text(date.format('ss'));

    setTimeout(refreshClock, 1000);

  })();
  

  //可视窗口高度
  var visibleWindowHeight = $(window).height();

  //header高度
  var pageHeader = ($(".toolbarView").length > 0 ) ? $(".toolbarView").height() : 0;
  var pageHeaderPadding = 0;
  if (pageHeader > 0) {
    pageHeaderPadding = parseFloat($("#e-op-area > .container-fluid").css('padding-top')) || 0
  }

  var headerHeight = $("header.e-header").outerHeight() + pageHeader + pageHeaderPadding;

  //footer高度
  var footerHeight = $("footer.e-home-footer").outerHeight();

  var iframeHeight = visibleWindowHeight - headerHeight - footerHeight;
  $("#e-op-area .e-op-area-iframe-container").css("min-height", iframeHeight);

});

/* ========================================================================
 * eams-ui 菜单
 * ======================================================================== */
+function ($) {
  'use strict';

  //
  // 首页Tab式浏览
  //-----------------------------------
  var $body = $("body");
  var tabAnchor = 'a[target]:not(.e-tab-close-icon)';

  var $iframeContainer = $('#e-op-area .e-op-area-iframe-container');
  // var $tabCloseAll = $('#e-home-tab-close-all');
  var iframeHomeName = "e-home-iframe";

  var $tabList = $('#e-home-tab-list');
  var tabFreshClass = "fa fa-refresh text-primary";
  var tabCloseClass = "fa fa-times text-primary";

  var iframeId = 0;

  var tabCount = 0;

  var $container = $("#e-top-menu");

  var tabMargin = 20;

  //tab的总长度，header的长度减去margin以及padding
  var maxWidth = $(".e-page-header").width() - tabMargin*2;

  var tabClick = function($anchor) {

    /*
     * hide原来可见的iframe(如果将iframe移动到别的地方会发生reload)
     * show关联的iframe
     * 将tab item设为激活
     */
    var iframeName = $anchor.attr('target');

    $iframeContainer.find('iframe').hide();
    $iframeContainer.find('iframe[name=' + iframeName + ']').show();


    _activateTab($anchor);

    //更新top菜单
    $container.find("li.children").remove();
    $container.navigation('updateMenu', $container.find("a[target=" + iframeName +"]"));
    $container.navigation('disabledMenu', $container.find("a[target=" + iframeName +"]"));

    _scrollTop();
  }

  var _activateTab = function($anchor) {
    $tabList.find(tabAnchor).parents('li').removeClass('active');
    $anchor.parent('li').addClass('active');
  }

  var _scrollTop = function() {
    $body.scrollTop(0);
  }


  /*
   * 关闭tab
   */
  var tabClose = function($closeAnchor) {
    /*
     * 删除page区域里的iframe
     * 删除#e-home-tab-list 区域里的条目
     * 显示下一个tab item
     */
    var $li = $closeAnchor.closest('li');
    var $anchor = $li.find(tabAnchor);


    if ($li.is('.active')) {
      var $nextTab = $li.next();
      if(!$nextTab.length) {
        $nextTab = $li.prev();
      }
      tabClick($nextTab.find(tabAnchor));
    }

    var iframeName = $anchor.attr('target');
    $iframeContainer.find('iframe[name=' + iframeName + ']').remove();

    _scrollHorizon($li);
  }

  var _scrollHorizon = function($li) {
    var firstLi = $tabList.find("li:first");
    var lastLi = $tabList.find("li:last");
    var left_offset = 0;

    $li.remove();

    if (firstLi.offset().left < tabMargin && (lastLi.offset().left + lastLi.outerWidth()) < maxWidth) {
      left_offset = $(".e-page-header").width() - tabMargin - (lastLi.offset().left + lastLi.outerWidth()) +'px';
    }

    if ($tabList.width() <= $(".e-page-header").width() - tabMargin*2) {

      $("div#e-home-tab-list").animate({ left: '0px' });
      $("#scroll-right").hide();
      $("#scroll-left").hide();
    } else {
      $("div#e-home-tab-list").animate({ left: '+=' + left_offset }, 'slow');
    }
  }

  // $tabCloseAll.click(function(event) {
  //   event.preventDefault();
  //   $tabList.find(tabAnchor).filter(':not(#e-home-tab-home)').parent().remove();
  //   $iframeContainer.find('iframe:not(#e-home-iframe)').remove();
  //   tabClick($tabList.find(tabAnchor));
  //
  //   tabCount = 0;
  //
  // });

  $tabList.find('a:not([data-toggle])').click(function(event) {
    event.preventDefault();
    tabClick($(this));
  });

  $('a[data-open="tab-view"]').click(function(event) {
    event.preventDefault();
    $container.navigation('menuClick', $(this));
  });


  $("#scroll-right").on('click', function() {

    var header_max_width = $(".e-page-header").width() - tabMargin;
    var $beyond_right_border_li = null;
    $.each($tabList.find("li"), function() {
      var current_width = $(this).offset().left + $(this).outerWidth();
      if (current_width > header_max_width) {
        $beyond_right_border_li = $(this);
        return false;
      }
    });

    if ($beyond_right_border_li) {
      var offset_left = header_max_width -  ($beyond_right_border_li.offset().left + $beyond_right_border_li.outerWidth());
    }
    $("div#e-home-tab-list:not(:animated)").animate({ left: '+=' + (offset_left +'px') });
  });


  $("#scroll-left").on('click', function() {
    var leftOffset = $tabList.offset().left;
    if (leftOffset >= 0) {
      return false;
    }

    var left_border_index = 0;
    $.each($tabList.find("li"), function() {
      if ($(this).offset().left >= tabMargin) {
        left_border_index = $(this).index();
        return false;
      }
    });

    var $beyond_left_border_li = $tabList.find("li:nth-child(" + (left_border_index - 1 + 1) + ")");
    if ($beyond_left_border_li) {
      var offset_left = tabMargin - $beyond_left_border_li.offset().left;
      $("div#e-home-tab-list:not(:animated)").animate({ left: '+=' + (offset_left +'px') });
    }
  });

  // Navigation CLASS DEFINITION
  // ======================

  var Navigation = function (element, options) {

    this.options = options;

    this.$container = $(element);

  }

  Navigation.VERSION = '0.0.1';


  Navigation.prototype.initMenu = function(menus, initParentId) {

    var $iframeHome = $iframeContainer.find('iframe[name=' + iframeHomeName + ']');
    var home_src = $iframeHome.attr("src");

    var $home_li = $("<li class='dropdown home dropdown-hover'></li>");
    var $home_a = $("<a></a>").addClass("dropdown-toggle")
      .attr("role", "button").attr("data-toggle", "dropdown")
      .attr("aria-haspopup", true).attr("aria-expanded", false)
      .attr("href", "#");

    var $home_ul = $("<ul></ul>").addClass("dropdown-menu").attr('aria-labelledby', 'drop_0');

    function getMenus(parentID) {
      return menus.filter(function(node){
        return ( node.parentId === parentID ) ;
      }).map(function(node){
        var exists = menus.some(function(childNode){
          return childNode.parentId === node.id;
        });

        var $ul = $("<ul></ul>").addClass("dropdown-menu").attr('aria-labelledby', "drop_" + node.id);
        var subMenu = (exists) ? $ul.append(getMenus(node.id)) : "";
        var $li = $("<li></li>");
        var $a = $("<a></a>");
        $a.attr("id", "drop_" + node.id);
        $a.attr("href", node.href);
        $a.text(node.title);

        //如果是home页面设置target为e-home-iframe
        if (node.href === home_src) {
          $a.attr("target", "e-home-iframe");
          $home_a.text(node.title);
        }
        if (node.parentId) {
          $a.attr("parentId", "drop_" + node.parentId);
        }
        $a.attr('appendDivider', node.appendDivider);
        if (subMenu != "") {
          $li.addClass("dropdown-submenu");
        }
        return $li.append($a).append(subMenu);
      });
    }

    var allMenus =getMenus(initParentId);
    if (allMenus && allMenus.length != 0) {
      $.each(allMenus, function(i, menu) {
        $home_ul.append(menu);
      });
      $home_li.append($home_a.append("<span class='caret'></span>")).append($home_ul);
      $home_li.find("[appendDivider=true]").each(function() {
        $(this).closest('li').after("<li class='divider'></li>");
      });
      this.$container.append($home_li);
    }
  }

  Navigation.prototype.updateMenu = function($anchor) {
    var drop_parentId = $anchor.attr("parentId");

    var $menu_list = this.$container.find("ul[aria-labelledby='" + drop_parentId + "']").removeAttr("style");
    if ($menu_list.length != 0) {
      var $new_li = $("<li></li>").addClass("dropdown children dropdown-hover");
      var $new_a = $("<a></a>").addClass("dropdown-toggle")
        .attr("role", "button").attr("data-toggle", "dropdown")
        .attr("aria-haspopup", true).attr("aria-expanded", false)
        .text($anchor.text());

      $new_li.append($new_a)

      if ($menu_list.find("li").length > 1) {
        $new_a.append("<span class='caret'></span>");
        $new_li.append($menu_list.clone(true));
      }

      this.$container.find("li:first").after($new_li);


      //查找上一级菜单
      var $parent_anchor = this.$container.find("a[id='"+drop_parentId+"']");
      this.updateMenu($parent_anchor);
    } else {
      this.$container.find("li a:first").text($anchor.text()).append("<span class='caret'></span>");
    }

    $(".dropdown-hover a[class='dropdown-toggle']").dropdownHover();
  }

  Navigation.prototype.menuClick = function($anchor) {
    var src = $anchor.attr('href');

    var $existIframe = $iframeContainer.find('iframe[src="' + src + '"]');

    /*
     * 如果存在相同url的iframe
     *   将anchor的target指向新的那个iframe
     *   将那个iframe显示出来
     *   激活对应的tab
     */
    if ($existIframe.length > 0) {

      $iframeContainer.find('iframe:not(:hidden)').hide();
      $existIframe.show();
      $existIframe.attr('src', src);

      var $tabAnchor = $tabList.find(tabAnchor).filter("[target='" + $existIframe.attr('name') + "']");
      _activateTab($tabAnchor);


      //不保留之前的页面
      $($existIframe[0].contentDocument).find('.index').remove();
      return;

    }

    iframeId++;
    var iframeName  = 'e-home-iframe-' + iframeId;
    /*
     * 否则
     *   生成新的iframe id
     *   创建一个新的iframe
     *   将anchor的target指向新的iframe
     *   hide原来可见的iframe(如果将iframe移动到别的地方会发生reload)
     *   新的iframe append到$iframeContainer
     */
    $iframeContainer.find('iframe:not(:hidden)').hide();
    $('<iframe></iframe>')
      .addClass('embed-responsive-item')
      .attr('name', iframeName)
      .attr('src', $anchor.attr('href'))
      .attr('frameBorder','0')
      .appendTo($iframeContainer);

    $anchor.attr('target', iframeName);
    this.$container.find("a[id='" + $anchor.attr("id") + "']").attr('target', iframeName);

    /*
     $ 在 $tabList 追加一个tab item
     * 将tab item设为激活
     * 更新tab count的数字
     */
    var $tabAnchor = $('<a></a>').attr('href', '#').attr('target', iframeName).append(
      $('<span></span>').text($anchor.text())
    ).click(function(event) {
        event.preventDefault();
        tabClick($(this))
      });

    var $freshAnchor = $('<i></i>').addClass(tabFreshClass).click(function(event) {
      event.preventDefault();
      $iframeContainer.find('iframe[src="' + src + '"]')[0].contentWindow.document.location.href = src;
    });

    var $tabCloseAnchor =  $('<i></i>').addClass(tabCloseClass).click(function(event) {
      event.preventDefault();
      tabClose($(this));
    });


    var $tabAnchorLi = $('<li></li>').append($tabAnchor.append($freshAnchor).append($tabCloseAnchor));
    _activateTab($tabAnchor);

    $tabAnchorLi.appendTo($tabList);

    if ($tabList.width() > maxWidth) {
      $("#scroll-right").show();
      $("#scroll-left").show();
    }

    _scrollTop();
  }

  Navigation.prototype.disabledMenu = function($anchor) {
    this.$container.find("li").removeClass("disabled");
    $anchor.closest("li").addClass("disabled");
  }

  /** 得到最终菜单 */
  Navigation.prototype.generateMenus = function(menus, initParentId) {

    this.initMenu(menus, initParentId);

    var self = this;

    $("#e-top-menu a").on("click", function(e) {
      if (!$(this).attr('href') || $(this).attr('href') == '#') {
        this.style.backgroundColor = 'transparent';
        return false;
      }

      e.preventDefault();
      self.$container.find("li.children").remove();
      self.updateMenu($(this));

      $body.find(".dropdown-toggle-hover").removeClass("dropdown-toggle-hover");
      self.menuClick($(this));

      //disabled当前菜单
      self.disabledMenu($container.find("a[id='"+$(this).attr("id") + "']"));
    });

    $(".dropdown-hover a:first").dropdownHover();
  }

  Navigation.prototype.closeAll = function() {
    $tabList.find(tabAnchor).filter(':not(#e-home-tab-home)').parent().remove();
    $iframeContainer.find('iframe:not(#e-home-iframe)').remove();
    tabClick($tabList.find(tabAnchor));

    tabCount = 0;
  }

  // Navigation PLUGIN DEFINITION
  // =======================

  function Plugin(option) {

    var args = arguments;
    var ret;
    this.each(function () {
      var $this = $(this);
      var data = $this.data('navigation');

      if (!data) {
        var options = $.extend(true, {}, $.fn.navigation.defaults, typeof option == 'object' && option);
        $this.data('navigation', (data = new Navigation(this, options)))
      }

      if (typeof option == 'string') {
        if (args.length == 1) {
          var _ret = data[option].call(data);
          if (typeof _ret != 'undefined') {
            ret = _ret;
          }
        } else {
          var _ret = data[option].apply(data, Array.prototype.slice.call(args, 1));
          if (typeof _ret != 'undefined') {
            ret = _ret;
          }
        }
      }
    })

    if (typeof ret != 'undefined') {
      return ret;
    }
    return this;

  }

  var old = $.fn.navigation

  $.fn.navigation = Plugin
  $.fn.navigation.Constructor = Navigation
  $.fn.navigation.defaults = {

  }

  $.fn.navigation.locales = {}

  // Navigation NO CONFLICT
  // =================
  $.fn.navigation.noConflict = function () {

    $.fn.navigation = old;
    return this;

  }

}(jQuery);
