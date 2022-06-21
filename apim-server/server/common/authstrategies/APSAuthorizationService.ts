import { Request, Response, NextFunction } from 'express';
import { APSServiceAccount } from '../../../src/@solace-iot-team/apim-server-openapi-node';
import { APSSessionUser } from '../../api/services/APSSessionService';
import { EServerStatusCodes, ServerLogger } from '../ServerLogger';
import { ServerUtils } from '../ServerUtils';
import { TTokenPayload_AccountType } from './APSAuthStrategyService';


export class APSAuthorizationService {

  private static verifyUserIsAuthorized = async({ apsSessionUser, resource, organizationId, businessGroupId }:{
    resource: string;
    apsSessionUser: APSSessionUser;
    organizationId?: string;
    businessGroupId?: string;
  }): Promise<void> => {
    const funcName = 'verifyUserIsAuthorized';
    const logName = `${APSAuthorizationService.name}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHORIZING_USER, message: 'request', details: {
      userId: apsSessionUser.userId,
      resource: resource,
      organizationId: organizationId,
      businessGroupId: businessGroupId
    }}));

    // calculate the resource path user is allowed to access 
    // should take organizationId into account if here in the request

    // throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserResponse.userId, resource: routePath });


  }

  private static verifyServiceAccountIsAuthorized = async({ apsServiceAccount, resource, organizationId, businessGroupId }:{
    resource: string;
    apsServiceAccount: APSServiceAccount;
    organizationId?: string;
    businessGroupId?: string;
  }): Promise<void> => {
    const funcName = 'verifyServiceAccountIsAuthorized';
    const logName = `${APSAuthorizationService.name}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHORIZING_SERVICE_ACCOUNT, message: 'request', details: {
      serviceAccountId: apsServiceAccount.serviceAccountId,
      resource: resource,
      organizationId: organizationId,
      businessGroupId: businessGroupId
    }}));

    // calculate the resource path user is allowed to access 
    // should take organizationId into account if here in the request

    // throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserResponse.userId, resource: routePath });


  }

  
  public static withAuthorization = (req: Request, _res: Response, next: NextFunction): void => {
    const funcName = 'withAuthorization';
    const logName = `${APSAuthorizationService.name}.${funcName}()`;

    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHORIZING, message: 'request', details: {
    //   req: req,
    // } }));
    // throw new ServerError(logName, `continue with ${logName}`);

    const anyReq: any = req as any;
    const path: string = anyReq._parsedUrl.path;
    const accountType: TTokenPayload_AccountType = anyReq.authInfo;
    switch(accountType) {
      case TTokenPayload_AccountType.USER_ACCOUNT:
        const apsSessionUser: APSSessionUser = anyReq.user;
        // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHORIZING_USER, message: 'request', details: {
        //   _passport: anyReq._passport,
        //   session: anyReq.session,
        //   routePath: anyReq.route.path,
        //   openApiOperationId: anyReq.openapi.schema.operationId,
        //   // apsUserResponse: apsUserResponse
        // } }));
        // throw new ServerError(logName, `continue with ${logName}`);
        // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHORIZING_USER, message: 'request', details: {
        //   userId: apsSessionUser.userId,
        //   resource: path,
        //   openApiOperationId: anyReq.openapi.schema.operationId,
        // } }));
        // throw new ServerError(logName, `continue with ${logName}`);
    
        // can use the routePath or the openApiOperationId?
        // "routePath": "/apim-server/v1/apsSession/test",
        // "openApiOperationId": "apsTest"
    
        // check if authorized 
        // todo: extract organizationId and businessGroupId from request ...
        APSAuthorizationService.verifyUserIsAuthorized({
          apsSessionUser: apsSessionUser,
          resource: path
        })
        .then(() => {
          next();
        })
        .catch( (e) => {
          next(e);
        });
        break;
      case TTokenPayload_AccountType.SERVICE_ACCOUNT:
        const apsServiceAccount: APSServiceAccount = anyReq.user;
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHORIZING_SERVICE_ACCOUNT, message: 'request', details: {
          serviceAccountId: apsServiceAccount.serviceAccountId,
          resource: path,
          openApiOperationId: anyReq.openapi.schema.operationId,
        } }));
        APSAuthorizationService.verifyServiceAccountIsAuthorized({
          apsServiceAccount: apsServiceAccount,
          resource: path
        })
        .then(() => {
          next();
        })
        .catch( (e) => {
          next(e);
        });
        break;
      default:
        ServerUtils.assertNever(logName, accountType);
    }
  }

}


