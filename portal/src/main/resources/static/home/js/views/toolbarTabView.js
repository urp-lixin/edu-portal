/**
 * Created by wx on 17-4-12.
 */
define([
  'views/tabView',
  'text!templates/toolbarTab-template.html'
], function (TabView, ToolbarTabTemplate) {

  var ToolbarTabView = Backbone.View.extend({
    el: $(".toolbarView"),
    template: _.template(ToolbarTabTemplate),
    initialize: function (options) {
      this.eventBus = options.eventBus;
      this.listenTo(this.eventBus, 'menu:activated', this.addOne);
      this.listenTo(this.eventBus, 'fixedMenu:activated', this.addOne);
      this.listenTo(this.eventBus, 'shortcut:click',this.addOne);
      this.listenTo(this.eventBus, 'activate:hometab',this.getHomePage);
      this.$el.html(this.template);

      this.iframeId = 0;
      this.$el.find("#e-home-tab-list").append('<li class="active"><a href="welcome/" id="e-home-tab-home" target="e-home-iframe"> <i class="fa fa-home text-primary"></i> </a> </li>');
      },
    events: {
      'click #scroll-right': 'scrollRight',
      'click #scroll-left': 'scrollLeft',
      'click #e-home-tab-home':'getHomePage'
    },
    getHomePage: function (e) {
      e.preventDefault();
      var $iframeContainer = $('#e-op-area .e-op-area-iframe-container');
      var $container = $("#e-top-menu");
      var $tabList = $('#e-home-tab-list');

      $iframeContainer.find("#home-loading").addClass('hide');
      $iframeContainer.find("#home-page").removeClass('hide');
      $iframeContainer.find('iframe').hide();
      $tabList.find('li').removeClass('active');
      $("#e-home-tab-home").parents('li').addClass('active');
      this.eventBus.trigger('tab:activated', $container.find("a[target=e-home-iframe]"));
    },
    scrollRight: function () {
      var tabMargin = 20;
      var header_max_width = $(".e-page-header").width() - tabMargin;
      var $beyond_right_border_li = null;
      $.each(this.$el.find('#e-home-tab-list').find("li"), function() {
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

    },
    scrollLeft: function () {

      var tabMargin = 20;
      var leftOffset = this.$el.offset().left;
      if (leftOffset >= 0) {
        return false;
      }

      var left_border_index = 0;
      $.each(this.$el.find("li"), function() {
        if ($(this).offset().left >= tabMargin) {
          left_border_index = $(this).index();
          return false;
        }
      });

      var $beyond_left_border_li = this.$el.find("li:nth-child(" + (left_border_index - 1 + 1) + ")");
      if ($beyond_left_border_li) {
        var offset_left = tabMargin - $beyond_left_border_li.offset().left;
        $("div#e-home-tab-list:not(:animated)").animate({ left: '+=' + (offset_left +'px') });
      }

    },
    addOne: function ($anchor,event) {
      var _self = this;
      var $iframeContainer = $('#e-op-area .e-op-area-iframe-container');
      var tabAnchor = 'a[target]:not(.e-tab-close-icon)';

      var src = $anchor.attr('href');
      var tabMargin = 20;
      var maxWidth = $(".e-page-header").width() - tabMargin*2;

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

        var $tabAnchor = this.$el.find('#e-home-tab-list').find(tabAnchor).filter("[target='" + $existIframe.attr('name') + "']");
        this.$el.find('#e-home-tab-list').find(tabAnchor).parents('li').removeClass('active');
        $tabAnchor.parent('li').addClass('active');

        //不保留之前的页面
        $($existIframe[0].contentDocument).find('.index').remove();
        return;
      }
      this.iframeId++;
      var tabView = new TabView({
        iframeId: _self.iframeId,
        href: $anchor.attr('href'),
        eventBus: _self.eventBus,
        event:event
      });

      this.$el.find('#e-home-tab-list').append(tabView.$el);
      if (this.$el.find('#e-home-tab-list').width() > maxWidth) {
        $("#scroll-right").show();
        $("#scroll-left").show();
      }
      $("body").scrollTop(0);

    }
  });
  return ToolbarTabView;

});