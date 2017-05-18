var dynamoDb;
import Constants = require("../../constants");
import AWS = require("../../AWS");
import debug = require('debug');

var Log = debug('dynamo:boot');

if (typeof dynamoDb == 'undefined') {
  if (Constants.development) {
    Log("Connecting to DynamoDb -- DEVELOPMENT");
    dynamoDb = new AWS.DynamoDB({endpoint: new AWS.Endpoint(Constants.domains.dynamo)});
  } else {
    Log("Connecting to DynamoDb -- PRODUCTION");
    dynamoDb = new AWS.DynamoDB();
  }
}

export = dynamoDb;