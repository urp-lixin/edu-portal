/**
 * Created by wx on 17-3-24.
 */
define([
  'models/shortcut',
  'collections/shortcuts',
  'text!templates/shortcut-template.html',
  'views/shortcutConfigView',
  'services/shortcutService'
], function (Shortcut, Shortcuts, ShortcutTemplate, ShortcutConfigView, ShotcutService) {

  var ShortcutView = Backbone.View.extend({
    el: $("#shortcut"),
    template: _.template(ShortcutTemplate),
    initialize: function (options) {

      this.eventBus = options.eventBus;
      this.bizTypeId = options.bizTypeId;
      this.menus = options.menus;
      this.listenTo(this.eventBus, 'shortcut:save',this.refreshShortcut);

      this.configView = new ShortcutConfigView({
        menus: this.menus,
        shortcuts: this.initShortcuts,
        eventBus: this.eventBus
      });
    },
    render: function (biztypeid) {
      var _self = this;

      if (biztypeid != undefined) {
        _self.bizTypeId = biztypeid
      }

      var permCodes = ShotcutService.getPermCodes(_self.bizTypeId);
      var shortcuts = new Shortcuts;

      $.each(permCodes, function (index, value) {
        _.map(_self.menus, function (menu) {
          if (menu.permCode == value) {
            var shortcut = new Shortcut({
              id: menu.id,
              title: menu.title,
              href: menu.href,
              permCode: menu.permCode
            });
            shortcuts.add(shortcut);
          }
        })
      });
      this.refreshShortcut(shortcuts);
      
      return this;
    },
    refreshShortcut: function (shortcuts) {
      var _self = this;
      _self.initShortcuts = shortcuts;

      $("#shortcut").empty();
      this.$el.html(this.template);

      $.each(_self.initShortcuts.models, function () {
        $("#shortcut").append('<div><a class="shortcutDiv text-center" id="drop_' + this.get("id") + '" href="' + this.get("href") + '">' + this.get("title") + '</a><input class="hidden" value="' + this.get("id") + '"/></div>');
      });
    },
    events: {
      'click #shortcutConfig': 'config',
      'click .shortcutDiv': 'clickShortcut'
    },
    config: function () {
      var _self = this;
      this.configView.$el.empty();
      this.configView.menus = _self.menus;
      this.configView.bizTypeId = _self.bizTypeId;
      this.configView.eventBus = _self.eventBus;
      this.configView.shortcuts = _self.initShortcuts;

      this.configView.render();
    },
    clickShortcut: function (e) {
      var $this = $(e.target);
      this.eventBus.trigger('shortcut:click', $this, e);
    }

  });
  return ShortcutView;
});
