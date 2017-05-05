/*
 * This should be the ONE file necessary to include for any
 * piece of code that needs a preloaded settings. It deep-extends
 * programmatically added defaults here with CONFIG and the SECRETS files.
 *
 * The one exception to this are gulpfiles, which may manually include
 * the CONFIG file since it contains lots of filepaths and glob definitions.
 */

// Note / TODO: the complexity of this is due to the fact that lambda didn't use to 
// support environment variables. Since it does now, we can clean this up and
// just simply example NODE_ENV.
let dev = (process.env.NODE_ENV === "development");
let staging = (process.env.NODE_ENV === "staging");
let prod = (process.env.NODE_ENV === "production");

if (process.env.FORCE_PRODUCTION==="true") {
  prod = true;
  dev = false;
  staging = false;
}

let environmentName;

if (prod) environmentName = 'production';
if (dev) environmentName = 'development';
if (staging) environmentName = 'staging';

let deepExtend = require("deep-extend");
let secrets;

if (dev) {
  secrets = require('../configuration/secrets/development.json');
} else if (prod) {
  secrets = require('../configuration/secrets/production.json');
} else if (staging) {
  secrets = require('../configuration/secrets/staging.json');  
} else {
  throw new Error("ERROR: Missing secrets file!");
}

console.log("Environment: ", environmentName);

console.log(secrets);

var base = {
  development: dev,
  production: prod,
  staging: staging,
  environmentName: environmentName,
  AWS: {
    region: 'us-west-2'
  },

  github: {
    ClientID: secrets.github.ClientID,
    ClientSecret: secrets.github.ClientSecret,
    CallbackURL: secrets.github.CallbackURL
  },
  gitlab: {
    ClientID: secrets.gitlab.ClientID,
    ClientSecret: secrets.gitlab.ClientSecret,
    CallbackURL: secrets.gitlab.CallbackURL    
  },

  // Not done

  Google: secrets.Google,
  Box: secrets.Box,
  Microsoft: secrets.Microsoft,

  Twilio: {
    SID: secrets.Twilio.SID,
    Token: secrets.Twilio.Token,
    FromPhone: secrets.Twilio.fromPhone
  },
  Intercom: {
    App: secrets.Intercom.App,
    Key: secrets.Intercom.Key
  },

  Stripe: {
    ButtonjoySecretKey: secrets.Stripe.ButtonjoySecretKey,
    ButtonjoyCharitySecretKey: secrets.Stripe.ButtonjoyCharitySecretKey,    
    ButtonjoyTestSecretKey: 'sk_test_hWoYu3rgL3R2l4HcxdBamqUE',
    ButtonjoyCharityTestSecretKey: 'sk_test_MSOIJBVyKPxedruMRbsHsC41',    
    SecretKey: secrets.Stripe.SecretKey,
    PublicKey: secrets.Stripe.PublishableKey,
    ConnectClientKey: secrets.Stripe.ConnectClientKey
  }
};

export = base;