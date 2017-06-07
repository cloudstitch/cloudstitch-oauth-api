import * as Strategy from 'passport-google-oauth2';
import * as Constants from './constants';

import TokenHandler from "./TokenHandler";

const SERVICE = 'google';

export function Configure(router: any, passport: any) {
  // Google
  // ------
  if(Constants[SERVICE]) {
    let opts = {
      clientID: Constants[SERVICE].ClientID,
      clientSecret: Constants[SERVICE].ClientSecret,
      callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
      passReqToCallback: true
    };
    console.log(opts);

    passport.use(new Strategy(opts, TokenHandler(SERVICE)));

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