var Strategy = require('passport-stripe').Strategy;
import * as Constants from './constants';

import TokenHandler from "./TokenHandler";

const SERVICE = 'stripe';

export function Configure(router: any, passport: any) {
  if(Constants[SERVICE]) {
    let opts = {
      clientID: Constants[SERVICE].ConnectClientKey,
      clientSecret: Constants[SERVICE].ClientSecret,
      callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
      passReqToCallback: true
    };
    console.log(opts);

    passport.use(new Strategy(opts, TokenHandler(SERVICE)));

    router.get(`/${SERVICE}/redirect`,
      passport.authenticate('stripe', {
        scope: 'read_write'
      }
    ));

    router.route(`/${SERVICE}/token`)
      .get(passport.authenticate(SERVICE, { failureRedirect: Constants.failureUrl }),
        (req, res) => {
          res.redirect(Constants.loadingUrl);
        });
  }

}