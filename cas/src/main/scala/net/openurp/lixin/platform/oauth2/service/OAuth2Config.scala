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

package net.openurp.lixin.platform.oauth2.service

/**
 * OAuth2Config
 * <p>
 *   config oauth2 in project config file.
 * </p>
 * @example{{{
 *   <oauth2 host="http://sso.lixin.edu.cn">
 *     <clientId>javaSDKexample</clientId>
 *      <clientSecret>831ecb0ae1f56b711ab4e944cf0981a3</clientSecret>
 *      <callbackURL>http://localhost:8080/sso/index</callbackURL>
 *      <authorizeURL>/authorize.php</authorizeURL>
 *      <accessTokenURL>/token.php</accessTokenURL>
 *      <resourceURL>/resource.php</resourceURL>
 *      <logoutURL>/logout.php?access_token=${access_token}&amp;response_type=token&amp;redirect_uri=http://sso.lixin.edu.cn/index.html</logoutURL>
 *  </oauth2>
 * }}}
 */
class OAuth2Config {
  var clientId: String = _
  var clientSecret: String = _
  var callbackURL: String = _
  var authorizeURL: String = _
  var accessTokenURL: String = _
  var logoutURL: String = _
  var resourceURL: String = _
}
