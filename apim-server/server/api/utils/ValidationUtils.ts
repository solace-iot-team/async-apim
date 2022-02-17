
import { ApiKeyNotFoundServerError, OrganizationNotFoundServerError } from '../../common/ServerError';
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import APSOrganizationsService from '../services/apsAdministration/APSOrganizationsService';

export class ValidationUtils {

  public static validateOrganization = async(callerLogName: string, apsOrganizationId: string): Promise<void> => {
    const funcName = 'validateOrganization';
    const logName = `${callerLogName}:${ValidationUtils.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATE, message: 'validating organization exists', details: {
      apsOrganizationId: apsOrganizationId,
    }}));

    try {
      await APSOrganizationsService.byId(apsOrganizationId);
    } catch(e) {
      // re-write error
      if(e instanceof ApiKeyNotFoundServerError) {
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATION_ERROR, message: 'organization does not exist', details: {
          apsOrganizationId: apsOrganizationId,
        }}));    
        throw new OrganizationNotFoundServerError(logName, undefined, { organizationId: apsOrganizationId });
      }
      else throw e;
    }
  }

}