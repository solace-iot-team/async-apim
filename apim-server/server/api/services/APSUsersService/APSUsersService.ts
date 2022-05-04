import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { MongoPersistenceService, TMongoAllReturn, TMongoPagingInfo, TMongoSearchInfo, TMongoSortInfo } from '../../../common/MongoPersistenceService';
import { TApiPagingInfo, TApiSearchInfo, TApiSortInfo } from '../../utils/ApiQueryHelper';
import ServerConfig, { TRootUserConfig } from '../../../common/ServerConfig';
import { ServerUtils } from '../../../common/ServerUtils';
import { 
  APSId,
  APSUserId,
  ApiError,
  ApsUsersService,
  APSUserLoginCredentials,
  APSUserReplace,
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
  ApiInternalServerErrorFromError, 
  ApiInvalidObjectReferencesServerError, 
  ApiKeyNotFoundServerError, 
  BootstrapErrorFromApiError, 
  BootstrapErrorFromError, 
  ServerErrorFromError, 
  TApiInvalidObjectReferenceError
} from '../../../common/ServerError';
import { APSUsersDBMigrate } from './APSUsersDBMigrate';
import APSOrganizationsServiceEventEmitter from '../apsAdministration/APSOrganizationsServiceEvent';
import { Mutex } from "async-mutex";
import APSOrganizationsService from '../apsAdministration/APSOrganizationsService';
import APSBusinessGroupsService from '../apsOrganization/apsBusinessGroups/APSBusinessGroupsService';
import { APSOrganizationSessionInfoList } from '../../../../src/@solace-iot-team/apim-server-openapi-node/models/APSOrganizationSessionInfoList';

export type APSRootUser = APSUserCreate;
export type APSRootUserResponse = APSUserResponse;
type APSUserCreateList = Array<APSUserCreate>;

