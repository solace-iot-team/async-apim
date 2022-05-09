import { Mutex } from "async-mutex";
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import { MongoPersistenceService } from '../../common/MongoPersistenceService';
import { ApiKeyNotFoundServerError, ApiNotAuthorizedServerError, ServerError, ServerErrorFromError } from '../../common/ServerError';
import APSUsersService, { APSRefreshTokenInternal, APSUserInternal } from './APSUsersService/APSUsersService';
import { 
  APSOrganizationList, 
  APSSessionLogoutResponse, 
  APSUserCreate, 
  APSUserLoginCredentials, 
  APSUserResponse, 
  ListAPSOrganizationResponse
 } from '../../../src/@solace-iot-team/apim-server-openapi-node';
 import APSOrganizationsServiceEventEmitter from './apsAdministration/APSOrganizationsServiceEvent';
import { APSUserLoginAsRequest } from '../../../src/@solace-iot-team/apim-server-openapi-node/models/APSUserLoginAsRequest';
import APSOrganizationsService from './apsAdministration/APSOrganizationsService';
import { ValidationUtils } from '../utils/ValidationUtils';
import APSSecretsService from "../../common/authstrategies/APSSecretsService";
import APSAuthStrategyService from "../../common/authstrategies/APSAuthStrategyService";
import { APSSessionTestResponse } from "../../../src/@solace-iot-team/apim-server-openapi-node/models/APSSessionTestResponse";

export type TRefreshTokenInternalResponse = {
  userId: string;
  newRefreshToken: string;
}

