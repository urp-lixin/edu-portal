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
package net.openurp.lixin.platform.cas.service

import com.google.gson.Gson
import org.beangle.commons.collection.Collections
import org.beangle.commons.lang.Strings
import org.beangle.commons.logging.Logging
import org.beangle.commons.net.http.HttpUtils

class OAuth2ServiceImpl(val config: OAuth2Config) extends Logging {

  def getUserInfo(access_token: String): Map[String, String] = {
    val url = config.resourceURL + "?access_token=" + access_token + "&mode=N"
    getData(url)
  }

  def getAuthorizeURL(response_type: String, state: String): String = {
    s"${config.authorizeURL}?client_id=${config.clientId}&redirect_uri=${config.callbackURL}&response_type=${response_type}&state=$state"
  }

  def getLogoutURL(access_token: String): String = {
    Strings.replace(config.logoutURL, "${access_token}", access_token)
  }

  def logout(access_token: String): Map[String, String] = {
    getData(getLogoutURL(access_token))
  }

  def getAccessToken(typ: String, keys: Map[String, String]): Map[String, String] = {
    val code = keys.get("code").orNull
    var grant_type: String = null
    var uri: String = null
    val typeStr = if (typ == null || typ == "") "code" else typ
    val accessTokenURL = config.accessTokenURL

    typeStr match {
      case "token" =>
        grant_type = "refresh_token"
        uri = accessTokenURL + "?client_id=" + config.clientId + "&client_secret=" + config.clientSecret + "&grant_type=" + grant_type + "&refresh_token=" + keys.get("refresh_token")

      case "code" =>
        grant_type = "authorization_code"
        uri = accessTokenURL + "?client_id=" + config.clientId +
          "&client_secret=" + config.clientSecret + "&grant_type=" +
          grant_type + "&code=" + code + "&redirect_uri=" +
          config.callbackURL

      case "password" =>
        grant_type = "password"
        uri = accessTokenURL + "?client_id=" + config.clientId +
          "&client_secret=" + config.clientSecret + "&grant_type=" +
          grant_type + "&username=" + keys.get("username") + "&password=" +
          keys.get("password")

      case _ =>
        uri = accessTokenURL + "?client_id=" + config.clientId +
          "&client_secret=" + config.clientSecret + "&grant_type=" +
          grant_type + "&code=" + code + "&redirect_uri=" +
          config.callbackURL
    }
    getData(uri)
  }

  private def getData(url: String): Map[String, String] = {
    var res = HttpUtils.getText(url).orNull
    res = Strings.trim(res)
    if ("[false]".equals(res)) {
      logger.error(s"url :$url get $res")
      Map.empty
    } else {
      jsonToMap(res)
    }
  }

  protected def jsonToMap(json: String): Map[String, String] = {
    if (Strings.isBlank(json) || json.charAt(0) == '[') return Map.empty

    val data = Collections.newMap[String, String]
    val jsonObject = new Gson().fromJson(json, classOf[java.util.HashMap[String, String]])

    val iter = jsonObject.entrySet().iterator()
    while (iter.hasNext()) {
      val entry = iter.next()
      data.put(entry.getKey, entry.getValue)
    }
    data.toMap
  }
}
