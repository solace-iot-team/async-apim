import { Application } from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';
import cors from "cors";

import ServerConfig, { EAuthConfigType, TAuthConfig, TExpressServerConfig } from "../ServerConfig";
import { ServerError, ServerFatalError } from "../ServerError";
import { ServerUtils } from "../ServerUtils";
import APSPassportFactory from "./APSPassportFactory";

export enum EAuthStrategyName {
  INTERNAL = "internal",
  OIDC = "oidc"
}
export type TTokenContents = {
  _id: string;
}

class APSAuthStrategyService {
  private apsPassport: passport.PassportStatic | undefined = undefined;
  private apsStrategy: passport.Strategy | undefined = undefined;
  private apsStrategyName: EAuthStrategyName | undefined = undefined;

  public getApsPassport = (): passport.PassportStatic => {
    const funcName = 'getApsPassport';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    if(this.apsPassport === undefined) throw new ServerError(logName, 'this.apsPassport === undefined');
    return this.apsPassport;
  }

  public getApsStrategy = (): passport.Strategy => {
    const funcName = 'getApsStrategy';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    if(this.apsStrategy === undefined) throw new ServerError(logName, 'this.apsStrategy === undefined');
    return this.apsStrategy;
  }

  public getApsStrategyName = (): EAuthStrategyName => {
    const funcName = 'getApsStrategyName';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    if(this.apsStrategyName === undefined) throw new ServerError(logName, 'this.apsStrategyName === undefined');
    return this.apsStrategyName;
  }

  private getGeneralCorsOptions = (): cors.CorsOptions => {
    return {
      origin: true,
    };
  }
  private getCorsOptions_InternalAuth = (_config: TExpressServerConfig): cors.CorsOptions => {
    const funcName = 'getCorsOptions_InternalAuth';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;

    // TODO: use whitelisted client IP/domains?
    // //Add the client URL to the CORS policy

    // const whitelist = process.env.WHITELISTED_DOMAINS
    //   ? process.env.WHITELISTED_DOMAINS.split(",")
    //   : []
    const corsOptions: cors.CorsOptions = this.getGeneralCorsOptions();
    corsOptions.credentials = true;
    return corsOptions;
  }

  private initializeInternalAuth = ({ app, config }:{
    app: Application;
    config: TExpressServerConfig;
  }) => {

    const { apsPassport, apsStrategy } = APSPassportFactory.buildInternal({ name: EAuthStrategyName.INTERNAL });
    this.apsStrategy = apsStrategy;
    this.apsPassport = apsPassport;
    this.apsStrategyName = EAuthStrategyName.INTERNAL;

    app.use(apsPassport.initialize());
    // app.use(session({
    //   secret: 'keyboard cat',
    //   resave: true,
    //   saveUninitialized: true,
    //   cookie: { secure: false, sameSite: false, signed: false, maxAge: 1800000 }
    // }));
    // app.use(apsPassport.session());
    app.use(cors(this.getCorsOptions_InternalAuth(config)));
    // TODO: why / where did I find this?
    // app.use(bodyParser.urlencoded({ extended: false }));

  }

  public initialize = ({ app, config }:{
    app: Application;
    config: TExpressServerConfig;
  }): void => {
    const funcName = 'initialize';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;

    const authConfigType: EAuthConfigType = config.authConfig.type;
    switch(authConfigType) {
      case EAuthConfigType.UNDEFINED:
        throw new ServerError(logName, `authConfigType = ${authConfigType}`);
      case EAuthConfigType.INTERNAL:
        
        this.initializeInternalAuth({ app: app, config: config });
        

        // app.post('/apsSession/login', passport.authenticate('local'));


        return;
      case EAuthConfigType.OIDC:
        throw new ServerError(logName, `authConfigType = ${authConfigType} not supported`);
      default:
        ServerUtils.assertNever(logName, authConfigType)
    }
  }

  /**
   * Usage: 
   * res.cookie("refreshToken", refreshToken, APSAuthStrategyService.getResponseCookieOptions_For_InternalAuth_RefreshToken());
   */
  public getResponseCookieOptions_For_InternalAuth_RefreshToken(): any {
    const funcName = 'getResponseCookieOptions_For_InternalAuth';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;

    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);
    return {
      httpOnly: true,
      // Since localhost is not having https protocol,
      // secure cookies do not work correctly (in postman)
      // secure: !dev,
      secure: true,
      signed: true,
      maxAge: authConfig.refreshJwtExpirySecs,
      sameSite: "none",
      path: '/'
    };
  }

  public generateBearerToken_For_InternalAuth = ({ userId }:{
    userId: string;
  }): string => {
    const funcName = 'generateBearerToken_For_InternalAuth';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;

    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);

    const tokenContents: TTokenContents = {
      _id: userId
    };

    return jwt.sign(tokenContents, authConfig.authJwtSecret, {
      expiresIn: authConfig.authJwtExpirySecs
    });
  }

  public generateRefreshToken_For_InternalAuth = ({ userId }:{
    userId: string;
  }): string => {
    const funcName = 'generateRefreshToken_For_InternalAuth';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);

    const tokenContents: TTokenContents = {
      _id: userId
    };

    return jwt.sign(tokenContents, authConfig.refreshJwtSecret, {
      expiresIn: authConfig.refreshJwtExpirySecs
    });
  }

}

export default new APSAuthStrategyService();


        // from: https://www.wlaurance.com/2018/09/async-await-passportjs-local-strategy

// //defined above
// passport.use(strategy);

// app.use(session({ secret: "cats" }));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(passport.initialize());
// app.use(passport.session());

// //Could be async if we wanted it to
// passport.serializeUser((user, done) => {
//   done(null, user.email);
// });

// //ASYNC ALL THE THINGS!!
// passport.deserializeUser(async (email, done) => {
//   try {
//     let user = await UserController.findOneByEmail(email);
//     if (!user) {
//       return done(new Error('user not found'));
//     }
//     done(null, user);
//   } catch (e) {
//     done(e);
//   }
// });

// app.post('/login',
//   passport.authenticate('local', { successRedirect: '/' }));

// app.get('/me', async (req, res) => {
//   res.send(req.user);
// });