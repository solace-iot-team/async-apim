import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { MongoPersistenceService, TMongoAllReturn, TMongoPagingInfo, TMongoSearchInfo, TMongoSortInfo } from '../../../common/MongoPersistenceService';
import { TApiPagingInfo, TApiSearchInfo, TApiSortInfo } from '../../utils/ApiQueryHelper';
import { TRootUserConfig } from '../../../common/ServerConfig';
import { ServerUtils } from '../../../common/ServerUtils';
import { 
  APSId,
  APSUserLoginCredentials,
  APSUserUpdate,
  ListApsUsersResponse,
  APSUserResponseList,
  APSUserResponse,
  APSOrganizationRolesList,
  APSOrganizationRoles,
  ListAPSOrganizationResponse,
  APSOrganizationList,
  APSOrganization,
  APSOrganizationRolesResponseList,
  APSUserCreate,
  EAPSSystemAuthRole,
 } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import { 
  ApiBadQueryParameterCombinationServerError, 
  ApiInternalServerError, 
  ApiInvalidObjectReferencesServerError, 
  ServerErrorFromError, 
  TApiInvalidObjectReferenceError
} from '../../../common/ServerError';
import { APSUsersDBMigrate } from './APSUsersDBMigrate';
import APSOrganizationsServiceEventEmitter from '../apsAdministration/APSOrganizationsServiceEvent';
import { Mutex } from "async-mutex";
import APSOrganizationsService from '../apsAdministration/APSOrganizationsService';
import APSBusinessGroupsService from '../apsOrganization/apsBusinessGroups/APSBusinessGroupsService';
import { APSOrganizationSessionInfoList } from '../../../../src/@solace-iot-team/apim-server-openapi-node/models/APSOrganizationSessionInfoList';
import APSSecretsService from '../../../common/authstrategies/APSSecretsService';

export type APSUserSessionInfo = {
  /** using array for convenient deletion, possible values: 1 element or none */
  refreshToken: Array<string>;
  lastLoginTimestamp?: number;
}
export interface APSUserInternal extends APSUserCreate {
  lastOrganizationId?: string;
  sessionInfo: APSUserSessionInfo;
}
export type APSUserInternalList = Array<APSUserInternal>;

