<!DOCTYPE html>

<html lang="zh" xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title id="home_page_title">首页</title>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

  <link rel="stylesheet" href="${base}/static/eams-ui/css/eams-ui.css?v=00002" />
  <link rel="stylesheet" href="${base}/static/eams-ui/css/eams-ui-plugin.min.css?v=00002" />
  <link rel="stylesheet" href="${base}/static/helper/css/info-page.css?v=00002" />
  <link rel="stylesheet" href="${base}/static/helper/css/generate-template.css?v=00002" />
  <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
  <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
  <!--[if lt IE 9]>
  <script src="${base}/static/eams-ui/js/html5shiv.min.js?v=00002"></script>
  <script src="${base}/static/eams-ui/js/respond.min.js?v=00002"></script>
  <![endif]-->

  <script src="${base}/static/eams-ui/js/eams-ui.min.js?v=00008"></script>
  <script src="${base}/static/eams-ui/js/eams-ui.zh.min.js?v=00002"></script>
  <script>
    // 设置 context path, js会需要用
    window.CONTEXT_PATH = '${base}';
    window.LOCALE = 'zh';
  </script>
  <script type="text/javascript" src="${base}/static/helper/search-page-helper1.js?v=00003"></script>
  <script type="text/javascript" src="${base}/static/helper/notIndex-page-helper.js?v=00003"></script>
  <script type="text/javascript" src="${base}/static/helper/info-page.js?v=00003"></script>
  <script type="text/javascript" src="${base}/static/helper/student-selectize.js?v=00003"></script>
  <script type="text/javascript" src="${base}/static/helper/datatable-column-tools.js?v=00003"></script>
  <script>
    $(function () {
      var infoMessages = null;
      if (!infoMessages) {
        infoMessages = [];
      }
      $.each(infoMessages, function (index, message) {
        new PNotify({
          title: '消息',
          text: message,
          type: 'info',
          delay: 1000
        });
      });

      var successMessages = null;
      if (!successMessages) {
        successMessages = [];
      }
      $.each(successMessages, function (index, message) {
        new PNotify({
          title: '成功',
          text: message,
          type: 'success',
          delay: 1000
        });
      });

      var errorMessages = null;
      if (!errorMessages) {
        errorMessages = [];
      }
      $.each(errorMessages, function (index, message) {
        new PNotify({
          title: '错误',
          text: message,
          type: 'error',
          delay: 5000
        });
      });

      var noticeMessages = null;
      if (!noticeMessages) {
        noticeMessages = [];
      }
      $.each(noticeMessages, function (index, message) {
        new PNotify({
          title: '提示',
          text: message,
          type: 'notice',
          delay: 1000
        });
      });

      $(document).ajaxError(function (event, request) {

        if (request.responseText && request.status == 200 && request.statusText == "parsererror") {
          window.location.href = self.location.href;
        }

        if (!request.responseJSON) {
          return;
        }

        var texts = [];
        var message = request.responseJSON.message;
        if (request.responseJSON.errors && request.responseJSON.errors.length > 0) {
          message = request.responseJSON.errors[0].defaultMessage;
        }

        texts.push("exception:\t" + request.responseJSON.exception);
        texts.push("message:\t" + message);
        texts.push("path:\t" + request.responseJSON.path);
        texts.push("status:\t" + request.responseJSON.status);
        texts.push("timestamp:\t" + new Date(request.responseJSON.timestamp));

        new PNotify({
          title: request.responseJSON.error,
          text: texts.join("\n"),
          type: 'error',
          delay: 50000,
          width: '600px',
          min_height: '150px'
        });

      });

    });

    window.preventFromSubmitTwice = function($form) {
      $form.submit(function() {
        $(this).submit(function() {
          return false;
        });
        return true;
      });
    }
    window.preventFromSubmitTwice($('#save-form'));

    window.semesterURIUtil = function (originalUri, insertBefore, semesterId) {
      var semesterPattern = "/semester/";
      if (originalUri.indexOf(semesterPattern) != -1) {
        // remove semester pattern
        var semesterPatternStartAt = originalUri.indexOf(semesterPattern);
        var semesterPatternEndAt = semesterPatternStartAt +
            originalUri.substring(semesterPatternStartAt, originalUri.length).indexOf("/", semesterPattern.length);
        originalUri = originalUri.substring(0, semesterPatternStartAt) + originalUri.substring(semesterPatternEndAt, originalUri.length);
      }
      var appendIndex = originalUri.indexOf(insertBefore);
      return originalUri.substring(0, appendIndex) + semesterPattern + semesterId + originalUri.substring(appendIndex, originalUri.length);
    };

  </script>
	<link rel="stylesheet" href="${base}/static/eams-ui/css/font-awesome.min.css" />
	<link rel="stylesheet" href="${base}/static/eams-ui/css/eams-ui-home.css" />
	<link rel="stylesheet" href="${base}/static/home/css/index.css" />
</head>

<body class="e-home e-home-bg1">


