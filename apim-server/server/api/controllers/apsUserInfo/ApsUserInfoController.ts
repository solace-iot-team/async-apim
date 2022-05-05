import { Request, Response, NextFunction } from 'express';
import APSUsersService from '../../services/APSUsersService/APSUsersService';

export class ApsUserInfoController {

  public static info = (req: Request, res: Response, next: NextFunction): void => {
    if (req.user && (req.user as any).id) {
      APSUsersService.byId((req.user as any).id)
        .then((r) => {
          res.status(200).json(r);
        })
        .catch((e) => {
          next(e);
        });
    } else {
      next(new Error('no user logged in'));
    }
  }
}