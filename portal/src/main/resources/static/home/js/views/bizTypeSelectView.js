/**
 * Created by wx on 17-4-10.
 */
define([
  'text!templates/bizTypeSelect-template.html'
], function (BizTypeSelectTemplate) {
  
  var BizTypeSelectView = Backbone.View.extend({

    el: $('#bizTypeSelectPlace'),
    template: _.template(BizTypeSelectTemplate),
    initialize: function (options) {
      this.bizType = options.bizType;
      this.bizTypes = options.bizTypes;
      this.eventBus = options.eventBus;
      this.render();
    },
    render: function () {
      var _self = this;
      this.$el.html(this.template);
      var bizTypes = _self.bizTypes;
      $("#home_change_id_biz").html('切换业务类型');

      $.each(bizTypes, function () {
        if (this.id == _self.bizType.id) {
          $(".biz-types").append('<a href="#" bizTypeId ="' + this.id + '" class="list-group-item selected"><i class="fa fa-tags text-success"></i>&nbsp;&nbsp;<span bizTypeId ="' + this.id + '" >' + this.name + '</span></a>');
        } else {
          $(".biz-types").append('<a href="#" bizTypeId ="' + this.id + '" class="list-group-item"><i class="fa fa-tags text-success"></i>&nbsp;&nbsp;<span bizTypeId ="' + this.id + '" >' + this.name + '</span></a>');
        }
      });
    },
    events: {
      'click .list-group-item': 'changeBizType'
    },
    changeBizType: function (event) {
      var $this = $(event.target);
      var $list;
      var currentBizTypeId = $this.attr("bizTypeId");

      $(".list-group-item.selected").removeClass("selected");

      if ($this.hasClass('list-group-item')) {
        $list = $this;
      } else {
        $list = $this.parents('.list-group-item');
      }
      $list.addClass('selected');

      $("#bizTypeSwitcher").modal('hide');

      $(".role-change span").text('当前管理业务'
          + ":" + $this.text().trim());

      if (currentBizTypeId != this.bizType.id) {
        this.eventBus.trigger('bizType:change', currentBizTypeId, event);
        this.bizType.id=currentBizTypeId;
        this.bizType.name=$this.text().trim();
      }
    }
  });
  return BizTypeSelectView;

});