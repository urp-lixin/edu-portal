[#ftl attributes={"content_type","text/xml; charset=utf-8"}/]
<?xml version="1.0" encoding="utf-8"?>
<sso:serviceResponse xmlns:sso="sso-namespace">
  <sso:authenticationFailure code='${result.code}'>${result.description?xml}</sso:authenticationFailure>
</sso:serviceResponse>
