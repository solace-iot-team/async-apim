import { Request, Response, NextFunction } from 'express';
import APSMonitorService from '../../services/APSMonitorService';
import APSStatus = Components.Schemas.APSStatus;

export class ApsMonitorController {

  public static status = (_req: Request, res: Response, next: NextFunction): void => {
    APSMonitorService.status()
    .then( (r: APSStatus) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

}