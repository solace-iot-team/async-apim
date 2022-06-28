import { Request, Response, NextFunction } from 'express';
import { APSStatus } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSConnectorsService from '../../services/apsConfig/APSConnectorsService';
import APSMonitorService from '../../services/APSMonitorService';

export type ConnectorStatusApiBase_QueryParams = Pick<Components.QueryParameters, 'optionalConnectorId'>;

export class ApsMonitorController {

  public static status = (_req: Request, res: Response, next: NextFunction): void => {
    // Cache-Control: no-cache
    APSMonitorService.status()
    .then( (r: APSStatus) => {
      res.header("Cache-Control", "no-cache").status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static connectorStatus = (req: Request<any, any, any, ConnectorStatusApiBase_QueryParams>, res: Response, next: NextFunction): void => {
    const { query }  = req;
    APSConnectorsService.connectorStatus({ apsConnectorId: query.optionalConnectorId })
    .then( (r: any) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }
}