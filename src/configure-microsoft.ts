import { Strategy } from 'passport-azure-oauth';
import * as Constants from './constants';

import TokenHandler from "./TokenHandler";

const SERVICE = 'microsoft';

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

    router.get(`/oauth/${SERVICE}/redirect`,
      passport.authenticate('azureoauth', {
      }
    ));

    router.route(`/:stage/${SERVICE}/token`)
      .get(passport.authenticate(SERVICE, { failureRedirect: Constants.failureUrl }),
        (req, res) => {
          res.redirect(Constants.loadingUrl);
        });
  }

}