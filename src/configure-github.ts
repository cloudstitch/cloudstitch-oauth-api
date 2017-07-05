import { Strategy as GithubStrategy } from 'passport-github';
import * as Constants from './constants';

import CreateConfigure from "./configure";

const SERVICE = 'github';
const OPTS = {
  clientID: Constants[SERVICE].ClientID,
  clientSecret: Constants[SERVICE].ClientSecret,
  callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
  passReqToCallback: true
};
let SCOPE = {scope: 'repo'};

export let Configure = CreateConfigure(SERVICE, SERVICE, OPTS, GithubStrategy, SCOPE);
