import { Request, Response, NextFunction } from 'express';
import APSAboutService from '../../../services/apsConfig/APSAboutService';
import APSAbout = Components.Schemas.APSAbout;

export class ApsAboutController {

  public static about = (_req: Request, res: Response, next: NextFunction): void => {
    APSAboutService.about()
    .then( (r: APSAbout) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

}