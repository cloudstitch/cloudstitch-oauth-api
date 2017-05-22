import * as Q from 'q';

import { Token } from "./models/Token";
import * as dynamoDb from "./models/dynamo/Dynamo";
import * as firebaseAdmin from "firebase-admin";
let firebaseApp: firebaseAdmin.app.App =  require("./firebase-admin");

export class TokenHandler {
  async save(token: string, refreshToken: string, service: string, username: string) {
    let newDbToken = Token.create();
    newDbToken.token = token;
    newDbToken.refreshToken = refreshToken;
    newDbToken.service = service;
    await Q.nfcall(dynamoDb.update, newDbToken, null);
    let snapshot = await firebaseApp.database().ref(`auth/${username}`).once('value');
    let authInfo = snapshot.val();
    authInfo[service] =true;
    await firebaseApp.database().ref(`auth/${username}`).set(authInfo);
  }
}

export const Instance  = new TokenHandler();
