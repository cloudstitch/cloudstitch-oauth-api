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
  try {
    await Q.nfcall(dynamoDb.update, newDbToken, {fields: ["token", "refreshToken"]});
  } catch(ex) {
    console.log("Couldn't save to dynamo", ex);
    console.log(newDbToken);
  }
  let snapshot = await firebaseApp.database().ref(`auth/${fbUsername}`).once('value');
  let authInfo = snapshot.val();
  authInfo[service] =true;
  try {
    await firebaseApp.database().ref(`auth/${fbUsername}`).set(authInfo);
  } catch(ex) {
    console.log("Couldn't save to firebase", ex);
    console.log(fbUsername, authInfo);
  }
}

export default function TokenHandler(SERVICE: string) {
  return async (req, accessToken, refreshToken, profile, done) => {
    console.log("--------------------- handling token")
    let snapshot = await firebaseApp.database().ref(`authstate/${req.cookies[Constants.cookieName]}/`).once('value');
    let username = snapshot.val();
    console.log("Updating username", username);
    await save(accessToken, refreshToken, SERVICE, username);
    console.log("Success");
    done(null);
  };
}
