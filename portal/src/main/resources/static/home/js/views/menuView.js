/**
 * Created by wx on 17-4-10.
 */
define([
      'models/menu',
      'collections/menus',
      'views/shortcutView',
      'services/menuService'
    ],
    function (Menu, menus, ShortcutView, MenuService) {

      var MenuView = Backbone.View.extend({
        el: $("#e-top-menu"),
        initialize: function (options) {
          this.eventBus = options.eventBus;
          this.bizType = options.bizType;
          var _self = this;
          this.shortcutView = new ShortcutView({
            eventBus: _self.eventBus,
            bizTypeId: _self.bizType.id
          });

          this.render();
          this.listenTo(this.eventBus, 'bizType:change', this.render);
          this.listenTo(this.eventBus, 'tab:activated', this.updateMenu);
          this.listenTo(this.eventBus, 'tab:activated', this.disabledMenu);
        },
        render: function (biztypeid) {
          var _self = this;
          var bizTypeId = _self.bizType.id;
          if (biztypeid != undefined) {
            bizTypeId = biztypeid
          }
          var menus = MenuService.getMenu(bizTypeId);
          this.initMenu(menus, "");

          menus.splice(0, 1);
          this.shortcutView.menus = menus;
          this.shortcutView.render(bizTypeId);

        },
        events: {
          'click .drop_submenu': 'clickSubMenu'

        },
        initMenu: function (menus, initParentId) {
          var _self = this;

          this.$el.html("");
          var $home_li = $("<li class='dropdown home dropdown-hover'></li>");
          var $home_a = $("<a></a>").addClass("dropdown-toggle")
              .attr("role", "button").attr("data-toggle", "dropdown")
              .attr("aria-haspopup", true).attr("aria-expanded", false)
              .attr("href", "#")
              .text(menus[0].title);
          var $home_ul = $("<ul></ul>").addClass("dropdown-menu").attr('aria-labelledby', 'drop_0');

          var allMenus = this.getMenus(menus, initParentId);
          if (allMenus && allMenus.length != 0) {
            $.each(allMenus, function (i, menu) {
              $home_ul.append(menu);
            });
            $home_li.append($home_a.append("<span class='caret'></span>")).append($home_ul);
            $home_li.find("[appendDivider=true]").each(function () {
              $(this).closest('li').after("<li class='divider'></li>");
            });
            this.$el.append($home_li);
          }

          $(".dropdown-hover a:first").dropdownHover({
            changePosition: true
          });


          $("[target=e-home-iframe]").click(function(e) {
            _self.eventBus.trigger('activate:hometab', e);

            $("li.dropdown-hover").removeClass("open");
          });

        },

        getMenus: function(menus, parentID) {
          var $iframeContainer = $('#e-op-area .e-op-area-iframe-container');
          var iframeHomeName = "e-home-iframe";
          var $iframeHome = $iframeContainer.find('iframe[name=' + iframeHomeName + ']');
          var home_src = $iframeHome.attr("src");
          var _self = this;
          var $home_a = $("<a></a>").addClass("dropdown-toggle")
              .attr("role", "button").attr("data-toggle", "dropdown")
              .attr("aria-haspopup", true).attr("aria-expanded", false)
              .attr("href", "#");

          return menus.filter(function (node) {
            return ( node.parentId === parentID );
          }).map(function (node) {
            var exists = menus.some(function (childNode) {
              return childNode.parentId === node.id;
            });

            var $ul = $("<ul></ul>").addClass("dropdown-menu").attr('aria-labelledby', "drop_" + node.id);
            var subMenu = (exists) ? $ul.append(_self.getMenus(menus, node.id)) : "";
            var $li = $("<li></li>");
            var $a = $("<a></a>");
            $a.attr("id", "drop_" + node.id);
            $a.attr("class", "drop_submenu");
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
      },

      disabledMenu: function ($anchor) {
        this.$el.find("li").removeClass("disabled");
        $anchor.closest("li").addClass("disabled");
      },

      updateMenu: function ($anchor) {
        var drop_parentId = $anchor.attr("parentId");

        var $menu_list = this.$el.find("ul[aria-labelledby='" + drop_parentId + "']").removeAttr("style");
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

          this.$el.find("li:first").after($new_li);


          //查找上一级菜单
          var $parent_anchor = this.$el.find("a[id='" + drop_parentId + "']");
          this.updateMenu($parent_anchor);
        } else {
          this.$el.find("li a:first").text($anchor.text()).append("<span class='caret'></span>");
        }

        $(".dropdown-hover a[class='dropdown-toggle']").dropdownHover({
          changePosition: true
        });

      },

      clickSubMenu: function (e) {
        var _self = this;
        var $this = $(e.target);

        var $body = $("body");
        if (!$this.attr('href') || $this.attr('href') == '#') {
          e.target.style.backgroundColor = 'transparent';
          return false;
        }

        e.preventDefault();
        this.$el.find("li.children").remove();
        _self.updateMenu($this);

        $body.find(".dropdown-toggle-hover").removeClass("dropdown-toggle-hover");
        this.eventBus.trigger('menu:activated', $this, e);

        //disabled当前菜单
        _self.disabledMenu(this.$el.find("a[id='" + $this.attr("id") + "']"));

      }

    });
    return MenuView;

  });