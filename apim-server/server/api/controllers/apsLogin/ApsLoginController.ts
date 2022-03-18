import { Request, Response, NextFunction } from 'express';
import APSLoginService from '../../services/APSLoginService';
import { ControllerUtils } from '../ControllerUtils';

export type UserId_Params = Pick<Components.PathParameters, 'user_id'>;

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

  public static loginAs = (req: Request, res: Response, next: NextFunction): void => {
    APSLoginService.loginAs(req.body)
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static logoutAll = (_req: Request, res: Response, next: NextFunction): void => {
    APSLoginService.logoutAll()
    .then((_r) => {
      res.status(204).send();
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static logout = (req: Request<UserId_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'logout';
    const logName = `${ApsLoginController.name}.${funcName}()`;

    APSLoginService.logout({
      apsUserId: ControllerUtils.getParamValue<UserId_Params>(logName, req.params, 'user_id')
    })
    .then((_r) => {
      res.status(204).send();
    })
    .catch( (e) => {
      next(e);
    });
  }

}