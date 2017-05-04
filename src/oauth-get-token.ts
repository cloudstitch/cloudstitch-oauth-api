const cookieParser = require('cookie-parser');
const crypto = require('crypto');
import {createOAuthClientFn} from "./oauth-client";

export function createTokenHandler(service: string, version: number, createOAuthClientFn:any, redirectUri:any) : (req, res) => any {
  return (req, res) => {
    var oauth2 = createOAuthClientFn()

    try {
      cookieParser()(req, res, () => {
        console.log(`[OAuth ${service}] Received verification state: ${req.cookies.state}`);
        console.log(`[OAuth ${service}] Received state: ${req.query.state}`);

        if (!req.cookies.state) {
          throw new Error('State cookie not set or expired. Maybe you took too long to authorize. Please try again.');
        } else if (req.cookies.state !== req.query.state) {
          throw new Error('State validation failed');
        }

        console.log(`[OAuth ${service}] Received auth code: ${req.query.code}`);

        oauth2.authorizationCode.getToken({
          code: req.query.code,
          redirect_uri: redirectUri
        }).then(results => {
          console.log('Auth code exchange result received:', results);

          const accessToken = results.access_token;
          const userId = results.user.id;
          const profilePic = results.user.profile_picture;
          const userName = results.user.full_name;

          console.log(`[OAuth ${service}] Received token: ${accessToken}`);
          console.log(`[OAuth ${service}] Received results: ${JSON.stringify(results, undefined, 2)}`);
                    
          // Now we need to LINK it to the user's account!
          res.jsonp({});
        });
      });
    } catch (error) {
      return res.jsonp({error: error.toString});
    }
  }
}

function createTokenHandlerForService(service: string) : (req, res) => any {
  var serviceBlock = Constants[service];
  return createRedirect(service, serviceBlock.version, createOAuthClientFn(service), serviceBlock.redirectUri, serviceBlock.scopes);
}
