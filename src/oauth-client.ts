function createOauth2Client(service: string) {
  export let OauthClient = function() {
    const credentials = {
      client: {
        id: configBlock.clientID,
        secret: configBlock.clientSecret
        idParamName: 'key',
        secretParamName: 'client_secret'
      },
      auth: {
        tokenHost: configBlock.clientTokenHost,
        tokenPath: configBlock.clientTokenPath,
        authorizePath: configBlock.authorizePath
      }
    };
    return require('simple-oauth2').create(credentials);
  }
}

export default function createOAuthClientFn(service: string) {
  return createOAuth2Client(service);
}