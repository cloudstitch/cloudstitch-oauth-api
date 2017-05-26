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
  failureUrl: prod ? "https://www.cloudstitch.com/login" : staging ? "https://staging.cloudstitch.com/login" : "http://localhost:3000",
  development: dev,
  production: prod,
  staging: staging,
  environmentName: environmentName,
  loadingUrl: "http://cloudstitch.com/loading",
  callbackURLs: {
    development: {
      github:  "http://development.cloudstitch.com:3000/oauth/github/token",
      gitlab:  "http://development.cloudstitch.com:3000/oauth/gitlab/token",
      google:  "http://development.cloudstitch.com:3000/oauth/google/token",
      dropbox: "http://development.cloudstitch.com:3000/oauth/dropbox/token",
      box:     "http://development.cloudstitch.com:3000/oauth/box/token",
      stripe:  "http://development.cloudstitch.com:3000/oauth/stripe/token"
    },
    production: {
      github:  "https://oauth.cloudstitch.com/production/oauth/github/token",
      gitlab:  "https://oauth.cloudstitch.com/production/oauth/gitlab/token",
      google:  "https://oauth.cloudstitch.com/production/oauth/google/token",
      dropbox: "https://oauth.cloudstitch.com/production/oauth/dropbox/token",
      box:     "https://oauth.cloudstitch.com/production/oauth/box/token",
      stripe:  "https://oauth.cloudstitch.com/production/oauth/stripe/token"
    },
    staging: {
      github:  "https://oauth-staging.cloudstitch.com/staging/oauth/github/token",
      gitlab:  "https://oauth-staging.cloudstitch.com/staging/oauth/gitlab/token",
      google:  "https://oauth-staging.cloudstitch.com/staging/oauth/google/token",
      dropbox: "https://oauth-staging.cloudstitch.com/staging/oauth/dropbox/token",
      box:     "https://oauth-staging.cloudstitch.com/staging/oauth/box/token",
      stripe:  "https://oauth-staging.cloudstitch.com/staging/oauth/stripe/token"
    }
  },
  AWS: {
    region: secrets.AWS.region
  },

  domains: {
    dynamo: secrets.AWS.DynamoDB.endpoint
  },

  github: {
    ClientID: secrets.GitHub.ClientID,
    ClientSecret: secrets.GitHub.ClientSecret,
    CallbackURL: secrets.GitHub.CallbackURL
  },
  gitlab: {
    ClientID: secrets.GitLab.ClientID,
    ClientSecret: secrets.GitLab.ClientSecret,
    CallbackURL: secrets.GitLab.CallbackURL    
  },

  Firebase: secrets.Firebase,

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