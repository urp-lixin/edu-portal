+(function($) {
  $('#show-todo').click(function() {
    if ($('#todo-list').hasClass("visible")) {
      $('#todo-list').hide("slide", { direction: "right" }).removeClass("visible");
    } else {
      $('#todo-list').show("slide", { direction: "right" }).addClass("visible");
    }
  });

  $(".close-todo-list").click(function() {
    if ($('#todo-list').hasClass("visible")) {
      $('#todo-list').hide("slide", { direction: "right" }).removeClass("visible");
    }
  });


  var templatePath = window.CONTEXT_PATH + "/static/todo/todo-template.html";
  var template = "";
  $.ajax(
    templatePath,
    {
      async: false,
      success: function (data) {
        template = data;
      }
    }
  );


  //用backbone生成todos
  var Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        id: null,
        title: "",
        description: "",
        createDateTime: "",
        doneDateTime: "",
        done: false,
        uri: ""
      };
    },
    toggle: function() {
      this.set({done: !this.get("done")});
    },
    done: function(options) {
      options = _.defaults((options || {}),
        {
          url: window.CONTEXT_PATH + "/todos/toggleDone/" + this.get("id"),
          async: false
        });
      Backbone.sync('update', this, options);
    },
    undone: function(options) {
      options = _.defaults((options || {}),
        {
          url: window.CONTEXT_PATH + "/todos/toggleDone/" + this.get("id"),
          async: false
        });
      Backbone.sync('update', this, options);
    }
  });

  var TodoList = Backbone.Collection.extend({
    model: Todo,
    url: window.CONTEXT_PATH + "/todos/delete",
    done: function() {
      return this.where({done: true});
    },
    remaining: function() {
      return this.where({done: false});
    },
    fetch: function(options) {
      options = _.defaults((options || {}),
        {
          url: window.CONTEXT_PATH + "/todos",
          async: false
        });
      return Backbone.Collection.prototype.fetch.call(this, options);
    }
  });

  var UndoView = Backbone.View.extend({
    tagName:  "tr",
    template: _.template($($(template)[0]).html()),
    events: {
      "click .toggle": "toggleDone",
      "click .handle": "handle",
      "click .assign": "assign"
    },
    initialize: function(options) {
      this.eventBus = options.eventBus;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    toggleDone: function() {
      this.model.toggle();
      this.eventBus.trigger('done', this.model);
    },
    handle: function(options) {
      $.ajax({
        url: window.CONTEXT_PATH + "/todos/page/" + this.model.get("id"),
        async: false,
        type: "GET",
        success: function (res) {
          if (res) {
            var $container = $("#e-top-menu");
            $("#e-top-menu").navigation('menuClick', $container.find("[href='/bizTypes']"));
            $container.navigation('updateMenu', $container.find("[href='/bizTypes']"));
            $container.navigation('disabledMenu', $container.find("[href='/bizTypes']"));
          } else {
            new PNotify({
              title: '消息',
              text: '没有权限',
              type: 'error',
              delay: 5000
            });
          }
        }
      });
    },
    assign: function() {
      this.eventBus.trigger('assign', this.model);
    }
  });

  var DoneView = Backbone.View.extend({
    tagName:  "tr",
    template: _.template($($(template)[4]).html()),
    events: {
      "click .toggle": "toggleDone"
    },
    initialize: function(options) {
      this.eventBus = options.eventBus;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    toggleDone: function() {
      this.model.toggle();
      this.eventBus.trigger('undone', this.model);
    }
  });

  var TodosView = Backbone.View.extend({

    undo_el: $("#todo-list .undone"),

    done_el: $("#todo-list .done"),

    statsTemplate: _.template($($(template)[2]).html()),

    el: $("#todo-list .buttons"),

    events: {
      "click .hideDone": "hideDone",
      "click .clearDone": "clearDone"
    },

    initialize: function(options) {
      this.eventBus = _.extend({}, Backbone.Events);
      this.todoList = new TodoList(options.todos);

      this.listenTo(this.eventBus, 'done', this.done);
      this.listenTo(this.eventBus, 'undone', this.undone);
      this.listenTo(this.eventBus, 'assign', this.assign);

      this.render();
    },
    render: function() {
      var _self = this;
      $.each(this.todoList.remaining(), function() {
        _self.undo_el.find("tbody").append(new UndoView({
          model: this,
          eventBus : _self.eventBus
        }).render().el);
      });
      $.each(this.todoList.done(), function() {
        _self.done_el.find("tbody").append(new DoneView({
          model: this,
          eventBus : _self.eventBus
        }).render().el);
      });
      this.$el.append(this.statsTemplate({undoCount: this.todoList.done().length}));

      $(".todos-table tr").find("td:eq(1)").on('click', function() {
        var $noerapTd = $(this);
        if ($noerapTd.hasClass("table-nowrap")) {
          $noerapTd.removeClass("table-nowrap");
        } else {
          $noerapTd.addClass("table-nowrap");
        }
      });

      $(".todos-table").each(function() {
        var $trs = $(this).find("tr");
        for(var i=0; i < $trs.length-1; i++) {
          $($trs[i]).after("<tr class='dividing' style='height: 10px'></tr>");
        }
      });

      $("#todoCount").text(this.todoList.remaining().length);
    },
    hideDone: function() {
      $(".done").toggle();
    },
    remove: function() {
      this.undo_el.find("tbody").empty();
      this.done_el.find("tbody").empty();
      this.$el.children().remove();
      $(".dividing").remove();
    },
    clearDone: function() {
      _.invoke(this.todoList.done(), 'destroy');
      this.$el.empty().append(this.statsTemplate({undoCount: this.todoList.done().length}));
    },
    fetch: function() {
      this.todoList.fetch();
      this.remove();
      this.render();
    },
    done: function(todo) {
      todo.done();
      this.fetch();
    },
    undone: function(todo) {
      todo.undone();
      this.fetch();
    },
    assign: function(todo) {
      $("#assign").modal('show');
      var _self = this;

      $("#chooseAssignee").click(function() {
        if (!$("#assignee").val()) {
          $("#assignee").parent().append('<label id="assignee-error" class="text-danger">必须填写</label>');
          return false;
        }

        var assigneeId;
        var options = $("#assignee")[0].selectize.options;
        var item = $("#assignee")[0].selectize.items[0];
        $.each(options, function() {
          if (item == this.id) {
            assigneeId = this.assigneeId;
            return false;
          }
        });

        $.ajax({
          url: window.CONTEXT_PATH + "/todos/assign/" + todo.get("id"),
          async: false,
          data: {assigneeId: assigneeId},
          type: "POST",
          success: function (res) {
            _self.fetch();
          }
        });
      });

      $('#assign').on('hidden.bs.modal', function (e) {
        $("#assignee")[0].selectize.clear();
        $("#assignee-error").remove();
      })
    }
  });

  var todoView;
  $.ajax({
    url: window.CONTEXT_PATH + "/todos",
    async: false,
    type: "GET",
    success: function (results) {
      todoView = new TodosView({
        todos: results
      });
    }
  });

  //setInterval(function() {todoView.fetch()}, 3000);

})(jQuery);