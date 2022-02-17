import { Request, Response, NextFunction } from 'express';
import { 
  ListAPSExternalSystemsResponse,
  APSExternalSystem
} from '../../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSExternalSystemsService from '../../../services/apsOrganization/apsExternalSystems/APSExternalSystemsService';

import { ControllerUtils } from '../../ControllerUtils';

export type All_Params = Pick<Components.PathParameters, 'organization_id'>;
export type ById_Params = Pick<Components.PathParameters, 'organization_id' | 'external_system_id'>;
export type Create_Params = Pick<Components.PathParameters, 'organization_id'>;
export type Update_Params = Pick<Components.PathParameters, 'organization_id' | 'external_system_id'>;
export type Delete_Params = Pick<Components.PathParameters, 'organization_id' | 'external_system_id'>;

export class ApsExternalSystemsController {

  public static all = (req: Request<All_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'all';
    const logName = `${ApsExternalSystemsController.name}.${funcName}()`;

    try {
      APSExternalSystemsService.all({
        apsOrganizationId: ControllerUtils.getParamValue<All_Params>(logName, req.params, 'organization_id')
      })
      .then( (r: ListAPSExternalSystemsResponse) => {
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
    const logName = `${ApsExternalSystemsController.name}.${funcName}()`;
    try {
      APSExternalSystemsService.byId({
        apsOrganizationId: ControllerUtils.getParamValue<ById_Params>(logName, req.params, 'organization_id'),
        apsExternalSystemId: ControllerUtils.getParamValue<ById_Params>(logName, req.params, 'external_system_id')
      })
      .then( (r: APSExternalSystem) => {
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
    const logName = `${ApsExternalSystemsController.name}.${funcName}()`;
    try {
      APSExternalSystemsService.create({
        apsOrganizationId: ControllerUtils.getParamValue<Create_Params>(logName, req.params, 'organization_id'),
        apsExternalSystemCreate: req.body
      })
      .then((r: APSExternalSystem) => {
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
    const logName = `${ApsExternalSystemsController.name}.${funcName}()`;

    try {
      APSExternalSystemsService.update({
        apsOrganizationId: ControllerUtils.getParamValue<Update_Params>(logName, req.params, 'organization_id'),
        apsExternalSystemId: ControllerUtils.getParamValue<Update_Params>(logName, req.params, 'external_system_id'),
        apsExternalSystemUpdate: req.body
      })
      .then((r: APSExternalSystem) => {
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
    const logName = `${ApsExternalSystemsController.name}.${funcName}()`;

    try{
      APSExternalSystemsService.delete({
        apsOrganizationId: ControllerUtils.getParamValue<Delete_Params>(logName, req.params, 'organization_id'),
        apsExternalSystemId: ControllerUtils.getParamValue<Delete_Params>(logName, req.params, 'external_system_id')
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