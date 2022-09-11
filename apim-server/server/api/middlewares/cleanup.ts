import { Request, Response, NextFunction } from 'express';
import { ConnectorClient } from '../../common/ConnectorClient';
import { ApiInternalServerErrorNotOperational } from '../../common/ServerError';
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import ServerStatus from '../../common/ServerStatus';

const componentName = "middleware";

export default function cleanup(
  _req: Request,
  res: Response,
  next: NextFunction
): void {

  res.on("finish", function() {
    ConnectorClient.setApsSessionUserId(undefined);
  });

  next();
}
