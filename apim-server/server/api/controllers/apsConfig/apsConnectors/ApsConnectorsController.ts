import { Request, Response, NextFunction } from 'express';
import { EServerStatusCodes, ServerLogger } from '../../../../common/ServerLogger';
import APSConnectorsService, { TAPSListAPSConnectorResponse } from '../../../services/apsConfig/APSConnectorsService';
import APSConnector = Components.Schemas.APSConnector;
import { ApiMissingParameterServerError } from '../../../../common/ServerError';

export class ApsConnectorsController {
  private static className = 'ApsConnectorsController';

  public static all = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'all';
    const logName = `${ApsConnectorsController.className}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));

    APSConnectorsService.all()
    .then( (r: TAPSListAPSConnectorResponse) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static byId = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'byId';
    const logName = `${ApsConnectorsController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    const connectorId: string = req.params.connector_id;
    if(!connectorId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'connector_id' });
    APSConnectorsService.byId(connectorId)
    .then( (r: APSConnector) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static byActive = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'byActive';
    const logName = `${ApsConnectorsController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    APSConnectorsService.byActive()
    .then( (r: APSConnector) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static create = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'create';
    const logName = `${ApsConnectorsController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    APSConnectorsService.create(req.body)
    .then((r) => {
      res.status(201).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static replace = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'replace';
    const logName = `${ApsConnectorsController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    const connectorId: string = req.params.connector_id;
    if(!connectorId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'connector_id' });
    APSConnectorsService.replace(connectorId, req.body)
    .then((r) => {
      res.status(200).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static setActive = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'setActive';
    const logName = `${ApsConnectorsController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    const connectorId: string = req.params.connector_id;
    if(!connectorId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'connector_id' });
    APSConnectorsService.setActive(connectorId)
    .then((r) => {
      res.status(201).json(r);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static delete = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'delete';
    const logName = `${ApsConnectorsController.className}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
    const connectorId: string = req.params.connector_id;
    if(!connectorId) throw new ApiMissingParameterServerError(logName, undefined, { parameter: 'connector_id' });
    APSConnectorsService.delete(connectorId)
    .then( (_r) => {
      res.status(204).send();
    })
    .catch( (e) => {
      next(e);
    });
  }
}