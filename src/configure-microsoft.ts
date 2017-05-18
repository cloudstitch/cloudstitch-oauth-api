import { Strategy } from 'passport-azure-oauth';
import * as Constants from './constants';

const SERVICE = 'microsoft';

function Handler(req, accessToken, refreshToken, profile, done) {
  console.log(accessToken, refreshToken, profile);
  done(null);
};

export function Configure(router: any, passport: any) {
  // Github
  // ------
  let opts = {
    clientID: Constants[SERVICE].ClientID,
    clientSecret: Constants[SERVICE].ClientSecret,
    callbackURL: Constants[SERVICE].CallbackURL,
    passReqToCallback: true
  };
  console.log(opts);

  passport.use(new Strategy(opts, Handler));

  router.get(`/oauth/${SERVICE}/redirect`,
    passport.authenticate('azureoauth', {
    }
  ));

  router.get(`/oauth/${SERVICE}/get_token`,
    passport.authenticate('azureoauth', {
      successRedirect: `/oauth/${SERVICE}/success`,
      failureRedirect: `/oauth/${SERVICE}/fail`
    }
  ));

  // router.route('/auth/github/success')
  //   .get(authController.linkGithubSuccess);
  // router.route('/auth/github/fail')
  //   .get(cors.addCORSHeaders, passportConf.isAuthenticatedApi, authController.linkGithubFail);

}