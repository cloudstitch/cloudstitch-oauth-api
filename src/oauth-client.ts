// function createOauth2Client(service: string) {
//   export let OauthClient = function() {
//     const credentials = {
//       client: {
//         id: configBlock.ClientID,
//         secret: configBlock.ClientSecret
//         idParamName: 'key',
//         secretParamName: 'client_secret'
//       },
//       auth: {
//         tokenHost: configBlock.ClientTokenHost,
//         tokenPath: configBlock.ClientTokenPath,
//         authorizePath: configBlock.AuthorizePath
//       }
//     };
//     return require('simple-oauth2').create(credentials);
//   }
// }

// export default function createOAuthClientFn(service: string) {
//   return createOAuth2Client(service);
// }