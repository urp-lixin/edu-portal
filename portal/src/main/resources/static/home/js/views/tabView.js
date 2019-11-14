/**
 * Created by wx on 17-4-10.
 */

define([], function () {

  var TabView = Backbone.View.extend({
    tagName: 'li',
    className: 'tabLi',
    events: {
      'click .closed': 'closeTab',
      'click .refresh': 'refreshTab',
      'click .tabTitle': 'activate'
    },
    initialize: function (options) {
      var _self = this;
      this.iframeId = options.iframeId;
      this.href = options.href;
      this.EVENT = options.event;
      this.eventBus = options.eventBus;
      this.listenTo(this.eventBus, 'bizType:change', this.closeAll);

      this.$iframeContainer = $('#e-op-area .e-op-area-iframe-container');
      this.$tabList = $('#e-home-tab-list');
      this.tabAnchor = 'a[target]:not(.e-tab-close-icon)';

      var iframeName = 'e-home-iframe-' + this.iframeId;
      var $container = $("#e-top-menu");
      var tabFreshClass = "fa fa-refresh text-primary refresh";
      var tabCloseClass = "fa fa-times text-primary closed";

      this.$iframeContainer.find("#home-loading").removeClass('hide');
      this.$iframeContainer.find("#home-page").addClass('hide');
      this.$iframeContainer.find('iframe:not(:hidden)').hide();
      $('<iframe></iframe>')
          .addClass('embed-responsive-item')
          .attr('name', iframeName)
          .attr('src', _self.href)
          .attr('frameBorder', '0')
          .appendTo(_self.$iframeContainer);
      $(_self.EVENT.target).attr('target', iframeName);
      $container.find("a[id='" + $(_self.EVENT.target).attr("id") + "']").attr('target', iframeName);

      var $tabAnchor = $('<a></a>').attr('href', _self.href).attr('target', iframeName).append(
          $('<span class="tabTitle"></span>').text($(_self.EVENT.target).text()));

      var $freshAnchor = $('<i></i>').addClass(tabFreshClass);

      var $tabCloseAnchor = $('<i></i>').addClass(tabCloseClass);
      this.$el.append($tabAnchor.append($freshAnchor).append($tabCloseAnchor));
      this.tabClick($tabAnchor, _self.EVENT);

    },
    refreshTab: function (e) {
      e.preventDefault();
      var $anchor = $(e.target).parent('a');
      var src = $anchor.attr('href');
      this.activate(e);
      this.$iframeContainer.find('iframe[src="' + src + '"]')[0].contentWindow.document.location.href = src;
    },
    closeTab: function (e) {
      e.preventDefault();
      this.tabClose($(e.target), e);
    },
    tabClose: function ($closeAnchor, e) {
      /*
       * 删除page区域里的iframe
       * 删除#e-home-tab-list 区域里的条目
       * 显示下一个tab item
       */
      var $li = $closeAnchor.closest('li');
      var $anchor = $li.find(this.tabAnchor);


      if ($li.is('.active')) {
        var $nextTab = $li.next();
        if (!$nextTab.length) {
          $nextTab = $li.prev();
        }
        this.tabClick($nextTab.find(this.tabAnchor), e);
      }

      var iframeName = $anchor.attr('target');
      this.$iframeContainer.find('iframe[name=' + iframeName + ']').remove();

      this.scrollHorizon($li);
    },
    scrollHorizon: function ($li) {
      var tabMargin = 20;
      var firstLi = this.$tabList.find("li:first");
      var lastLi = this.$tabList.find("li:last");
      var left_offset = 0;
      var maxWidth = $(".e-page-header").width() - tabMargin*2;
      $li.remove();
      if (firstLi.offset().left < tabMargin && (lastLi.offset().left + lastLi.outerWidth()) < maxWidth) {
        left_offset = $(".e-page-header").width() - tabMargin - (lastLi.offset().left + lastLi.outerWidth()) + 'px';
      }

      if (this.$tabList.width() <= $(".e-page-header").width() - tabMargin * 2) {
        $("div#e-home-tab-list").animate({left: '0px'});
        $("#scroll-right").hide();
        $("#scroll-left").hide();
      } else {
        $("div#e-home-tab-list").animate({left: '+=' + left_offset}, 'slow');
      }
    },
    tabClick: function ($anchor, event) {
      event.preventDefault();
      /*
       * hide原来可见的iframe(如果将iframe移动到别的地方会发生reload)
       * show关联的iframe
       * 将tab item设为激活
       */
      // var $iframeContainer = $('#e-op-area .e-op-area-iframe-container');
      var $container = $("#e-top-menu");
      var iframeName = $anchor.attr('target');
      $container.find("a[id='" + $(event.target).attr("id") + "']").attr('target', iframeName);

      if (iframeName == 'e-home-iframe') {
        this.$iframeContainer.find("#home-loading").addClass('hide');
        this.$iframeContainer.find("#home-page").removeClass('hide');
      } else {
        this.$iframeContainer.find("#home-loading").removeClass('hide');
        this.$iframeContainer.find("#home-page").addClass('hide');
      }

      this.$iframeContainer.find('iframe').hide();
      this.$iframeContainer.find('iframe[name=' + iframeName + ']').show();

      this.activateTab($anchor);
      //更新top菜单
      $container.find("li.children").remove();
      this.eventBus.trigger('tab:activated', $container.find("a[target=" + iframeName + "]"));

      $("body").scrollTop(0);
    },
    activateTab: function ($anchor) {
      this.$tabList.find(this.tabAnchor).parent("li").removeClass('active');
      $anchor.parent("li").addClass('active');
    },
    activate: function (e) {
      var $anchor = $(e.target).parents('a');
      this.tabClick($anchor, e);
    },
    closeAll: function (biztypeId, e) {

      var $iframeContainer = $('#e-op-area .e-op-area-iframe-container');
      var tabAnchor = 'a[target]:not(.e-tab-close-icon)';
      var $tabList = $('#e-home-tab-list');

      $tabList.find(tabAnchor).filter(':not(#e-home-tab-home)').parent().remove();
      $iframeContainer.find('iframe:not(#e-home-iframe)').remove();
      this.tabClick($tabList.find(tabAnchor), e);
    }
  });

  return TabView;

});