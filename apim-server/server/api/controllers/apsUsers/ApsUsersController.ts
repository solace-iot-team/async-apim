import { Request, Response, NextFunction } from 'express';
import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { ApiQueryHelper } from '../../utils/ApiQueryHelper';
import APSUsersService, { TAPSListUserResponse } from '../../services/APSUsersService';
import APSUser = Components.Schemas.APSUser;
import { ApiMissingParameterServerError } from '../../../common/ServerError';

export class ApsUsersController {
  private static className = 'ApsUsersController';

  public static all = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'all';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    APSUsersService.all(ApiQueryHelper.getPagingInfoFromQuery(req.query), ApiQueryHelper.getSortInfoFromQuery(req.query), ApiQueryHelper.getSearchInfoFromQuery(req.query))
    .then( (r: TAPSListUserResponse) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static byId = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'byId';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    const userId: string = req.params.user_id;
    if(!userId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'user_id' });
    APSUsersService.byId(userId)
    .then( (r: APSUser) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static create = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'create';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    APSUsersService.create(req.body)
    .then((r) => {
      res.status(201).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static update = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'update';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    const userId: string = req.params.user_id;
    if(!userId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'user_id' });
    APSUsersService.update(userId, req.body)
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static replace = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'replace';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    const userId: string = req.params.user_id;
    if(!userId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'user_id' });
    APSUsersService.replace(userId, req.body)
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static delete = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'delete';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    const userId: string = req.params.user_id;
    if(!userId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'user_id' });
    APSUsersService.delete(userId)
    .then( (_r) => {
      res.status(204).send();
    })
    .catch( (e) => {
      next(e);
    });
  }

}

