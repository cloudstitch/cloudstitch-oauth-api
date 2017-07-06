import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
import * as crypto from 'crypto';
import * as token from "./token";

const awsServerlessExpress = require('aws-serverless-express')

import * as Constants from "./constants";
import * as firebaseAdmin from "firebase-admin";
require("./firebase-admin");
let firebaseApp: firebaseAdmin.app.App = firebaseAdmin.app(`cloudstitch-${Constants.environmentName}`);

// import {RedirectHandler} from "./oauth-redirect";
// import {TokenHandler} from "./oauth-token";

import {Configure as Github} from "./configure-github";
import {Configure as Gitlab} from "./configure-gitlab";
import {Configure as Dropbox} from "./configure-dropbox";
import {Configure as Microsoft} from "./configure-microsoft";
import {Configure as Stripe} from "./configure-stripe";
import {Configure as Google} from "./configure-google";

// WEB APP
// =======

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: 'application/json'}));
app.use(cookieParser());
app.use(passport.initialize());

passport.serializeUser(function(user, done) {
  done(null, 0);
});

passport.deserializeUser(function(id, done) {
  done(null, {})
});

// Add a state cookie
app.use(async (req, res, done) => {
  res.set('Cache-Control', 'no-cache');

  console.log("Cookie", req.cookies[Constants.cookieName]);
  console.log("Query Token", req.query.token);

  if(!req.cookies[Constants.cookieName] && req.query.token) {
    //see if the current user has a state value stored in the firebase auth info
    let username;
    try {
      username = token.checkWebToken(req.query.token);
    } catch(e) {
      console.log("couldn't verify web token", e);
    }
    if(!username || typeof username !== "string") {
      res.statusCode = 403;
      console.log("Token malformed or username field missing", username);
      res.send(JSON.stringify({error: true, message: "Token malformed or username field missing."}))
      res.end();
      return;
    }

    var fbUsername = username
      .replace(/\./g, '-DOT-')
      .replace(/\$/g, '-DOLLAR-')
      .replace(/\[/g, '-OPEN-')
      .replace(/\]/g, '-CLOSE-')
      .replace(/\#/g, '-POUND-')
      .replace(/\//g, '-SLASH-');

    console.log("Username", username, "with fb path variant", fbUsername);

    let authInfoSnapshot = await firebaseApp.database().ref(`auth/${fbUsername}/`).once('value');
    let authInfo = authInfoSnapshot.val();

    const state = (authInfo && authInfo.state) ? authInfo.state : crypto.randomBytes(20).toString('hex')

    // We're going to set this either way because of the authstage prefix change.
    await firebaseApp.database().ref(`authstate/${state}/`).set(username);
    
    console.log("Existing snapshot", state, authInfo);

    if(!authInfo) {
      // no auth info yet? sore it
      console.log("No auth info. Storing");
      await firebaseApp.database().ref(`auth/${fbUsername}/`).set({
        github: false,
        gitlab: false,
        google: false,
        dropbox: false,
        stripe: false,
        microsoft: false,
        state
      });
    }
    console.log('Setting verification state:', state);
    res.cookie(Constants.cookieName, state, {maxAge: 3600000, secure: !Constants.development, httpOnly: Constants.development});
    done();
    return;
  } else if(!req.cookies[Constants.cookieName]) {
    res.statusCode = 403;
    console.log("Token missing or session lost");
    res.clearCookie(Constants.cookieName);
    res.send(JSON.stringify({error: true, message: "Token missing or session lost."}))
    res.end();
  } else {
    console.log("Skipping cookie business");
    res.clearCookie(Constants.cookieName);
    done();
  }
})

let router = express.Router();

Github(router, passport);
Gitlab(router, passport);
Dropbox(router, passport);
Microsoft(router, passport);
Stripe(router, passport);
Google(router, passport);

app.use(router);

const server = awsServerlessExpress.createServer(app)
export function handler(event, context) {
  awsServerlessExpress.proxy(server, event, context)
}