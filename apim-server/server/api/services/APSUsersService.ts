import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import APSUser = Components.Schemas.APSUser;
import APSUserUpdateRequest = Components.Schemas.APSUserUpdate;
import APSUserReplaceRequest = Components.Schemas.APSUserReplace;
import APSListResponseMeta = Components.Schemas.APSListResponseMeta;
import APSUserId = Components.Schemas.APSId;
import APSUserLoginCredentials = Components.Schemas.APSUserLoginCredentials;
import { MongoPersistenceService, TMongoAllReturn, TMongoPagingInfo, TMongoSearchInfo, TMongoSortInfo } from '../../common/MongoPersistenceService';
import { TApiPagingInfo, TApiSearchInfo, TApiSortInfo } from '../utils/ApiQueryHelper';
import { TRootUserConfig } from '../../common/ServerConfig';

export type TAPSListUserResponse = APSListResponseMeta & { list: Array<APSUser> };

export class APSUsersService {
  private static collectionName = "apsUsers";
  private static apiObjectName = "APSUser";
  private static rootApsUser: APSUser;
  private persistenceService: MongoPersistenceService;

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSUsersService.collectionName, true); 
  }

  public initialize = async(rootUserConfig: TRootUserConfig) => {
    const funcName = 'initialize';
    const logName = `${APSUsersService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
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
      roles: [ 'root' ]
    }
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
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

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'pagingInfo', details: pagingInfo }));
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'sortInfo', details: sortInfo }));
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'searchInfo', details: searchInfo }));

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
    const mongoSearchInfo: TMongoSearchInfo = { searchWordList: searchInfo.searchWordList };
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
    const created: APSUser = await this.persistenceService.create(apsUser.userId, apsUser) as APSUser;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'created', details: created }));

    return created;
  }

  public update = async(apsUserId: APSUserId, apsUserUpdateRequest: APSUserUpdateRequest): Promise<APSUser> => {
    const funcName = 'update';
    const logName = `${APSUsersService.name}.${funcName}()`;
    const updated: APSUser = await this.persistenceService.update(apsUserId, apsUserUpdateRequest) as APSUser;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'updated', details: updated }));

    return updated;
  }

  public replace = async(apsUserId: APSUserId, apsUserReplaceRequest: APSUserReplaceRequest): Promise<APSUser> => {
    const funcName = 'replace';
    const logName = `${APSUsersService.name}.${funcName}()`;
    const replaced: APSUser = await this.persistenceService.replace(apsUserId, { ...apsUserReplaceRequest, userId: apsUserId }) as APSUser;

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
