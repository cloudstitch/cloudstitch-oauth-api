let express = require('express');
let bodyParser = require('body-parser');
let passport = require('passport');
const awsServerlessExpress = require('aws-serverless-express')

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