/*
 * OpenURP, Agile University Resource Planning Solution.
 *
 * Copyright © 2014, The OpenURP Software.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful.
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.beangle.ids.cas.web.action

import java.io.ByteArrayInputStream

import net.openurp.lixin.platform.cas.service.OAuth2ServiceImpl
import org.beangle.commons.bean.Initializing
import org.beangle.commons.codec.binary.Aes
import org.beangle.commons.lang.{Numbers, Strings}
import org.beangle.commons.web.url.UrlBuilder
import org.beangle.commons.web.util.{CookieUtils, RequestUtils}
import org.beangle.ids.cas.LoginConfig
import org.beangle.ids.cas.ticket.TicketRegistry
import org.beangle.ids.cas.web.helper.{CaptchaHelper, CsrfDefender, SessionHelper}
import org.beangle.security.Securities
import org.beangle.security.authc._
import org.beangle.security.context.SecurityContext
import org.beangle.security.session.{OvermaxSessionException, Session}
import org.beangle.security.web.WebSecurityManager
import org.beangle.security.web.access.SecurityContextBuilder
import org.beangle.security.web.session.CookieSessionIdPolicy
import org.beangle.webmvc.api.action.{ActionSupport, ServletSupport}
import org.beangle.webmvc.api.annotation.{ignore, mapping, param}
import org.beangle.webmvc.api.view.{Status, Stream, View}
import org.openurp.app.Urp

/**
 * 个性化：增加了对local的支持
 *
 * @param secuirtyManager
 * @param ticketRegistry
 */
class LoginAction(secuirtyManager: WebSecurityManager, ticketRegistry: TicketRegistry)
  extends ActionSupport with ServletSupport with Initializing {

  private var csrfDefender: CsrfDefender = _

  var oauth2Service: OAuth2ServiceImpl = _

  var config: LoginConfig = _

  var captchaHelper: CaptchaHelper = _

  var securityContextBuilder: SecurityContextBuilder = _

  var passwordStrengthChecker: PasswordStrengthChecker = _

  val messages: Map[Class[_], String] = Map(
    classOf[AccountExpiredException] -> "账户过期",
    classOf[UsernameNotFoundException] -> "找不到该用户",
    classOf[BadCredentialsException] -> "密码错误",
    classOf[LockedException] -> "账户被锁定",
    classOf[DisabledException] -> "账户被禁用",
    classOf[CredentialsExpiredException] -> "密码过期",
    classOf[OvermaxSessionException] -> "超过最大人数上限"
  )

  override def init(): Unit = {
    csrfDefender = new CsrfDefender(config.key, config.origin)
  }

  @mapping(value = "")
  def index(@param(value = "service", required = false) service: String): View = {
    Securities.session match {
      case Some(session) =>
        forwardService(service, session)
      case None =>
        val u = get("username")
        val p = get("password")
        if (u.isEmpty || p.isEmpty) {
          val local = getBoolean("local", false)
          if (local) {
            toLoginForm()
          } else {
            if (Strings.isNotBlank(service)) {
              CookieUtils.addCookie(request, response, "CAS_service", service, 300)
            }
            redirect(to(oauth2Service.getAuthorizeURL("code", "1q2w3e")), null)
          }
        } else {
          val isService = getBoolean("isService", defaultValue = false)
          val validCsrf = isService || csrfDefender.valid(request, response)
          if (validCsrf) {
            if (!isService && config.enableCaptcha && !captchaHelper.verify(request, response)) {
              put("error", "错误的验证码")
              toLoginForm()
            } else {
              if (overMaxFailure(u.get)) {
                put("error", "密码错误三次以上，暂停登录")
                toLoginForm()
              } else {
                var password = p.get
                if (password.startsWith("?")) {
                  password = Aes.ECB.decodeHex(loginKey, password.substring(1))
                }
                val token = new UsernamePasswordToken(u.get, password)
                try {
                  val req = request
                  val session = secuirtyManager.login(req, response, token)
                  SecurityContext.set(securityContextBuilder.build(req, Some(session)))
                  if (config.checkPasswordStrength && !isService) {
                    val strength = passwordStrengthChecker.check(password)
                    if (strength == PasswordStrengths.VeryWeak || strength == PasswordStrengths.Weak) {
                      redirect(to("/edit", if (Strings.isNotBlank(service)) "service=" + service else ""), "检测到弱密码，请修改")
                    } else {
                      forwardService(service, session)
                    }
                  } else {
                    forwardService(service, session)
                  }
                } catch {
                  case e: AuthenticationException =>
                    val msg = messages.getOrElse(e.getClass, e.getMessage)
                    put("error", msg)
                    if (e.isInstanceOf[BadCredentialsException]) {
                      rememberFailue(u.get)
                    }
                    toLoginForm()
                }
              }
            }
          } else {
            null
          }
        }
    }
  }

  /** 密码错误次数是否3次以上 */
  def overMaxFailure(princial: String): Boolean = {
    var c = CookieUtils.getCookieValue(request, "failure_" + princial)
    var failure = 0
    if (Strings.isNotBlank(c)) {
      failure = Numbers.toInt(c)
    }
    failure >= 3
  }

  /** 记录密码实效的次数
   *
   * @param princial
   */
  def rememberFailue(princial: String): Unit = {
    var c = CookieUtils.getCookieValue(request, "failure_" + princial)
    var failure = 1
    if (Strings.isNotBlank(c)) {
      failure = Numbers.toInt(c) + 1
    }
    CookieUtils.addCookie(request, response, "failure_" + princial, failure.toString, 15 * 60)
  }

  @ignore
  def toLoginForm(): View = {
    if (config.forceHttps && !RequestUtils.isHttps(request)) {
      val req = request
      val builder = new UrlBuilder(req.getContextPath)
      builder.setScheme("https").setServerName(req.getServerName).setPort(443)
        .setContextPath(req.getContextPath).setServletPath("/login")
        .setQueryString(req.getQueryString)
      redirect(to(builder.buildUrl()), "force https")
    } else {
      csrfDefender.addToken(request, response)
      put("config", config)
      put("current_timestamp", System.currentTimeMillis)
      forward("index")
    }
  }

  def success: View = {
    put("logined", Securities.session.isDefined)
    put("portal",Urp.portal)
    forward()
  }

  private def forwardService(service: String, session: Session): View = {
    if (null == service) {
      redirect("success", null)
    } else {
      val idPolicy = secuirtyManager.sessionIdPolicy.asInstanceOf[CookieSessionIdPolicy]
      val isMember = SessionHelper.isMember(request, service, idPolicy)
      if (isMember) {
        if (SessionHelper.isSameDomain(request, service, idPolicy)) {
          redirect(to(service), null)
        } else {
          val serviceWithSid =
            service + (if (service.contains("?")) "&" else "?") + idPolicy.name + "=" + session.id
          redirect(to(serviceWithSid), null)
        }
      } else {
        val ticket = ticketRegistry.generate(session, service)
        redirect(to(service + (if (service.contains("?")) "&" else "?") + "ticket=" + ticket), null)
      }
    }
  }

  /**
   * 用于加密用户密码的公开key，注意不要更改这里16。
   */
  private def loginKey: String = {
    val serverName = request.getServerName
    if (serverName.length >= 16) {
      serverName.substring(0, 16)
    } else {
      Strings.rightPad(serverName, 16, '0')
    }
  }

  def captcha: View = {
    if (config.enableCaptcha) {
      Stream(new ByteArrayInputStream(captchaHelper.generate(request, response)), "image/jpeg", "captcha")
    } else {
      Status(404)
    }
  }

}

