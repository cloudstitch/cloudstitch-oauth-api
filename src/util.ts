import cookieParser = require('cookie-parser');



// export function stashRedirectUri() {
//     cookieParser()(req, res, () => {
//     const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
//     console.log('Setting verification state:', state);
//     res.cookie('state', state.toString(), {maxAge: 3600000, secure: true, httpOnly: true});
//     const redirectUriRes = oauth2.authorizationCode.authorizeURL({
//       redirect_uri: redirectUri,
//       scope: scopes,
//       state: state
//     });
//     console.log(`[OAuth ${service}] Redirecting to: ${redirectUri}`);
//     res.redirect(redirectUriRes);
//   });
// }