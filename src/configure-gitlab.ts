import { Strategy } from 'passport-gitlab';
import * as Constants from './constants';

const SERVICE = 'gitlab';

function Handler(accessToken, refreshToken, profile, done) {
  console.log(accessToken, refreshToken, profile);
  done(null);
};

export function Configure(router: any, passport: any) {
  // Github
  // ------
  if(Constants[SERVICE]) {
    let opts = {
      clientID: Constants[SERVICE].ClientID,
      clientSecret: Constants[SERVICE].ClientSecret,
      callbackURL: Constants[SERVICE].CallbackURL
    };
    console.log(opts);

    passport.use(new Strategy(opts, Handler));

    router.get(`/oauth/${SERVICE}/redirect`,
      passport.authenticate(SERVICE, {
        scope: 'repo'
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

}