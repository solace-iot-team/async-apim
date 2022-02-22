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
  APSUser,
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

type APSUserList = Array<APSUser>;

export class APSUsersService {
  private static collectionName = "apsUsers";
  private static boostrapApsUserListPath = 'bootstrap/apsUsers/apsUserList.json';
  private static apiObjectName = "APSUser";
  private static collectionSchemaVersion = 2;
  private static rootApsUser: Components.Schemas.APSUser;
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

      const mongoSearchInfo: TMongoSearchInfo = { 
        filter: {
          memberOfOrganizations: {
            $elemMatch: { organizationId: apsOrganizationId }
          }
        }
      };
  
      const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
        searchInfo: mongoSearchInfo
      });
  
      const apsUserList: APSUserList = mongoAllReturn.documentList as APSUserList;
      for(const apsUser of apsUserList) {
        const memberOfOrganizationRolesList: APSOrganizationRolesList = apsUser.memberOfOrganizations ? apsUser.memberOfOrganizations : [];
        const idx = memberOfOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRoles) => {
          return organizationRoles.organizationId === apsOrganizationId;
        });
        if(idx > -1) memberOfOrganizationRolesList.splice(idx, 1);  
        const update: APSUser = {
          ...apsUser,
          memberOfOrganizations: memberOfOrganizationRolesList
        }
        await this.persistenceService.update({
          collectionDocumentId: apsUser.userId,
          collectionDocument: update,
          collectionSchemaVersion: APSUsersService.collectionSchemaVersion
        })
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
      systemRoles: ['root']
    }

    // custom, one time maintenance
    // await this.persistenceService.delete("master.user@aps.com");

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

        const bootstrapApsUserList: APSUserList = bootstrapApsUserListData;
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

  public getRootApsUser = (): Components.Schemas.APSUser => {
    return APSUsersService.rootApsUser;
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

    const apsUserSortFieldNameValidationSchema: Partial<APSUser> = {
      isActivated: false,
      userId: 'string',
      password: 'string',
      profile: {
        email: 'string',
        first: 'string',
        last: 'string'
      },
      systemRoles: [],
      memberOfOrganizations: []
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
    const apsUserList: APSUserList = mongoAllReturn.documentList;
    const apsUserResponseList: APSUserResponseList = await this.createAPSUserResponseList(apsUserList);

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

    const apsUser: APSUser = await this.persistenceService.byId({
      collectionDocumentId: apsUserId
    }) as APSUser;
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponse: APSUserResponse = this.createAPSUserResponse(apsUser, apsOrganizationList);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSUserResponse', details: apsUserResponse }));

    return apsUserResponse;
  }

  public create = async(apsUser: APSUser): Promise<APSUser> => {
    const funcName = 'create';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, message: 'APSUser', details: apsUser }));

    await this.validateReferences(apsUser);

    const created: APSUser = await this.persistenceService.create({
      collectionDocumentId: apsUser.userId,
      collectionDocument: apsUser,
      collectionSchemaVersion: APSUsersService.collectionSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATED, message: 'APSUser', details: created }));

    return created;
  }

  public update = async(apsUserId: APSUserId, apsUserUpdate: APSUserUpdate): Promise<APSUser> => {
    const funcName = 'update';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, message: 'APSUser', details: {
      apsUserId: apsUserId,
      apsUserUpdate: apsUserUpdate
    }}));

    const apsDocument: Partial<APSUser> = {
      ...apsUserUpdate,
      profile: undefined,
      userId: apsUserId
    }

    await this.validateReferences(apsDocument);

    const updated: APSUser = await this.persistenceService.update({
      collectionDocumentId: apsUserId,
      collectionDocument: apsUserUpdate,
      collectionSchemaVersion: APSUsersService.collectionSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATED, message: 'APSUser', details: updated }));

    return updated;
  }

  public replace = async(apsUserId: APSUserId, apsUserReplace: APSUserReplace): Promise<APSUser> => {
    const funcName = 'replace';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REPLACING, message: 'APSUser', details: {
      apsUserId: apsUserId,
      apsUserReplace: apsUserReplace
    }}));

    const apsDocument: Partial<APSUser> = {
      ...apsUserReplace,
      userId: apsUserId
    }
    await this.validateReferences(apsDocument);

    const replaced: APSUser = await this.persistenceService.replace({
      collectionDocumentId: apsUserId, 
      collectionDocument: apsDocument, 
      collectionSchemaVersion: APSUsersService.collectionSchemaVersion  
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REPLACED, message: 'APSUser', details: replaced }));

    return replaced;
  }

  public delete = async(apsUserId: APSUserId): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSUsersService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, message: 'keys', details: {
      apsUserId: apsUserId 
    }}));

    const deletedUser: APSUser = (await this.persistenceService.delete({
      collectionDocumentId: apsUserId
    }) as unknown) as APSUser;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETED, message: 'APSUser', details: deletedUser }));

  }

  private validateReferences = async(apsUserPartial: Partial<APSUser>): Promise<void> => {
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

    // create error 
    if(invalidReferencesList.length > 0) {
      throw new ApiInvalidObjectReferencesServerError(logName, 'invalid user references', { 
        id: apsUserPartial.userId,
        collectionName: APSUsersService.collectionName,
        invalidReferenceList: invalidReferencesList
      });      
    }

  }

  private createAPSUserResponse = (apsUser: APSUser, apsOrganizationList: APSOrganizationList): APSUserResponse => {
    const apsUserResponse: APSUserResponse = apsUser as APSUserResponse;
    if(apsUser.memberOfOrganizations !== undefined) {
      const memberOfOrganizationResponse: APSOrganizationRolesResponseList = [];
      for(const memberOfOrganization of apsUser.memberOfOrganizations) {
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
    }
    return apsUserResponse;
  }
  private createAPSUserResponseList = async(apsUserList: APSUserList): Promise<APSUserResponseList> => {
    // retrieve all orgs and add org displayName to membersOfOrganizations for each user
    const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
    const apsUserResponseList: APSUserResponseList = [];
    for(const apsUser of apsUserList) {
      const apsUserResponse: APSUserResponse = this.createAPSUserResponse(apsUser, apsOrganizationList);  
      apsUserResponseList.push(apsUserResponse);
    }
    return apsUserResponseList;
  }

}

export default new APSUsersService();
