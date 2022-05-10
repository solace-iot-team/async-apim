import { Request, Response, NextFunction } from 'express';
import { APSSessionUser } from '../../api/services/APSSessionService';
import { EServerStatusCodes, ServerLogger } from '../ServerLogger';


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
  
  public static withAuthorization = (req: Request, _res: Response, next: NextFunction): void => {
    const funcName = 'login';
    const logName = `${APSAuthorizationService.name}.${funcName}()`;

    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHORIZING_USER, message: 'request', details: {
    //   req: req,
    // } }));
    // throw new ServerError(logName, `continue with ${logName}`);
    // "_parsedUrl": {
    //   "protocol": null,
    //   "slashes": null,
    //   "auth": null,
    //   "host": null,
    //   "port": null,
    //   "hostname": null,
    //   "hash": null,
    //   "search": null,
    //   "query": null,
    //   "pathname": "/apsSession/test",
    //   "path": "/apsSession/test",

    const anyReq: any = req as any;
    const apsSessionUser: APSSessionUser = anyReq.user;
    const path: string = anyReq._parsedUrl.path;

    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHORIZING_USER, message: 'request', details: {
    //   _passport: anyReq._passport,
    //   session: anyReq.session,
    //   routePath: anyReq.route.path,
    //   openApiOperationId: anyReq.openapi.schema.operationId,
    //   // apsUserResponse: apsUserResponse
    // } }));
    // throw new ServerError(logName, `continue with ${logName}`);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHORIZING_USER, message: 'request', details: {
      userId: apsSessionUser.userId,
      resource: path,
      openApiOperationId: anyReq.openapi.schema.operationId,
    } }));
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


    

  }

}

