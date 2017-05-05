let express = require('express');
let bodyParser = require('body-parser');
const awsServerlessExpress = require('aws-serverless-express')


import {RedirectHandler} from "./oauth-redirect";
import {TokenHandler} from "./oauth-token";


// WEB APP
// =======

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: 'application/json'}));

// HTTP POST request handler
app.get('/:service/redirect', function (request, response) {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));
  RedirectHandler(request, response);
});

app.get('/:service/token', function (request, response) {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));
  TokenHandler(request, response);
});

const server = awsServerlessExpress.createServer(app)
export function handler(event, context) {
  awsServerlessExpress.proxy(server, event, context)
}