<!-- 顶部导航栏 -->
<header class="e-header">

  <nav role="navigation" class="navbar navbar-static-top">

    <div class="container-fluid">

      <!-- Collect the nav links, forms, and other content for toggling -->
      <div class="collapse navbar-collapse">

        <ul class="nav navbar-nav">
          <li><img style="padding-top: 10px" src="${base}/static/home/img/eams_logo_color.png" /></li>
        </ul>

        <ul id="e-top-menux" class="nav navbar-nav e-navbar-nav-1">
          <li class="dropdown home dropdown-hover">
            <a class="dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"  href="http://localhost:8086/eams/home#">首页<span class="caret"></span></a>
            <ul class="dropdown-menu" aria-labelledby="drop_0">
              [#if apps?size>0]
              [#assign lastApp=apps?first]
              [#list apps as  app]
                [#if app.domain!=lastApp.domain]
                <li class="divider"></li>
                [#assign lastApp=app]
                [/#if]
               <li><a id="drop_01" class="drop_submenu" href="${app.url?replace('{openurp.webapp}',webappBase)}" appenddivider="false">${app.title}</a></li>
              [/#list]
              [/#if]
            </ul>
          </li>
        </ul>

        <div class="navbar-custom-menu">
         <ul class="nav navbar-nav navbar-right e-navbar-nav-3">
          <li class="dropdown" id="accountManagement"><a data-toggle="dropdown" class="dropdown-toggle" href="#"> <i class="fa fa-user personName">${user.description}</i><b class="caret"></b> </a></li>
          <li class="dropdown" style="display: none">
            <a id="show-todo" data-toggle="collapse" style="font-size: 19px" class="dropdown-toggle" href="#" role="button" aria-expanded="false">
              <i class="fa fa-list-ul"></i>
              <div id="todoCount" class="e-corner-mark-red"></div>
            </a>
          </li>

          <li class="dropdown">
            <a style="font-size: 19px" class="dropdown-toggle" href="${base}/index/logout">
              <i class="fa fa-sign-out"></i>
            </a>
          </li>

        </ul>
        </div>
      </div>
      <!-- /.navbar-collapse -->

    </div>

  </nav>

</header>


<div id="e-content-area">
  <div id="bizTypeSelectPlace"></div>


  <!-- operation area -->
  <div id="e-op-area">

    <div class="container-fluid e-toolbarTab">
      <!-- page header -->
      <div class="toolbarView"></div>

      <!-- /.page header -->

      <div class="embed-responsive e-op-area-iframe-container">

        <h1 id="home-loading" class="text-muted hide">正在加载...</h1>
        <div id="home-page">
          <div id="welcomeTitle">
            <p><span>欢迎使用教务管理系统</span></p>
          </div>
          <div class="container-fluid" id="content">
            <div class="col-sm-6">
              <div class="content-left">
                <div class="container-fluid">
                  <div class="col-sm-7">
                    <div id="teachWeek" class="text-center">

                    </div>
                    <div id="calendarDiv">
                      <div id="calendar"></div>

                    </div>

                  </div>
                  <div class="col-sm-5">
                    <div id="lastLoginInfo" class="text-left">
                      <p id="lastLoginTitle">上次登录</p>
                      <div id="loginInfo">
                        <div>
                          <label for="lastLoginData">时间：</label>
                          <p id="lastLoginData"></p>
                        </div>
                        <div>
                          <label for="lastLoginIp">IP：</label>
                          <p id="lastLoginIp"></p>
                        </div>
                        <div>
                          <label for="lastLoginDevice">设备：</label>
                          <p id="lastLoginDevice"></p>
                        </div>
                      </div>
                    </div>
                    <div id="loginCount" class="text-right">
                      <div id="counts"></div>
                      <div><p>使用系统次数</p></div>


                    </div>

                  </div>

                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="container-fluid" id="shortcutx">
              <p>我的应用</p>
              [#list apps as  app]
              <div><a class="shortcutDiv text-center"  href="${app.url?replace('{openurp.webapp}',webappBase)}">${app.title}</a></div>
              [/#list]
            </div>
          </div>
          <div id="modalPlace"></div>
        </div>


      </div>

    </div>
    <!-- /.page iframe -->

    <footer class="e-home-footer">
      <div>版权所有 <i class="fa fa-copyright"></i> 2015</div>
    </footer>

  </div>
  <!-- /.operation area -->

</div>


<script src="${base}/static/eams-ui/js/eams-ui-home.js"></script>
<script src="${base}/static/todo/js/todo.js"></script>
<script src="${base}/static/eams-ui/js/require.js"></script>
<script src="${base}/static/home/js/main.js"></script>
 ${b.script("openurp-default","js/urpnav.js")}
 ${b.script("openurp-default","js/urp.js")}
<script>
  $(function () {
    var bizTypes = [{'defaultCampusAssoc':null,'id':1,'name':'\u975E\u6559\u5B66\u4E1A\u52A1','nameEn':'System Ops','nameZh':'\u975E\u6559\u5B66\u4E1A\u52A1','transient':false},{'defaultCampusAssoc':null,'id':2,'name':'\u672C\u79D1','nameEn':'Undergraduate','nameZh':'\u672C\u79D1','transient':false}];
    var personName = '${user.description}';
    refreshViews(
        {'defaultCampusAssoc':null,'id':1,'name':'\u975E\u6559\u5B66\u4E1A\u52A1','nameEn':'System Ops','nameZh':'\u975E\u6559\u5B66\u4E1A\u52A1','transient':false}, bizTypes, personName);
  });
  //可视窗口高度
  var visibleWindowHeight = $(window).height();

  //header高度
  var pageHeaderPadding = 15;
  var pageHeader = 30;
  var headerHeight = $("header.e-header").outerHeight() + pageHeader + pageHeaderPadding;

  //footer高度
  var footerHeight = $("footer.e-home-footer").outerHeight();

  var iframeHeight = visibleWindowHeight - headerHeight - footerHeight;

  $("#home-page").css({height: iframeHeight, overflow: "auto"});
  </script>
</body>
</html>

