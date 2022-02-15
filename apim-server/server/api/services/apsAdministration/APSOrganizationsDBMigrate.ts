import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { TMongoAllReturn } from '../../../common/MongoPersistenceService';
import { 
  APSOrganizationList, APSUser,
 } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import { ApiDuplicateKeyServerError, MigrateServerError } from '../../../common/ServerError';
import { APSOrganizationsService } from './APSOrganizationsService';
import APSUsersService from '../APSUsersService/APSUsersService';

// capture all the schema versions over time here
// Version: 0
export type APSOrganization_DB_0 = {
  organizationId: string;
  displayName: string;
}

export class APSOrganizationsDBMigrate {

  public static migrate = async(apsOrganizationsService: APSOrganizationsService): Promise<number> => {
    const funcName = 'migrate';
    const logName = `${APSOrganizationsDBMigrate.name}.${funcName}()`;
    const targetDBSchemaVersion = apsOrganizationsService.getDBObjectSchemaVersion();

    if(targetDBSchemaVersion === 0) {
      // get all users and create orgs they are members of
      const userOrgList: APSOrganizationList = [];
      const res: TMongoAllReturn = await APSUsersService.getPersistenceService().all({});
      for (const apsDoc of res.documentList) {
        const apsUser: APSUser = apsDoc as APSUser;
        if(apsUser.memberOfOrganizations !== undefined) {
          for(const memberOfOrganization of apsUser.memberOfOrganizations) {
            const found = userOrgList.find( (x) => {
              return x.organizationId === memberOfOrganization.organizationId;
            });
            if(found === undefined) userOrgList.push({ organizationId: memberOfOrganization.organizationId, displayName: memberOfOrganization.organizationId })
          }
        }
      }
      // create orgs 
      let numOrgsCreated = 0;
      for(const org of userOrgList) {
        try {
          await apsOrganizationsService.create(org);
          ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'created org', details: { 
            organization: org
          }}));      
          numOrgsCreated++;
        } catch(e) {
          if( ! (e instanceof ApiDuplicateKeyServerError)) {
            throw new MigrateServerError(logName, 'create organization failed', apsOrganizationsService.getCollectionName(), targetDBSchemaVersion, targetDBSchemaVersion);            
          }
        }
      }
      return numOrgsCreated;
    }
    return  0;
  }

}
