import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import APSUser = Components.Schemas.APSUser;
import APSUserLoginCredentials = Components.Schemas.APSUserLoginCredentials;
import { MongoPersistenceService } from '../../common/MongoPersistenceService';
import { ApiKeyNotFoundServerError, ApiNotAuthorizedServerError } from '../../common/ServerError';
import APSUsersService from './APSUsersService/APSUsersService';

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

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsUserLoginCredentials', details: apsUserLoginCredentials }));

    // check if root
    if (apsUserLoginCredentials.userId === APSUsersService.getRootApsUserLoginCredentials().userId) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'isRootUser', details: undefined }));
      if (apsUserLoginCredentials.userPwd === APSUsersService.getRootApsUserLoginCredentials().userPwd) {
        return APSUsersService.getRootApsUser();
      } else {
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'noPasswordMatch', details: undefined }));
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
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'loggedIn', details: loggedIn }));
      return loggedIn;
    } catch (e) {
      if (e instanceof ApiKeyNotFoundServerError) {
        throw new ApiNotAuthorizedServerError(logName, undefined, { userId: apsUserLoginCredentials.userId });
      } else {
        throw e;
      }
    }
  }

}

export default new APSLoginService();
