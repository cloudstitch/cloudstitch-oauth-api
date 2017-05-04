let express = require('express');
let bodyParser = require('body-parser');
let sprintf = require('sprintf-js').sprintf;
const awsServerlessExpress = require('aws-serverless-express')

import {Router} from "./buttonjoy-router";

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({type: 'application/json'}));

app.post('/voice/addrow', function (request, response) {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));  
  const assistant = new ApiAiAssistant({request: request, response: response});
  assistant.handleRequest(Router);
});

app.listen(3000);
const server = awsServerlessExpress.createServer(app)

export function handler(event, context) {
  awsServerlessExpress.proxy(server, event, context)
}