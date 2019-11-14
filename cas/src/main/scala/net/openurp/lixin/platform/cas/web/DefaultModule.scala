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
package net.openurp.lixin.platform.cas.web

import java.io.FileInputStream

import net.openurp.lixin.platform.cas.service.{OAuth2Config, OAuth2ServiceImpl}
import net.openurp.lixin.platform.cas.web.action.IndexAction
import org.beangle.cdi.bind.BindModule
import org.openurp.app.UrpApp
import net.openurp.lixin.platform.cas.service.{OAuth2Config, OAuth2ServiceImpl}

/**
 * @author chaostone
 */
class DefaultModule extends BindModule {
  override def binding() {
    bind(classOf[IndexAction])
    UrpApp.getUrpAppFile foreach { file =>
      val is = new FileInputStream(file)
      val app = scala.xml.XML.load(is)
      //在项目的配置文件中出现oauth2节点的情况下才配置如下信息
      (app \\ "oauth2") foreach { e =>
        val config = new OAuth2Config
        val host = (e \ "@host").text.trim
        config.clientId = (e \\ "clientId").text.trim
        config.clientSecret = (e \\ "clientSecret").text.trim
        config.callbackURL = (e \\ "callbackURL").text.trim

        config.authorizeURL = host + (e \\ "authorizeURL").text.trim
        config.accessTokenURL = host + (e \\ "accessTokenURL").text.trim
        config.resourceURL = host + (e \\ "resourceURL").text.trim
        config.logoutURL = host + (e \\ "logoutURL").text.trim

        bind(classOf[OAuth2ServiceImpl]).constructor(config)
      }
      is.close()
    }
  }
}