export class APSSessionService {
  // private static collectionName = "apsUsers";
  private static collectionName = APSUsersService.getCollectionName();
  private persistenceService: MongoPersistenceService;
  private collectionMutex = new Mutex();

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSSessionService.collectionName); 
    APSOrganizationsServiceEventEmitter.on('deleted', this.onOrganizationDeleted);
  }

  // make public for test access
  public wait4CollectionUnlock = async() => {
    const funcName = 'wait4CollectionUnlock';
    const logName = `${APSSessionService.name}.${funcName}()`;
    // await this.collectionMutex.waitForUnlock();
    const releaser = await this.collectionMutex.acquire();
    releaser();
    if(this.collectionMutex.isLocked()) throw new Error(`${logName}: mutex is locked`);
  }
  private onOrganizationDeleted = async(apsOrganizationId: string): Promise<void> => {
    // TODO: test without arrow function
    // await this.collectionMutex.runExclusive(async () => {
    //   await this._onOrganizationDeleted(apsOrganizationId);
    // });
    const x = async(): Promise<void> => {
      await this._onOrganizationDeleted(apsOrganizationId);
    }
    await this.collectionMutex.runExclusive(x);
  }
  private _onOrganizationDeleted = async(apsOrganizationId: string): Promise<void> => {
    const funcName = '_onOrganizationDeleted';
    const logName = `${APSSessionService.name}.${funcName}()`;

    try {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_DELETED, message: 'APSOrganizationId', details: {
        organizationId: apsOrganizationId
      }}));

      // logout all users from this organization
      await this._logoutOrganizationAll({ apsOrganizationId: apsOrganizationId });

      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSED_ON_EVENT_DELETED, message: 'APSOrganizationId', details: {
        organizationId: apsOrganizationId
      }}));
  
    } catch(e) {
      const ex = new ServerErrorFromError(e, logName);
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_DELETED, message: ex.message , details: ex.toObject() }));
    } 
  }


  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSSessionService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    // do initialization
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public authenticateInternal = async({ username, password }:{
    username: string;
    password: string;
  }): Promise<string> => {
    const funcName = 'authenticateInternal';
    const logName = `${APSSessionService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATING_USER, message: 'username', details: {
      username: username
    }}));

    // check if root
    if(username === APSUsersService.getRootApsUserLoginCredentials().username) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATING_USER, message: 'root user', details: undefined }));
      if(APSSecretsService.isMatch({
        secret: password,
        hashed: APSUsersService.getRootApsUserLoginCredentials().password
      })) {
        // return the user id
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATED_USER, message: 'userId', details: {
          userId: username
        }}));
        return username;
      } else {
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATING_USER, message: 'root: noPasswordMatch', details: undefined }));
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: username });
      }
    }
    // check DB
    try {
      // get the user from DB
      const apsUserInternal: APSUserInternal = await this.persistenceService.byId({
        documentId: username
      }) as APSUserInternal;

      if (!apsUserInternal.isActivated) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: username });
      }

      if(APSSecretsService.isMatch({
        secret: password,
        hashed: apsUserInternal.password
      })) {
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATED_USER, message: 'userId', details: {
          userId: username
        }}));
        return username;
      } else {
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATING_USER, message: 'user: noPasswordMatch', details: undefined }));
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: username });
      }
      
    } catch (e) {
      if (e instanceof ApiKeyNotFoundServerError) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: username });
      } else {
        throw e;
      }
    }
    
  }

  public login = async({ userId, refreshToken }:{
    userId: string;
    refreshToken: string;
  }): Promise<APSUserResponse> => {
    const funcName = 'login';
    const logName = `${APSSessionService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'userId', details: {
      userId: userId
    }}));

    // check if root
    if(userId === APSUsersService.getRootApsUserLoginCredentials().username) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'isRootUser', details: undefined }));
      // add the refreshToken to list
      APSUsersService.updateRootApsUserInternal({ refreshToken: refreshToken });
      return await APSUsersService.getRootApsUserResponse();
    }

    // check DB
    try {
      // get the user from DB
      const apsUserInternal: APSUserInternal = await this.persistenceService.byId({
        documentId: userId
      }) as APSUserInternal;

      if (!apsUserInternal.isActivated) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: userId });
      }

      // add the refreshToken to list
      apsUserInternal.refreshTokenList.push({ refreshToken: refreshToken });
      const updateInternal: Partial<APSUserInternal> = {
        refreshTokenList: apsUserInternal.refreshTokenList,
      };
      await this.persistenceService.update({ 
        collectionDocumentId: userId,
        collectionDocument: updateInternal,
        collectionSchemaVersion: APSUsersService.getDBObjectSchemaVersion(),
      });

      const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
      const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
      const apsUserResponse: APSUserResponse = APSUsersService.createAPSUserResponse({
        apsUserInternal: apsUserInternal, 
        apsOrganizationList: apsOrganizationList
      });
  
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_IN_USER, message: 'APSUserResponse', details: {
        apsUserResponse: apsUserResponse 
      }}));

      return apsUserResponse;
      
    } catch (e) {
      if (e instanceof ApiKeyNotFoundServerError) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: userId });
      } else {
        throw e;
      }
    }
  }

  // public refreshToken = async
  //   existingRefreshToken: refreshToken,
  //   newRefreshToken: newRefreshToken
  // })

  public refreshToken = async({ existingRefreshToken }:{
    existingRefreshToken: string;
  }): Promise<TRefreshTokenInternalResponse> => {
    const funcName = 'refreshToken';
    const logName = `${APSSessionService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    const userId: string = APSAuthStrategyService.getUserId_From_RefreshToken({ refreshToken: existingRefreshToken });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REFRESHING_USER_TOKEN, message: 'userId', details: {
      userId: userId
    }}));

    const newRefreshToken: string = APSAuthStrategyService.generateRefreshToken_For_InternalAuth({ userId: userId });

    // get the user details
    // check if root
    if(userId === APSUsersService.getRootApsUserLoginCredentials().username) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REFRESHING_USER_TOKEN, message: 'isRootUser', details: undefined }));
      const rootUser: APSUserInternal = APSUsersService.getRootApsUserInternal();
      const tokenIndex = rootUser.refreshTokenList.findIndex( (apsRefreshTokenInternal: APSRefreshTokenInternal) => {
        return apsRefreshTokenInternal.refreshToken === existingRefreshToken;
      });
      if (tokenIndex === -1) {
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REFRESHING_USER_TOKEN, message: 'no token match', details: {
          userId: userId
        }}));
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: userId });
      }
      // replace refreshToken in list
      rootUser.refreshTokenList[tokenIndex] = { refreshToken: newRefreshToken };
      return {
        newRefreshToken: newRefreshToken,
        userId: userId
      };
    }
    // check DB
    try {
      // get the user from DB
      const apsUserInternal: APSUserInternal = await this.persistenceService.byId({
        documentId: userId
      }) as APSUserInternal;

      if (!apsUserInternal.isActivated) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: userId });
      }
      const tokenIndex = apsUserInternal.refreshTokenList.findIndex( (apsRefreshTokenInternal: APSRefreshTokenInternal) => {
        return apsRefreshTokenInternal.refreshToken === existingRefreshToken;
      });
      if (tokenIndex === -1) {
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REFRESHING_USER_TOKEN, message: 'no token match', details: {
          userId: userId
        }}));
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: userId });
      }
      // replace refreshToken in list
      apsUserInternal.refreshTokenList[tokenIndex] = { refreshToken: newRefreshToken };
      const updateInternal: Partial<APSUserInternal> = {
        refreshTokenList: apsUserInternal.refreshTokenList,
      };
      await this.persistenceService.update({ 
        collectionDocumentId: userId,
        collectionDocument: updateInternal,
        collectionSchemaVersion: APSUsersService.getDBObjectSchemaVersion(),
      });
      return {
        newRefreshToken: newRefreshToken,
        userId: userId
      };
    } catch (e) {
      if (e instanceof ApiKeyNotFoundServerError) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: userId });
      } else {
        throw e;
      }
    }
  }

  public logout = async({ userId }:{
    userId: string;
  }): Promise<APSSessionLogoutResponse> => {    
    const funcName = 'logout';
    const logName = `${APSSessionService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    // check if root
    if(userId === APSUsersService.getRootApsUserLoginCredentials().username) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_USER, message: 'isRootUser', details: undefined }));
      const rootUser: APSUserInternal = APSUsersService.getRootApsUserInternal();
      // delete refreshToken
      rootUser.refreshTokenList = [];
    }
    // check DB
    try {
      // get the user from DB
      const apsUserInternal: APSUserInternal = await this.persistenceService.byId({
        documentId: userId
      }) as APSUserInternal;
      // delete refreshToken
      const updateInternal: Partial<APSUserInternal> = {
        refreshTokenList: [],
      };
      await this.persistenceService.update({ 
        collectionDocumentId: userId,
        collectionDocument: updateInternal,
        collectionSchemaVersion: APSUsersService.getDBObjectSchemaVersion(),
      });
    } catch (e) {
      if (e instanceof ApiKeyNotFoundServerError) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: userId });
      } else {
        throw e;
      }
    }
    
    const apsSessionLogoutResponse: APSSessionLogoutResponse = {
      success: true
    };
    return apsSessionLogoutResponse;
  }

  public test = async(): Promise<APSSessionTestResponse> => {
    const funcName = 'test';
    const logName = `${APSSessionService.name}.${funcName}()`;
    const response: APSSessionTestResponse = {
      success: true
    };
    return response;
  }

  /**
   * Invalidates all user sessions for this organization.
   */
  private _logoutOrganizationAll = async({ apsOrganizationId }:{
    apsOrganizationId: string;
  }): Promise<void> => {
    const funcName = '_logoutOrganizationAll';
    const logName = `${APSSessionService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_ORGANIZATION_ALL, message: 'apsOrganizationId', details: {
      apsOrganizationId: apsOrganizationId
    } }));

    throw new ServerError(logName, 'not implemented');
    // delete all refreshTokens from all users who are members of this organization

    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_OUT_ORGANIZATION_ALL, message: 'apsOrganizationId', details: {
    //   apsOrganizationId: apsOrganizationId
    // } }));

  } 
  
}

export default new APSSessionService();
