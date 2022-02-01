import { MongoError } from "mongodb";
import { HttpError as OpenApiValidatorHttpError } from 'express-openapi-validator/dist/framework/types';
import APSErrorIds = Components.Schemas.APSErrorIds;
import APSError = Components.Schemas.APSError;
import { EServerStatusCodes, ServerLogger } from "./ServerLogger";
import { ApiError, APSStatus } from "../../src/@solace-iot-team/apim-server-openapi-node";
import ServerConfig from "./ServerConfig";
import ServerStatus from "./ServerStatus";

export class ServerErrorFactory {
  public static createServerError = (e: any, logName: string): ServerError => {
    let serverError: ServerError;
    if (e instanceof ServerError ) serverError = e;
    else serverError = new ServerErrorFromError(e, logName);
    return serverError;
  }
}
export class ServerError extends Error {
  private internalStack: Array<string>;
  private internalLogName: string;
  private internalMessage: string;
  protected appId: string;

  private createArrayFromStack = (stack: any): Array<string> => {
    return stack.split('\n');
  }

  constructor(internalLogName: string, internalMessage?: string) {
    super(internalMessage?internalMessage:internalLogName);
    this.name = this.constructor.name;
    this.internalLogName = internalLogName;
    this.internalStack = this.createArrayFromStack(this.stack);
    this.appId = ServerConfig.getServerLoggerConfig().appId;
  }

  public toString = (): string => {
    return JSON.stringify(this.toObject(), null, 2);
  }

  public toObject = (): any => {
    const funcName = 'toObject';
    const logName = `${ServerError.name}.${funcName}()`;
    try {
      return JSON.parse(JSON.stringify(this));
    } catch (e: any) {
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INTERNAL_ERROR, message: `JSON.parse error`, details: { name: e.name, message: e.message } }));    
      return {
        internalLogName: this.internalLogName,
        internalMessage: this.internalMessage ? this.internalMessage : `JSON.parse error: ${e.name}: ${e.message}`,
        internalStack: this.internalStack
      }
    }
  }
}

export class ServerFatalError extends ServerError {
  private originalError: {
    name: string,
    errors: any,
    status: number
  }
  constructor(originalError: any, internalLogName: string) {
    super(internalLogName, originalError.message);
    this.originalError = {
      name: originalError.name,
      errors: originalError.errors || [{ message: originalError.message }],
      status: originalError.status
    }
  }
}
export class ServerErrorFromError extends ServerError {
  private originalError: {
    name: string,
    errors: any,
    status: number
  }
  constructor(originalError: any, internalLogName: string) {
    super(internalLogName, originalError.message);
    this.originalError = {
      name: originalError.name,
      errors: originalError.errors || [{ message: originalError.message }],
      status: originalError.status
    }
  }
}

export class ConfigMissingEnvVarServerError extends ServerError {
  private envVarName: string;
  constructor(internalLogName: string, internalMessage: string, envVarName: string) {
    super(internalLogName, `${internalMessage}: ${envVarName}`);
    this.envVarName = envVarName;
  }
}

export class ConfigEnvVarNotANumberServerError extends ServerError {
  private envVarName: string;
  private envVarValue: string;
  constructor(internalLogName: string, internalMessage: string, envVarName: string, envVarValue: string) {
    super(internalLogName, internalMessage);
    this.envVarName = envVarName;
    this.envVarValue = envVarValue;
  }
}
export class MigrateServerError extends ServerError {
  private collectionName: string;
  private fromVersion: number;
  private toVersion: number;
  constructor(internalLogName: string, internalMessage: string, collectionName: string, fromVersion: number, toVersion: number) {
    super(internalLogName, internalMessage);
    this.collectionName = collectionName;
    this.fromVersion = fromVersion;
    this.toVersion = toVersion;
  }
}

type ApiServerErrorResponseHeaders = {
  headerField: string,
  headerValue: string
}

export class ApiServerError extends ServerError {
  public apiStatusCode: number;
  private apiErrorId: APSErrorIds;
  private apiDescription: string;
  protected apiMeta: any;
  protected responseHeaders: Array<ApiServerErrorResponseHeaders> = [];

