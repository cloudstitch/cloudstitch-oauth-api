import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';
import * as crypto from 'crypto';

import * as firebaseAdmin from "firebase-admin";
let firebaseApp: firebaseAdmin.app.App =  require("./firebase-admin");

const awsServerlessExpress = require('aws-serverless-express')

import * as Constants from "./constants";

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
  if(!req.cookies.state && req.query.username) {
    const state = crypto.randomBytes(20).toString('hex');
    let oldState = await firebaseApp.database().ref(`auth/${req.query.username}/`).once('value');
    firebaseApp.database().ref(`auth/${req.query.username}/`).set({
      github: false,
      gitlab: false,
      google: false,
      dropbox: false,
      stripe: false,
      microsoft: false,
      state
    });
    console.log('Setting verification state:', state);
    res.cookie('state', state.toString(), {maxAge: 3600000, secure: !Constants.development, httpOnly: Constants.development});
  }
  done();
})

let router = express.Router();

Github(router, passport);
Gitlab(router, passport);
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