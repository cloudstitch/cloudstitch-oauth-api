import { Strategy } from 'passport-gitlab2';
import * as Constants from './constants';

import TokenHandler from "./TokenHandler";
import CreateConfigure from "./configure";

const SERVICE = 'gitlab';
let OPTS = {
  clientID: Constants[SERVICE].ClientID,
  clientSecret: Constants[SERVICE].ClientSecret,
  callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
  passReqToCallback: true
};
let SCOPE =  {scope: 'api'}

export let Configure = CreateConfigure(SERVICE, SERVICE, OPTS, Strategy, SCOPE);
// passport.use(new GithubStrategy(opts, <any>TokenHandler(SERVICE)));
