import { Mutex } from "async-mutex";
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import { MongoPersistenceService } from '../../common/MongoPersistenceService';
import { ApiKeyNotFoundServerError, ApiNotAuthorizedServerError, ServerErrorFromError } from '../../common/ServerError';
import APSUsersService, { APSUserInternal } from './APSUsersService/APSUsersService';
import { 
  APSOrganizationList, 
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

export class APSLoginService {
  private static collectionName = "apsUsers";
  private persistenceService: MongoPersistenceService;
  private collectionMutex = new Mutex();

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSLoginService.collectionName); 
    APSOrganizationsServiceEventEmitter.on('deleted', this.onOrganizationDeleted);
  }

  // make public for test access
  public wait4CollectionUnlock = async() => {
    const funcName = 'wait4CollectionUnlock';
    const logName = `${APSLoginService.name}.${funcName}()`;
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
    const logName = `${APSLoginService.name}.${funcName}()`;

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
    const logName = `${APSLoginService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    // do initialization
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public login = async(apsUserLoginCredentials: APSUserLoginCredentials): Promise<APSUserResponse> => {
    const funcName = 'login';
    const logName = `${APSLoginService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'apsUserLoginCredentials', details: {
      apsUserLoginCredentials: apsUserLoginCredentials
    }}));

    // check if root
    if (apsUserLoginCredentials.username === APSUsersService.getRootApsUserLoginCredentials().username) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'isRootUser', details: undefined }));
      if (apsUserLoginCredentials.password === APSUsersService.getRootApsUserLoginCredentials().password) {
        return await APSUsersService.getRootApsUserResponse();
      } else {
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'noPasswordMatch', details: undefined }));
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginCredentials.username });
      }
    }
    
    // check internal DB 
    try {

      const loggedIn: APSUserInternal = await this.persistenceService.byId({
        documentId: apsUserLoginCredentials.username
      }) as APSUserInternal;

      if (!loggedIn.isActivated) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginCredentials.username });
      }

      if(!APSSecretsService.isMatch({ secret: apsUserLoginCredentials.password, hashed: loggedIn.password })) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginCredentials.username });
      }

      const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
      const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
      const apsUserResponse: APSUserResponse = APSUsersService.createAPSUserResponse({
        apsUserInternal: loggedIn, 
        apsOrganizationList: apsOrganizationList
      });
  
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_IN_USER, message: 'APSUserResponse', details: {
        apsUserResponse: apsUserResponse 
      }}));
      return apsUserResponse;
    } catch (e) {
      if (e instanceof ApiKeyNotFoundServerError) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginCredentials.username });
      } else {
        throw e;
      }
    }
  }

  public loginAs = async(apsUserLoginAsRequest: APSUserLoginAsRequest): Promise<APSUserResponse> => {
    const funcName = 'loginAs';
    const logName = `${APSLoginService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_AS_USER, message: 'APSUserLoginAsRequest', details: {
      apsUserLoginAsRequest: apsUserLoginAsRequest
    }}));

    // check if root
    if (apsUserLoginAsRequest.userId === APSUsersService.getRootApsUserLoginCredentials().username) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_AS_USER, message: 'isRootUser', details: undefined }));
      ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_AS_USER, message: 'isRootUser, not allowed', details: undefined }));
      throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginAsRequest.userId });
    }
    // check internal DB 
    try {
      const loggedIn: APSUserInternal = await this.persistenceService.byId({
        documentId: apsUserLoginAsRequest.userId
      }) as APSUserInternal;
      // TODO: check if user has given consent
      // if (!loggedIn.hasGivenConsent) {
      //   throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginAsRequest.userId });
      // }
      const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
      const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
      const apsUserResponse: APSUserResponse = APSUsersService.createAPSUserResponse({
        apsUserInternal: loggedIn, 
        apsOrganizationList: apsOrganizationList
      });

      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_IN_AS_USER, message: 'APSUserResponse', details: {
        apsUserResponse: apsUserResponse 
      }}));

      return apsUserResponse;

    } catch (e) {
      if (e instanceof ApiKeyNotFoundServerError) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginAsRequest.userId });
      } else {
        throw e;
      }
    }
  }

  public logoutAll = async(): Promise<void> => {
    const funcName = 'logoutAll';
    const logName = `${APSLoginService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_ALL, message: 'all users' }));

    // FUTURE: invalidate all logged in user tokens

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_OUT_ALL, message: 'all users' }));

  }

  public logout = async({ apsUserId }:{
    apsUserId: string;
  }): Promise<void> => {
    const funcName = 'logout';
    const logName = `${APSLoginService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_USER, message: 'apsUserId', details: {
      apsUserId: apsUserId
    } }));

    const loggedOut: APSUserCreate = await this.persistenceService.byId({
      documentId: apsUserId
    }) as APSUserCreate;

    // FUTURE: invalidate user token

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_OUT_USER, message: 'apsUserId', details: {
      apsUser: loggedOut
    } }));

  }

  /**
   * Invalidates all user sessions for this organization.
   */
  private _logoutOrganizationAll = async({ apsOrganizationId }:{
    apsOrganizationId: string;
  }): Promise<void> => {
    const funcName = '_logoutOrganizationAll';
    const logName = `${APSLoginService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_ORGANIZATION_ALL, message: 'apsOrganizationId', details: {
      apsOrganizationId: apsOrganizationId
    } }));

    // FUTURE: invalidate all user token currently logged into this organization

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_OUT_ORGANIZATION_ALL, message: 'apsOrganizationId', details: {
      apsOrganizationId: apsOrganizationId
    } }));

  } 

  /**
   * Invalidates all user sessions for this organzation, forcing them to login again.
   * Checks if organization exists.
   */
  public logoutOrganizationAll = async({ apsOrganizationId }:{
    apsOrganizationId: string;
  }): Promise<void> => {
    const funcName = 'logoutOrganizationAll';
    const logName = `${APSLoginService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    await this._logoutOrganizationAll({ apsOrganizationId: apsOrganizationId });

  }

}

export default new APSLoginService();
