var Strategy = require('passport-stripe').Strategy;
import * as Constants from './constants';

import TokenHandler from "./TokenHandler";

const SERVICE = 'stripe';

export function Configure(router: any, passport: any) {
  // Github
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

    router.get(`/:stage/${SERVICE}/redirect`,
      passport.authenticate('stripe', {
        scope: 'read_write'
      }
    ));

    router.route(`/:stage/${SERVICE}/token`)
      .get(passport.authenticate(SERVICE, { failureRedirect: Constants.failureUrl }),
        (req, res) => {
          res.redirect(Constants.loadingUrl);
        });
  }

}