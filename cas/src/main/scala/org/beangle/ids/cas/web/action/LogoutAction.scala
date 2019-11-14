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

import javax.servlet.http.HttpServletRequest
import net.openurp.lixin.platform.cas.service.OAuth2ServiceImpl
import org.beangle.ids.cas.ticket.TicketRegistry
import org.beangle.security.Securities
import org.beangle.security.authc.Account
import org.beangle.security.context.SecurityContext
import org.beangle.security.web.WebSecurityManager
import org.beangle.webmvc.api.action.{ActionSupport, ServletSupport}
import org.beangle.webmvc.api.annotation.mapping
import org.beangle.webmvc.api.view.View

/**
 * 个性化，退出时如果是从sso过来的，则进行跳转
 *
 * @author chaostone
 */
class LogoutAction(secuirtyManager: WebSecurityManager, ticketRegistry: TicketRegistry)
  extends ActionSupport with ServletSupport {

  var oauth2Service: OAuth2ServiceImpl = _

  @mapping(value = "")
  def index(): View = {
    Securities.session match {
      case Some(session) =>
        ticketRegistry.evictServices(session) match {
          case Some(services) =>
            put("services", services.services)
            forward("service")
          case None =>
            secuirtyManager.logout(request, response, session)
            get("service") match {
              case Some(service) => redirect(to(service), null)
              case None => toLogin(request)
            }
        }
      case None =>
        get("service") match {
          case Some(service) => redirect(to(service), null)
          case None => toLogin(request)
        }
    }
  }

  //增加了退出后，返回sso的逻辑
  private def toLogin(request: HttpServletRequest): View = {
    if (null != oauth2Service) {
      SecurityContext.get.session match {
        case Some(session) =>
          session.principal.asInstanceOf[Account].remoteToken match {
            case Some(token) => redirect(to(oauth2Service.getLogoutURL(token.toString)), null)
            case None => redirect(to(classOf[LoginAction], "index"), null)
          }
        case None => redirect(to(classOf[LoginAction], "index", "&local=1"), null)
      }
    } else {
      redirect(to(classOf[LoginAction], "index", "&local=1"), null)
    }
  }
}
