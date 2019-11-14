/**
 * Created by wx on 17-3-24.
 */
define([
  'text!templates/shortcutConfig-template.html',
  'views/shortcutMenuView'
], function (shortcutConfigTemplate, ShortcutMenuView) {

  var ShortcutConfigView = Backbone.View.extend({

    el: $("#modalPlace"),
    template: _.template(shortcutConfigTemplate),
    initialize: function (options) {
      this.menus = options.menus;
      this.shortcuts = options.shortcuts;
      this.eventBus = options.eventBus;
      this.bizTypeId = options.bizTypeId;

      this.listenTo(this.eventBus, 'shortcut:delete', this.refreshList);
    },
    render: function () {
      var _self = this;
      _self.parents = [];
      this.$el.html(this.template);
      _.map(_self.menus, function (menu, index) {
        _self.parents[index] = menu.parentId;
      });
      this.$el.find("#shortcutModal").modal('show');
      this.$el.find("#modalTitle").html("快捷设置入口");
      this.refreshMenuList();
      this.refreshShortcutList();
      return this;

    },
    refreshList: function (element, type) {
      var shortcutmodels = this.shortcuts.models;
      if (type == 'delete') {

        var deleteModel ;
        _.map(shortcutmodels, function (model) {
          if (model.id == element) {
            deleteModel = model;
          }
        });
        this.shortcuts.remove(deleteModel);

        if (this.shortcuts.length < 13) {
          $("#tipForNumber").removeClass("text-danger");
        }
        $("#menuList").find("[id='" + element + "']").prop({checked: false});

      } else {
        this.shortcuts.add(element);
        if (this.shortcuts.length > 12) {
          $("#tipForNumber").addClass("text-danger");
        }
      }
      this.refreshShortcutList();
    },
    refreshShortcutList: function () {
      $("#menuBasket").html('');
      $("#menuBasket").append("<p class='text-center'>已选快捷入口</p>");
      var shortcuts = this.shortcuts.models;
      var _self = this;

      $.each(shortcuts, function () {
        var menu = new ShortcutMenuView({
          title: this.get("title"),
          viewId: this.get("id"),
          eventBus: _self.eventBus

        });
        $("#menuBasket").append(menu.$el);
      });

    },
    refreshMenuList: function () {
      var $menuList = this.$el.find("#menuList");
      var menus = this.menus;
      var shortcuts = this.shortcuts.models;
      var $table = $menuList.find('table');
      var parents = this.parents;

      $.each(menus, function () {
        if (this.parentId) {
          if (parents.indexOf(this.id) != -1) {
            $table.append('<tr data-node="treetable-' + this.id + '" data-pnode="treetable-parent-' + this.parentId + '"><td>' + this.title + '</td></tr>')

          } else {
            $table.append('<tr data-node="treetable-' + this.id + '" data-pnode="treetable-parent-' + this.parentId + '"><td><div class="checkbox tdCheckbox"><input class="childrenNode" type="checkbox" id="' + this.id + '"/>' + this.title + '</div></td></tr>')
          }
        } else {
          if (parents.indexOf(this.id) != -1) {
            $table.append('<tr data-node="treetable-' + this.id + '" data-pnode="treetable-parent-" class="treetable-expanded"><td>' + this.title + '</td></tr>')
          } else {
            $table.append('<tr data-node="treetable-' + this.id + '" data-pnode="treetable-parent-" class="treetable-expanded"><td><div class="checkbox tdCheckbox"><input class="childrenNode" type="checkbox" id="' + this.id + '"/>' + this.title + '</div></td></tr>')
          }

        }
      });
      $table.treeFy();

      $.each(shortcuts, function () {
        var _self = this;
        $("#menuList").find("[id='" + _self.id + "']").prop({checked: true});
      })
    },

    events: {
      'click .childrenNode': 'select',
      'click #save': 'save'
    },
    select: function (e) {
      var targetId = e.target.getAttribute('id');
      var menu = _.find(this.menus, function (menu) {
        return menu.id == targetId;
      });

      if (e.target.checked) {
        this.refreshList(menu,'add');
      } else {
        this.refreshList(targetId,'delete');
      }
    },
    save: function () {
      if (this.shortcuts.length > 12) {
        var $alert = bootbox.alert("每个管理业务，最多可设置12个快捷入口");

        eamsUiUtil.makeModalNearElementOnShown($alert, $("#save"));
      } else {
        var permCodeList = _.map(this.shortcuts.models, function (model) {
          return model.get("permCode");
        });
        var _self = this;
        $.ajax({
          url: window.CONTEXT_PATH + '/home/save-account-menu-shortcut',
          type: "POST",
          data: {
            bizTypeId: _self.bizTypeId,
            permCodes: permCodeList.join(","),
            REDIRECT_URL: '/home'
          },
          success: function () {
            _self.eventBus.trigger('shortcut:save', _self.shortcuts);
            $("#shortcutModal").modal('hide');
          }
        });
      }
    }
  });
  return ShortcutConfigView;

});