import { Request, Response, NextFunction } from 'express';
import { ApiQueryHelper } from '../../utils/ApiQueryHelper';
import APSUsersService from '../../services/APSUsersService/APSUsersService';
import { ApiMissingParameterServerError } from '../../../common/ServerError';
import { APSUserResponse, ListApsUsersResponse } from '../../../../src/@solace-iot-team/apim-server-openapi-node';

export class ApsUsersController {
  private static className = 'ApsUsersController';

  public static all = (req: Request, res: Response, next: NextFunction): void => {
    APSUsersService.all({
      pagingInfo: ApiQueryHelper.getPagingInfoFromQuery(req.query),
      searchInfo: ApiQueryHelper.getSearchInfoFromQuery(req.query),
      sortInfo: ApiQueryHelper.getSortInfoFromQuery(req.query),
    })
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
    APSUsersService.byId({ userId: userId })
    .then( (r: APSUserResponse) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static create = (req: Request, res: Response, next: NextFunction): void => {
    APSUsersService.create({ apsUserCreate: req.body })
    .then((r: APSUserResponse) => {
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
    APSUsersService.update({ 
      userId: userId, 
      apsUserUpdate: req.body
    })
    .then((r: APSUserResponse) => {
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
    APSUsersService.delete({ userId: userId })
    .then( (_r) => {
      res.status(204).send();
    })
    .catch( (e) => {
      next(e);
    });
  }

}

