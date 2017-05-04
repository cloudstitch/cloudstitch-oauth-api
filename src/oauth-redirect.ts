import {createOAuthClientFn} from "./oauth-client";

function createRedirect(service: string, version: number, createOAuthClientFn:any, redirectUri:any, scopes:any) : (req, res) => any {
  return (req, res) => {
    var oauth2 = createOAuthClientFn()
    cookieParser()(req, res, () => {
      const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
      console.log('Setting verification state:', state);
      res.cookie('state', state.toString(), {maxAge: 3600000, secure: true, httpOnly: true});
      const redirectUriRes = oauth2.authorizationCode.authorizeURL({
        redirect_uri: redirectUri,
        scope: scopes,
        state: state
      });
      console.log(`[OAuth ${service}] Redirecting to: ${redirectUri}`);
      res.redirect(redirectUriRes);
    });
  }
}

/*
 * Redirect URI should be passed by the CLIENT ?RedirectURI=<URI>
 */
function createRedirectForService(service: string, redirectUri: string) : (req, res) => any {
  var serviceBlock = Constants[service];
  return createRedirect(service, serviceBlock.version, createOAuthClientFn(service), redirectUri, serviceBlock.scopes);
}

