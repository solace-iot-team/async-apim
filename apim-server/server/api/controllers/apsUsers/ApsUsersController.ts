import { Request, Response, NextFunction } from 'express';
import { ApiQueryHelper } from '../../utils/ApiQueryHelper';
import APSUsersService from '../../services/APSUsersService/APSUsersService';
import { ApiMissingParameterServerError } from '../../../common/ServerError';
import { APSUser, ListApsUsersResponse } from '../../../../src/@solace-iot-team/apim-server-openapi-node';

export class ApsUsersController {
  private static className = 'ApsUsersController';

  public static all = (req: Request, res: Response, next: NextFunction): void => {

    APSUsersService.all(ApiQueryHelper.getPagingInfoFromQuery(req.query), ApiQueryHelper.getSortInfoFromQuery(req.query), ApiQueryHelper.getSearchInfoFromQuery(req.query))
    .then( (r: ListApsUsersResponse) => {
      // res.status(200).type('application/json').json(r);
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static byId = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'byId';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    const userId: string = req.params.user_id;
    if(!userId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'user_id' });
    APSUsersService.byId(userId)
    .then( (r: APSUser) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static create = (req: Request, res: Response, next: NextFunction): void => {
    APSUsersService.create(req.body)
    .then((r) => {
      res.status(201).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static update = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'update';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    const userId: string = req.params.user_id;
    if(!userId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'user_id' });
    APSUsersService.update(userId, req.body)
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static replace = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'replace';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    const userId: string = req.params.user_id;
    if(!userId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'user_id' });
    APSUsersService.replace(userId, req.body)
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static delete = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'delete';
    const logName = `${ApsUsersController.className}.${funcName}()`;
    const userId: string = req.params.user_id;
    if(!userId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'user_id' });
    APSUsersService.delete(userId)
    .then( (_r) => {
      res.status(204).send();
    })
    .catch( (e) => {
      next(e);
    });
  }

}

