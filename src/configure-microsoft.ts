import { Strategy } from 'passport-azure-oauth';
import * as Constants from './constants';

import CreateConfigure from "./configure";

const SERVICE = 'microsoft';
let OPTS = {
  clientId: Constants[SERVICE].ClientID,
  clientSecret: Constants[SERVICE].ClientSecret,
  tenantId: Constants[SERVICE].TenantID,
  resource: Constants[SERVICE].Resource,
  callbackURL: Constants.callbackURLs[Constants.environmentName][SERVICE],
  passReqToCallback: true
};

export let Configure = CreateConfigure(SERVICE, 'azureoauth', OPTS, Strategy, {});