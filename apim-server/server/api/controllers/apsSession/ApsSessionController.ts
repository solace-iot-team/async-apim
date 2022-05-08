import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { APSSessionLoginResponse, APSUserResponse } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSAuthStrategyService, { EAuthStrategyName } from '../../../common/authstrategies/APSAuthStrategyService';
import { ServerError, ServerFatalError } from '../../../common/ServerError';
import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { ServerUtils } from '../../../common/ServerUtils';
import APSSessionService from '../../services/APSSessionService';

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

    const authStrategyName: EAuthStrategyName = APSAuthStrategyService.getApsStrategyName();
    // let loginFunc: (req: Request, res: Response, next: NextFunction) => void = ApsSessionController.loginInternal;
    switch(authStrategyName) {
      case EAuthStrategyName.INTERNAL:
        return ApsSessionController.loginInternal(req, res, next);
        // break;
      case EAuthStrategyName.OIDC:
        throw new ServerError(logName, 'EAuthStrategyName.OIDC not implemented');
      default:
        ServerUtils.assertNever(logName, authStrategyName);
    }
    // APSAuthStrategyService.getApsPassport().authenticate(APSAuthStrategyService.getApsStrategy())(loginFunc(req, res, next));
    // passport.authenticate('internal')(loginFunc(req, res, next));
  }

  public static loginInternal = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'loginInternal';
    const logName = `${ApsSessionController.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'continue here', details: {
      req: req,
    } }));

    throw new ServerError(logName, `continue with ${logName}`);

    res.status(200).send({hello: "world"});



    // the strategy should populate user and user._id
    if(req.user === undefined) {
      throw new ServerFatalError(new Error('req.user === undefined'), logName);
    } 
    const anyReq: any = req as any;
    if(anyReq.user._id === undefined) {
      throw new ServerFatalError(new Error('anyReq.user._id === undefined'), logName);
    }
    const userId = anyReq.user._id;
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

}


// public static logout = (req: Request<UserId_Params>, res: Response, next: NextFunction): void => {
//   const funcName = 'logout';
//   const logName = `${ApsLoginController.name}.${funcName}()`;

//   APSLoginService.logout({
//     apsUserId: ControllerUtils.getParamValue<UserId_Params>(logName, req.params, 'user_id')
//   })
//   .then((_r) => {
//     res.status(204).send();
//   })
//   .catch( (e) => {
//     next(e);
//   });
// }
