import { ApiInternalServerError } from '../../common/ServerError';
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';

export class ControllerUtils {

  public static getParamValue<T>(logName: string, params: T, name: keyof T): string {
    const value = params[name];
    if(value === undefined) {
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.API_SERVICE_ERROR, message: 'parameter undefined, probably mismatch with router', details: {
        requiredParameter: name,
        receivedParameters: params
      }}));
      throw new ApiInternalServerError(logName, 'api resource not operational');
    }
    return (value ? String(value) : 'not_found');
  }
  
  public static getParamName<T>(name: keyof T): string {
    return String(name);
  }
  
}