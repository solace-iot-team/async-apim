import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { MongoPersistenceService, TMongoAllReturn } from '../../../common/MongoPersistenceService';
import { 
  APSId, 
  APSOrganization, 
  APSOrganizationCreate, 
  APSOrganizationList, 
  APSOrganizationUpdate, 
  ListAPSOrganizationResponse 
} from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSOrganizationsServiceEventEmitter from './APSOrganizationsServiceEvent';
import { APSOrganizationsDBMigrate } from './APSOrganizationsDBMigrate';

export class APSOrganizationsService {
  private static collectionName = "apsOrganizations";
  private static collectionSchemaVersion = 0;
  private persistenceService: MongoPersistenceService;
  
  constructor() {
    this.persistenceService = new MongoPersistenceService(APSOrganizationsService.collectionName);
  }

  public getPersistenceService = (): MongoPersistenceService => {
    return this.persistenceService;
  }
  public getCollectionName = (): string => {
    return APSOrganizationsService.collectionName;
  }
  public getDBObjectSchemaVersion = (): number => {
    return APSOrganizationsService.collectionSchemaVersion;
  }

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));

    // for devel: drops the connector collection
    // await this.persistenceService.dropCollection();

    await this.persistenceService.initialize();
    
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public bootstrap = async(): Promise<void> => {
    const funcName = 'bootstrap';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING }));
    // placeholder
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPED }));
  }

  public migrate = async(): Promise<void> => {
    const funcName = 'migrate';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING }));
    await APSOrganizationsDBMigrate.migrate(this);
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED }));
  }

  public all = async(): Promise<ListAPSOrganizationResponse> => {
    const funcName = 'all';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSOrganizationList' }));

    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({});
    const list: APSOrganizationList = mongoAllReturn.documentList;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSOrganizationList', details: list }));

    return {
      list: list,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async(apsOrganizationId: APSId): Promise<APSOrganization> => {
    const funcName = 'byId';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSOrganization', details: {
      apsOrganizationId: apsOrganizationId
    }}));

    const apsOrganization: APSOrganization = await this.persistenceService.byId({
      documentId: apsOrganizationId
    }) as APSOrganization;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSOrganization', details: apsOrganization }));

    return apsOrganization;
  }

  public create = async(apsOrganizationCreate: APSOrganizationCreate): Promise<APSOrganization> => {
    const funcName = 'create';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, message: 'APSOrganizationCreate', details: apsOrganizationCreate }));

    const created: APSOrganization = await this.persistenceService.create({
      collectionDocumentId: apsOrganizationCreate.organizationId,
      collectionDocument: apsOrganizationCreate,
      collectionSchemaVersion: APSOrganizationsService.collectionSchemaVersion
    });

    // emit created event
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTING_EVENT, message: 'created', details: {
      apsOrganizationId: apsOrganizationCreate.organizationId,
      APSOrganization: created
    }}));
    APSOrganizationsServiceEventEmitter.emit('created', apsOrganizationCreate.organizationId, created);
    
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATED, message: 'APSOrganization', details: created}));

    return created;
  }

  public update = async(apsOrganizationId: string, apsOrganizationUpdateRequest: APSOrganizationUpdate): Promise<APSOrganization> => {
    const funcName = 'update';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, message: 'APSOrganizationUpdate', details: {
      apsOrganizationId: apsOrganizationId,
      apsOrganizationUpdateRequest: apsOrganizationUpdateRequest 
    }}));

    const updated: APSOrganization = await this.persistenceService.update({
      collectionDocumentId: apsOrganizationId,
      collectionDocument: apsOrganizationUpdateRequest,
      collectionSchemaVersion: APSOrganizationsService.collectionSchemaVersion
    });

    // emit updated event
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTING_EVENT, message: 'updated', details: {
      apsOrganizationId: apsOrganizationId,
      APSOrganization: updated
    }}));
    APSOrganizationsServiceEventEmitter.emit('updated', apsOrganizationId, updated);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATED, message: 'APSOrganization', details: updated }));

    return updated;
  }

  public delete = async(apsOrganizationId: string): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, message: 'APSOrganization', details: {
      apsOrganizationId: apsOrganizationId
    }}));

    const deleted = (await this.persistenceService.delete({
      documentId: apsOrganizationId
    }) as unknown) as APSOrganization;
    
    // emit deleted event
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTING_EVENT, message: 'deleted', details: {
      apsOrganizationId: apsOrganizationId,
    }}));
    APSOrganizationsServiceEventEmitter.emit('deleted', apsOrganizationId);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETED, message: 'APSOrganization', details: deleted }));

  }

}

export default new APSOrganizationsService();
