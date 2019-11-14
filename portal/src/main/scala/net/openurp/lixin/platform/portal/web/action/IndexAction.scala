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
package net.openurp.lixin.platform.portal.web.action

import org.beangle.commons.codec.digest.Digests
import org.beangle.commons.collection.Collections
import org.beangle.data.dao.{EntityDao, OqlBuilder}
import org.beangle.security.Securities
import org.beangle.security.realm.cas.CasConfig
import org.beangle.security.session.Session
import org.beangle.security.web.authc.WebClient
import org.beangle.webmvc.api.action.{ActionSupport, ServletSupport}
import org.beangle.webmvc.api.context.ActionContext
import org.beangle.webmvc.api.view.View
import org.openurp.app.Urp
import org.openurp.platform.config.model.App
import org.openurp.platform.security.model.FuncPermission
import org.openurp.platform.user.model.{Root, User}
import org.openurp.platform.user.service.UserService

/**
 * @author chaostone
 */
class IndexAction extends ActionSupport with ServletSupport {

  var config: CasConfig = _

  var userService: UserService = _

  var entityDao: EntityDao = _

  def index(): View = {
    val session = Securities.session.get
    put("user", session.principal)
    profile(session)
    put("client", WebClient.get(ActionContext.current.request))
    put("webappBase", Urp.webapp)
    val user = getUser
    val apps = entityDao.search(OqlBuilder.from[App](classOf[FuncPermission].getName, "fp").join("fp.role.members", "m")
      .where("m.user=:user and m.member=true", user)
      .where("fp.resource.app.enabled=true")
      .where("fp.resource.app.appType.name='web-app'")
      .select("distinct fp.resource.app").cacheable(true))

    val rootsQuery = OqlBuilder.from(classOf[Root], "root")
      .where("root.user=:user and root.app.enabled=true and root.app.appType.name='web-app'", user)
      .cacheable()
    val roots = entityDao.search(rootsQuery)
    val allApps = Collections.newSet[App]
    allApps ++= apps
    allApps ++= roots.map(_.app)
    allApps.dropWhile(_.domain.name.startsWith("platform"))
    val finalApps = allApps.toList

    put("apps", finalApps.sortBy(_.indexno))
    forward()
  }

  def logout(): View = {
    redirect(to(config.casServer + "/logout"), null)
  }

  private def profile(session: Session): Unit = {
    val photoUrl = Urp.api + "/platform/user/avatars/" + Digests.md5Hex(session.principal.getName) + ".jpg"
    put("photoUrl", photoUrl)
  }

  private def getUser: User = {
    val userCode = Securities.user
    userService.get(userCode).get
  }

}
