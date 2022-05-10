import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import { MongoPersistenceService } from '../../common/MongoPersistenceService';
import { ApiKeyNotFoundServerError, ApiNotAuthorizedServerError, ServerErrorFromError } from '../../common/ServerError';
import APSUsersService, { APSUserInternal } from './APSUsersService/APSUsersService';
import { 
  APSSessionLogoutResponse, 
  APSUserResponse, 
 } from '../../../src/@solace-iot-team/apim-server-openapi-node';
 import APSOrganizationsServiceEventEmitter from './apsAdministration/APSOrganizationsServiceEvent';
import APSSecretsService from "../../common/authstrategies/APSSecretsService";
import APSAuthStrategyService from "../../common/authstrategies/APSAuthStrategyService";
import { APSSessionTestResponse } from "../../../src/@solace-iot-team/apim-server-openapi-node/models/APSSessionTestResponse";

export type TRefreshTokenInternalResponse = {
  userId: string;
  newRefreshToken: string;
}

export type APSSessionUser = Pick<APSUserInternal, "isActivated" | "userId" | "sessionInfo" | "password"> & {
  // TODO: needs to be a list by organzationId & businessGroupId
  authorizedResourcePathList: Array<string>;
};

export class APSSessionService {
  // private static collectionName = "apsUsers";
  private static collectionName = APSUsersService.getCollectionName();
  private persistenceService: MongoPersistenceService;
  // private collectionMutex = new Mutex();

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSSessionService.collectionName); 
    APSOrganizationsServiceEventEmitter.on('deleted', this.onOrganizationDeleted);
  }

  // make public for test access
  public wait4CollectionUnlock = async() => {
    await APSUsersService.wait4CollectionUnlock();
  }

  /**
   * Invalidates all user sessions.
   */
  private logoutAll_internal = async({ organizationId }:{
    organizationId?: string;
  }): Promise<void> => {
    const funcName = 'logoutAll_internal';
    const logName = `${APSSessionService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_ALL, message: 'logout all users', details: {
      organizationId: organizationId
    }}));

    // delete refreshToken from all users
    // TODO: implement logging out of just if logged into this organization
    const updateInternal: Partial<APSUserInternal> = {
      sessionInfo: {
        refreshToken: []
      }
    };

    await this.persistenceService.updateAll({ update: updateInternal });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_OUT_ALL, message: 'logout all users', details: {
      organizationId: organizationId
    }}));

  } 
  
  private onOrganizationDeleted = async(apsOrganizationId: string): Promise<void> => {
    // TODO: test without arrow function
    // await this.collectionMutex.runExclusive(async () => {
    //   await this._onOrganizationDeleted(apsOrganizationId);
    // });
    const x = async(): Promise<void> => {
      await this._onOrganizationDeleted(apsOrganizationId);
    }
    await APSUsersService.getCollectionMutex().runExclusive(x);
  }
  private _onOrganizationDeleted = async(apsOrganizationId: string): Promise<void> => {
    const funcName = '_onOrganizationDeleted';
    const logName = `${APSSessionService.name}.${funcName}()`;

    try {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_DELETED, message: 'APSOrganizationId', details: {
        organizationId: apsOrganizationId
      }}));

      // logout all users from this organization
      await this.logoutAll_internal({ organizationId: apsOrganizationId });

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

  private map_ApsUserInternal_To_ApsSessionUser = ({ apsUserInternal }:{
    apsUserInternal: APSUserInternal;
  }): APSSessionUser => {
    // TODO: calculate the authorizedResourcePathList from roles, etc.
    return {
      isActivated: apsUserInternal.isActivated,
      authorizedResourcePathList: ['path1', 'path2'],
      userId: apsUserInternal.userId,
      sessionInfo: apsUserInternal.sessionInfo,
      password: apsUserInternal.password,
    };
  }

  private deleteRefreshToken_internal = async({ userId }:{
    userId: string;
  }): Promise<void> => {
    // check if root
    if(userId === APSUsersService.getRootApsUserLoginCredentials().username) {
      return APSUsersService.deleteRefreshTokenRootApsUserInternal();
    }
    // DB
    const apsUserInternal: APSUserInternal = await this.persistenceService.byId({
      documentId: userId
    }) as APSUserInternal;
    const updateInternal: Partial<APSUserInternal> = {
      sessionInfo: {
        ...apsUserInternal.sessionInfo,
        refreshToken: []
      }
    };
    await APSUsersService.update_internal({ userId: userId, apsUserUpdate: updateInternal });
    return;
  }

  private byId_internal = async({ userId }: {
    userId: string;
  }): Promise<APSSessionUser> => {
    // check if root
    if(userId === APSUsersService.getRootApsUserLoginCredentials().username) {
      return this.map_ApsUserInternal_To_ApsSessionUser({ 
        apsUserInternal: APSUsersService.getRootApsUserInternal()
      });
    }
    // get from DB
    const apsUserInternal: APSUserInternal = await this.persistenceService.byId({
      documentId: userId
    }) as APSUserInternal;
    return this.map_ApsUserInternal_To_ApsSessionUser({ 
      apsUserInternal: apsUserInternal
    });
  }

  public byId = async({ userId }: {
    userId: string;
  }): Promise<APSSessionUser> => {
    await this.wait4CollectionUnlock();
    return await this.byId_internal({ userId: userId });
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

    const apsSessionUser: APSSessionUser = await this.byId_internal({ userId: username });
    if( 

      !apsSessionUser.isActivated || 

      !APSSecretsService.isMatch({
        secret: password,
        hashed: apsSessionUser.password
      })

    ) throw new ApiNotAuthorizedServerError(logName, undefined, { userId: username });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATED_USER, message: 'userId', details: {
      userId: username
    }}));

    return username;


    // // check if root
    // if(username === APSUsersService.getRootApsUserLoginCredentials().username) {
    //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATING_USER, message: 'root user', details: undefined }));
    //   if(APSSecretsService.isMatch({
    //     secret: password,
    //     hashed: APSUsersService.getRootApsUserLoginCredentials().password
    //   })) {
    //     // return the user id
    //     ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATED_USER, message: 'userId', details: {
    //       userId: username
    //     }}));
    //     return username;
    //   } else {
    //     ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATING_USER, message: 'root: noPasswordMatch', details: undefined }));
    //     throw new ApiNotAuthorizedServerError(logName, undefined, { userId: username });
    //   }
    // }
    // check DB
    // try {
    //   // get the user from DB
    //   const apsUserInternal: APSUserInternal = await this.persistenceService.byId({
    //     documentId: username
    //   }) as APSUserInternal;

    //   if (!apsUserInternal.isActivated) {
    //     throw new ApiNotAuthorizedServerError(logName, undefined, { userId: username });
    //   }

    //   if(APSSecretsService.isMatch({
    //     secret: password,
    //     hashed: apsUserInternal.password
    //   })) {
    //     ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATED_USER, message: 'userId', details: {
    //       userId: username
    //     }}));
    //     return username;
    //   } else {
    //     ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.AUTHENTICATING_USER, message: 'user: noPasswordMatch', details: undefined }));
    //     throw new ApiNotAuthorizedServerError(logName, undefined, { userId: username });
    //   }
      
    // } catch (e) {
    //   if (e instanceof ApiKeyNotFoundServerError) {
    //     throw new ApiNotAuthorizedServerError(logName, undefined, { userId: username });
    //   } else {
    //     throw e;
    //   }
    // }
    
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

      // update sessionInfo
      const updateInternal: Partial<APSUserInternal> = {
        sessionInfo: {
          refreshToken: [refreshToken],
          lastLoginTimestamp: Date.now(),
        }
      };
      const apsUserResponse: APSUserResponse = await APSUsersService.update_internal({ userId: userId, apsUserUpdate: updateInternal });
  
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
      APSUsersService.updateRootApsUserInternal({ refreshToken: newRefreshToken });
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REFRESHED_USER_TOKEN, message: 'isRootUser', details: undefined }));
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
      // update sessionInfo
      const updateInternal: Partial<APSUserInternal> = {
        sessionInfo: {
          refreshToken: [newRefreshToken],
          lastLoginTimestamp: Date.now(),
        }
      };
      await APSUsersService.update_internal({ userId: userId, apsUserUpdate: updateInternal });
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REFRESHED_USER_TOKEN, message: 'user', details: { userId: userId }}));      
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

    await this.wait4CollectionUnlock();

    await this.deleteRefreshToken_internal({ userId: userId });
    
    const apsSessionLogoutResponse: APSSessionLogoutResponse = {
      success: true
    };

    return apsSessionLogoutResponse;
  }

  public test = async(): Promise<APSSessionTestResponse> => {
    const response: APSSessionTestResponse = {
      success: true
    };
    return response;
  }
  
}

export default new APSSessionService();
