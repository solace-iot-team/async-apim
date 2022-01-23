import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import APSUser = Components.Schemas.APSUser;
import APSUserUpdateRequest = Components.Schemas.APSUserUpdate;
import APSUserReplaceRequest = Components.Schemas.APSUserReplace;
import APSListResponseMeta = Components.Schemas.APSListResponseMeta;
import APSUserId = Components.Schemas.APSId;
import APSUserLoginCredentials = Components.Schemas.APSUserLoginCredentials;
import { MongoPersistenceService, TMongoAllReturn, TMongoPagingInfo, TMongoSearchInfo, TMongoSortInfo } from '../../../common/MongoPersistenceService';
import { TApiPagingInfo, TApiSearchInfo, TApiSortInfo } from '../../utils/ApiQueryHelper';
import ServerConfig, { TRootUserConfig } from '../../../common/ServerConfig';
import { ServerUtils } from '../../../common/ServerUtils';
import { 
  ApiError,
  APSUserList,
  ApsUsersService,
 } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import { ApiInternalServerErrorFromError, ApiKeyNotFoundServerError, BootstrapErrorFromApiError, BootstrapErrorFromError } from '../../../common/ServerError';
import { APSUsersDBMigrate } from './APSUsersDBMigrate';

export type TAPSListUserResponse = APSListResponseMeta & { list: Array<APSUser> };

export class APSUsersService {
  private static collectionName = "apsUsers";
  private static boostrapApsUserListPath = 'bootstrap/apsUsers/apsUserList.json';
  private static apiObjectName = "APSUser";
  private static dbObjectSchemaVersion = 1;
  private static rootApsUser: APSUser;
  private persistenceService: MongoPersistenceService;

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSUsersService.collectionName, true); 
  }

  public getPersistenceService = (): MongoPersistenceService => {
    return this.persistenceService;
  }
  public getCollectionName = (): string => {
    return APSUsersService.collectionName;
  }
  public getDBObjectSchemaVersion = (): number => {
    return APSUsersService.dbObjectSchemaVersion;
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

  public getRootApsUser = (): APSUser => {
    return APSUsersService.rootApsUser;
  }

  public all = async(pagingInfo: TApiPagingInfo, sortInfo: TApiSortInfo, searchInfo: TApiSearchInfo): Promise<TAPSListUserResponse> => {
    const funcName = 'all';
    const logName = `${APSUsersService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'parameters', details: {
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
      }
    };

    const mongoPagingInfo: TMongoPagingInfo = { pageNumber: pagingInfo.pageNumber, pageSize: pagingInfo.pageSize };
    const mongoSortInfo: TMongoSortInfo = { sortFieldName: sortInfo.sortFieldName, sortDirection: sortInfo.sortDirection, apsObjectSortFieldNameValidationSchema: apsUserSortFieldNameValidationSchema, apsObjectName: APSUsersService.apiObjectName };
    const mongoSearchInfo: TMongoSearchInfo = { 
      searchWordList: searchInfo.searchWordList
    };
    mongoSearchInfo.filter = {};
    if(searchInfo.searchOrganizationId !== undefined) {
      // mongoSearchInfo.filter.memberOfOrganizations = { $in: [searchInfo.searchOrganizationId] };
      mongoSearchInfo.filter.memberOfOrganizations = searchInfo.searchOrganizationId  ;
    } else if(searchInfo.excludeSearchOrganizationId !== undefined) {
      mongoSearchInfo.filter.memberOfOrganizations = { $ne: searchInfo.excludeSearchOrganizationId };
    }
    if(searchInfo.searchIsActivated !== undefined) {
      mongoSearchInfo.filter.isActivated = searchInfo.searchIsActivated;
    }
    // userId
    if(searchInfo.searchUserId !== undefined) {
      mongoSearchInfo.filter.userId = new RegExp('.*' + searchInfo.searchUserId + '.*');
    }

    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all(mongoPagingInfo, mongoSortInfo, mongoSearchInfo);

    return {
      list: mongoAllReturn.documentList as Array<APSUser>,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async(apsUserId: APSUserId): Promise<APSUser> => {
    const funcName = 'byId';
    const logName = `${APSUsersService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsUserId', details: apsUserId }));

    const apsUser: APSUser = await this.persistenceService.byId(apsUserId) as APSUser;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsUser', details: apsUser }));

    return apsUser;
  }

  public create = async(apsUser: APSUser): Promise<APSUser> => {
    const funcName = 'create';
    const logName = `${APSUsersService.name}.${funcName}()`;
    const created: APSUser = await this.persistenceService.create({
      documentId: apsUser.userId,
      document: apsUser,
      schemaVersion: APSUsersService.dbObjectSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'created', details: created }));

    return created;
  }

  public update = async(apsUserId: APSUserId, apsUserUpdateRequest: APSUserUpdateRequest): Promise<APSUser> => {
    const funcName = 'update';
    const logName = `${APSUsersService.name}.${funcName}()`;
    const updated: APSUser = await this.persistenceService.update({
      documentId: apsUserId,
      document: apsUserUpdateRequest,
      schemaVersion: APSUsersService.dbObjectSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'updated', details: updated }));

    return updated;
  }

  public replace = async(apsUserId: APSUserId, apsUserReplaceRequest: APSUserReplaceRequest): Promise<APSUser> => {
    const funcName = 'replace';
    const logName = `${APSUsersService.name}.${funcName}()`;

    const replaced: APSUser = await this.persistenceService.replace({
      documentId: apsUserId, 
      document: { ...apsUserReplaceRequest, userId: apsUserId }, 
      schemaVersion: APSUsersService.dbObjectSchemaVersion  
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replaced', details: replaced }));

    return replaced;
  }

  public delete = async(apsUserId: APSUserId): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSUsersService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsUserId', details: apsUserId }));

    const deletedUser: APSUser = (await this.persistenceService.delete(apsUserId) as unknown) as APSUser;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'deletedUser', details: deletedUser }));

  }

}

export default new APSUsersService();
