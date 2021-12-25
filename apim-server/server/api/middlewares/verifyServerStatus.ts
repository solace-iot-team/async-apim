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
    ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.API_SERVICE_ERROR, message: 'server status', details: ServerStatus.getStatus() }));
    throw new ApiInternalServerErrorNotOperational(logName);
  }
  next();
}
