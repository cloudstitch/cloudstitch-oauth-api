import { OAuthStrategy as Strategy } from 'passport-google-oauth';
import * as Constants from './constants';

const SERVICE = 'google';

function Handler(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any, msg?: any)=> void) {
  console.log(accessToken, refreshToken, profile);
  done(null);
};

export function Configure(router: any, passport: any) {
  // Google
  // ------
  /*
  interface IOAuthStrategyOption {
    consumerKey: string;
    consumerSecret: string;
    callbackURL: string;

    requestTokenURL?: string;
    accessTokenURL?: string;
    userAuthorizationURL?: string;
    sessionKey?: string;
}
   */
  let opts = {
    consumerKey: Constants[SERVICE].consumerKey,
    consumerSecret: Constants[SERVICE].consumerSecret,
    callbackURL: Constants[SERVICE].CallbackURL,
    passReqToCallback: true
  };
  console.log(opts);

  passport.use(new Strategy(opts, Handler));

  router.get(`/oauth/${SERVICE}/redirect`,
    passport.authenticate(SERVICE, {
      scope: 'profile email https://www.googleapis.com/auth/plus.me http://spreadsheets.google.com/feeds/ https://www.googleapis.com/auth/drive',
      accessType: 'offline', // Necessary for refreshToken
      approvalPrompt: 'force' // Necessary for refreshToken
    }
  ));

  router.get(`/oauth/${SERVICE}/get_token`,
    passport.authenticate(SERVICE, {
      successRedirect: `/oauth/${SERVICE}/success`,
      failureRedirect: `/oauth/${SERVICE}/fail`
    }
  ));

  // router.route('/auth/github/success')
  //   .get(authController.linkGithubSuccess);
  // router.route('/auth/github/fail')
  //   .get(cors.addCORSHeaders, passportConf.isAuthenticatedApi, authController.linkGithubFail);
}