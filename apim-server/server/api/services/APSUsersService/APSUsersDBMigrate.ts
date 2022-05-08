import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { MongoPersistenceService } from '../../../common/MongoPersistenceService';
import { 
  APSOrganizationAuthRoleList,
  APSOrganizationRoles,
  APSSystemAuthRoleList,
  APSUserCreate,
  EAPSOrganizationAuthRole,
  EAPSSystemAuthRole,
 } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import { APSUsersService } from './APSUsersService';

// capture all the schema versions over time here
// Version: 0
export type APSUserProfile_DB_0 = {
  first: string;
  last: string;
  email: string;
}
export type APSUser_DB_0 = {
  _id: string;
  isActivated: boolean;
  userId: string;
  password: string;
  profile: APSUserProfile_DB_0;
  roles: Array<string>;
  memberOfOrganizations?: Array<string>;
}
// Version: 1
export type APSOrganizationRoles_DB_1 = {
  organizationId: string;
  roles: Array<string>;
}
export type APSUser_DB_1 = {
  _id: string;
  isActivated: boolean;
  userId: string;
  password: string;
  profile: any;
  systemRoles: Array<string>;
  memberOfOrganizations?: Array<APSOrganizationRoles_DB_1>;
}

// * Schema 2 *
export type EAPSBusinessGroupAuthRole_DB_2 = "loginAs" | "organizationAdmin" | "apiTeam" | "apiConsumer";
export type APSMemberOfBusinessGroup_DB_2 = {
  businessGroupId: string;
  roles: Array<string>;
}
export type APSMemberOfOrganizationGroups_DB_2 = {
  organizationId: string;
  memberOfBusinessGroupList: Array<APSMemberOfBusinessGroup_DB_2>;
}
export type APSUser_DB_2 = {
  _id: string;
  _schemaVersion: number;
  isActivated: boolean;
  userId: string;
  password: string;
  profile: any;
  systemRoles: Array<string>;
  memberOfOrganizations?: Array<APSOrganizationRoles_DB_1>;
  memberOfOrganizationGroups?: Array<APSMemberOfOrganizationGroups_DB_2>;
}
// * Schema 3 *
export type EAPSBusinessGroupAuthRole_DB_3 = "organizationAdmin" | "apiTeam" | "apiConsumer";
export type APSUser_DB_3 = {
  _id: string;
  _schemaVersion: number;
  isActivated: boolean;
  userId: string;
  password: string;
  profile: any;
  systemRoles: Array<string>;
  memberOfOrganizations?: Array<APSOrganizationRoles_DB_1>;
  memberOfOrganizationGroups?: Array<APSMemberOfOrganizationGroups_DB_2>;
}

// * Schema 4 *
export type APSRefreshTokenInternal = {
  refreshToken: string;
}
export type APSRefreshTokenInternalList = Array<APSRefreshTokenInternal>;
export type APSUser_DB_4 = APSUser_DB_3 & {
  refreshTokenList: APSRefreshTokenInternalList;
}

export class APSUsersDBMigrate {

