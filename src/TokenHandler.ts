import { Token } from "./models/Token";
import * as dynamoDb from "./models/dynamo/Dynamo";

export class TokenHandler {
  save(token: string, refreshToken: string, service: string) {
    
  }
}

export const Instance  = new TokenHandler();
