import Constants = require("./constants");
// process.env.AWS_PROFILE = Constants.secrets.AWS.profileName
var AWS = require("aws-sdk");

if (Constants.development) {
  var config :any= {
    accessKeyId: Constants.AWS['AccessKey'], 
    secretAccessKey: Constants.AWS['AccessSecret'],
    region: Constants.AWS.region
  };
  AWS.config.update(config);
} else {
  AWS.config.region = Constants.AWS.region;
}

export = AWS;