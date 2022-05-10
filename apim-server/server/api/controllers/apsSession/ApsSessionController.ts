import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { APSSessionLoginResponse, APSSessionLogoutResponse, APSSessionRefreshTokenResponse, APSUserResponse } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSAuthStrategyService from '../../../common/authstrategies/APSAuthStrategyService';
import ServerConfig, { EAuthConfigType } from '../../../common/ServerConfig';
import { ApiNotAuthorizedServerError, ServerError, ServerFatalError } from '../../../common/ServerError';
import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { ServerUtils } from '../../../common/ServerUtils';
import APSSessionService, { APSSessionUser, TRefreshTokenInternalResponse } from '../../services/APSSessionService';

export type UserId_Params = Pick<Components.PathParameters, 'user_id'>;
export type OrganizationId_Params = Pick<Components.PathParameters, 'organization_id'>;

export class ApsSessionController {

  public static login = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'login';
    const logName = `${ApsSessionController.name}.${funcName}()`;
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'continue here', details: {
    //   req: _req,
    // } }));
    // throw new ServerError(logName, `continue with ${logName}`);
    const configAuthType: EAuthConfigType = ServerConfig.getAuthConfig().type;
    switch(configAuthType) {
      case EAuthConfigType.INTERNAL:
        return ApsSessionController.loginInternal(req, res, next);
      case EAuthConfigType.OIDC:
        throw new ServerError(logName, `configAuthType = ${configAuthType} not implemented`);
      case EAuthConfigType.NONE:
        throw new ServerError(logName, `configAuthType = ${configAuthType}`);
      default:
        ServerUtils.assertNever(logName, configAuthType);
    }
    throw new ServerError(logName, `configAuthType = ${configAuthType}`);    
    // APSAuthStrategyService.getApsPassport().authenticate(APSAuthStrategyService.getApsStrategy())(loginFunc(req, res, next));
    // passport.authenticate('internal')(loginFunc(req, res, next));
  }

  public static loginInternal = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'loginInternal';
    const logName = `${ApsSessionController.name}.${funcName}()`;

    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'continue here', details: {
    //   req: req
    // } }));

    // the strategy should populate user = userId
    if(req.user === undefined) {
      throw new ServerFatalError(new Error('req.user === undefined'), logName);
    } 

    const anyReq: any = req as any;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'continue here', details: {
      _passport: anyReq._passport,
      session: anyReq.session
    } }));
    // throw new ServerError(logName, `${logName}: continue here`);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'continue here', details: {
      user: anyReq.user,
    } }));
    // throw new ServerError(logName, `${logName}: continue with userId=${JSON.stringify(anyReq.user, null, 2)}`);

    const userId = anyReq.user;
    const token = APSAuthStrategyService.generateBearerToken_For_InternalAuth({ userId: userId });
    const refreshToken = APSAuthStrategyService.generateRefreshToken_For_InternalAuth({ userId: userId });

    APSSessionService.login({
      userId: userId,
      refreshToken: refreshToken
    })
    .then((apsUserResponse: APSUserResponse) => {

      res.cookie("refreshToken", refreshToken, APSAuthStrategyService.getResponseCookieOptions_For_InternalAuth_RefreshToken());

      // sending token back to browser not great - store it in the session?
      const apsSessionLoginResponse: APSSessionLoginResponse = {
        ...apsUserResponse,
        token: token
      };

      res.status(200).send(apsSessionLoginResponse);

    })
    .catch( (e) => {
      next(e);
    });
  }

  public static refreshToken = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'refreshToken';
    const logName = `${ApsSessionController.name}.${funcName}()`;

    const anyReq: any = req as any;

    // has no session info
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REFRESHING_USER_TOKEN, message: 'request', details: {
      _passport: anyReq._passport,
      session: anyReq.session
    } }));
    // throw new ServerError(logName, `continue with ${logName}`);

    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
  
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REFRESHING_USER_TOKEN, message: 'refreshToken', details: {
      refreshToken: refreshToken
    } }));

    // throw new ServerError(logName, `continue with ${logName}`);

    if(refreshToken === undefined) throw new ApiNotAuthorizedServerError(logName, undefined, { userId: 'userId'});

    APSSessionService.refreshToken({
      existingRefreshToken: refreshToken,
    })
    .then(( response: TRefreshTokenInternalResponse ) => {

      res.cookie("refreshToken", response.newRefreshToken, APSAuthStrategyService.getResponseCookieOptions_For_InternalAuth_RefreshToken());

      const apsSessionRefreshTokenResponse: APSSessionRefreshTokenResponse = {
        success: true,
        token: APSAuthStrategyService.generateBearerToken_For_InternalAuth({ userId: response.userId })
      };

      res.status(200).send(apsSessionRefreshTokenResponse);

    })
    .catch( (e) => {
      next(e);
    });
  }

  public static logout = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'logout';
    const logName = `${ApsSessionController.name}.${funcName}()`;

    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_USER, message: 'request', details: {
    //   req: req,
    // } }));

    const anyReq: any = req as any;
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_USER, message: 'request', details: {
    //   user: anyReq.user,
    // } }));
    // throw new ServerError(logName, `continue with ${logName}`);
    const apsSessionUser: APSSessionUser = anyReq.user;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_USER, message: 'request', details: {
      _passport: anyReq._passport,
      session: anyReq.session,
      userId: apsSessionUser.userId
    } }));
    // throw new ServerError(logName, `continue with ${logName}`);

    // const { signedCookies = {} } = req;
    // const { refreshToken } = signedCookies;

    APSSessionService.logout({
      userId: apsSessionUser.userId
    })
    .then( (apsSessionLogoutResponse: APSSessionLogoutResponse) => {

      res.clearCookie("refreshToken", APSAuthStrategyService.getResponseCookieOptions_For_InternalAuth_RefreshToken());

      res.status(200).json(apsSessionLogoutResponse);

    })
    .catch( (e) => {
      next(e);
    });
  }

  public static test = (_req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'test';
    const logName = `${ApsSessionController.name}.${funcName}()`;
    APSSessionService.test()
    .then( (r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }
}
