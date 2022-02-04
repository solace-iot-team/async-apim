import { Request, Response, NextFunction } from 'express';
import APSOrganizationsService from '../../../services/apsAdministration/APSOrganizationsService';
import { ApiMissingParameterServerError } from '../../../../common/ServerError';
import { 
  APSOrganization, 
  ListAPSOrganizationResponse 
} from '../../../../../src/@solace-iot-team/apim-server-openapi-node';

export class ApsOrganizationsController {
  private static className = 'ApsOrganizationsController';

  public static all = (_req: Request, res: Response, next: NextFunction): void => {
    APSOrganizationsService.all()
    .then( (r: ListAPSOrganizationResponse) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static byId = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'byId';
    const logName = `${ApsOrganizationsController.className}.${funcName}()`;
    const organizationId: string = req.params.organization_id;
    if(!organizationId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'organization_id' });
    APSOrganizationsService.byId(organizationId)
    .then( (r: APSOrganization) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static create = (req: Request, res: Response, next: NextFunction): void => {
    APSOrganizationsService.create(req.body)
    .then((r) => {
      res.status(201).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static update = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'update';
    const logName = `${ApsOrganizationsController.className}.${funcName}()`;
    const organizationId: string = req.params.organization_id;
    if(!organizationId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'organization_id' });
    APSOrganizationsService.update(organizationId, req.body)
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static delete = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'delete';
    const logName = `${ApsOrganizationsController.className}.${funcName}()`;
    const organizationId: string = req.params.organization_id;
    if(!organizationId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'organization_id' });
    APSOrganizationsService.delete(organizationId)
    .then( (_r) => {
      res.status(204).send();
    })
    .catch( (e) => {
      next(e);
    });
  }
}