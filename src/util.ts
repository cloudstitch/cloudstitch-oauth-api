// import crypto = require('crypto');

// function addCookie(req, res, redirectUri, scopes) {
//   const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
//   console.log('Setting verification state:', state);
//   res.cookie('state', state.toString(), {maxAge: 3600000, secure: true, httpOnly: true});


//   const redirectUriRes = oauth2.authorizationCode.authorizeURL({
//     redirect_uri: redirectUri,
//     scope: scopes,
//     state: state
//   });
//   console.log(`[OAuth ${service}] Redirecting to: ${redirectUri}`);
//   res.redirect(redirectUriRes);
// }

// app.use((req, res) => {
// })


export function returnResults(req, res) {
  res.jsonp({});
}