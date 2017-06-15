import { Strategy } from 'passport-azure-oauth';
import * as Constants from './constants';

import TokenHandler from "./TokenHandler";

const SERVICE = 'microsoft';

export function Configure(router: any, passport: any) {
  // Github
  // ------
  if(Constants[SERVICE]) {
    let opts = {
      clientId: Constants[SERVICE].ClientID,
      clientSecret: Constants[SERVICE].ClientSecret,
      tenantId: Constants[SERVICE].TenantID,
      resource: Constants[SERVICE].Resource,
      callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
      passReqToCallback: true
    };
    console.log(opts);

    passport.use(new Strategy(opts, TokenHandler(SERVICE)));

    router.get(`/${SERVICE}/redirect`,
      passport.authenticate('azureoauth', {
      }
    ));

    router.route(`/${SERVICE}/token`)
      .get(passport.authenticate(SERVICE, { failureRedirect: Constants.failureUrl }),
        (req, res) => {
          res.redirect(Constants.loadingUrl);
        });
  }

}