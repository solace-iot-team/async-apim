import { Request, Response, NextFunction } from 'express';
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';

const componentName = "middleware";

export default function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const funcName = 'requestLogger';
  const logName = `${componentName}.${funcName}()`;
  ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'requestInfo', details: ServerLogger.getRequestInfo(req) }));
  next();
}

