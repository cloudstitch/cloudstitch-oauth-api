import { Strategy } from 'passport-dropbox-oauth2';
import * as Constants from './constants';

import TokenHandler from "./TokenHandler";

const SERVICE = 'dropbox';

export function Configure(router: any, passport: any) {
  // Dropbox
  // ------
  if(Constants[SERVICE]) {
    let opts = {
      apiVersion: '2',
      clientID: Constants[SERVICE].ClientID,
      clientSecret: Constants[SERVICE].ClientSecret,
      callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
      passReqToCallback: true
    };
    console.log(opts);

    passport.use(new Strategy(opts, TokenHandler(SERVICE)));

    router.get(`/${SERVICE}/redirect`,
      passport.authenticate('dropbox-oauth2', {
      }
    ));

    router.route(`/${SERVICE}/token`)
      .get(passport.authenticate(SERVICE, { failureRedirect: Constants.failureUrl }),
        (req, res) => {
          res.redirect("https://www.cloudstitch.com/");
        });

  }

}