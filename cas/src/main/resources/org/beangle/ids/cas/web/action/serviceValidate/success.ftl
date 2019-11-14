[#ftl attributes={"content_type","text/xml; charset=utf-8"}/]
<?xml version="1.0" encoding="utf-8"?>
[#assign principal=result.ticket.principal/]
<sso:serviceResponse xmlns:sso="sso-namespace">
  <sso:authenticationSuccess>
    <sso:user>${principal.name}</sso:user>
      <sso:attributes>
        <sso:attribute name="userName" type="java.lang.String" value="${principal.name}"/>
        <sso:attribute name="psn_name" type="java.lang.String" value="${principal.name}"/>
        <sso:attribute name="has_login" type="java.lang.String" value="0"/>
      </sso:attributes>
      [#if Parameters['checkAlive']??]
      <sso:checkAliveTicket>${Parameters['ticket']}</sso:checkAliveTicket>
      [/#if]
  </sso:authenticationSuccess>
</sso:serviceResponse>