import { Strategy as GithubStrategy } from 'passport-github';
import * as Constants from './constants';

import TokenHandler from "./TokenHandler";

const SERVICE = 'github';

export function Configure(router: any, passport: any) {
  // Github
  // ------
  if(Constants[SERVICE]) {
    console.log(`---------------------------------- setting up ${SERVICE}`)
    let opts = {
      clientID: Constants[SERVICE].ClientID,
      clientSecret: Constants[SERVICE].ClientSecret,
      callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
      passReqToCallback: true
    };
    console.log(opts);

    passport.use(new GithubStrategy(opts, <any>TokenHandler(SERVICE)));

    router.get(`/${SERVICE}/redirect`,
      passport.authenticate(SERVICE, {
        scope: 'repo'
      }
    ));

    router.route(`/${SERVICE}/token`)
      .get(passport.authenticate(SERVICE, { failureRedirect: Constants.failureUrl }),
        (req, res) => {
          res.redirect(`${Constants.loadingUrl}`);
        });
  }

}