  public static migrate = async(apsUsersService: APSUsersService): Promise<number> => {
    const funcName = 'migrate';
    const logName = `${APSUsersDBMigrate.name}.${funcName}()`;
    const targetDBSchemaVersion = apsUsersService.getDBObjectSchemaVersion();

    const currentDBRawUserListToMigrate = await apsUsersService.getPersistenceService().allRawLessThanTargetSchemaVersion(targetDBSchemaVersion);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'migrating users', details: { 
      targetDBSchemaVersion: targetDBSchemaVersion,
      currentDBRawUserListToMigrate: currentDBRawUserListToMigrate 
    }}));
    for(let currentDBRawUser of currentDBRawUserListToMigrate) {
      let currentDBSchemaVersion = currentDBRawUser._schemaVersion ? currentDBRawUser._schemaVersion : 0;
      if(currentDBSchemaVersion === 0) {
        currentDBRawUser = await APSUsersDBMigrate.migrate_0_to_1(apsUsersService.getPersistenceService(), currentDBRawUser);
        currentDBSchemaVersion = 1;
      }
      if(currentDBSchemaVersion === 1) {
        currentDBRawUser = await APSUsersDBMigrate.migrate_1_to_2(apsUsersService.getPersistenceService(), currentDBRawUser);
        currentDBSchemaVersion = 2;
      }
      if(currentDBSchemaVersion === 2) {
        currentDBRawUser = await APSUsersDBMigrate.migrate_2_to_3(apsUsersService.getPersistenceService(), currentDBRawUser);
        currentDBSchemaVersion = 3;
      }
      if(currentDBSchemaVersion === 3) {
        currentDBRawUser = await APSUsersDBMigrate.migrate_3_to_4(apsUsersService.getPersistenceService(), currentDBRawUser);
        currentDBSchemaVersion = 4;
      }
    }
    const allDBRawUserList = await apsUsersService.getPersistenceService().allRawLessThanTargetSchemaVersion(targetDBSchemaVersion + 1);
    for(const dbRawUser of allDBRawUserList) {
      // adjust roles regardless of schema version
      await APSUsersDBMigrate.update_roles(apsUsersService, dbRawUser);
    }

    return currentDBRawUserListToMigrate.length;
  }

  /**
   * Remove role=loginAs from all users
   * @param persistenceService 
   * @param dbUser_1 
   * @returns 
   */
  private static update_roles = async(apsUsersService: APSUsersService, dbUser: APSUser_DB_3): Promise<APSUser_DB_3> => {
    const funcName = 'update_roles';
    const logName = `${APSUsersService.name}.${funcName}()`;

    const userId = dbUser.userId;

    // remove loginAs from systemRoles
    if(dbUser.systemRoles !== undefined) {
      for(let idx=0; idx < dbUser.systemRoles.length; idx++) {
        if(dbUser.systemRoles[idx] === 'loginAs') {
          dbUser.systemRoles.splice(idx, 1);
          idx--;
        }
      }  
      const dbUser_3: APSUser_DB_3 = {
        ...dbUser,
      }
      const replaced: APSUserCreate = await apsUsersService.getPersistenceService().replace({
        collectionDocumentId: userId, 
        collectionDocument: dbUser_3, 
        collectionSchemaVersion: apsUsersService.getDBObjectSchemaVersion()
      });
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'replaced', details: { 
        apsUser: replaced,
      }}));  
    }
    
    if(dbUser.memberOfOrganizations !== undefined) {
      const memberOfOrganizationGroupsList: Array<APSMemberOfOrganizationGroups_DB_2> = [];
      for(const apsOrganizationRoles_DB_1 of dbUser.memberOfOrganizations) {
        // remove loginAs from organization roles
        for(let idx=0; idx < apsOrganizationRoles_DB_1.roles.length; idx++) {
          if(apsOrganizationRoles_DB_1.roles[idx] === 'loginAs') {
            apsOrganizationRoles_DB_1.roles.splice(idx, 1);
            idx--;
          }
        }
        const memberOfBusinessGroup: APSMemberOfBusinessGroup_DB_2 = {
          businessGroupId: apsOrganizationRoles_DB_1.organizationId,
          roles: apsOrganizationRoles_DB_1.roles
        }
        const memberOfOrganizationGroups: APSMemberOfOrganizationGroups_DB_2 = {
          organizationId: apsOrganizationRoles_DB_1.organizationId,
          memberOfBusinessGroupList: [memberOfBusinessGroup]          
        }
        memberOfOrganizationGroupsList.push(memberOfOrganizationGroups);
      }
      const dbUser_3: APSUser_DB_3 = {
        ...dbUser,
        memberOfOrganizationGroups: memberOfOrganizationGroupsList
      }
      const replaced: APSUserCreate = await apsUsersService.getPersistenceService().replace({
        collectionDocumentId: userId, 
        collectionDocument: dbUser_3, 
        collectionSchemaVersion: apsUsersService.getDBObjectSchemaVersion()
      });
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'replaced', details: { 
        apsUser: replaced,
      }}));  
    }

    const newRawDBDocument = await apsUsersService.getPersistenceService().byIdRaw({
      documentId: userId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, details: {
      old_dbUser: dbUser,
      new_dbUser: newRawDBDocument
    }}));
    return newRawDBDocument;
  }

  private static migrate_3_to_4 = async(persistenceService: MongoPersistenceService, dbUser_3: APSUser_DB_3): Promise<APSUser_DB_4> => {
    const funcName = 'migrate_3_to_4';
    const logName = `${APSUsersService.name}.${funcName}()`;

    const newSchemaVersion = 3;
    const userId = dbUser_3.userId;

    const dbUser_4: APSUser_DB_4 = {
      ...dbUser_3,
      _schemaVersion: newSchemaVersion,
      refreshTokenList: [],
    }
    const replaced: APSUser_DB_4 = await persistenceService.replace({
      collectionDocumentId: userId, 
      collectionDocument: dbUser_4, 
      collectionSchemaVersion: newSchemaVersion
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'replaced', details: { 
      apsUser: replaced,
    }}));  

    const newRawDBDocument = await persistenceService.byIdRaw({
      documentId: userId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, details: {
      dbUser_3: dbUser_3,
      dbUser_4: newRawDBDocument
    }}));
    return newRawDBDocument;
  }

  private static migrate_2_to_3 = async(persistenceService: MongoPersistenceService, dbUser_2: APSUser_DB_2): Promise<APSUser_DB_3> => {
    const funcName = 'migrate_2_to_3';
    const logName = `${APSUsersService.name}.${funcName}()`;

    const newSchemaVersion = 3;
    const userId = dbUser_2.userId;

    const dbUser_3: APSUser_DB_3 = {
      ...dbUser_2,
      _schemaVersion: newSchemaVersion,
    }
    const replaced: APSUserCreate = await persistenceService.replace({
      collectionDocumentId: userId, 
      collectionDocument: dbUser_3, 
      collectionSchemaVersion: newSchemaVersion
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'replaced', details: { 
      apsUser: replaced,
    }}));  

    const newRawDBDocument = await persistenceService.byIdRaw({
      documentId: userId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, details: {
      dbUser_2: dbUser_2,
      dbUser_3: newRawDBDocument
    }}));
    return newRawDBDocument;
  }

  private static migrate_1_to_2 = async(persistenceService: MongoPersistenceService, dbUser_1: APSUser_DB_1): Promise<APSUser_DB_2> => {
    const funcName = 'migrate_1_to_2';
    const logName = `${APSUsersService.name}.${funcName}()`;

    const newSchemaVersion = 2;
    const userId = dbUser_1.userId;

    if(dbUser_1.memberOfOrganizations !== undefined) {
      const memberOfOrganizationGroupsList: Array<APSMemberOfOrganizationGroups_DB_2> = [];
      for(const apsOrganizationRoles_DB_1 of dbUser_1.memberOfOrganizations) {
        const memberOfBusinessGroup: APSMemberOfBusinessGroup_DB_2 = {
          businessGroupId: apsOrganizationRoles_DB_1.organizationId,
          roles: apsOrganizationRoles_DB_1.roles
        }
        const memberOfOrganizationGroups: APSMemberOfOrganizationGroups_DB_2 = {
          organizationId: apsOrganizationRoles_DB_1.organizationId,
          memberOfBusinessGroupList: [memberOfBusinessGroup]          
        }
        memberOfOrganizationGroupsList.push(memberOfOrganizationGroups);
      }
      const dbUser_2: APSUser_DB_2 = {
        ...dbUser_1,
        _schemaVersion: newSchemaVersion,
        memberOfOrganizationGroups: memberOfOrganizationGroupsList
      }
      const replaced: APSUserCreate = await persistenceService.replace({
        collectionDocumentId: userId, 
        collectionDocument: dbUser_2, 
        collectionSchemaVersion: newSchemaVersion
      });
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'replaced', details: { 
        apsUser: replaced,
      }}));  
    }
    const newRawDBDocument = await persistenceService.byIdRaw({
      documentId: userId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, details: {
      dbUser_1: dbUser_1,
      dbUser_2: newRawDBDocument
    }}));
    return newRawDBDocument;
  }


  private static migrate_0_to_1 = async(persistenceService: MongoPersistenceService, dbUser_0: APSUser_DB_0): Promise<APSUser_DB_1> => {
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
      collectionDocumentId: dbUser_1.userId, 
      collectionDocument: dbUser_1, 
      collectionSchemaVersion: 1
    });
    const newRawDBDocument = await persistenceService.byIdRaw({
      documentId: dbUser_1.userId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, details: {
      newRawDBDocument: newRawDBDocument,
    } }));
    return newRawDBDocument;
  }


}
