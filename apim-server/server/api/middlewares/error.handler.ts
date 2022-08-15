import { Request, Response, NextFunction } from 'express';
import { 
  ApiInternalServerError, 
  ApiInternalServerErrorFromError, 
  ApiInternalServerErrorFromMongoError, 
  ApiServerErrorFromOpenApiRequestValidatorError, 
  ApiServerError, 
  ConnectorProxyError
} from '../../common/ServerError';
import { EServerStatusCodes, ServerLogger, TServerLogEntry } from '../../common/ServerLogger';
import { MongoError } from 'mongodb';
import { HttpError as OpenApiValidatorHttpError } from 'express-openapi-validator/dist/framework/types';

const componentName = "middleware";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const funcName = 'errorHandler';
  const logName = `${componentName}.${funcName}()`;
  if(err instanceof ApiServerError) serverErrorHandler(err, req, res, next);
  else {
    let internalServerError: ApiServerError;
    if(err instanceof MongoError) internalServerError = new ApiInternalServerErrorFromMongoError(err, logName);
    else if(err instanceof OpenApiValidatorHttpError) {
      internalServerError = new ApiServerErrorFromOpenApiRequestValidatorError(logName, err, req.body, ServerLogger.getRequestInfo(req));
    } 
    // else if(err instanceof ConnectorProxyError) {

    // } 
    else internalServerError = new ApiInternalServerErrorFromError(err, logName);
    serverErrorHandler(internalServerError, req, res, next);
  } 
}

const serverErrorHandler = (apiServerError: ApiServerError, _req: Request, res: Response, _next: NextFunction) => {
  const funcName = 'serverErrorHandler';
  const logName = `${componentName}.${funcName}()`;
  const logEntry: TServerLogEntry = ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.API_SERVICE_ERROR, message: apiServerError.message, details: apiServerError.toObject() });

  if(apiServerError instanceof ApiInternalServerError) 
    ServerLogger.warn(logEntry);  
  else 
    ServerLogger.debug(logEntry);

  // * DEBUG *
  // check getAPSErrorHeaders()
  // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apiServerError.getAPSErrorHeaders()', details: apiServerError.getAPSErrorHeaders() }));
  // check toAPSError()
  // const x: Components.Schemas.APSError = apiServerError.toAPSError();
  // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apiServerError.toAPSError()', details: x }));

  for (const responseHeader of apiServerError.getAPSErrorHeaders()) {
    res.header(responseHeader.headerField, responseHeader.headerValue);
  }
  res.status(apiServerError.apiStatusCode).json(apiServerError.toAPSError()); 
}

