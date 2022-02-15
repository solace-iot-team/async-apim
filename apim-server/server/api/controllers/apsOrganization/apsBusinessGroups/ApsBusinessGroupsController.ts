import { Request, Response, NextFunction } from 'express';
import { ApiMissingParameterServerError } from '../../../../common/ServerError';
import { 
  ListAPSBusinessGroupsResponse, 
  APSBusinessGroupResponse
} from '../../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSBusinessGroupsService from '../../../services/apsOrganization/APSBusinessGroupsService';

export class ApsBusinessGroupsController {
  private static className = 'ApsBusinessGroupsController';

  public static all = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'all';
    const logName = `${ApsBusinessGroupsController.className}.${funcName}()`;
    const organizationId: string = req.params.organization_id;
    if(!organizationId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'organization_id' });
    APSBusinessGroupsService.all({
      apsOrganizationId: organizationId
    })
    .then( (r: ListAPSBusinessGroupsResponse) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static byId = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'byId';
    const logName = `${ApsBusinessGroupsController.className}.${funcName}()`;
    const organizationId: string = req.params.organization_id;
    if(!organizationId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'organization_id' });
    const businessgroup_id: string = req.params.businessgroup_id;
    if(!businessgroup_id) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'businessgroup_id' });

    APSBusinessGroupsService.byId({
      apsOrganizationId: organizationId,
      apsBusinessGroupId: businessgroup_id
    })
    .then( (r: APSBusinessGroupResponse) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static create = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'create';
    const logName = `${ApsBusinessGroupsController.className}.${funcName}()`;
    const organizationId: string = req.params.organization_id;
    if(!organizationId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'organization_id' });

    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'create', details: {
    //   req: {
    //     body: req.body
    //   }
    // } }));
    
    APSBusinessGroupsService.create({
      apsOrganizationId: organizationId,
      apsBusinessGroup: req.body
    })
    .then((r) => {
      res.status(201).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static update = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'update';
    const logName = `${ApsBusinessGroupsController.className}.${funcName}()`;
    const organizationId: string = req.params.organization_id;
    if(!organizationId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'organization_id' });
    const businessgroup_id: string = req.params.businessgroup_id;
    if(!businessgroup_id) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'businessgroup_id' });

    APSBusinessGroupsService.update({
      apsOrganizationId: organizationId,
      apsBusinessGroupId: businessgroup_id,
      apsBusinessGroupUpdate: req.body
    })
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static delete = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'delete';
    const logName = `${ApsBusinessGroupsController.className}.${funcName}()`;
    const organizationId: string = req.params.organization_id;
    if(!organizationId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'organization_id' });
    const businessgroup_id: string = req.params.businessgroup_id;
    if(!businessgroup_id) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'businessgroup_id' });

    APSBusinessGroupsService.delete({
      apsOrganizationId: organizationId,
      apsBusinessGroupId: businessgroup_id
    })
    .then( (_r) => {
      res.status(204).send();
    })
    .catch( (e) => {
      next(e);
    });
  }
}