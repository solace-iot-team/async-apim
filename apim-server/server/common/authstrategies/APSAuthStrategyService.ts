import { Application } from "express";
import jwt from 'jsonwebtoken';
import cors from "cors";

import ServerConfig, { EAuthConfigType, TAuthConfig, TAuthConfigInternal, TExpressServerConfig } from "../ServerConfig";
import { ApiCorsServerError, ApiNotAuthorizedServerError, ServerError, ServerFatalError } from "../ServerError";
import { ServerUtils } from "../ServerUtils";
import APSPassportFactory from "./APSPassportFactory";
import passport, { AuthenticateOptions } from "passport";
import { EServerStatusCodes, ServerLogger } from "../ServerLogger";
import { APSSessionUser } from "../../api/services/APSSessionService";
import { APSOrganization, APSOrganizationList, APSServiceAccount, ListAPSApiProductsResponse, ListAPSOrganizationResponse } from "../../../src/@solace-iot-team/apim-server-openapi-node";
import APSOrganizationsService from "../../api/services/apsAdministration/APSOrganizationsService";

export enum ERegisteredStrategyName {
  INTERNAL_LOCAL = "internal_local",
  INTERNAL_JWT = "internal_jwt",
  OIDC = "oidc"
}
export enum TTokenPayload_AccountType {
  USER_ACCOUNT = "USER_ACCOUNT",
  SERVICE_ACCOUNT = "SERVICE_ACCOUNT"
}
export type TTokenPayload = {
  _id: string;
  iat: number;
  accountType: TTokenPayload_AccountType;
}
enum EConnectorRoles {
  PLATFORM_ADMIN = "platform-admin",
  ORG_ADMIN = "org-admin"
}
export type TConnectorTokenPayload = {
  userId: string;
  iat: number;
  organization?: Array<string>;
  roles: Array<EConnectorRoles>;
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
  private static isRequestOriginLocalhost = false;
  public verify_Internal = passport.authenticate(ERegisteredStrategyName.INTERNAL_JWT, this.apsInternal_JwtStrategyAuthenticateOptions);
  private static jwtHeader: jwt.JwtHeader = {
    typ: 'JWT',
    alg: 'HS256'
  };


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
    ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CORS_POLICY, message: 'checking cors policy', details: {
      requestOrigin: requestOrigin ? requestOrigin : 'undefined',
      corsWhitelistedDomainList: APSAuthStrategyService.corsWhitelistedDomainList
    } }));
    // return callback(new ServerError(logName, `continue with ${logName}`));  

    if(requestOrigin !== undefined) {
      // localhost always allowed
      if(APSAuthStrategyService.localhostRegExp.test(requestOrigin)) {
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CORS_POLICY, message: 'localhost pass', details: {
          requestOrigin: requestOrigin,
        } }));    
        APSAuthStrategyService.isRequestOriginLocalhost = true;
        return callback(null, true);
      }
      ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CORS_POLICY, message: 'checking whitelisted IPs', details: {
        requestOrigin: requestOrigin,
        corsWhitelistedDomainList: APSAuthStrategyService.corsWhitelistedDomainList
      } }));    
      // check whitelist, if empty, allow all
      if(APSAuthStrategyService.corsWhitelistedDomainList.length > 0) {
        if(APSAuthStrategyService.corsWhitelistedDomainList.indexOf(requestOrigin) !== -1) return callback(null, true);
      } else {
        // no whitelisted IPs found, allowing all through
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CORS_POLICY, message: 'no whitelisted IPs found, allowing all through', details: {
          requestOrigin: requestOrigin,
        } }));    
        return callback(null, true);
      }
    } else {
      ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CORS_POLICY, message: 'requestOrigin is undefined, allowing through', details: {
        requestOrigin: 'undefined',
      } }));    
      return callback(null, true);  
    }
    // error
    return callback(new ApiCorsServerError(logName, requestOrigin ? requestOrigin : 'undefined'));
  }
  private getGeneralCorsOptions = (): cors.CorsOptions => {
    return {
      origin: APSAuthStrategyService.checkCorsOrigin,
    };
  }
  private getCorsOptions_InternalAuth = (_config: TExpressServerConfig): cors.CorsOptions => {
    // const funcName = 'getCorsOptions_InternalAuth';
    // const logName = `${APSAuthStrategyService.name}.${funcName}()`;

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

    APSPassportFactory.buildInternal({ 
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
      case EAuthConfigType.INTERNAL:        
        this.initializeInternalAuth({ app: app, config: config });
        return;
      case EAuthConfigType.OIDC:
        throw new ServerError(logName, `authConfigType = ${authConfigType} not supported`);
      default:
        ServerUtils.assertNever(logName, authConfigType)
    }
  }

  public getResponseClearCookieOptions_For_InternalAuth_RefreshToken(): any {
    const funcName = 'getResponseClearCookieOptions_For_InternalAuth_RefreshToken';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);
    return {
      ...this.getResponseCookieOptions_For_InternalAuth_RefreshToken(),
      maxAge: 0,
      expires: new Date(0),
    };
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
    let _secure = true;
    let _sameSite: string | undefined = "none";
    // for localhost, secure must be true
    // secure: true, sameSite: "none"
    // for others:
    // secure: true (requires https) + sameSite: "none"
    // secure: false (over http) + sameSite: "lax" (this is the default)
    if(!APSAuthStrategyService.isRequestOriginLocalhost) {
      _secure = false;
      _sameSite = undefined;
    }
    return {
      httpOnly: true,
      secure: _secure,
      sameSite: _sameSite,
      signed: true,
      // milli seconds
      maxAge: authConfig.refreshJwtExpirySecs * 1000,
      path: '/'
    };
  }

  private generateBearerToken_For_Connector = ({ userId, organizationIdList, authConfig }:{
    userId: string;
    organizationIdList?: Array<string>;
    authConfig: TAuthConfigInternal;
  }): string => {
    const payload: TConnectorTokenPayload = {
      userId: userId,
      iat: Date.now(),
      organization: organizationIdList ? organizationIdList : [],
      // gives me a socket hangup
      // organization: organizationIdList,
      roles: [EConnectorRoles.PLATFORM_ADMIN, EConnectorRoles.ORG_ADMIN]
    };
    const signOptions: jwt.SignOptions = {
      // seconds
      expiresIn: 600,
      issuer: authConfig.connectorAuth.issuer,
      audience: authConfig.connectorAuth.audience,
      subject: userId,
      header: APSAuthStrategyService.jwtHeader,
      algorithm: 'HS256'
    };
    return jwt.sign(payload, authConfig.connectorAuth.secret, signOptions);
  }
  private generateBearerToken_For_Connector_For_UserAccount = ({ apsSessionUser }:{
    apsSessionUser: APSSessionUser;
  }): string => {
    const funcName = 'generateBearerToken_For_Connector_For_UserAccount';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;    
    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);
    let organizationIdList: Array<string> = [];
    if(apsSessionUser.memberOfOrganizations !== undefined) {
      organizationIdList = apsSessionUser.memberOfOrganizations.map( (x) => {
        return x.organizationId;
      });
    }
    return this.generateBearerToken_For_Connector({ 
      userId: apsSessionUser.userId,
      authConfig: authConfig,
      organizationIdList: organizationIdList
    });
  }

  public generateBearerToken_For_Connector_For_ServiceAccount = ({ apsServiceAccount }:{
    apsServiceAccount: APSServiceAccount;
  }): string => {
    const funcName = 'generateBearerToken_For_Connector_For_ServiceAccount';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;    
    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);
    return this.generateBearerToken_For_Connector({ 
      userId: apsServiceAccount.serviceAccountId,
      authConfig: authConfig,
      // organizationIdList: apsServiceAccount.organizationIdList
    });  
  }

  public generateConnectorProxyAuthHeader = ({ apsSessionUser, accountType }:{
    apsSessionUser: APSSessionUser | APSServiceAccount;
    accountType: TTokenPayload_AccountType;
  }): string => {
    const funcName = 'generateConnectorProxyAuthHeader';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);

    ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CONNECTOR_PROXY, message: 'apsSessionUser', details: {
      apsSessionUser: apsSessionUser,
      accountType: accountType
    } }));
    let connectorToken = '';
    switch(accountType) {
      case TTokenPayload_AccountType.USER_ACCOUNT:
        const _apsSessionUser: APSSessionUser = apsSessionUser as APSSessionUser;
        connectorToken = this.generateBearerToken_For_Connector_For_UserAccount({ apsSessionUser: _apsSessionUser});
        break;
      case TTokenPayload_AccountType.SERVICE_ACCOUNT:
        const _apsServiceAccount: APSServiceAccount = apsSessionUser as APSServiceAccount;
        connectorToken = this.generateBearerToken_For_Connector_For_ServiceAccount({ apsServiceAccount: _apsServiceAccount });
        break;
      default:
        ServerUtils.assertNever(logName, accountType);
    }
    // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CONNECTOR_PROXY, message: 'connectorToken', details: {
    //   connectorToken: connectorToken,
    // } }));

    return "Bearer " + connectorToken;
    // for testing, use user based auth
    // generate basic only for now, generate token later
    // return "Basic " + Buffer.from(ServerConfig.getConnectorConfig().connectorClientConfig.serviceUser + ":" + ServerConfig.getConnectorConfig().connectorClientConfig.serviceUserPwd).toString("base64");
  }

  private generateBearerToken_For_InternalAuth = ({ id, accountType, expiresInSeconds, secret }:{
    id: string;
    accountType: TTokenPayload_AccountType;
    expiresInSeconds: number;
    secret: string;
  }): string => {
    const payload: TTokenPayload = {
      _id: id,
      iat: Date.now(),
      accountType: accountType
    };
    const signOptions: jwt.SignOptions = {
      // seconds
      expiresIn: expiresInSeconds,
      issuer: ServerConfig.getConfig().serverLogger.appId,
      subject: id,
      header: APSAuthStrategyService.jwtHeader,
      algorithm: 'HS256'
    }
    return jwt.sign(payload, secret, signOptions);
  }

  public generateUserAccountBearerToken_For_InternalAuth = ({ userId }:{
    userId: string;
  }): string => {
    const funcName = 'generateUserAccountBearerToken_For_InternalAuth';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;

    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);

    return this.generateBearerToken_For_InternalAuth({ 
      id: userId,
      accountType: TTokenPayload_AccountType.USER_ACCOUNT,
      expiresInSeconds: authConfig.authJwtExpirySecs,
      secret: authConfig.authJwtSecret
    });
  }

  public generateServiceAccountBearerToken_For_InternalAuth = ({ serviceAccountId }:{
    serviceAccountId: string;
  }): string => {
    const funcName = 'generateServiceAccountBearerToken_For_InternalAuth';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;

    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);

    return this.generateBearerToken_For_InternalAuth({ 
      id: serviceAccountId,
      accountType: TTokenPayload_AccountType.SERVICE_ACCOUNT,
      expiresInSeconds: -1,
      secret: authConfig.authJwtSecret
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
      _id: userId,
      iat: Date.now(),
      accountType: TTokenPayload_AccountType.USER_ACCOUNT
    };
    const signOptions: jwt.SignOptions = {
      // seconds
      expiresIn: authConfig.refreshJwtExpirySecs,
      issuer: ServerConfig.getConfig().serverLogger.appId,
      subject: userId,
      header: APSAuthStrategyService.jwtHeader,
      algorithm: 'HS256'
    };
    return jwt.sign(payload, authConfig.refreshJwtSecret, signOptions);

    // return jwt.sign(payload, authConfig.refreshJwtSecret, {
    //   // seconds
    //   expiresIn: authConfig.refreshJwtExpirySecs
    // });

  }

  public getUserId_From_RefreshToken = ({ refreshToken }:{
    refreshToken: string;
  }): string => {
    const funcName = 'getUserId_From_RefreshToken';
    const logName = `${APSAuthStrategyService.name}.${funcName}()`;
    const authConfig: TAuthConfig = ServerConfig.getAuthConfig();
    if(authConfig.type !== EAuthConfigType.INTERNAL) throw new ServerFatalError(new Error('authConfig.type !== EAuthConfigType.INTERNAL'), logName);
    
    try {
      const payload = jwt.verify(refreshToken, authConfig.refreshJwtSecret) as TTokenPayload;
      return payload._id;
    } catch(e: any) {
      throw new ApiNotAuthorizedServerError(logName, undefined, { error: e });
    }
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