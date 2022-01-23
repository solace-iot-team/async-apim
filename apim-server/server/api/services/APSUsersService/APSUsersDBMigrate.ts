import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { MongoPersistenceService, TMongoAllReturn, TMongoPagingInfo, TMongoSearchInfo, TMongoSortInfo } from '../../../common/MongoPersistenceService';
import { TApiPagingInfo, TApiSearchInfo, TApiSortInfo } from '../../utils/ApiQueryHelper';
import ServerConfig, { TRootUserConfig } from '../../../common/ServerConfig';
import { ServerUtils } from '../../../common/ServerUtils';
import { 
  ApiError,
  APSOrganizationAuthRoleList,
  APSOrganizationRoles,
  APSSystemAuthRoleList,
  APSUserList,
  APSUserProfile,
  ApsUsersService,
  EAPSOrganizationAuthRole,
  EAPSSystemAuthRole,
 } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import { ApiInternalServerErrorFromError, ApiKeyNotFoundServerError, BootstrapErrorFromApiError, BootstrapErrorFromError, MigrateServerError } from '../../../common/ServerError';
import { APSUsersService } from './APSUsersService';

// capture all the schema versions over time here
// Version: 0
type APSUserProfile_DB_0 = {
  first: string;
  last: string;
  email: string;
}
type APSUser_DB_0 = {
  _id: string;
  isActivated: boolean;
  userId: string;
  password: string;
  profile: APSUserProfile_DB_0;
  roles: Array<string>;
  memberOfOrganizations?: Array<string>;
}
// Version: 1
type APSOrganizationRoles_DB_1 = {
  organizationId: string;
  roles: Array<string>;
}
type APSUser_DB_1 = {
  _id: string;
  _schemaVersion: number;
  isActivated: boolean;
  userId: string;
  password: string;
  profile: any;
  systemRoles: Array<string>;
  memberOfOrganizations?: Array<APSOrganizationRoles_DB_1>;
}

export class APSUsersDBMigrate {

  public static migrate = async(apsUsersService: APSUsersService): Promise<void> => {
    const funcName = 'migrate';
    const logName = `${APSUsersDBMigrate.name}.${funcName}()`;
    const targetDBSchemaVersion = apsUsersService.getDBObjectSchemaVersion();

    const currentDBRawUserListToMigrate = await apsUsersService.getPersistenceService().allRawLessThanTargetSchemaVersion(targetDBSchemaVersion);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'migrating users', details: { 
      targetDBSchemaVersion: targetDBSchemaVersion,
      currentDBRawUserListToMigrate: currentDBRawUserListToMigrate 
    }}));
    for(const currentDBRawUser of currentDBRawUserListToMigrate) {
      const currentDBSchemaVersion = currentDBRawUser._schemaVersion ? currentDBRawUser._schemaVersion : 0;
      if(targetDBSchemaVersion === 1) {
        if(currentDBSchemaVersion === 0) await APSUsersDBMigrate.migrate_0_to_1(apsUsersService.getPersistenceService(), currentDBRawUser);
        else throw new MigrateServerError(logName, 'no migration path for schema versions found', apsUsersService.getCollectionName(), currentDBSchemaVersion, targetDBSchemaVersion);
      }
    }    
  }

  private static migrate_0_to_1 = async(persistenceService: MongoPersistenceService, dbUser_0: APSUser_DB_0): Promise<void> => {
    const funcName = 'migrate_0_to_1';
    const logName = `${APSUsersService.name}.${funcName}()`;

    const oldRoles: Array<string> = dbUser_0.roles ? dbUser_0.roles : [];
    const newOrgRolesValueList = Object.values(EAPSOrganizationAuthRole) as Array<string>;
    const newOrgRoles: APSOrganizationAuthRoleList = [];
    const newSystemRoles: APSSystemAuthRoleList = [];
    const newSystemRolesValueList = Object.values(EAPSSystemAuthRole) as Array<string>;
    for(const oldRole of oldRoles) {
      if(newOrgRolesValueList.includes(oldRole)) newOrgRoles.push(oldRole as EAPSOrganizationAuthRole);
      if(newSystemRolesValueList.includes(oldRole)) newSystemRoles.push(oldRole as EAPSSystemAuthRole);
    }
    const newMemberOfOrganizations: Array<APSOrganizationRoles> = [];
    if(dbUser_0.memberOfOrganizations !== undefined) {
      for(const orgId of dbUser_0.memberOfOrganizations) {
        const orgRole: APSOrganizationRoles = {
          organizationId: orgId,
          roles: newOrgRoles
        }
        newMemberOfOrganizations.push(orgRole);
      }
    }

    const dbUser_1: APSUser_DB_1 = {
      _id: dbUser_0._id,
      _schemaVersion: 1,
      isActivated: dbUser_0.isActivated,
      userId: dbUser_0.userId,
      password: dbUser_0.password,
      profile: dbUser_0.profile,
      systemRoles: newSystemRoles,
      memberOfOrganizations: newMemberOfOrganizations
    }

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, details: {
      dbUser_0: dbUser_0,
      dbUser_1: dbUser_1
    } }));

    await persistenceService.replace({
      documentId: dbUser_1.userId, 
      document: dbUser_1, 
      schemaVersion: 1
    });
    const newRawDBDocument = await persistenceService.byIdRaw(dbUser_1.userId);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, details: {
      newRawDBDocument: newRawDBDocument,
    } }));
  }


}
