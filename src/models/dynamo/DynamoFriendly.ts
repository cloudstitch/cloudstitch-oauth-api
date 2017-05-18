import FactoryFriendly = require("./FactoryFriendly");

interface DynamoFriendly extends FactoryFriendly.FactoryFriendly {
  dynamoTableName: string;
  dynamoHashKey: any;
  dynamoRangeKey?: any;
  savedProperties: any;
  postLoad?: () => void;
}

export = DynamoFriendly;