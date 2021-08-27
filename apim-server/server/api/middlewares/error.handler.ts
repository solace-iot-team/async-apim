import { Request, Response, NextFunction } from 'express';
import { 
  ApiInternalServerError, 
  ApiInternalServerErrorFromError, 
  ApiInternalServerErrorFromMongoError, 
  ApiServerErrorFromOpenApiRequestValidatorError, 
  ApiServerError 
} from '../../common/ServerError';
import { EServerStatusCodes, ServerLogger, TServerLogEntry } from '../../common/ServerLogger';
import { MongoError } from 'mongodb';
import { HttpError as OpenApiValidatorHttpError } from 'express-openapi-validator/dist/framework/types';

const componentName: string = "error.handler";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const funcName = 'errorHandler';
  const logName = `${componentName}.${funcName}()`;
  if(err instanceof ApiServerError) serverErrorHandler(err, req, res, _next);
  else {
    let internalServerError: ApiServerError;
    if(err instanceof MongoError) internalServerError = new ApiInternalServerErrorFromMongoError(err, logName);
    else if(err instanceof OpenApiValidatorHttpError) {
      internalServerError = new ApiServerErrorFromOpenApiRequestValidatorError(logName, err, req.body, ServerLogger.getRequestInfo(req));
    }
    else internalServerError = new ApiInternalServerErrorFromError(err, logName);
    serverErrorHandler(internalServerError, req, res, _next);
  } 

  //   const logEntry: TServerLogEntry = ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.API_SERVICE_ERROR, message: internalServerError.message, details: internalServerError.toObject() });

  //   if(internalServerError instanceof ApiInternalServerError) 
  //     ServerLogger.error(logEntry);  
  //   else 
  //     ServerLogger.debug(logEntry);

  //   for (const responseHeader of internalServerError.getAPSErrorHeaders()) {
  //     res.header(responseHeader.headerField, responseHeader.headerValue);
  //   }
  //   res.status(internalServerError.apiStatusCode).json(internalServerError.toAPSError());  
  // }
}

const serverErrorHandler = (apiServerError: ApiServerError, _req: Request, res: Response, _next: NextFunction) => {
  const funcName = 'serverErrorHandler';
  const logName = `${componentName}.${funcName}()`;
  const logEntry: TServerLogEntry = ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.API_SERVICE_ERROR, message: apiServerError.message, details: apiServerError.toObject() });

  if(apiServerError instanceof ApiInternalServerError) 
    ServerLogger.error(logEntry);  
  else 
    ServerLogger.debug(logEntry);
  
  for (const responseHeader of apiServerError.getAPSErrorHeaders()) {
    res.header(responseHeader.headerField, responseHeader.headerValue);
  }
  res.status(apiServerError.apiStatusCode).json(apiServerError.toAPSError());
}

