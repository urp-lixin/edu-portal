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
package net.openurp.lixin.platform.cas.web.action

import net.openurp.lixin.platform.cas.service.OAuth2ServiceImpl
import org.beangle.commons.lang.Strings
import org.beangle.commons.web.util.CookieUtils
import org.beangle.ids.cas.ticket.TicketRegistry
import org.beangle.ids.cas.web.helper.SessionHelper
import org.beangle.security.authc.PreauthToken
import org.beangle.security.context.SecurityContext
import org.beangle.security.session.Session
import org.beangle.security.web.WebSecurityManager
import org.beangle.security.web.access.SecurityContextBuilder
import org.beangle.security.web.session.CookieSessionIdPolicy
import org.beangle.webmvc.api.action.{ActionSupport, ServletSupport}
import org.beangle.webmvc.api.annotation.param
import org.beangle.webmvc.api.view.View
import org.openurp.app.Urp

class IndexAction extends ActionSupport with ServletSupport {
  var oauth2Service: OAuth2ServiceImpl = _
  var secuirtyManager: WebSecurityManager = _
  var ticketRegistry: TicketRegistry = _
  var securityContextBuilder: SecurityContextBuilder = _

  def index(@param(value = "service", required = false) s: String): View = {
    val serviceInCookie = CookieUtils.getCookieValue(request, "CAS_service")
    val service = if (Strings.isEmpty(s)) serviceInCookie else s
    SecurityContext.get.session match {
      case Some(session) =>
        forwardService(service, session)
      case None =>
        get("code") match {
          case Some(code) =>
            val token = oauth2Service.getAccessToken("code", Map("code" -> code))
            token.get("access_token") match {
              case Some(access_token) =>
                val userInfo = oauth2Service.getUserInfo(access_token)
                val session = secuirtyManager.login(request, response, new PreauthToken(userInfo("uid"), access_token))
                SecurityContext.set(securityContextBuilder.build(request, Some(session)))
                forwardService(service, session)
              case None => redirect(to(oauth2Service.getAuthorizeURL("code", "1q2w3e")), null)
            }
          case None =>
            redirect(to(oauth2Service.getAuthorizeURL("code", "1q2w3e")), null)
        }
    }
  }

  private def forwardService(service: String, session: Session): View = {
    if (null == service) {
      put("portal",Urp.portal)
      forward("/org/beangle/ids/cas/web/action/login/success")
    } else {
      if (SessionHelper.isMember(request, service, secuirtyManager.sessionIdPolicy.asInstanceOf[CookieSessionIdPolicy])) {
        redirect(to(service), null)
      } else {
        val ticket = ticketRegistry.generate(session, service)
        redirect(to(service + (if (service.contains("?")) "&" else "?") + "ticket=" + ticket), null)
      }
    }
  }

}
