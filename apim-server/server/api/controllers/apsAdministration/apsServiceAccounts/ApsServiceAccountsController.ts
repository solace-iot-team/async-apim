import { Request, Response, NextFunction } from 'express';
import { APSServiceAccount, APSServiceAccountCreateResponse, ListAPSServiceAccountsResponse } from '../../../../../src/@solace-iot-team/apim-server-openapi-node';
import ServerConfig, { EAuthConfigType } from '../../../../common/ServerConfig';
import { ServerError } from '../../../../common/ServerError';
import { ServerUtils } from '../../../../common/ServerUtils';
import APSServiceAccountsService from '../../../services/apsAdministration/APSServiceAccountsService';
import { ControllerUtils } from '../../ControllerUtils';

export type ServiceAccountId_Params = Pick<Components.PathParameters, 'service_account_id'>;

export class ApsServiceAccountsController {
  private static className = 'ApsServiceAccountsController';

  public static all = (_req: Request, res: Response, next: NextFunction): void => {
    APSServiceAccountsService.all()
    .then( (r: ListAPSServiceAccountsResponse) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static byId = (req: Request<ServiceAccountId_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'byId';
    const logName = `${ApsServiceAccountsController.className}.${funcName}()`;

    APSServiceAccountsService.byId({
      serviceAccountId: ControllerUtils.getParamValue<ServiceAccountId_Params>(logName, req.params, 'service_account_id')
    })
    .then( (r: APSServiceAccount) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static createInternal = (req: Request, res: Response, next: NextFunction): void => {
    // const funcName = 'createInternal';
    // const logName = `${ApsServiceAccountsController.name}.${funcName}()`;

    APSServiceAccountsService.create({
      apsServiceAccountCreate: req.body,
    })
    .then((apsServiceAccountCreateResponse: APSServiceAccountCreateResponse) => {

      res.status(201).send(apsServiceAccountCreateResponse);

    })
    .catch( (e) => {
      next(e);
    });
  }

  public static create = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'create';
    const logName = `${ApsServiceAccountsController.className}.${funcName}()`;

    const configAuthType: EAuthConfigType = ServerConfig.getAuthConfig().type;
    switch(configAuthType) {
      case EAuthConfigType.INTERNAL:
        return ApsServiceAccountsController.createInternal(req, res, next);
      case EAuthConfigType.OIDC:
        throw new ServerError(logName, `configAuthType = ${configAuthType} not implemented`);
      case EAuthConfigType.NONE:
        throw new ServerError(logName, `configAuthType = ${configAuthType}`);
      default:
        ServerUtils.assertNever(logName, configAuthType);
    }
    throw new ServerError(logName, `configAuthType = ${configAuthType}`);    
  }

  public static delete = (req: Request<ServiceAccountId_Params>, res: Response, next: NextFunction): void => {
    const funcName = 'delete';
    const logName = `${ApsServiceAccountsController.className}.${funcName}()`;

    APSServiceAccountsService.delete({
      serviceAccountId: ControllerUtils.getParamValue<ServiceAccountId_Params>(logName, req.params, 'service_account_id')
    })
    .then( (_r) => {
      res.status(204).send();
    })
    .catch( (e) => {
      next(e);
    });
  }
}