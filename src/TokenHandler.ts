import * as Q from 'q';

import { Token } from "./models/Token";
import * as dynamoDb from "./models/dynamo/DynamoService";

import * as Constants from "./constants";
import * as firebaseAdmin from "firebase-admin";
require("./firebase-admin");
let firebaseApp: firebaseAdmin.app.App =  firebaseAdmin.app(`cloudstitch-${Constants.environmentName}`)

export class TokenHandler {
  async save(token: string, refreshToken: string, service: string, username: string) {
    let newDbToken = Token.create();
    newDbToken.token = token;
    newDbToken.user = username;
    newDbToken.refreshToken = refreshToken;
    newDbToken.service = service;
    await Q.nfcall(dynamoDb.update, newDbToken, {fields: ["token", "refreshToken"]});
    let snapshot = await firebaseApp.database().ref(`auth/${username}`).once('value');
    let authInfo = snapshot.val();
    authInfo[service] =true;
    await firebaseApp.database().ref(`auth/${username}`).set(authInfo);
  }
}

export const Instance  = new TokenHandler();
