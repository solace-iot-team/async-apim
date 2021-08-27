import { Request, Response, NextFunction } from 'express';
import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { ApiPathNotFoundServerError, ApiServerError } from '../../../common/ServerError';


export class ApsCatchAllController {

  public static all = (req: Request, _res: Response, next: NextFunction): void => {
    const funcName = 'all';
    const logName = `${ApsCatchAllController.name}.${funcName}()`;
    const requestInfo = ServerLogger.getRequestInfo(req);
    ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'catchAllNotFound', details: requestInfo }));

    const apiError: ApiServerError = new ApiPathNotFoundServerError(logName, undefined, { path: req.originalUrl });

    next(apiError);

  }

}