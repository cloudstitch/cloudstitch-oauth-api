import jwt = require('jsonwebtoken');
import fs = require("fs");
import * as Constants from "./constants";

export function checkWebToken(token: string): string {
  var cert = fs.readFileSync(Constants.WebToken.publicKeyPath);
  try {
    var decoded = jwt.verify(token, cert, {algorithms: ['RS256']});
    if (typeof decoded['id'] == 'undefined') throw new Error("Token missing user ID");
    if (typeof decoded['username'] == 'undefined') throw new Error("Token missing username");
    if (typeof decoded['email'] == 'undefined') throw new Error("Token missing user email");
    return decoded['username'];
  } catch(err) {
    console.log("Error verifying web token", token, err);
    throw new Error('Token login failed.')
  }
}