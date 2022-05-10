import { Request, Response, NextFunction } from 'express';
import APSSecureTestsService from '../../services/APSSecureTestsService';

export class ApsSecureTestsController {

  public static test = (_req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'test';
    const logName = `${ApsSecureTestsController.name}.${funcName}()`;
    APSSecureTestsService.test()
    .then( (r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }
}