  constructor(internalLogName: string, internalMessage: string, apiStatusCode: number, apiErrorId: APSErrorIds, apiDescription: string, apiMeta?: any) {
    super(internalLogName, internalMessage);
    this.name = this.constructor.name;
    this.apiStatusCode = apiStatusCode;
    this.apiErrorId = apiErrorId;
    this.apiDescription = apiDescription;
    this.apiMeta = apiMeta;
  }

  public getAPSErrorHeaders = (): Array<ApiServerErrorResponseHeaders> => {
    return this.responseHeaders;
  }

  public toAPSError = (): APSError => {
    const funcName = 'toAPSError';
    const logName = `${ApiServerError.name}.${funcName}()`;
    const apsError: APSError = {
      appId: this.appId,
      errorId: this.apiErrorId,
      description: this.apiDescription,
    }
    if(this.apiMeta !== undefined) {
      // check if apiMeta is a json serializable object
      try {
        JSON.parse(JSON.stringify(this.apiMeta));
        apsError.meta = this.apiMeta;
      } catch (e: any) {
      }
    } else {
      apsError.meta = {
        message: this.message
      }
    }
    return apsError;
  }
}

export class ApiInternalServerError extends ApiServerError {
  private static internalServerErrorName = 'InternalServerError';
  protected static apiStatusCode = 500;
  protected static apiErrorId: APSErrorIds = 'internalServerError';
  protected static apiDefaultDescription = 'Internal Server Error';

  constructor(internalLogName: string, internalMessage: string, apiDescription : string = ApiInternalServerError.apiDefaultDescription, apiMeta?: any) {
    super(internalLogName, internalMessage, ApiInternalServerError.apiStatusCode, ApiInternalServerError.apiErrorId, apiDescription, apiMeta);
  }
}


export class ApiInternalServerErrorNotOperational extends ApiServerError {
  private static internalServerErrorName = 'ApiInternalServerErrorNotOperational';
  protected static apiStatusCode = 500;
  protected static apiErrorId: APSErrorIds = 'serverNotOperational';
  protected static apiDefaultDescription = 'Server Not Operational';
  private static apiMessage = 'server not operational';

  constructor(internalLogName: string) {
    const apsStatus: APSStatus = {
      isReady: ServerStatus.getStatus().isReady,
      timestamp: ServerStatus.getStatus().lastModifiedTimestamp
    }
    const meta = {
      status: apsStatus,
      // message: ApiInternalServerErrorNotOperational.apiMessage
    }
    super(internalLogName, ApiInternalServerErrorNotOperational.apiMessage, ApiInternalServerErrorNotOperational.apiStatusCode, ApiInternalServerErrorNotOperational.apiErrorId, ApiInternalServerErrorNotOperational.apiDefaultDescription, meta);
  }
}

export class ApiInternalServerErrorFromError extends ApiInternalServerError {
  private originalError: {
    name: string,
    errors: any,
    status: number
  }

  constructor(originalError: any, internalLogName: string) {
    super(internalLogName, originalError.message);
    this.originalError = {
      name: originalError.name,
      errors: originalError.errors || [{ message: originalError.message }],
      status: originalError.status
    }
  }
}

export class BootstrapErrorFromError extends ServerErrorFromError {
  protected static apiDefaultDescription = 'Bootstrap Server Error';
  private error: Error;
  constructor(error: Error, internalLogName: string, internalMessage: string) {
    super(error, internalLogName);
    this.error = error;
    this.message = internalMessage;
  }
}

export class BootstrapErrorFromApiError extends ApiInternalServerError {
  protected static apiDefaultDescription = 'Bootstrap Api Server Error';
  private apiError: ApiError;
  constructor(apiError: ApiError, internalLogName: string, internalMessage: string) {
    super(internalLogName, internalMessage, apiError.message);
    this.apiError = apiError;
  }
}

export class ApiInternalServerErrorFromMongoError extends ApiInternalServerError {
  private mongoErrorCode: number | string | undefined;
  private mongoErrorMessage: string;
  private mongoErrorLabels: Array<string>;
  private mongoErrorName: string;
  private mongoErrorErrMsg: string;

