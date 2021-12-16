import { Request, Response, NextFunction } from 'express';
import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import APSMonitorService from '../../services/APSMonitorService';
import APSStatus = Components.Schemas.APSStatus;

export class ApsMonitorController {
  private static className = 'ApsMonitorController';

  public static status = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'status';
    const logName = `${ApsMonitorController.className}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));

    APSMonitorService.status()
    .then( (r: APSStatus) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

}