var Strategy = require('passport-stripe').Strategy;
import * as Constants from './constants';

import CreateConfigure from "./configure";

const SERVICE = 'stripe';
let OPTS = {
  clientID: Constants[SERVICE].ConnectClientKey,
  clientSecret: Constants[SERVICE].ClientSecret,
  callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
  passReqToCallback: true
};
const SCOPE = {
  scope: 'read_write'
}

export let Configure = CreateConfigure(SERVICE, SERVICE, OPTS, Strategy, SCOPE);