export class APSUsersService {
  private static collectionName = "apsUsers";
  private static boostrapApsUserListPath = 'bootstrap/apsUsers/apsUserList.json';
  private static apiObjectName = "APSUser";
  private static collectionSchemaVersion = 3;
  private static rootApsUser: APSRootUser;
  private persistenceService: MongoPersistenceService;
  private collectionMutex = new Mutex();

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSUsersService.collectionName, true);
    APSOrganizationsServiceEventEmitter.on('deleted', this.onOrganizationDeleted);
  }

  private wait4CollectionUnlock = async() => {
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

      const apsUserList: APSUserCreateList = mongoAllReturn_memberOfOrganizations.documentList as APSUserCreateList;
      apsUserList.push(...(mongoAllReturn_organizationSessionInfoList.documentList as APSUserCreateList));

      for(const apsUser of apsUserList) {
        // memberOfOrganizations
        const memberOfOrganizationRolesList: APSOrganizationRolesList = apsUser.memberOfOrganizations ? apsUser.memberOfOrganizations : [];
        const idx = memberOfOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRoles) => {
          return organizationRoles.organizationId === apsOrganizationId;
        });
        if(idx > -1) memberOfOrganizationRolesList.splice(idx, 1);  
        // last Session info
        const apsOrganizationSessionInfoList: APSOrganizationSessionInfoList = apsUser.organizationSessionInfoList ? apsUser.organizationSessionInfoList : [];
        const sessionInfoList_idx = apsOrganizationSessionInfoList.findIndex((x) => {
          return x.organizationId === apsOrganizationId;
        });
        if(sessionInfoList_idx > -1) apsOrganizationSessionInfoList.splice(sessionInfoList_idx, 1);

        const update: APSUserUpdate = {
          ...apsUser,
          memberOfOrganizations: memberOfOrganizationRolesList,
          organizationSessionInfoList: apsOrganizationSessionInfoList,
        };
        await this.persistenceService.update({
          collectionDocumentId: apsUser.userId,
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

  public getPersistenceService = (): MongoPersistenceService => {
    return this.persistenceService;
  }
  public getCollectionName = (): string => {
    return APSUsersService.collectionName;
  }
  public getDBObjectSchemaVersion = (): number => {
    return APSUsersService.collectionSchemaVersion;
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
      password: rootUserConfig.password,
      profile: {
        first: 'root',
        last: 'admin',
        email: rootUserConfig.userId
      },
      systemRoles: [EAPSSystemAuthRole.ROOT]
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

    if(ServerConfig.getConfig().dataPath) {
      const bootstrapApsUserListFileName = `${ServerConfig.getConfig().dataPath}/${APSUsersService.boostrapApsUserListPath}`;
      const bootstrapApsUserListFile: string | undefined = ServerUtils.validateFilePathWithReadPermission(bootstrapApsUserListFileName);
      if(bootstrapApsUserListFile) {
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'boostrap user list file', details: { file: bootstrapApsUserListFile } }));  
        // read file
        const bootstrapApsUserListData = ServerUtils.readFileContentsAsJson(bootstrapApsUserListFile);
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'bootstrap user list', details: { bootstrapUserList: bootstrapApsUserListData } }));  

        const bootstrapApsUserList: APSUserCreateList = bootstrapApsUserListData;
        for(const bootstrapApsUser of bootstrapApsUserList) {
          let found = false;
          try {
            await this.byId(bootstrapApsUser.userId);
            found = true;
          } catch(e) {
            if(e instanceof ApiKeyNotFoundServerError) {
              found = false;
            } else {
              throw new ApiInternalServerErrorFromError(e, logName);
            }
          }
          if(found) {
            ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'bootstrap user already exists', details: { bootstrapApsUser: bootstrapApsUser } }));  
          } else {
            try {
              await ApsUsersService.createApsUser({
                requestBody: bootstrapApsUser
              });
            } catch (e: any) {
              ServerLogger.debug(ServerLogger.createLogEntry(logName, { 
                  code: EServerStatusCodes.BOOTSTRAP_ERROR, 
                  message: 'creating user', 
                  details: { 
                    bootstrapUser: bootstrapApsUser,
                    error: e
                   } 
                }));  
              if(e instanceof ApiError) throw new BootstrapErrorFromApiError(e, logName, 'creating user');
              else throw new BootstrapErrorFromError(e, logName, 'creating user');
            }
          }
        }
      } else {
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'bootstrap user list file not found, skipping', details: { file: bootstrapApsUserListFileName } }));  
      }
    } else {
      ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'skipping user list bootstrap, no data path' }));  
    }
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPED }));
  }

  public getRootApsUserLoginCredentials = (): APSUserLoginCredentials => {
    return {
      userId: APSUsersService.rootApsUser.userId,
      userPwd: APSUsersService.rootApsUser.password
    }
  }

  public getRootApsUser = (): APSRootUser => {
    return APSUsersService.rootApsUser;
  }

  public getRootApsUserResponse = async(): Promise<APSRootUserResponse> => {
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse({
      apsUserCreate: this.getRootApsUser(), 
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
    const apsUserCreateList: APSUserCreateList = mongoAllReturn.documentList;
    const apsUserResponseList: APSUserResponseList = await this.createAPSUserResponseList({
      apsUserCreateList: apsUserCreateList
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSUserResponseList', details: apsUserResponseList }));

    return {
      list: apsUserResponseList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public all = async(pagingInfo: TApiPagingInfo, sortInfo: TApiSortInfo, searchInfo: TApiSearchInfo): Promise<ListApsUsersResponse> => {
    const funcName = 'all';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'ListApsUsersResponse', details: {
      pagingInfo: pagingInfo,
      sortInfo: sortInfo,
      searchInfo: searchInfo
     }}));

    const apsUserSortFieldNameValidationSchema: Partial<APSUserCreate> = {
      isActivated: false,
      userId: 'string',
      password: 'string',
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
    const apsUserCreateList: APSUserCreateList = mongoAllReturn.documentList;
    const apsUserResponseList: APSUserResponseList = await this.createAPSUserResponseList({
      apsUserCreateList: apsUserCreateList
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSUserResponseList', details: apsUserResponseList }));

    return {
      list: apsUserResponseList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async(apsUserId: APSUserId): Promise<APSUserResponse> => {
    const funcName = 'byId';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSUserResponse', details: apsUserId }));

    const apsUserCreate: APSUserCreate = await this.persistenceService.byId({
      documentId: apsUserId
    }) as APSUserCreate;
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse({
      apsUserCreate: apsUserCreate, 
      apsOrganizationList: apsOrganizationList
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSUserResponse', details: apsUserResponse }));

    return apsUserResponse;
  }

  public create = async(apsUserCreate: APSUserCreate): Promise<APSUserResponse> => {
    const funcName = 'create';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, message: 'APSUserCreate', details: {
      apsUserCreate: apsUserCreate
    }}));

    await this.validateReferences(apsUserCreate);

    const created: APSUserCreate = await this.persistenceService.create({
      collectionDocumentId: apsUserCreate.userId,
      collectionDocument: apsUserCreate,
      collectionSchemaVersion: APSUsersService.collectionSchemaVersion
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, message: 'APSUserCreate', details: created }));
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse({ 
      apsUserCreate: apsUserCreate,
      apsOrganizationList: apsOrganizationList,
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATED, message: 'APSUserResponse', details: apsUserResponse }));

    return apsUserResponse;
  }

  public update = async(apsUserId: APSUserId, apsUserUpdate: APSUserUpdate): Promise<APSUserResponse> => {
    const funcName = 'update';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, message: 'APSUserUpdate', details: {
      apsUserId: apsUserId,
      apsUserUpdate: apsUserUpdate
    }}));

    const apsDocument: Partial<APSUserCreate> = {
      ...apsUserUpdate,
      profile: undefined,
      userId: apsUserId
    }

    await this.validateReferences(apsDocument);

    const updated: APSUserCreate = await this.persistenceService.update({
      collectionDocumentId: apsUserId,
      collectionDocument: apsUserUpdate,
      collectionSchemaVersion: APSUsersService.collectionSchemaVersion
    });
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse({ 
      apsUserCreate: updated,
      apsOrganizationList: apsOrganizationList,
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATED, message: 'APSUserResponse', details: apsUserResponse }));

    return apsUserResponse;
  }

  public replace = async(apsUserId: APSUserId, apsUserReplace: APSUserReplace): Promise<APSUserResponse> => {
    const funcName = 'replace';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REPLACING, message: 'APSUserReplace', details: {
      apsUserId: apsUserId,
      apsUserReplace: apsUserReplace
    }}));

    const apsDocument: Partial<APSUserCreate> = {
      ...apsUserReplace,
      userId: apsUserId
    }
    await this.validateReferences(apsDocument);

    const replaced: APSUserCreate = await this.persistenceService.replace({
      collectionDocumentId: apsUserId, 
      collectionDocument: apsDocument, 
      collectionSchemaVersion: APSUsersService.collectionSchemaVersion  
    });
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse({ 
      apsUserCreate: replaced,
      apsOrganizationList: apsOrganizationList,
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REPLACED, message: 'APSUserResponse', details: apsUserResponse }));

    return apsUserResponse;
  }

  public delete = async(apsUserId: APSUserId): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, message: 'keys', details: {
      apsUserId: apsUserId 
    }}));

    const deletedUser: APSUserCreate = (await this.persistenceService.delete({
      documentId: apsUserId
    }) as unknown) as APSUserCreate;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETED, message: 'APSUserCreate', details: deletedUser }));

  }

  private validateReferences = async(apsUserPartial: Partial<APSUserCreate>): Promise<void> => {
    const funcName = 'validateReferences';
    const logName = `${APSUsersService.name}.${funcName}()`;

    if(apsUserPartial.userId === undefined) throw new ApiInternalServerError(logName, 'userId not found');

    const invalidReferencesList: Array<TApiInvalidObjectReferenceError> = [];
    // check memberOfOrganizations
    if(apsUserPartial.memberOfOrganizations !== undefined) {
      for(const apsOrganizationRoles of apsUserPartial.memberOfOrganizations) {
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
    if(apsUserPartial.organizationSessionInfoList !== undefined) {
      for(const organizationSessionInfo of apsUserPartial.organizationSessionInfoList) {
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
        id: apsUserPartial.userId,
        collectionName: APSUsersService.collectionName,
        invalidReferenceList: invalidReferencesList
      });      
    }

  }

  private map_ApsUserCreate_To_ApsUserResponse({ apsUserCreate }:{ 
    apsUserCreate: APSUserCreate; 
  }): APSUserResponse {
    const partial: Partial<APSUserCreate> = {
      ...apsUserCreate
    };
    delete partial.password;
    return partial as APSUserResponse;
  }

  public createAPSUserResponse = ({ apsUserCreate, apsOrganizationList }:{
    apsUserCreate: APSUserCreate;
    apsOrganizationList: APSOrganizationList;
  }): APSUserResponse => {
    const apsUserResponse: APSUserResponse = this.map_ApsUserCreate_To_ApsUserResponse({
      apsUserCreate: apsUserCreate
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

  private createAPSUserResponseList = async({ apsUserCreateList }:{
    apsUserCreateList: APSUserCreateList;
  }): Promise<APSUserResponseList> => {
    // retrieve all orgs and add org displayName to membersOfOrganizations for each user
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponseList: APSUserResponseList = [];
    for(const apsUserCreate of apsUserCreateList) {
      const apsUserResponse: APSUserResponse = this.createAPSUserResponse({
        apsUserCreate: apsUserCreate, 
        apsOrganizationList: apsOrganizationList
      });  
      apsUserResponseList.push(apsUserResponse);
    }
    return apsUserResponseList;
  
  }

}

export default new APSUsersService();
