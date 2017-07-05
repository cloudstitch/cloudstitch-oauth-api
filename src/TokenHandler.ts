import * as Q from 'q';

import { Token } from "./models/Token";
import * as dynamoDb from "./models/dynamo/DynamoService";

import * as Constants from "./constants";
import * as firebaseAdmin from "firebase-admin";
require("./firebase-admin");
let firebaseApp: firebaseAdmin.app.App = firebaseAdmin.app(`cloudstitch-${Constants.environmentName}`);

let save = async function (token: string, refreshToken: string, service: string, username: string) {
  let firebaseApp: firebaseAdmin.app.App =  firebaseAdmin.app(`cloudstitch-${Constants.environmentName}`)

    var fbUsername = username
      .replace(/\./g, '-DOT-')
      .replace(/\$/g, '-DOLLAR-')
      .replace(/\[/g, '-OPEN-')
      .replace(/\]/g, '-CLOSE-')
      .replace(/\#/g, '-POUND-')
      .replace(/\//g, '-SLASH-');

  let newDbToken = Token.create();
  newDbToken.token = token;
  newDbToken.user = username;
  newDbToken.refreshToken = refreshToken;
  newDbToken.service = service;
  await Q.nfcall(dynamoDb.update, newDbToken, {fields: ["token", "refreshToken"]});
  let snapshot = await firebaseApp.database().ref(`auth/${fbUsername}`).once('value');
  let authInfo = snapshot.val();
  authInfo[service] =true;
  await firebaseApp.database().ref(`auth/${fbUsername}`).set(authInfo);
}

export default function TokenHandler(SERVICE: string) {
  return async (req, accessToken, refreshToken, profile, done) => {
    console.log("--------------------- handling token")
    let snapshot = await firebaseApp.database().ref(`auth/${req.cookies[Constants.cookieName]}/`).once('value');
    let username = snapshot.val();
    await save(accessToken, refreshToken, SERVICE, username);
    done(null);
  };
}
