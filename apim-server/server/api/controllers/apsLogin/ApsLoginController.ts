import { Request, Response, NextFunction } from 'express';
import APSLoginService from '../../services/APSLoginService';

export class ApsLoginController {

  public static login = (req: Request, res: Response, next: NextFunction): void => {
    APSLoginService.login(req.body)
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

}