  constructor(mongoError: MongoError, internalLogName: string) {
    super(internalLogName, mongoError.message, ApiInternalServerError.apiDefaultDescription, {
      message: 'internal db error'
    });
    this.mongoErrorCode = mongoError.code;
    this.mongoErrorMessage = mongoError.message;
    this.mongoErrorLabels = mongoError.errorLabels;
    this.mongoErrorName = mongoError.name;
    this.mongoErrorErrMsg = mongoError.errmsg;
  }
}

export class ApiServerErrorFromOpenApiRequestValidatorError extends ApiServerError {
  private static apiDescription = 'OpenAPI request validation error';
  private openApiValidatorError: OpenApiValidatorHttpError;

  constructor(internalLogName: string, httpError: OpenApiValidatorHttpError, requestBody: any, requestInfo: any) {
    super(
      internalLogName, 
      ApiServerErrorFromOpenApiRequestValidatorError.name, 
      httpError.status, 
      'openApiRequestValidation', 
      ApiServerErrorFromOpenApiRequestValidatorError.apiDescription, 
      { 
        requestInfo: requestInfo,
        requestBody: requestBody,
        errors: httpError.errors,
        headers: httpError.headers
      } 
    );
    if(httpError.headers) {
      for (const [key, value] of Object.entries(httpError.headers)) {
        this.responseHeaders.push({ headerField: key, headerValue: value });
      }
    }
    this.openApiValidatorError = httpError;
  }
}

export class ApiServerErrorFromOpenApiResponseValidatorError extends ApiInternalServerError {
  private static apiDescription = 'OpenAPI response validation error';
  private openApiValidatorError: OpenApiValidatorHttpError;
  private requestInfo: any;
  private responseBody: any;

  constructor(internalLogName: string, httpError: OpenApiValidatorHttpError, responseBody: any, requestInfo: any) {
    super(
      internalLogName, 
      httpError.message,
      ApiServerErrorFromOpenApiResponseValidatorError.apiDescription,
      { errors: httpError.errors }
    );
    this.requestInfo = requestInfo;
    this.responseBody = responseBody;
    this.openApiValidatorError = httpError;
  }
}

export type TApiServerErrorMeta = {
  id: string,
  collectionName: string
}
export type TApiDuplicateKeyServerErrorMeta = TApiServerErrorMeta;
export type TApiKeyNotFoundServerErrorMeta = TApiServerErrorMeta;
export type TApiObjectNotFoundServerErrorMeta = {
  filter: Record<string, unknown>,
  collectionName: string
}
export type TApiNotAuthorizedServerErrorMeta = {
  userId: string
}

export class ApiDuplicateKeyServerError extends ApiServerError {
  private static apiStatusCode = 422;
  private static apiErrorId: APSErrorIds = 'duplicateKey';
  private static apiDefaultDescription = 'document already exists';

  constructor(internalLogName: string, apiDescription: string = ApiDuplicateKeyServerError.apiDefaultDescription, apiMeta: TApiDuplicateKeyServerErrorMeta) {
    super(internalLogName, ApiDuplicateKeyServerError.name, ApiDuplicateKeyServerError.apiStatusCode, ApiDuplicateKeyServerError.apiErrorId, apiDescription, apiMeta);
  }
}

export class ApiKeyNotFoundServerError extends ApiServerError {
  private static apiStatusCode = 404;
  private static apiErrorId: APSErrorIds = 'keyNotFound';
  private static apiDefaultDescription = 'document does not exist';

  constructor(internalLogName: string, apiDescription: string = ApiKeyNotFoundServerError.apiDefaultDescription, apiMeta: TApiKeyNotFoundServerErrorMeta) {
    super(internalLogName, ApiKeyNotFoundServerError.name, ApiKeyNotFoundServerError.apiStatusCode, ApiKeyNotFoundServerError.apiErrorId, apiDescription, apiMeta);
  }
}

export class ApiObjectNotFoundServerError extends ApiServerError {
  private static apiStatusCode = 404;
  private static apiErrorId: APSErrorIds = 'objectNotFound';
  private static apiDefaultDescription = 'object not found';

