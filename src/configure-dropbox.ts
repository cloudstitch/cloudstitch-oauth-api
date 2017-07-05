import { Strategy } from 'passport-dropbox-oauth2';
import * as Constants from './constants';

import CreateConfigure from "./configure";

const SERVICE = 'dropbox';
const PASSPORT_SERVICE = 'dropbox-oauth2'
const OPTS = {
    apiVersion: '2',
    clientID: Constants[SERVICE].ClientID,
    clientSecret: Constants[SERVICE].ClientSecret,
    callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
    passReqToCallback: true
  };
const SCOPE = {}

export let Configure = CreateConfigure(SERVICE, PASSPORT_SERVICE, OPTS, Strategy, SCOPE);
