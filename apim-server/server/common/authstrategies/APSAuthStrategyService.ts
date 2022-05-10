import { Application } from "express";
import jwt from 'jsonwebtoken';
import cors from "cors";

import ServerConfig, { EAuthConfigType, TAuthConfig, TAuthConfigInternal, TExpressServerConfig } from "../ServerConfig";
import { ApiCorsServerError, ServerError, ServerFatalError } from "../ServerError";
import { ServerUtils } from "../ServerUtils";
import APSPassportFactory, { TPassportBuildInternalResult } from "./APSPassportFactory";
import passport, { AuthenticateOptions } from "passport";

export enum ERegisteredStrategyName {
  INTERNAL_LOCAL = "internal_local",
  INTERNAL_JWT = "internal_jwt",
  OIDC = "oidc"
}
export type TTokenPayload = {
  _id: string;
}
type StaticOrigin = boolean | string | RegExp | (boolean | string | RegExp)[];

class APSAuthStrategyService {
  // private apsPassport: passport.PassportStatic | undefined = undefined;
  // private apsStrategy: passport.Strategy | undefined = undefined;
  private apsInternal_LocalRegsiteredStrategyName: ERegisteredStrategyName.INTERNAL_LOCAL | undefined = undefined;
  private apsInternal_JwtRegisteredStrategyName: ERegisteredStrategyName.INTERNAL_JWT | undefined = undefined;
  // private apsVerifyUserFunc: IVerifyUserFunc | undefined;
  private readonly apsInternal_JwtStrategyAuthenticateOptions: AuthenticateOptions = {
    session: false,
    // failureRedirect
  };
  // private static readonly localhostRegExp = new RegExp(/.*localhost:[0-9]*$/);
  private static readonly localhostRegExp = new RegExp(/.*(localhost|127\.0\.0\.1):[0-9]*$/);
  private static corsWhitelistedDomainList: Array<string> = [];
  public verifyUser_Internal = passport.authenticate(ERegisteredStrategyName.INTERNAL_JWT, this.apsInternal_JwtStrategyAuthenticateOptions);


  // public getApsPassport = (): passport.PassportStatic => {
  //   const funcName = 'getApsPassport';
  //   const logName = `${APSAuthStrategyService.name}.${funcName}()`;
  //   if(this.apsPassport === undefined) throw new ServerError(logName, 'this.apsPassport === undefined');
  //   return this.apsPassport;
  // }

  // public getApsStrategy = (): passport.Strategy => {
  //   const funcName = 'getApsStrategy';
  //   const logName = `${APSAuthStrategyService.name}.${funcName}()`;
  //   if(this.apsStrategy === undefined) throw new ServerError(logName, 'this.apsStrategy === undefined');
  //   return this.apsStrategy;
  // }


  // public getVerifyUserFunc = () => {
  //   const funcName = 'getVerifyUserFunc';
  //   const logName = `${APSAuthStrategyService.name}.${funcName}()`;
  //   if(this.apsVerifyUserFunc === undefined) throw new ServerError(logName, 'this.apsVerifyUserFunc === undefined');
  //   return this.apsVerifyUserFunc;
  // }

  public getApsRegisteredAuthStrategyName = (): ERegisteredStrategyName => {
    const funcName = 'getApsRegisteredAuthStrategyName';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    const configAuthType: EAuthConfigType = ServerConfig.getAuthConfig().type;
    switch(configAuthType) {
      case EAuthConfigType.INTERNAL:
        if(this.apsInternal_LocalRegsiteredStrategyName === undefined) throw new ServerError(logName, 'this.apsInternal_LocalRegsiteredStrategyName === undefined');
        return this.apsInternal_LocalRegsiteredStrategyName;
      case EAuthConfigType.OIDC:
        throw new ServerError(logName, `configAuthType = ${configAuthType} not implemented`);
      case EAuthConfigType.NONE:
        throw new ServerError(logName, `configAuthType = ${configAuthType}`);
      default:
        ServerUtils.assertNever(logName, configAuthType);
    }
    throw new ServerError(logName, `configAuthType = ${configAuthType}`);    
  }

