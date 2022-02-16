import { Request, Response, NextFunction } from 'express';
// import { ApiMissingParameterServerError } from '../../../../common/ServerError';
import { 
  ListAPSBusinessGroupsResponse, 
  APSBusinessGroupResponse,
  ListAPSBusinessGroupsExternalSystemResponse,
  APSBusinessGroupExternalResponse
} from '../../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSBusinessGroupsService from '../../../services/apsOrganization/APSBusinessGroupsService';
import { ControllerUtils } from '../../ControllerUtils';

export type All_Params = Pick<Components.PathParameters, 'organization_id'>;
export type AllByExternalSystemId_Params = Pick<Components.PathParameters, 'organization_id' | 'external_system_id'>;
export type ById_Params = Pick<Components.PathParameters, 'organization_id' | 'businessgroup_id'>;
export type ByExternalReferenceId_Params = Pick<Components.PathParameters, 'organization_id' | 'external_reference_id'>;
export type Create_Params = Pick<Components.PathParameters, 'organization_id'>;
export type Update_Params = Pick<Components.PathParameters, 'organization_id' | 'businessgroup_id'>;
export type Delete_Params = Pick<Components.PathParameters, 'organization_id' | 'businessgroup_id'>;

export class ApsBusinessGroupsController {

  public static all = (req: Request<All_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'all';
    const logName = `${ApsBusinessGroupsController.name}.${funcName}()`;

    try {
      APSBusinessGroupsService.all({
        apsOrganizationId: ControllerUtils.getParamValue<All_Params>(logName, req.params, 'organization_id')
      })
      .then( (r: ListAPSBusinessGroupsResponse) => {
        res.status(200).json(r);
      })
      .catch( (e) => {
        next(e);
      });
    } catch(e) {
      next(e);
    }
  }

  public static allByExternalSystemId = (req: Request<AllByExternalSystemId_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'allByExternalSystemId';
    const logName = `${ApsBusinessGroupsController.name}.${funcName}()`;

    try {
      APSBusinessGroupsService.allByExternalSystemId({
        apsOrganizationId: ControllerUtils.getParamValue<AllByExternalSystemId_Params>(logName, req.params, 'organization_id'),
        apsExternalSystemId: ControllerUtils.getParamValue<AllByExternalSystemId_Params>(logName, req.params, 'external_system_id')
      })
      .then( (r: ListAPSBusinessGroupsExternalSystemResponse) => {
        res.status(200).json(r);
      })
      .catch( (e) => {
        next(e);
      });
    } catch(e) {
      next(e);
    }
  }

  public static byId = (req: Request<ById_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'byId';
    const logName = `${ApsBusinessGroupsController.name}.${funcName}()`;
    try {
      APSBusinessGroupsService.byId({
        apsOrganizationId: ControllerUtils.getParamValue<ById_Params>(logName, req.params, 'organization_id'),
        apsBusinessGroupId: ControllerUtils.getParamValue<ById_Params>(logName, req.params, 'businessgroup_id')
      })
      .then( (r: APSBusinessGroupResponse) => {
        res.status(200).json(r);
      })
      .catch( (e) => {
        next(e);
      });
    } catch(e) {
      next(e);
    }
  }

  public static byExternalReferenceId = (req: Request<ByExternalReferenceId_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'byExternalReferenceId';
    const logName = `${ApsBusinessGroupsController.name}.${funcName}()`;

    try {
      APSBusinessGroupsService.byExternalReferenceId({
        apsOrganizationId: ControllerUtils.getParamValue<ByExternalReferenceId_Params>(logName, req.params, 'organization_id'),
        apsExternalReferenceId: ControllerUtils.getParamValue<ByExternalReferenceId_Params>(logName, req.params, 'external_reference_id'),
      })
      .then( (r: APSBusinessGroupExternalResponse) => {
        res.status(200).json(r);
      })
      .catch( (e) => {
        next(e);
      });
    } catch(e) {
      next(e);
    }
  }

  public static create = (req: Request<Create_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'create';
    const logName = `${ApsBusinessGroupsController.name}.${funcName}()`;
    try {
      APSBusinessGroupsService.create({
        apsOrganizationId: ControllerUtils.getParamValue<Create_Params>(logName, req.params, 'organization_id'),
        apsBusinessGroup: req.body
      })
      .then((r: APSBusinessGroupResponse) => {
        res.status(201).json(r);
      })
      .catch( (e) => {
        next(e);
      });
    } catch(e) {
      next(e);
    }
  }

  public static update = (req: Request<Update_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'update';
    const logName = `${ApsBusinessGroupsController.name}.${funcName}()`;

    try {
      APSBusinessGroupsService.update({
        apsOrganizationId: ControllerUtils.getParamValue<Update_Params>(logName, req.params, 'organization_id'),
        apsBusinessGroupId: ControllerUtils.getParamValue<Update_Params>(logName, req.params, 'businessgroup_id'),
        apsBusinessGroupUpdate: req.body
      })
      .then((r: APSBusinessGroupResponse) => {
        res.status(200).json(r);
      })
      .catch( (e) => {
        next(e);
      });
    } catch(e) {
      next(e);
    }
  }

  public static delete = (req: Request<Delete_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'delete';
    const logName = `${ApsBusinessGroupsController.name}.${funcName}()`;

    try{
      APSBusinessGroupsService.delete({
        apsOrganizationId: ControllerUtils.getParamValue<Delete_Params>(logName, req.params, 'organization_id'),
        apsBusinessGroupId: ControllerUtils.getParamValue<Delete_Params>(logName, req.params, 'businessgroup_id')
      })
      .then( (_r) => {
        res.status(204).send();
      })
      .catch( (e) => {
        next(e);
      });
    } catch(e) {
      next(e);
    }
  }
}