  constructor(internalLogName: string, apiDescription: string = ApiObjectNotFoundServerError.apiDefaultDescription, apiMeta: TApiObjectNotFoundServerErrorMeta) {
    super(internalLogName, ApiObjectNotFoundServerError.name, ApiObjectNotFoundServerError.apiStatusCode, ApiObjectNotFoundServerError.apiErrorId, apiDescription, apiMeta);
  }
}

export type TApiMissingParameterServerErrorMeta = {
  parameter: string
}

export class ApiMissingParameterServerError extends ApiServerError {
  private static apiStatusCode = 400;
  private static apiErrorId: APSErrorIds = 'missingParameter';
  private static apiDefaultDescription = 'missing paramter';

  constructor(internalLogName: string, apiDescription: string = ApiMissingParameterServerError.apiDefaultDescription, apiMeta: TApiMissingParameterServerErrorMeta) {
    super(internalLogName, ApiMissingParameterServerError.name, ApiMissingParameterServerError.apiStatusCode, ApiMissingParameterServerError.apiErrorId, apiDescription, apiMeta);
  }
}

export type TApiBadSortFieldNameServerErrorrMeta = {
  sortFieldName: string,
  apsObjectName: string
}

export class ApiBadSortFieldNameServerError extends ApiServerError {
  private static apiStatusCode = 400;
  private static apiErrorId: APSErrorIds = 'invalidSortFieldName';
  private static apiDefaultDescription = 'invalid sortFieldName';

  constructor(internalLogName: string, apiDescription: string = ApiBadSortFieldNameServerError.apiDefaultDescription, apiMeta: TApiBadSortFieldNameServerErrorrMeta) {
    super(internalLogName, ApiBadSortFieldNameServerError.name, ApiBadSortFieldNameServerError.apiStatusCode, ApiBadSortFieldNameServerError.apiErrorId, apiDescription, apiMeta);
  }
}

export type ApiBadQueryParameterCombinationServerErrorMeta = {
  invalidQueryParameterCombinationList: Array<string>,
  apsObjectName: string
}
export class ApiBadQueryParameterCombinationServerError extends ApiServerError {
  private static apiStatusCode = 400;
  private static apiErrorId: APSErrorIds = 'invalidQueryParameterCombination';
  private static apiDefaultDescription = 'invalid query parameter combination';

  constructor(internalLogName: string, apiDescription: string = ApiBadQueryParameterCombinationServerError.apiDefaultDescription, apiMeta: ApiBadQueryParameterCombinationServerErrorMeta) {
    super(internalLogName, ApiBadQueryParameterCombinationServerError.name, ApiBadQueryParameterCombinationServerError.apiStatusCode, ApiBadQueryParameterCombinationServerError.apiErrorId, apiDescription, apiMeta);
  }
}

export class ApiNotAuthorizedServerError extends ApiServerError {
  private static apiStatusCode = 401;
  private static apiErrorId: APSErrorIds = 'notAuthorized';
  private static apiDefaultDescription = 'not authorized';

  constructor(internalLogName: string, apiDescription: string = ApiNotAuthorizedServerError.apiDefaultDescription, apiMeta: TApiNotAuthorizedServerErrorMeta) {
    super(internalLogName, ApiNotAuthorizedServerError.name, ApiNotAuthorizedServerError.apiStatusCode, ApiNotAuthorizedServerError.apiErrorId, apiDescription, apiMeta);
  }
}

export type TApiPathNotFoundServerErrorMeta = {
  path: string
}

export class ApiPathNotFoundServerError extends ApiServerError {
  private static apiStatusCode = 404;
  private static apiErrorId: APSErrorIds = 'pathNotFound';
  private static apiDefaultDescription = 'path does not exist';

  constructor(internalLogName: string, apiDescription: string = ApiPathNotFoundServerError.apiDefaultDescription, apiMeta: TApiPathNotFoundServerErrorMeta) {
    super(internalLogName, ApiPathNotFoundServerError.name, ApiPathNotFoundServerError.apiStatusCode, ApiPathNotFoundServerError.apiErrorId, apiDescription, apiMeta);
  }  
}
