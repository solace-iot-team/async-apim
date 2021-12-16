import { Request, Response, NextFunction } from 'express';
import { EServerStatusCodes, ServerLogger } from '../../../../common/ServerLogger';
import APSAboutService from '../../../services/apsConfig/APSAboutService';
import APSAbout = Components.Schemas.APSAbout;

export class ApsAboutController {
  private static className = 'ApsAboutController';

  public static about = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'about';
    const logName = `${ApsAboutController.className}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));

    APSAboutService.about()
    .then( (r: APSAbout) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

}