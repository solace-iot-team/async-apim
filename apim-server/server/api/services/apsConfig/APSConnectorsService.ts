import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import APSConnector = Components.Schemas.APSConnector;
import APSConnectorCreateRequest = Components.Schemas.APSConnectorCreate;
import APSConnectorReplaceRequest = Components.Schemas.APSConnectorReplace;
import APSListResponseMeta = Components.Schemas.APSListResponseMeta;
import { MongoPersistenceService, TMongoAllReturn } from '../../../common/MongoPersistenceService';
import APSConnectorId = Components.Schemas.APSId;
import { ApiInternalServerError, ApiObjectNotFoundServerError } from '../../../common/ServerError';

export type TAPSListAPSConnectorResponse = APSListResponseMeta & { list: Array<APSConnector> };

export class APSConnectorsService {
  private static collectionName = "apsConnectors";
  private persistenceService: MongoPersistenceService;
  
  constructor() {
    const funcName = 'constructor';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    this.persistenceService = new MongoPersistenceService(APSConnectorsService.collectionName);
  }

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    // await this.persistenceService.dropCollection();
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public all = async(): Promise<TAPSListAPSConnectorResponse> => {
    const funcName = 'all';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all();
    return {
      list: mongoAllReturn.documentList as Array<APSConnector>,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async(apsConnectorId: APSConnectorId): Promise<APSConnector> => {
    const funcName = 'byId';
    const logName = `${APSConnectorsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnectorId', details: apsConnectorId}));

    const apsConnector: APSConnector = await this.persistenceService.byId(apsConnectorId) as APSConnector;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnector', details: apsConnector}));

    return apsConnector;
  }

  public byActive = async(): Promise<APSConnector> => {
    const funcName = 'byActive';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    const filter = { isActive: true };
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all(undefined, undefined, { filter: filter } );

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'mongoAllReturn', details: mongoAllReturn}));

    if (mongoAllReturn.documentList.length > 1) {
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.API_SERVICE_ERROR, message: 'expecting 0 or 1 active connectors', details: mongoAllReturn}));
      throw new ApiInternalServerError(logName, `expecting 0 or 1 active connectors, found=${mongoAllReturn.documentList.length}`);
    }
    const returnList: Array<APSConnector>  = mongoAllReturn.documentList as Array<APSConnector>;
    if(returnList.length === 0) throw new ApiObjectNotFoundServerError(logName, undefined, { collectionName: APSConnectorsService.collectionName, filter: filter });
    const apsConnector: APSConnector = returnList[0];
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnector', details: apsConnector}));
    return apsConnector;
  }

  public create = async(apsConnectorCreateRequest: APSConnectorCreateRequest): Promise<APSConnector> => {
    const funcName = 'create';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    const create: APSConnector = {
      ...apsConnectorCreateRequest,
      isActive: false
    }
    const created: APSConnector = await this.persistenceService.create(apsConnectorCreateRequest.connectorId, create) as APSConnector;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'created', details: created}));

    return created;
  }

  public replace = async(apsConnectorId: APSConnectorId, apsConnectorReplaceRequest: APSConnectorReplaceRequest): Promise<APSConnector> => {
    const funcName = 'replace';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    const current: APSConnector = await this.persistenceService.byId(apsConnectorId) as APSConnector;
    const replace: APSConnector = {
      ...apsConnectorReplaceRequest,
      connectorId: apsConnectorId,
      isActive: current.isActive
    }
    const replaced: APSConnector = await this.persistenceService.replace(apsConnectorId, replace) as APSConnector;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replaced', details: replaced}));

    return replaced;
  }

  public setActive = async(apsConnectorId: APSConnectorId): Promise<APSConnector> => {
    const funcName = 'setActive';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    const newActive: APSConnector = await this.persistenceService.byId(apsConnectorId) as APSConnector;
    let oldActive: APSConnector | undefined = undefined;
    try {
      oldActive = await this.byActive();
    } catch (e) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'no active connector found', details: undefined }));
    }
    if(oldActive) {
      oldActive.isActive = false;
      const replacedOldActive: APSConnector = await this.persistenceService.replace(oldActive.connectorId, oldActive) as APSConnector;
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replacedOldActive', details: replacedOldActive }));
    }
    newActive.isActive = true;
    const replacedNewActive: APSConnector = await this.persistenceService.replace(apsConnectorId, newActive) as APSConnector;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replacedNewActive', details: replacedNewActive }));

    return replacedNewActive;
  }

  public delete = async(apsConnectorId: APSConnectorId) => {
    const funcName = 'delete';
    const logName = `${APSConnectorsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnectorId', details: apsConnectorId }));

    const deletedCount: number = await this.persistenceService.delete(apsConnectorId);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'deletedCount', details: deletedCount }));

  }

}

export default new APSConnectorsService();
