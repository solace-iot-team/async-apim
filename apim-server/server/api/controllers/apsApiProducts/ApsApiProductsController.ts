import { Request, Response, NextFunction } from 'express';
import { ApiQueryHelper } from '../../utils/ApiQueryHelper';
import { APSApiProductSource, ListAPSApiProductsResponse } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSApiProductsService from '../../services/APSApiProductsService';
import { ControllerUtils } from '../ControllerUtils';
import { APSSessionUser } from '../../services/APSSessionService';
import { APIProductAccessLevel } from '@solace-iot-team/apim-connector-openapi-node';

export type All_Path_Params = Pick<Components.PathParameters, 'organization_id'>;
export type Extra_Query_Params = {
  businessGroupIdList: Components.Parameters.BusinessGroupIdList;
  accessLevelList: Components.Parameters.AccessLevelList;
  excludeApiProductIdList: Components.Parameters.ExcludeApiProductIdList;
  apiProductIdList: Components.Parameters.ApiProductIdList;
  source: APSApiProductSource;
}

export class ApsApiProductsController {

  public static all = (req: Request<All_Path_Params, any, any, Extra_Query_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'all';
    const logName = `${ApsApiProductsController.name}.${funcName}()`;

    const anyReq: any = req as any;
    const apsSessionUser: APSSessionUser = anyReq.user;
    // ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsSessionUser', details: {
    //   apsSessionUser: apsSessionUser,
    //   accountType: accountType
    // } }));


    // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'request', details: {
    //   query: req.query,
    // } }));
    // throw new Error(`${logName}: check the query`);

    APSApiProductsService.all({
      apsSessionUser: apsSessionUser,
      organizationId: ControllerUtils.getParamValue<All_Path_Params>(logName, req.params, 'organization_id'),
      businessGroupIdList: req.query.businessGroupIdList,
      accessLevelList: req.query.accessLevelList ? req.query.accessLevelList as Array<APIProductAccessLevel> : undefined,
      excludeApiProductIdList: req.query.excludeApiProductIdList,
      apiProductIdList: req.query.apiProductIdList,
      source: req.query.source,
      pagingInfo: ApiQueryHelper.getPagingInfoFromQuery(req.query),
      searchInfo: ApiQueryHelper.getSearchInfoFromQuery(req.query),
      sortInfo: ApiQueryHelper.getSortInfoFromQuery(req.query),
    })
    .then( (r: ListAPSApiProductsResponse) => {
      // res.status(200).type('application/json').json(r);
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  // public static byId = (req: Request, res: Response, next: NextFunction): void => {
  //   const funcName = 'byId';
  //   const logName = `${ApsUsersController.className}.${funcName}()`;
  //   const userId: string = req.params.user_id;
  //   if(!userId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'user_id' });
  //   APSUsersService.byId({ userId: userId })
  //   .then( (r: APSUserResponse) => {
  //     res.status(200).json(r);
  //   })
  //   .catch( (e) => {
  //     next(e);
  //   });
  // }


}