export class APSUsersService {
  private static collectionName = "apsUsers";
  private static apiObjectName = "APSUser";
  private static collectionSchemaVersion = 4;
  private static rootApsUser: APSUserInternal;
  private persistenceService: MongoPersistenceService;
  private collectionMutex = new Mutex();

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSUsersService.collectionName, true);
    APSOrganizationsServiceEventEmitter.on('deleted', this.onOrganizationDeleted);
  }

  public getPersistenceService = (): MongoPersistenceService => {
    return this.persistenceService;
  }
  public getCollectionName = (): string => {
    return APSUsersService.collectionName;
  }
  public getDBObjectSchemaVersion = (): number => {
    return APSUsersService.collectionSchemaVersion;
  }
  public getCollectionMutex = (): Mutex => {
    return this.collectionMutex;
  }
  public wait4CollectionUnlock = async() => {
    const funcName = 'wait4CollectionUnlock';
    const logName = `${APSUsersService.name}.${funcName}()`;
    
    await this.collectionMutex.waitForUnlock();
    // const releaser = await this.collectionMutex.acquire();
    // releaser();
    if(this.collectionMutex.isLocked()) throw new Error(`${logName}: mutex is locked`);

  }
  private onOrganizationDeleted = async(apsOrganizationId: APSId): Promise<void> => {
    // await this.collectionMutex.runExclusive(async () => {
    //   await this._onOrganizationDeleted(apsOrganizationId);
    // });
    const x = async(): Promise<void> => {
      await this._onOrganizationDeleted(apsOrganizationId);
    }
    await this.collectionMutex.runExclusive(x);
  }

  private _onOrganizationDeleted = async(apsOrganizationId: APSId): Promise<void> => {
    const funcName = '_onOrganizationDeleted';
    const logName = `${APSUsersService.name}.${funcName}()`;

    try {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_DELETED, message: 'APSOrganizationId', details: {
        organizationId: apsOrganizationId
      }}));

      // TODO: how to do an OR filter?
      const mongoSearchInfo_memberOfOrganizations: TMongoSearchInfo = { 
        filter: {
          memberOfOrganizations: {
            $elemMatch: { organizationId: apsOrganizationId }
          }
        }
      };
      const mongoAllReturn_memberOfOrganizations: TMongoAllReturn = await this.persistenceService.all({
        searchInfo: mongoSearchInfo_memberOfOrganizations
      });

      const mongoSearchInfo_organizationSessionInfoList: TMongoSearchInfo = { 
        filter: {
          organizationSessionInfoList: {
            $elemMatch: { organizationId: apsOrganizationId }
          }
        }
      };
      const mongoAllReturn_organizationSessionInfoList: TMongoAllReturn = await this.persistenceService.all({
        searchInfo: mongoSearchInfo_organizationSessionInfoList
      });

      const apsUserInternalList: APSUserInternalList = mongoAllReturn_memberOfOrganizations.documentList as APSUserInternalList;
      apsUserInternalList.push(...(mongoAllReturn_organizationSessionInfoList.documentList as APSUserInternalList));

      for(const apsUserInternal of apsUserInternalList) {
        // memberOfOrganizations
        const memberOfOrganizationRolesList: APSOrganizationRolesList = apsUserInternal.memberOfOrganizations ? apsUserInternal.memberOfOrganizations : [];
        const idx = memberOfOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRoles) => {
          return organizationRoles.organizationId === apsOrganizationId;
        });
        if(idx > -1) memberOfOrganizationRolesList.splice(idx, 1);  
        // last Session info
        const apsOrganizationSessionInfoList: APSOrganizationSessionInfoList = apsUserInternal.organizationSessionInfoList ? apsUserInternal.organizationSessionInfoList : [];
        const sessionInfoList_idx = apsOrganizationSessionInfoList.findIndex((x) => {
          return x.organizationId === apsOrganizationId;
        });
        if(sessionInfoList_idx > -1) apsOrganizationSessionInfoList.splice(sessionInfoList_idx, 1);

        const update: APSUserInternal = {
          ...apsUserInternal,
          memberOfOrganizations: memberOfOrganizationRolesList,
          organizationSessionInfoList: apsOrganizationSessionInfoList,
        };
        await this.persistenceService.update({
          collectionDocumentId: apsUserInternal.userId,
          collectionDocument: update,
          collectionSchemaVersion: APSUsersService.collectionSchemaVersion
        });
      }

      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSED_ON_EVENT_DELETED, message: 'APSOrganizationId', details: {
        organizationId: apsOrganizationId
      }}));

    } catch(e) {
      const ex = new ServerErrorFromError(e, logName);
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: ex.message , details: ex.toObject() }));
    } 
  }

  public initialize = async(rootUserConfig: TRootUserConfig) => {
    const funcName = 'initialize';
    const logName = `${APSUsersService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    
    // for devel: drop the user collection
    // await this.persistenceService.dropCollection();
    
    await this.persistenceService.initialize();
    APSUsersService.rootApsUser = {
      isActivated: true,
      userId: rootUserConfig.userId,
      password: APSSecretsService.createHash(rootUserConfig.password),
      profile: {
        first: 'root',
        last: 'admin',
        email: rootUserConfig.userId
      },
      systemRoles: [EAPSSystemAuthRole.ROOT],
      sessionInfo: {
        refreshToken: []
      }
    }

    // custom, one time maintenance
    // await this.persistenceService.delete({
    //   documentId: "master.user@async-apim-devel.com"
    // });
    

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public migrate = async(): Promise<void> => {
    const funcName = 'migrate';
    const logName = `${APSUsersService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING }));
    await APSUsersDBMigrate.migrate(this);
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED }));
  }

  public bootstrap = async(): Promise<void> => {
    const funcName = 'bootstrap';
    const logName = `${APSUsersService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING }));
    // remove sessionInfo
    const updateInternal: Partial<APSUserInternal> = {
      sessionInfo: {
        refreshToken: []
      }
    };
    await this.persistenceService.updateAll({ update: updateInternal });
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPED }));
  }

  public getRootApsUserLoginCredentials = (): APSUserLoginCredentials => {
    return {
      username: APSUsersService.rootApsUser.userId,
      password: APSUsersService.rootApsUser.password
    }
  }

  public getRootApsUserInternal = (): APSUserInternal => {
    return APSUsersService.rootApsUser;
  }

  public updateRootApsUserInternal = ({ refreshToken }:{
    refreshToken: string;
  }): APSUserInternal => {
    APSUsersService.rootApsUser.sessionInfo = {
      refreshToken: [refreshToken],
      lastLoginTimestamp: Date.now(),
    };
    return APSUsersService.rootApsUser;
  }
  public deleteRefreshTokenRootApsUserInternal = (): void => {
    APSUsersService.rootApsUser.sessionInfo.refreshToken = [];
  }

  public getRootApsUserResponse = async(): Promise<APSUserResponse> => {
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse({
      apsUserInternal: this.getRootApsUserInternal(),
      apsOrganizationList: apsOrganizationList
    });
    return apsUserResponse;
  }

  /**
   * Get the list of users that are members of the organizations.
   * NOTE: uses memberOfOrganizations field only.
   */
  public allByOrganizationId = async({ apsOrganizationId }:{
    apsOrganizationId: string;
  }): Promise<ListApsUsersResponse> => {
    const funcName = 'allByOrganizationId';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'ListApsUsersResponse', details: {
      apsOrganizationId: apsOrganizationId
     }}));

     const mongoSearchInfo: TMongoSearchInfo = { 
      filter: {}
    };
    mongoSearchInfo.filter.memberOfOrganizations = {
      $elemMatch: { organizationId: apsOrganizationId }
    }
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      searchInfo: mongoSearchInfo
    });
    const apsUserInternalList: APSUserInternalList = mongoAllReturn.documentList;
    const apsUserResponseList: APSUserResponseList = await this.createAPSUserResponseList({
      apsUserInternalList: apsUserInternalList
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSUserResponseList', details: apsUserResponseList }));

    return {
      list: apsUserResponseList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public all = async({ pagingInfo, sortInfo, searchInfo }:{
    pagingInfo: TApiPagingInfo;
    sortInfo: TApiSortInfo;
    searchInfo: TApiSearchInfo;
  }): Promise<ListApsUsersResponse> => {
    const funcName = 'all';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'ListApsUsersResponse', details: {
      pagingInfo: pagingInfo,
      sortInfo: sortInfo,
      searchInfo: searchInfo
     }}));

    const apsUserSortFieldNameValidationSchema: Partial<APSUserInternal> = {
      isActivated: false,
      userId: 'string',
      profile: {
        email: 'string',
        first: 'string',
        last: 'string'
      },
      systemRoles: [],
      memberOfOrganizations: [],
      memberOfOrganizationGroups: []
    };

    const mongoPagingInfo: TMongoPagingInfo = { pageNumber: pagingInfo.pageNumber, pageSize: pagingInfo.pageSize };
    const mongoSortInfo: TMongoSortInfo = { sortFieldName: sortInfo.sortFieldName, sortDirection: sortInfo.sortDirection, apsObjectSortFieldNameValidationSchema: apsUserSortFieldNameValidationSchema, apsObjectName: APSUsersService.apiObjectName };
    const mongoSearchInfo: TMongoSearchInfo = { 
      searchWordList: searchInfo.searchWordList
    };
    mongoSearchInfo.filter = {};
    // cannot use both together, etiher or
    if(searchInfo.searchOrganizationId !== undefined && searchInfo.excludeSearchOrganizationId !== undefined) {
      throw new ApiBadQueryParameterCombinationServerError(logName, undefined, {
        apsObjectName: APSUsersService.apiObjectName,
        invalidQueryParameterCombinationList: [
          ServerUtils.getPropertyNameString(searchInfo, (x) => x.searchOrganizationId),
          ServerUtils.getPropertyNameString(searchInfo, (x) => x.excludeSearchOrganizationId),
        ]
      });
    }
    if(searchInfo.searchOrganizationId !== undefined) {
      mongoSearchInfo.filter.memberOfOrganizations = {
        $elemMatch: { organizationId: searchInfo.searchOrganizationId }
      }
    } else if(searchInfo.excludeSearchOrganizationId !== undefined) {
      mongoSearchInfo.filter.memberOfOrganizations = {
        $not: {
          $elemMatch: { organizationId: searchInfo.excludeSearchOrganizationId }
        }
      }
    }
    if(searchInfo.searchIsActivated !== undefined) {
      // mongoSearchInfo.filter.isActivated = { $eq: searchInfo.searchIsActivated };
      mongoSearchInfo.filter.isActivated = searchInfo.searchIsActivated;
    }
    // userId
    if(searchInfo.searchUserId !== undefined) {
      mongoSearchInfo.filter.userId = new RegExp('.*' + searchInfo.searchUserId + '.*');
    }

    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      pagingInfo: mongoPagingInfo,
      sortInfo: mongoSortInfo,
      searchInfo: mongoSearchInfo
    });
    const apsUserInternalList: APSUserInternalList = mongoAllReturn.documentList;
    const apsUserResponseList: APSUserResponseList = await this.createAPSUserResponseList({
      apsUserInternalList: apsUserInternalList
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSUserResponseList', details: apsUserResponseList }));

    return {
      list: apsUserResponseList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async({ userId }: {
    userId: string;
  }): Promise<APSUserResponse> => {
    const funcName = 'byId';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSUserResponse', details: { userId: userId } }));

    const apsUserInternal: APSUserInternal = await this.persistenceService.byId({
      documentId: userId
    });

    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse({
      apsUserInternal: apsUserInternal, 
      apsOrganizationList: apsOrganizationList
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSUserResponse', details: apsUserResponse }));

    return apsUserResponse;
  }

  public create = async({ apsUserCreate }:{
    apsUserCreate: APSUserCreate;
  }): Promise<APSUserResponse> => {
    const funcName = 'create';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, message: 'APSUserCreate', details: {
      apsUserCreate: apsUserCreate
    }}));

    await this.validateReferences({ apsUserInternalPartial: apsUserCreate });

    const created: APSUserInternal = await this.persistenceService.create({
      collectionDocumentId: apsUserCreate.userId,
      collectionDocument: this.map_APSUserCreate_To_APSUserInternal({ apsUserCreate: apsUserCreate }),
      collectionSchemaVersion: APSUsersService.collectionSchemaVersion
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, message: 'APSUserCreate', details: created }));
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse({ 
      apsUserInternal: created,
      apsOrganizationList: apsOrganizationList,
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATED, message: 'APSUserResponse', details: apsUserResponse }));

    return apsUserResponse;
  }

  public update_internal = async({ userId, apsUserUpdate }:{
    userId: string;
    apsUserUpdate: APSUserUpdate;
  }): Promise<APSUserResponse> => {
    const validationDoc: Partial<APSUserInternal> = {
      ...apsUserUpdate,
      profile: undefined,
      userId: userId,
      sessionInfo: undefined,
    };
    await this.validateReferences({ apsUserInternalPartial: validationDoc });

    if(apsUserUpdate.password !== undefined) {
      apsUserUpdate.password = APSSecretsService.createHash(apsUserUpdate.password);
    }
    const updatedInternal: APSUserInternal = await this.persistenceService.update({
      collectionDocumentId: userId,
      collectionDocument: apsUserUpdate,
      collectionSchemaVersion: APSUsersService.collectionSchemaVersion
    });
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse({ 
      apsUserInternal: updatedInternal,
      apsOrganizationList: apsOrganizationList,
    });
    return apsUserResponse;
  }
  
  public update = async({ userId, apsUserUpdate }:{
    userId: string;
    apsUserUpdate: APSUserUpdate;
  }): Promise<APSUserResponse> => {
    const funcName = 'update';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, message: 'APSUserUpdate', details: {
      userId: userId,
      apsUserUpdate: apsUserUpdate
    }}));

    const apsUserResponse: APSUserResponse = await this.update_internal({ userId: userId, apsUserUpdate: apsUserUpdate });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATED, message: 'APSUserResponse', details: apsUserResponse }));

    return apsUserResponse;
  }

  public delete = async({ userId }:{
    userId: string;
  }): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, message: 'keys', details: {
      userId: userId 
    }}));

    const deletedInternal: APSUserInternal = (await this.persistenceService.delete({
      documentId: userId
    }) as unknown) as APSUserInternal;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETED, message: 'APSUserInternal', details: deletedInternal }));

  }

  private validateReferences = async({ apsUserInternalPartial }:{
    apsUserInternalPartial: Partial<APSUserInternal>
  }): Promise<void> => {
    const funcName = 'validateReferences';
    const logName = `${APSUsersService.name}.${funcName}()`;

    if(apsUserInternalPartial.userId === undefined) throw new ApiInternalServerError(logName, 'userId not found');

    const invalidReferencesList: Array<TApiInvalidObjectReferenceError> = [];
    // check memberOfOrganizations
    if(apsUserInternalPartial.memberOfOrganizations !== undefined) {
      for(const apsOrganizationRoles of apsUserInternalPartial.memberOfOrganizations) {
        try {
          await APSOrganizationsService.byId(apsOrganizationRoles.organizationId);
        } catch(e) {
          invalidReferencesList.push({
            referenceId: apsOrganizationRoles.organizationId,
            referenceType: 'APSOrganization'
          });
        }
      }
    }
    // check last session info
    if(apsUserInternalPartial.organizationSessionInfoList !== undefined) {
      for(const organizationSessionInfo of apsUserInternalPartial.organizationSessionInfoList) {
        try {
          await APSOrganizationsService.byId(organizationSessionInfo.organizationId);
        } catch(e) {
          invalidReferencesList.push({
            referenceId: organizationSessionInfo.organizationId,
            referenceType: 'APSOrganization'
          });
        }
        try {
          await APSBusinessGroupsService.byId({
            apsOrganizationId: organizationSessionInfo.organizationId,
            apsBusinessGroupId: organizationSessionInfo.lastSessionInfo.businessGroupId
          });
        } catch(e) {
          invalidReferencesList.push({
            referenceId: organizationSessionInfo.lastSessionInfo.businessGroupId,
            referenceType: 'APSBusinessGroup'
          });
        }
      }
    }
    // create error 
    if(invalidReferencesList.length > 0) {
      throw new ApiInvalidObjectReferencesServerError(logName, 'invalid user references', { 
        id: apsUserInternalPartial.userId,
        collectionName: APSUsersService.collectionName,
        invalidReferenceList: invalidReferencesList
      });      
    }

  }

  private map_APSUserCreate_To_APSUserInternal({ apsUserCreate }:{
    apsUserCreate: APSUserCreate;
  }): APSUserInternal {
    return {
      ...apsUserCreate,
      password: APSSecretsService.createHash(apsUserCreate.password),
      sessionInfo: {
        refreshToken: []
      },
    }
  }
  private map_APSUserInternal_To_APSUserResponse({ apsUserInternal }:{ 
    apsUserInternal: APSUserInternal;
  }): APSUserResponse {
    const partial: Partial<APSUserInternal> = {
      ...apsUserInternal
    };
    delete partial.password;
    delete partial.sessionInfo;
    return partial as APSUserResponse;
  }

  public createAPSUserResponse = ({ apsUserInternal, apsOrganizationList }:{
    apsUserInternal: APSUserInternal;
    apsOrganizationList: APSOrganizationList;
  }): APSUserResponse => {
    const apsUserResponse: APSUserResponse = this.map_APSUserInternal_To_APSUserResponse({
      apsUserInternal: apsUserInternal
    });
    if(apsUserResponse.memberOfOrganizations !== undefined) {
      const memberOfOrganizationResponse: APSOrganizationRolesResponseList = [];
      for(const memberOfOrganization of apsUserResponse.memberOfOrganizations) {
        const foundOrg: APSOrganization | undefined = apsOrganizationList.find( (x) => {
          return x.organizationId === memberOfOrganization.organizationId;
        });
        if(foundOrg !== undefined) {
          memberOfOrganizationResponse.push({
            ...memberOfOrganization,
            organizationDisplayName: foundOrg.displayName
          });
        } else {
          memberOfOrganizationResponse.push({
            ...memberOfOrganization,
            organizationDisplayName: memberOfOrganization.organizationId
          });
        }
      }
      apsUserResponse.memberOfOrganizations = memberOfOrganizationResponse;
    } else {
      apsUserResponse.memberOfOrganizations = [];
    }
    if(apsUserResponse.memberOfOrganizationGroups === undefined) {
      apsUserResponse.memberOfOrganizationGroups = [];
    }
    // session info
    if(apsUserResponse.organizationSessionInfoList === undefined) {
      apsUserResponse.organizationSessionInfoList = [];
    }
    return apsUserResponse;  
  }

  private createAPSUserResponseList = async({ apsUserInternalList }:{
    apsUserInternalList: APSUserInternalList;
  }): Promise<APSUserResponseList> => {
    // retrieve all orgs and add org displayName to membersOfOrganizations for each user
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponseList: APSUserResponseList = [];
    for(const apsUserInternal of apsUserInternalList) {
      const apsUserResponse: APSUserResponse = this.createAPSUserResponse({
        apsUserInternal: apsUserInternal, 
        apsOrganizationList: apsOrganizationList
      });  
      apsUserResponseList.push(apsUserResponse);
    }
    return apsUserResponseList;
  }

}

export default new APSUsersService();
