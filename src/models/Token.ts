import DynamoFriendly = require('./dynamo/DynamoFriendly');

const TABLE = 'tokens';

export type SERVICES = 'google' | 'microsoft';

export interface IToken {
  /*
   * The service where this user mas permissions
   */
  service: string;

  /*
   * The identity used to identify that user.
   */
  user: string;
  
  /*
   * The OAuth Key
   */
  token: string;

  /*
   * The refresh key
   */
  refreshToken: string;
  
  /*
   * The scope (optioal)
   */
  scope?: string;  

  incomingWebhookUrl?: string;
  incomingWebhookChannel?: string;
  incomingWebhookChannelId?: string;
  incomingWebhookConfigurationUrl?: string;
  serviceId?: string;
  serviceEmail?: string;
  serviceName?: string;
}

export class Token implements DynamoFriendly, IToken {
  // Standard
  user: string = null;
  service: string;
  token: string = null;
  refreshToken: string = null;
  scope: string = null;  

  incomingWebhookUrl?: string;
  incomingWebhookChannel?: string;
  incomingWebhookChannelId?: string;
  incomingWebhookConfigurationUrl?: string;
  serviceId?: string;
  serviceEmail?: string;
  serviceName?: string;

  // Dynamo Friendly
  dynamoTableName: string = TABLE;
  dynamoHashKey = "user";
  dynamoRangeKey = "service";
  
  savedProperties = {
    'user': {type: 'S'},
    'service': {type: 'S'},
    'token': {type: 'S'},
    'refreshToken': {type: 'S'},
    'scope': {type: 'S'},
    'incomingWebhookUrl': {type: 'S'},
    'incomingWebhookChannel': {type: 'S'},
    'incomingWebhookChannelId': {type: 'S'},
    'incomingWebhookConfigurationUrl': {type: 'S'},
    'serviceId': {type: 'S'},
    'serviceEmail': {type: 'S'}, 
    'serviceName': {type: 'S'} 
  };

  static create = function() : Token {
    return new Token();
  }
}

export class OldToken implements DynamoFriendly, IToken {
  // Standard
  user_id: number = 0;
  google_token: string = null;
  google_refresh_token: string = null;
  service: SERVICES = 'google';
  user:string = 'services';
  token: string;
  refreshToken: string;
  scope: string = null;  

  // Dynamo Friendly
  dynamoTableName: string = 'cloudstitch-tokens';
  dynamoHashKey = "user_id";
  
  savedProperties = {
    'user_id': {type: 'N'},
    'google_token': {type: 'S'},
    'google_refresh_token': {type: 'S'}
  };
  static create = function() : OldToken {
    return new OldToken();
  }
}