import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { MongoPersistenceService, TMongoAllReturn } from '../../../common/MongoPersistenceService';
import APSOrganizationId = Components.Schemas.APSId;
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

  public migrate = async(): Promise<void> => {
    const funcName = 'migrate';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING }));
    await APSOrganizationsDBMigrate.migrate(this);
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED }));
  }

  public all = async(): Promise<ListAPSOrganizationResponse> => {
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all();
    return {
      list: mongoAllReturn.documentList as APSOrganizationList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async(apsOrganizationId: APSId): Promise<APSOrganization> => {
    const funcName = 'byId';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsOrganizationId', details: apsOrganizationId}));

    const apsOrganization: APSOrganization = await this.persistenceService.byId(apsOrganizationId) as APSOrganization;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsOrganization', details: apsOrganization}));

    return apsOrganization;
  }

  public create = async(apsOrganizationCreateRequest: APSOrganizationCreate): Promise<APSOrganization> => {
    const funcName = 'create';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;
    const created: APSOrganization = await this.persistenceService.create({
      collectionDocumentId: apsOrganizationCreateRequest.organizationId,
      collectionDocument: apsOrganizationCreateRequest,
      collectionSchemaVersion: APSOrganizationsService.collectionSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'created', details: created}));

    return created;
  }

  public update = async(apsOrganizationId: APSId, apsOrganizationUpdateRequest: APSOrganizationUpdate): Promise<APSOrganization> => {
    const funcName = 'update';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;
    const updated: APSOrganization = await this.persistenceService.update({
      collectionDocumentId: apsOrganizationId,
      collectionDocument: apsOrganizationUpdateRequest,
      collectionSchemaVersion: APSOrganizationsService.collectionSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'updated', details: updated }));

    return updated;
  }

  public delete = async(apsOrganizationId: APSOrganizationId): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSOrganizationsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsOrganizationId', details: apsOrganizationId }));

    const deleted = (await this.persistenceService.delete(apsOrganizationId) as unknown) as APSOrganization;
    
    APSOrganizationsServiceEventEmitter.emit('deleted', apsOrganizationId);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'deleted', details: deleted }));

  }

}

export default new APSOrganizationsService();
