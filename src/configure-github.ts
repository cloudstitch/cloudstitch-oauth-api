import { Strategy as GithubStrategy } from 'passport-github';
import * as Constants from './constants';

import { Instance as TokenHandler } from "./TokenHandler";

const SERVICE = 'github';

import * as firebaseAdmin from "firebase-admin";
let firebaseApp: firebaseAdmin.app.App =  require("./firebase-admin");

async function Handler(req, accessToken, refreshToken, profile, done) {
  console.log("--------------------- handling token")
  let snapshot = await firebaseApp.database().ref(`auth/${req.cookie.state}/`).once('value');
  let username = snapshot.val();
  await TokenHandler.save(accessToken, refreshToken, SERVICE, username);
  done(null);
};

export function Configure(router: any, passport: any) {
  // Github
  // ------
  if(Constants[SERVICE]) {
    console.log(`---------------------------------- setting up ${SERVICE}`)
    let opts = {
      clientID: Constants[SERVICE].ClientID,
      clientSecret: Constants[SERVICE].ClientSecret,
      callbackURL: `http://ted.studymonk.com:3000/oauth/${SERVICE}/token`,//Constants[SERVICE].CallbackURL
      passReqToCallback: true
    };
    console.log(opts);

    passport.use(new GithubStrategy(opts, <any>Handler));

    router.get(`/oauth/${SERVICE}/redirect`,
      passport.authenticate(SERVICE, {
        scope: 'repo'
      }
    ), (req, res) => {

      console.log("---------------------------- authing with github");
    });

    router.get(`/oauth/${SERVICE}/get_token`,
      passport.authenticate(SERVICE, {
        successRedirect: `/oauth/${SERVICE}/success`,
        failureRedirect: `/oauth/${SERVICE}/fail`
      }
    ));

    router.route(`/oauth/${SERVICE}/token`)
      .get(passport.authenticate(SERVICE, { failureRedirect: Constants.failureUrl }),
        (req, res) => {
          console.log("------------------------------- res back from github")
          res.redirect("https://www.cloudstitch.com/") //TODO redirect somewhere else? or not
        });
    // router.route(`/auth/${SERVICE}/fail`)
    //   .get(cors.addCORSHeaders, passportConf.isAuthenticatedApi, authController.linkGithubFail);
  }

}