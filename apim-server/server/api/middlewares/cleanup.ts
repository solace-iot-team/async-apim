import { Request, Response, NextFunction } from 'express';
import { ConnectorClient } from '../../common/ConnectorClient';

// const componentName = "middleware";

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
