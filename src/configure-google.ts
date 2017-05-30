import { OAuthStrategy as Strategy } from 'passport-google-oauth';
import * as Constants from './constants';

import TokenHandler from "./TokenHandler";

const SERVICE = 'google';

export function Configure(router: any, passport: any) {
  // Google
  // ------
  if(Constants[SERVICE]) {
    let opts = {
      consumerKey: Constants[SERVICE].consumerKey,
      consumerSecret: Constants[SERVICE].consumerSecret,
      callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
      passReqToCallback: true
    };
    console.log(opts);

    passport.use(new Strategy(opts, <any>TokenHandler(SERVICE)));

    router.get(`/${SERVICE}/redirect`,
      passport.authenticate(SERVICE, {
        scope: 'profile email https://www.googleapis.com/auth/plus.me http://spreadsheets.google.com/feeds/ https://www.googleapis.com/auth/drive',
        accessType: 'offline', // Necessary for refreshToken
        approvalPrompt: 'force' // Necessary for refreshToken
      }
    ));

    router.route(`/${SERVICE}/token`)
      .get(passport.authenticate(SERVICE, { failureRedirect: Constants.failureUrl }),
        (req, res) => {
          res.redirect(Constants.loadingUrl);
        });
  }
}