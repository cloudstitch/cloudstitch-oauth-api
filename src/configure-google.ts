import * as Strategy from 'passport-google-oauth2';
import * as Constants from './constants';

import CreateConfigure from "./configure";

const SERVICE = 'google';
let OPTS = {
    clientID: Constants[SERVICE].ClientID,
    clientSecret: Constants[SERVICE].ClientSecret,
    callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
    passReqToCallback: true
  };
let SCOPE = {
  scope: 'profile email https://www.googleapis.com/auth/plus.me http://spreadsheets.google.com/feeds/ https://www.googleapis.com/auth/drive',
  accessType: 'offline', // Necessary for refreshToken
  approvalPrompt: 'force' // Necessary for refreshToken
}

export let Configure = CreateConfigure(SERVICE, SERVICE, OPTS, Strategy, SCOPE);
