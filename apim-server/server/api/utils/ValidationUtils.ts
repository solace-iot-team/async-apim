
import { ApiKeyNotFoundServerError, ApiOrganizationNotFoundServerError } from '../../common/ServerError';
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import APSOrganizationsService from '../services/apsAdministration/APSOrganizationsService';

export class ValidationUtils {

  public static validateOrganization = async(callerLogName: string, apsOrganizationId: string): Promise<void> => {
    const funcName = 'validateOrganization';
    const logName = `${callerLogName}:${ValidationUtils.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATING_EXISTENCE, message: 'apsOrganizationId', details: {
      apsOrganizationId: apsOrganizationId,
    }}));

    try {
      await APSOrganizationsService.byId(apsOrganizationId);
    } catch(e) {
      // re-write error
      if(e instanceof ApiKeyNotFoundServerError) {
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATE_EXISTENCE_ERROR, message: 'apsOrganizationId', details: {
          apsOrganizationId: apsOrganizationId,
        }}));    
        throw new ApiOrganizationNotFoundServerError(logName, undefined, { organizationId: apsOrganizationId });
      }
      else throw e;
    }
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATED_EXISTENCE, message: 'apsOrganizationId', details: {
      apsOrganizationId: apsOrganizationId,
    }}));
  }

}