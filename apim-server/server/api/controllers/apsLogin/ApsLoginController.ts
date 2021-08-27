import { Request, Response, NextFunction } from 'express';
import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import APSLoginService from '../../services/APSLoginService';

export class ApsLoginController {

  public static login = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'login';
    const logName = `${ApsLoginController.name}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'login', details: ServerLogger.getRequestInfo(req) }));
    APSLoginService.login(req.body)
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

}