import * as Constants from './constants';
import TokenHandler from "./TokenHandler";

const TOKEN_OPTS = {
  failureRedirect: Constants.failureUrl
}

const TOKEN_RESP = (req, res) => {
  console.log("We authenticated");
  res.redirect(`${Constants.loadingUrl}`);
}

export default function Configure(SERVICE: string, passportService: string, opts: any, strategy: any, scope = {}) {
  return (router: any, passport: any) => {
    if(Constants[SERVICE]) {
      console.log(`---------------------------------- setting up ${SERVICE}`)
      console.log(opts);
      passport.use(new strategy(opts, <any>TokenHandler(SERVICE)));
      router.get(`/${SERVICE}/redirect`, passport.authenticate(passportService, scope));
      router.route(`/${SERVICE}/token`).get(passport.authenticate(SERVICE, TOKEN_OPTS), TOKEN_RESP);    
    }
  }
}
