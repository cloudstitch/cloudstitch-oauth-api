import * as firebaseAdmin from "firebase-admin";
import * as Constants from "./constants";

let firebaseApp: firebaseAdmin.app.App;
try {
  firebaseApp = firebaseAdmin.app(`cloudstitch-${Constants.environmentName}`);
  console.log("----------------------- found app")
} catch(e) {}
console.log(firebaseApp);
if(!firebaseApp) {
  console.log("----------------------- init app")
  firebaseApp = firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(Constants.Firebase),
      databaseURL: `https://cloudstitch-${Constants.environmentName}.firebaseio.com`
    }, `cloudstitch-${Constants.environmentName}`);
}

console.log(typeof firebaseApp.database);

if(typeof firebaseApp === undefined) {
  throw new Error("failed to init firebase");
}
