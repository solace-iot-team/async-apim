import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { MongoPersistenceService } from '../../../common/MongoPersistenceService';
import APSOrganizationId = Components.Schemas.APSId;

export class APSOrganizationssService {
  private static collectionName = "apsOrganizations";
  private static collectionSchemaVersion = 0;
  private persistenceService: MongoPersistenceService;
  
  constructor() {
    this.persistenceService = new MongoPersistenceService(APSOrganizationssService.collectionName);
  }

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSOrganizationssService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));

    // for devel: drops the connector collection
    // await this.persistenceService.dropCollection();

    await this.persistenceService.initialize();
    
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  // public all = async(): Promise<TAPSListAPSConnectorResponse> => {
  //   const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all();
  //   return {
  //     list: mongoAllReturn.documentList as Array<APSConnector>,
  //     meta: {
  //       totalCount: mongoAllReturn.totalDocumentCount
  //     }
  //   }
  // }

  // public byId = async(apsConnectorId: APSConnectorId): Promise<APSConnector> => {
  //   const funcName = 'byId';
  //   const logName = `${APSConnectorsService.name}.${funcName}()`;

  //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnectorId', details: apsConnectorId}));

  //   const apsConnector: APSConnector = await this.persistenceService.byId(apsConnectorId) as APSConnector;

  //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnector', details: apsConnector}));

  //   return apsConnector;
  // }

  // public create = async(apsConnectorCreateRequest: APSConnectorCreateRequest): Promise<APSConnector> => {
  //   const funcName = 'create';
  //   const logName = `${APSConnectorsService.name}.${funcName}()`;
  //   const create: APSConnector = {
  //     ...apsConnectorCreateRequest,
  //     isActive: false
  //   }
  //   const created: APSConnector = await this.persistenceService.create({
  //     collectionDocumentId: apsConnectorCreateRequest.connectorId,
  //     collectionDocument: create,
  //     collectionSchemaVersion: APSConnectorsService.collectionSchemaVersion
  //   });

  //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'created', details: created}));

  //   return created;
  // }

  // public replace = async(apsConnectorId: APSConnectorId, apsConnectorReplaceRequest: APSConnectorReplaceRequest): Promise<APSConnector> => {
  //   const funcName = 'replace';
  //   const logName = `${APSConnectorsService.name}.${funcName}()`;
  //   const current: APSConnector = await this.persistenceService.byId(apsConnectorId) as APSConnector;
  //   const replace: APSConnector = {
  //     ...apsConnectorReplaceRequest,
  //     connectorId: apsConnectorId,
  //     isActive: current.isActive
  //   }
  //   const replaced: APSConnector = await this.persistenceService.replace({
  //     collectionDocumentId: apsConnectorId,
  //     collectionDocument: replace,
  //     collectionSchemaVersion: APSConnectorsService.collectionSchemaVersion
  //   });

  //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replaced', details: replaced}));

  //   return replaced;
  // }

  // public setActive = async(apsConnectorId: APSConnectorId): Promise<APSConnector> => {
  //   const funcName = 'setActive';
  //   const logName = `${APSConnectorsService.name}.${funcName}()`;
  //   const newActive: APSConnector = await this.persistenceService.byId(apsConnectorId) as APSConnector;
  //   let oldActive: APSConnector | undefined = undefined;
  //   try {
  //     oldActive = await this.byActive();
  //   } catch (e) {
  //     ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'no active connector found', details: undefined }));
  //   }
  //   if(oldActive) {
  //     oldActive.isActive = false;
  //     const replacedOldActive: APSConnector = await this.persistenceService.replace({
  //       collectionDocumentId: oldActive.connectorId,
  //       collectionDocument: oldActive,
  //       collectionSchemaVersion: APSConnectorsService.collectionSchemaVersion
  //     });
  //     ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replacedOldActive', details: replacedOldActive }));
  //   }
  //   newActive.isActive = true;
  //   const replacedNewActive: APSConnector = await this.persistenceService.replace({
  //     collectionDocumentId: apsConnectorId,
  //     collectionDocument: newActive,
  //     collectionSchemaVersion: APSConnectorsService.collectionSchemaVersion
  //   });

  //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replacedNewActive', details: replacedNewActive }));

  //   return replacedNewActive;
  // }

  public delete = async(apsOrganizationId: APSOrganizationId): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSOrganizationssService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsOrganizationId', details: apsOrganizationId }));

    // const deletedOrganization = (await this.persistenceService.delete(apsOrganizationId) as unknown) as APSConnector;
    
    // call APSUsersService to notify of organization deletion?
    ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'implement delete organization', details: apsOrganizationId }));

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'deletedOrganization', details: apsOrganizationId }));

  }

}

export default new APSOrganizationssService();
