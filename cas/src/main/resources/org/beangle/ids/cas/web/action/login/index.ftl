<!DOCTYPE html>
<head>
<TITLE>欢迎访问上海立信会计金融学院教学管理系统</TITLE>
<meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

  <link rel="stylesheet" href="${base}/static/eams-ui/css/eams-ui.css?v=00002" />
  <link rel="stylesheet" href="${base}/static/eams-ui/css/eams-ui-plugin.min.css?v=00002" />
  <link rel="stylesheet" href="${base}/static/eams-ui/css/eams-ui-home.min.css?v=00002" />
</head>

<body onload="document.getElementById('username').focus();" class="e-home e-home-bg1">
<div class="container">

  <div class="login-form">
    <div class="row">
      <div class="col-md-4 col-md-offset-4 col-sm-12">
        <div class="login-banner">
          <h1>教务管理系统</h1>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 col-md-offset-4 col-sm-12">
        <div class="login-fields">
          [#if error??]<span style="color:red">${error!}</span>[/#if]
          <form role="form" method="post" autocomplete="off"   action="${base}/login" method="post" >
            <!-- 避免自动填充密码 -->
		  [#if Parameters['service']??]<input type="hidden" name="service" value="${Parameters['service']}">[/#if]
			[#if Parameters['sid_name']??]<input type="hidden" name="sid_name" value="${Parameters['sid_name']}">[/#if]
            <div class="form-group">
              <label for="username">用户名</label>
              <input value="${Parameters['username']!}" id="username" name="username"  class="form-control" tabindex="1" autocomplete="nope" type="text">
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <input id="password" value="" name="password" class="form-control" tabindex="2" autocomplete="new-password" type="password">
            </div>

            <div class="form-group">
            [#if config.enableCaptcha]
                <label for="captcha_response">验证码</label>
                <input id="captcha_response" name="captcha_response" tabindex="4" type="text" style="width:50px;" placeholder="验证码"/>
                <img src="${b.url("!captcha")}?t=${current_timestamp}" id="captcha_image" style="vertical-align:top;margin-top:1px;border:0px" width="90" height="25"  title="点击更换" onclick="change_captcha()">
            [/#if]
            <input type="submit" name="submitBtn" tabindex="5" class="btn btn btn-primary pull-right" onclick="return checkLogin(this.form)" value="登入"/>
            </div>
          </form>

          <div class="row-block">
            <div class="row"></div>
          </div>
        </div>

      </div>

    </div>

  </div>

</div>
${b.script("cryptojs","rollups/aes.js")}
${b.script("cryptojs","components/mode-ecb.js")}
<script type="text/javascript">
    var key= location.hostname;
    if(key.length>=16) key= key.substring(0,16);
    else  key= (key+'0'.repeat(16-key.length));
    key=CryptoJS.enc.Utf8.parse(key);

    var form  = document.loginForm;
    function checkLogin(form){
        if(!form['username'].value){
            alert("用户名称不能为空");return false;
        }
        if(!form['password'].value){
            alert("密码不能为空");return false;
        }
        [#if config.enableCaptcha]
        if(!form['captcha_response'].value){
            alert("验证码不能为空");return false;
        }
        [/#if]
        try{
        var encryptedData = CryptoJS.AES.encrypt(form['password'].value, key, {mode: CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
        form['password'].value=("?"+encryptedData.ciphertext);
        }catch(e){alert(e);return false;}
        return true;
    }

    function change_captcha(){
       document.getElementById('captcha_image').src="${b.url("!captcha")}?t="+(new Date()).getTime();
    }
</script>
</body>
</html>
