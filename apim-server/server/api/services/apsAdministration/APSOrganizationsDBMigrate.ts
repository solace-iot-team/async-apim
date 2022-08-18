import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { TMongoAllReturn } from '../../../common/MongoPersistenceService';
import { 
  APSUserCreate,
 } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import { ApiDuplicateKeyServerError, MigrateServerError } from '../../../common/ServerError';
import { APSOrganizationsService } from './APSOrganizationsService';
import APSUsersService from '../APSUsersService/APSUsersService';

// capture all the schema versions over time here
export type APSOrganization_v0 = {
  organizationId: string;
  displayName: string;
}
export type APSOrganization_DB_v0 = APSOrganization_v0 & {
  _id: string;
}
export type APSOrganization_v1 = {
  organizationId: string;
  displayName: string;
  maxNumApisPerApiProduct: number;
  appCredentialsExpiryDuration: number;
}
export type APSOrganization_DB_v1 = APSOrganization_v1 & {
  _id: string;
}
export type APSOrganization_v2 = {
  organizationId: string;
  displayName: string;
  assetIncVersionStrategy: string;
  maxNumEnvsPerApiProduct: number;
  maxNumApisPerApiProduct: number;
  appCredentialsExpiryDuration: number;
}
export type APSOrganization_DB_v2 = APSOrganization_v2 & {
  _id: string;
}

export class APSOrganizationsDBMigrate {

  public static migrate = async(apsOrganizationsService: APSOrganizationsService): Promise<number> => {
    const funcName = 'migrate';
    const logName = `${APSOrganizationsDBMigrate.name}.${funcName}()`;
    const targetDBSchemaVersion = apsOrganizationsService.getDBObjectSchemaVersion();

    if(targetDBSchemaVersion === 0) {
      await APSOrganizationsDBMigrate.migrate_None_to_0(apsOrganizationsService);
    }

    // now migrate each org
    const currentDBRawOrgListToMigrate = await apsOrganizationsService.getPersistenceService().allRawLessThanTargetSchemaVersion(targetDBSchemaVersion);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'migrating orgs', details: { 
      targetDBSchemaVersion: targetDBSchemaVersion,
      currentDBRawUserListToMigrate: currentDBRawOrgListToMigrate
    }}));

    for(let currentDBRawOrg of currentDBRawOrgListToMigrate) {
      let currentDBSchemaVersion = currentDBRawOrg._schemaVersion ? currentDBRawOrg._schemaVersion : 0;
      if(currentDBSchemaVersion === 0) {
        currentDBRawOrg = await APSOrganizationsDBMigrate.migrate_0_to_1(apsOrganizationsService, currentDBRawOrg);
        currentDBSchemaVersion = 1;
      }
      if(currentDBSchemaVersion === 1) {
        currentDBRawOrg = await APSOrganizationsDBMigrate.migrate_1_to_2(apsOrganizationsService, currentDBRawOrg);
        currentDBSchemaVersion = 2;
      }
      // next one here

    }

    return currentDBRawOrgListToMigrate.length;
  }

  private static migrate_1_to_2 = async(apsOrganizationsService: APSOrganizationsService, dbOrg_1: APSOrganization_DB_v1): Promise<APSOrganization_DB_v2> => {
    const funcName = 'migrate_1_to_2';
    const logName = `${APSOrganizationsDBMigrate.name}.${funcName}()`;

    const newSchemaVersion = 2;
    const orgId = dbOrg_1.organizationId;

    const dbOrg_2: APSOrganization_DB_v2 = {
      ...dbOrg_1,
      assetIncVersionStrategy: apsOrganizationsService.get_DefaultAssetIncVersionStrategy(),
      maxNumEnvsPerApiProduct: apsOrganizationsService.get_DefaultMaxNumEnvs_Per_ApiProduct(),
    }

    const replaced = await apsOrganizationsService.getPersistenceService().replace({
      collectionDocumentId: orgId,
      collectionDocument: dbOrg_2,
      collectionSchemaVersion: newSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'replaced', details: { 
      APSOrganization_DB_2: replaced,
    }}));  

    const newRawDBDocument = await apsOrganizationsService.getPersistenceService().byIdRaw({
      documentId: orgId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, details: {
      APSOrganization_DB_1: dbOrg_1,
      APSOrganization_DB_2: newRawDBDocument
    }}));
    return newRawDBDocument;
  }

  private static migrate_0_to_1 = async(apsOrganizationsService: APSOrganizationsService, dbOrg_0: APSOrganization_DB_v0): Promise<APSOrganization_DB_v1> => {
    const funcName = 'migrate_0_to_1';
    const logName = `${APSOrganizationsDBMigrate.name}.${funcName}()`;

    const newSchemaVersion = 1;
    const orgId = dbOrg_0.organizationId;

    const dbOrg_1: APSOrganization_DB_v1 = {
      ...dbOrg_0,
      appCredentialsExpiryDuration: apsOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),
      maxNumApisPerApiProduct: apsOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),
    }

    const replaced = await apsOrganizationsService.getPersistenceService().replace({
      collectionDocumentId: orgId,
      collectionDocument: dbOrg_1,
      collectionSchemaVersion: newSchemaVersion
    })

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'replaced', details: { 
      APSOrganization_DB_1: replaced,
    }}));  

    const newRawDBDocument = await apsOrganizationsService.getPersistenceService().byIdRaw({
      documentId: orgId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, details: {
      APSOrganization_DB_0: dbOrg_0,
      APSOrganization_DB_1: newRawDBDocument
    }}));
    return newRawDBDocument;
  }

  private static migrate_None_to_0 = async(apsOrganizationsService: APSOrganizationsService): Promise<void> => {
    const funcName = 'migrate_None_to_0';
    const logName = `${APSOrganizationsDBMigrate.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'creating orgs for users', details: { 
      targetDBSchemaVersion: 0,
    }}));

    // get all users and create orgs they are members of
    const userOrgList: Array<APSOrganization_v1> = [];
    const res: TMongoAllReturn = await APSUsersService.getPersistenceService().all({});
    for (const apsDoc of res.documentList) {
      const apsUser: APSUserCreate = apsDoc as APSUserCreate;
      if(apsUser.memberOfOrganizations !== undefined) {
        for(const memberOfOrganization of apsUser.memberOfOrganizations) {
          const found = userOrgList.find( (x) => {
            return x.organizationId === memberOfOrganization.organizationId;
          });
          if(found === undefined) {
            const apsOrganization: APSOrganization_v1 = {
              organizationId: memberOfOrganization.organizationId,
              displayName: memberOfOrganization.organizationId,
              maxNumApisPerApiProduct: apsOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),
              appCredentialsExpiryDuration: apsOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
            };
            userOrgList.push(apsOrganization);
          }
        }
      }
    }
    // create orgs 
    let numOrgsCreated = 0;
    for(const org of userOrgList) {
      try {
        const created = await apsOrganizationsService.getPersistenceService().create({
          collectionDocumentId: org.organizationId,
          collectionDocument: org,
          collectionSchemaVersion: 0
        });
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'created org', details: { 
          organization: created
        }}));      
        numOrgsCreated++;
      } catch(e) {
        if( ! (e instanceof ApiDuplicateKeyServerError)) {
          throw new MigrateServerError(logName, 'create organization failed', apsOrganizationsService.getCollectionName(), 0, 0);            
        }
      }
    }
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, message: 'creating orgs for users', details: { 
      targetDBSchemaVersion: 0,
      numOrgsCreated: numOrgsCreated
    }}));
  }


}
