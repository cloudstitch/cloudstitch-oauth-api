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

// Add a state cookie
app.use(async (req, res, done) => {
  if(!req.cookies.state && req.query.token) {
    //see if the current user has a state value stored in the firebase auth info
    let username;
    try {
      username = token.checkWebToken(req.query.token);
    } catch(e) {}
    if(!username || typeof username !== "string") {
      res.statusCode = 403;
      res.send(JSON.stringify({error: true, message: "Token malformed or username field missing."}))
      res.end();
      return;
    }

    let authInfoSnapshot = await firebaseApp.database().ref(`auth/${username}/`).once('value');
    let authInfo = authInfoSnapshot.val();

    const state = authInfo ? authInfo.state : crypto.randomBytes(20).toString('hex')
    
    if(!authInfo) {
      // no auth info yet? sore it
      await firebaseApp.database().ref(`auth/${state}/`).set(username);
      await firebaseApp.database().ref(`auth/${username}/`).set({
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
    res.cookie('state', state, {maxAge: 3600000, secure: !Constants.development, httpOnly: Constants.development});
    done();
    return;
  } else if(!req.cookies.state) {
    res.statusCode = 403;
    res.send(JSON.stringify({error: true, message: "Token missing or session lost."}))
    res.end();
  } else {
    done();
  }
})

let router = express.Router();

Github(router, passport);
// Gitlab(router, passport);
Dropbox(router, passport);
Microsoft(router, passport);
Stripe(router, passport);
Google(router, passport);

app.use(router);

// // HTTP POST request handler
// app.get('/:service/redirect', function (request, response) {
//   console.log('headers: ' + JSON.stringify(request.headers));
//   console.log('body: ' + JSON.stringify(request.body));
//   RedirectHandler(request, response);
// });

// app.get('/:service/token', function (request, response) {
//   console.log('headers: ' + JSON.stringify(request.headers));
//   console.log('body: ' + JSON.stringify(request.body));
//   TokenHandler(request, response);
// });

const server = awsServerlessExpress.createServer(app)
export function handler(event, context) {
  awsServerlessExpress.proxy(server, event, context)
}