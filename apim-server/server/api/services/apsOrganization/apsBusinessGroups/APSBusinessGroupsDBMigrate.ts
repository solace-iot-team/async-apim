import { 
  APSBusinessGroupCreate, 
  APSBusinessGroupResponse, 
  APSBusinessGroupResponseList, 
  APSOrganizationList, 
  ListAPSBusinessGroupsResponse, 
  ListAPSOrganizationResponse
 } from '../../../../../src/@solace-iot-team/apim-server-openapi-node';
import { EServerStatusCodes, ServerLogger } from '../../../../common/ServerLogger';
import { APSOptional } from '../../../../common/ServerUtils';
import APSOrganizationsService from '../../apsAdministration/APSOrganizationsService';
import { APSBusinessGroupsService } from './APSBusinessGroupsService';

// capture all the schema versions over time here
// Version: 1
export type APSBusinessGroup_ExternalReferene_DB_1 = {
  externalId: string;
  externalDisplayName: string;
  externalSystemId: string;
  externalSystemDisplayName: string;
}
export type APSBusinessGroup_DB_1 = {
  _id: string;
  _schemaVersion: number;
  _organizationId: string;
  businessGroupId: string;
  businessGroupDisplayName: string;
  businessGroupParentId: string;
  ownerId: string;
  externalReference: APSBusinessGroup_ExternalReferene_DB_1;
}

export class APSBusinessGroupsDBMigrate {

  private static initializeRootGroups4AllOrgs = async(apsBusinessGroupsService: APSBusinessGroupsService): Promise<void> => {
    const funcName = 'initializeRootGroups4AllOrgs';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'create root business group for all orgs (backwards compatibility)' }));
    const listResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const list: APSOrganizationList = listResponse.list;
    for(const apsOrganization of list) {
      try {
        await apsBusinessGroupsService.byId({
          apsOrganizationId: apsOrganization.organizationId,
          apsBusinessGroupId: apsOrganization.organizationId
        });
      } catch(e) {
        // not found
        const create: APSOptional<APSBusinessGroupCreate, 'businessGroupParentId'> = {
          businessGroupId: apsOrganization.organizationId,
          description: `Root for ${apsOrganization.displayName}`,
          displayName: apsOrganization.displayName,
        };
        const created: APSBusinessGroupResponse = await apsBusinessGroupsService._create({
          apsOrganizationId: apsOrganization.organizationId,
          apsBusinessGroupCreate: create
        });      
        ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'APSBusinessGroupResponse', details: { created: created} }));
      }
    }
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, message: 'created root business group for all orgs (backwards compatibility)' }));
  }

  private static migrateParentLessGroupsToRootParent = async(apsBusinessGroupsService: APSBusinessGroupsService): Promise<void> => {
    const funcName = 'migrateParentLessGroupsToRootParent';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING, message: 'migrate all parent less groups to root group as parent' }));
    const listResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const list: APSOrganizationList = listResponse.list;
    for(const apsOrganization of list) {
      const groupResponse: ListAPSBusinessGroupsResponse = await apsBusinessGroupsService.all({ apsOrganizationId: apsOrganization.organizationId });
      const list: APSBusinessGroupResponseList = groupResponse.list;
      for(const apsBusinessGroupResponse of list) {
        if(apsBusinessGroupResponse.businessGroupParentId === undefined && apsBusinessGroupResponse.businessGroupId !== apsOrganization.organizationId) {
          const dbUpdate: APSBusinessGroupCreate = {
            ...apsBusinessGroupResponse,
            businessGroupParentId: apsOrganization.organizationId,
          };
          const migrated: APSBusinessGroupResponse = await apsBusinessGroupsService.getPersistenceService().update({
            organizationId: apsOrganization.organizationId,
            collectionDocumentId: apsBusinessGroupResponse.businessGroupId,
            collectionDocument: dbUpdate,
            collectionSchemaVersion: apsBusinessGroupsService.getDBObjectSchemaVersion() 
          });
          ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, message: 'migrated group', details: {
            migrated: migrated
          }}));      
        }
      }
    }
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED, message: 'migrated all parent less groups to root group as parent' }));
  }


  public static migrate = async(apsBusinessGroupsService: APSBusinessGroupsService): Promise<number> => {
    // const funcName = 'migrate';
    // const logName = `${APSBusinessGroupsDBMigrate.name}.${funcName}()`;
    // const targetDBSchemaVersion = apsBusinessGroupsService.getDBObjectSchemaVersion();

    await APSBusinessGroupsDBMigrate.initializeRootGroups4AllOrgs(apsBusinessGroupsService);
    await APSBusinessGroupsDBMigrate.migrateParentLessGroupsToRootParent(apsBusinessGroupsService);

    return 0;

  }

}