  // public getApsInternal_JwtStrategyName = (): EAuthStrategyName.INTERNAL_JWT => {
  //   const funcName = 'getApsInternal_JwtStrategyName';
  //   const logName = `${APSAuthStrategyService.name}.${funcName}()`;
  //   if(this.apsInternal_JwtStrategyName === undefined) throw new ServerError(logName, 'this.apsInternal_JwtStrategyName === undefined');
  //   return this.apsInternal_JwtStrategyName;
  // }

  // type CustomOrigin = (requestOrigin: string | undefined, callback: (err: Error | null, origin?: StaticOrigin) => void) => void;
  private static checkCorsOrigin = (requestOrigin: string | undefined, callback: (err: Error | null, origin?: StaticOrigin) => void) => {
    const funcName = 'checkCorsOrigin';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'continue here', details: {
    //   requestOrigin: requestOrigin,
    // } }));
    // throw new ServerError(logName, `continue with ${logName}`);

    if(requestOrigin !== undefined) {
      // localhost always allowed
      if(APSAuthStrategyService.localhostRegExp.test(requestOrigin)) return callback(null, true);
      // check whitelist
      if(APSAuthStrategyService.corsWhitelistedDomainList.indexOf(requestOrigin) !== -1) return callback(null, true);
    }
    // error
    // return callback(new Error(`CORS check failure: ${requestOrigin}`));
    return callback(new ApiCorsServerError(logName));
  }
  private getGeneralCorsOptions = (): cors.CorsOptions => {
    return {
      origin: APSAuthStrategyService.checkCorsOrigin,
    };
  }
  private getCorsOptions_NoAuth = (_config: TExpressServerConfig): cors.CorsOptions => {
    return { origin: true };
  }
  private initializeNoAuth = ({ app, config }:{
    app: Application;
    config: TExpressServerConfig;
  }) => {
    app.use(cors(this.getCorsOptions_NoAuth(config)));
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

    const _buildInternalResult: TPassportBuildInternalResult  = APSPassportFactory.buildInternal({ 
      authConfigInternal: config.authConfig as TAuthConfigInternal,
      internalLocalStrategyName: ERegisteredStrategyName.INTERNAL_LOCAL,
      internalJwtStrategyName: ERegisteredStrategyName.INTERNAL_JWT  
    });
    // this.apsStrategy = apsStrategy;
    // this.apsPassport = apsPassport;

    // app.use(apsPassport.initialize());
    app.use(passport.initialize());
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

    // indicates module is initialized
    this.apsInternal_LocalRegsiteredStrategyName = ERegisteredStrategyName.INTERNAL_LOCAL;
    this.apsInternal_JwtRegisteredStrategyName = ERegisteredStrategyName.INTERNAL_JWT;
    // this.apsVerifyUserFunc = passport.authenticate(ERegisteredStrategyName.INTERNAL_JWT, { session: false });

  }

  public initialize = ({ app, config }:{
    app: Application;
    config: TExpressServerConfig;
  }): void => {
    const funcName = 'initialize';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;

    const authConfigType: EAuthConfigType = config.authConfig.type;
    switch(authConfigType) {
      case EAuthConfigType.NONE:
        this.initializeNoAuth({ app: app, config: config });
        return;
      case EAuthConfigType.INTERNAL:        
        this.initializeInternalAuth({ app: app, config: config });
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
      // secure: true,
      secure: false,
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

    const payload: TTokenPayload = {
      _id: userId
    };

    return jwt.sign(payload, authConfig.authJwtSecret, {
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

    const payload: TTokenPayload = {
      _id: userId
    };

    return jwt.sign(payload, authConfig.refreshJwtSecret, {
      expiresIn: authConfig.refreshJwtExpirySecs
    });
  }

  public getUserId_From_RefreshToken = ({ refreshToken }:{
    refreshToken: string;
  }): string => {
    const funcName = 'getUserId_From_RefreshToken';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);
    
    const payload = jwt.verify(refreshToken, authConfig.refreshJwtSecret) as TTokenPayload;
    return payload._id;
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