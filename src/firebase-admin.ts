import * as firebaseAdmin from "firebase-admin";
import * as Constants from "./constants";

let app = firebaseAdmin
  .initializeApp({
    credential: firebaseAdmin.credential.cert(Constants.Firebase),
    databaseURL: `https://cloudstitch-${Constants.environmentName}.firebaseio.com`
  }, `cloudstitch-${Constants.environmentName}`);

exports = app;