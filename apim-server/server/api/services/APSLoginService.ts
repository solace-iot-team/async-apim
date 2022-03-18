import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import APSUser = Components.Schemas.APSUser;
import APSUserLoginCredentials = Components.Schemas.APSUserLoginCredentials;
import { MongoPersistenceService } from '../../common/MongoPersistenceService';
import { ApiKeyNotFoundServerError, ApiNotAuthorizedServerError } from '../../common/ServerError';
import APSUsersService from './APSUsersService/APSUsersService';
import { APSUserId } from '../../../src/@solace-iot-team/apim-server-openapi-node';
import { APSUserLoginAsRequest } from '../../../src/@solace-iot-team/apim-server-openapi-node/models/APSUserLoginAsRequest';

export class APSLoginService {
  private static collectionName = "apsUsers";
  private persistenceService: MongoPersistenceService;

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSLoginService.collectionName); 
  }

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSLoginService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    // do initialization
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public login = async(apsUserLoginCredentials: APSUserLoginCredentials): Promise<APSUser> => {
    const funcName = 'login';
    const logName = `${APSLoginService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'apsUserLoginCredentials', details: {
      apsUserLoginCredentials: apsUserLoginCredentials
    }}));

    // check if root
    if (apsUserLoginCredentials.userId === APSUsersService.getRootApsUserLoginCredentials().userId) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'isRootUser', details: undefined }));
      if (apsUserLoginCredentials.userPwd === APSUsersService.getRootApsUserLoginCredentials().userPwd) {
        return APSUsersService.getRootApsUser();
      } else {
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_USER, message: 'noPasswordMatch', details: undefined }));
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginCredentials.userId });
      }
    }
    // check internal DB 
    try {
      const loggedIn: APSUser = await this.persistenceService.byId({
        documentId: apsUserLoginCredentials.userId
      }) as APSUser;
      if (!loggedIn.isActivated || loggedIn.password !== apsUserLoginCredentials.userPwd) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginCredentials.userId });
      }
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_IN_USER, message: 'loggedIn', details: {
        apsUser: loggedIn 
      }}));
      return loggedIn;
    } catch (e) {
      if (e instanceof ApiKeyNotFoundServerError) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginCredentials.userId });
      } else {
        throw e;
      }
    }
  }

  public loginAs = async(apsUserLoginAsRequest: APSUserLoginAsRequest): Promise<APSUser> => {
    const funcName = 'loginAs';
    const logName = `${APSLoginService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_AS_USER, message: 'apsUserLoginAsRequest', details: {
      apsUserLoginAsRequest: apsUserLoginAsRequest
    }}));

    // check if root
    if (apsUserLoginAsRequest.userId === APSUsersService.getRootApsUserLoginCredentials().userId) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_AS_USER, message: 'isRootUser', details: undefined }));
      ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_IN_AS_USER, message: 'isRootUser, not allowed', details: undefined }));
      throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginAsRequest.userId });
    }
    // check internal DB 
    try {
      const loggedIn: APSUser = await this.persistenceService.byId({
        documentId: apsUserLoginAsRequest.userId
      }) as APSUser;
      // TODO: check if user has given consent
      // if (!loggedIn.hasGivenConsent) {
      //   throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginAsRequest.userId });
      // }
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_IN_AS_USER, message: 'loggedIn', details: {
        apsUser: loggedIn 
      }}));
      return loggedIn;
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

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_ALL, message: 'all users' }));

    // FUTURE: invalidate all logged in user tokens

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_OUT_ALL, message: 'all users' }));

  }

  public logout = async({ apsUserId }:{
    apsUserId: APSUserId;
  }): Promise<void> => {
    const funcName = 'logout';
    const logName = `${APSLoginService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGING_OUT_USER, message: 'apsUserId', details: {
      apsUserId: apsUserId
    } }));

    const loggedOut: APSUser = await this.persistenceService.byId({
      documentId: apsUserId
    }) as APSUser;

    // FUTURE: invalidate user token

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.LOGGED_OUT_USER, message: 'apsUserId', details: {
      apsUser: loggedOut
    } }));

  }


}

export default new APSLoginService();
