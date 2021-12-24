import { Request, Response, NextFunction } from 'express';
import { ApiInternalServerErrorNotOperational } from '../../common/ServerError';
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import ServerStatus from '../../common/ServerStatus';

const componentName = "middleware";

export default function verifyServerStatus(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  const funcName = 'verifyServerStatus';
  const logName = `${componentName}.${funcName}()`;
  if(!ServerStatus.getStatus().isReady) {
    ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.Api_Service_Error, message: 'server status', details: ServerStatus.getStatus() }));
    throw new ApiInternalServerErrorNotOperational(logName);
  }
  next();
}

// res.status(apiServerError.apiStatusCode).json(apiServerError.toAPSError()); 
