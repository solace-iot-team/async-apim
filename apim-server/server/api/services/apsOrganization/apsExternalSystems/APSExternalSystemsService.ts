import { Mutex } from "async-mutex";
import { EServerStatusCodes, ServerLogger } from '../../../../common/ServerLogger';
import { 
  MongoPersistenceService, 
  TMongoAllReturn 
} from '../../../../common/MongoPersistenceService';
import { 
  APSExternalSystemList,
  ListAPSExternalSystemsResponse,
  APSExternalSystem,
  APSExternalSystemCreate,
  APSExternalSystemUpdate
 } from '../../../../../src/@solace-iot-team/apim-server-openapi-node';
import { 
  ServerErrorFromError, 
} from '../../../../common/ServerError';
import APSOrganizationsServiceEventEmitter from '../../apsAdministration/APSOrganizationsServiceEvent';
import APSExternalSystemsServiceEventEmitter from "./APSExternalSystemsServiceEvent";
import { APSExternalSystemsDBMigrate } from "./APSExternalSystemsDBMigrate";
import { ValidationUtils } from "../../../utils/ValidationUtils";
import APSOrganizationId = Components.Schemas.APSId;
import APSExternalSystemId = Components.Schemas.APSId;
import APSBusinessGroupsService from "../apsBusinessGroups/APSBusinessGroupsService";


export class APSExternalSystemsService {
  private static collectionName = "apsExternalSystems";
  private static apiObjectName = "APSExernalSystem";
  private static collectionSchemaVersion = 1;
  private persistenceService: MongoPersistenceService;
  private collectionMutex = new Mutex();

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSExternalSystemsService.collectionName, false);
    APSOrganizationsServiceEventEmitter.on('deleted', this.onOrganizationDeleted);
  }

  // public for test access
  public wait4CollectionUnlock = async() => {
    const funcName = 'wait4CollectionUnlock';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;
    
    await this.collectionMutex.waitForUnlock();
    // const releaser = await this.collectionMutex.acquire();
    // releaser();
    if(this.collectionMutex.isLocked()) throw new Error(`${logName}: mutex is locked`);

  }
  private onOrganizationDeleted = async(apsOrganizationId: APSOrganizationId): Promise<void> => {
    // TODO: test without arrow function
    // await this.collectionMutex.runExclusive(async () => {
    //   await this._onOrganizationDeleted(apsOrganizationId);
    // });
    const x = async(): Promise<void> => {
      await this._onOrganizationDeleted(apsOrganizationId);
    }
    await this.collectionMutex.runExclusive(x);
  }

  private _onOrganizationDeleted = async(apsOrganizationId: APSOrganizationId): Promise<void> => {
    const funcName = '_onOrganizationDeleted';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;

    try {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'organizationId', details: {
        organizationId: apsOrganizationId
      }}));

      const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
        organizationId: apsOrganizationId
      });
      const list: APSExternalSystemList = mongoAllReturn.documentList;
      for(const element of list) {
        await this.persistenceService.delete({
          organizationId: apsOrganizationId,
          documentId: element.externalSystemId
        });
      }
  
    } catch(e) {
      const ex = new ServerErrorFromError(e, logName);
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: ex.message , details: ex.toObject() }));
    } 
  }

  public getPersistenceService = (): MongoPersistenceService => {
    return this.persistenceService;
  }
  public getCollectionName = (): string => {
    return APSExternalSystemsService.collectionName;
  }
  public getDBObjectSchemaVersion = (): number => {
    return APSExternalSystemsService.collectionSchemaVersion;
  }
  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    
    // for devel: drop the collection
    // await this.persistenceService.dropCollection();
    
    await this.persistenceService.initialize();

    // custom, one time maintenance
    // await this.persistenceService.delete("master.user@aps.com");

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public bootstrap = async(): Promise<void> => {
    const funcName = 'bootstrap';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING }));
    // placeholder
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPED }));
  }

  public migrate = async(): Promise<void> => {
    const funcName = 'migrate';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING }));
    await APSExternalSystemsDBMigrate.migrate(this);
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED }));
  }

  public all = async({ apsOrganizationId }: {
    apsOrganizationId: APSOrganizationId
  }): Promise<ListAPSExternalSystemsResponse> => {
    const funcName = 'all';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSExternalSystemList', details: {
      apsOrganizationId: apsOrganizationId,
     }}));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      organizationId: apsOrganizationId
    });
    const list: APSExternalSystemList = mongoAllReturn.documentList;
    
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSExternalSystemList', details: list }));

    return {
      list: list,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async({ apsOrganizationId, apsExternalSystemId }: {
    apsOrganizationId: APSOrganizationId;
    apsExternalSystemId: APSExternalSystemId;    
  }): Promise<APSExternalSystem> => {
    const funcName = 'byId';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSExternalSystem', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId
    }}));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    const response: APSExternalSystem = await this.persistenceService.byId({
      organizationId: apsOrganizationId,
      documentId: apsExternalSystemId 
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSExternalSystem', details: response }));

    return response;
  }

  public create = async({ apsOrganizationId, apsExternalSystemCreate }: {
    apsOrganizationId: APSOrganizationId;
    apsExternalSystemCreate: APSExternalSystemCreate;
  }): Promise<APSExternalSystem> => {
    const funcName = 'create';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, message: 'APSExternalSystem', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemCreate: apsExternalSystemCreate
    } }));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    const created: APSExternalSystem = await this.persistenceService.create({
      organizationId: apsOrganizationId,
      // collectionDocumentId: this.generateDocumentId(apsOrganizationId, apsExternalSystemCreate.externalSystemId),
      collectionDocumentId: apsExternalSystemCreate.externalSystemId,
      collectionDocument: apsExternalSystemCreate,
      collectionSchemaVersion: APSExternalSystemsService.collectionSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATED, message: 'APSExternalSystem', details: created }));
    
    return created;
  }

  public update = async({ apsOrganizationId, apsExternalSystemId, apsExternalSystemUpdate }: {
    apsOrganizationId: APSOrganizationId;
    apsExternalSystemId: APSExternalSystemId;
    apsExternalSystemUpdate: APSExternalSystemUpdate;
  }): Promise<APSExternalSystem> => {
    const funcName = 'update';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, message: 'APSExternalSystem', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId,
      apsExternalSystemUpdate: apsExternalSystemUpdate
    }}));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    const updated: APSExternalSystem = await this.persistenceService.update({
      organizationId: apsOrganizationId,
      collectionDocumentId: apsExternalSystemId,
      collectionDocument: apsExternalSystemUpdate,
      collectionSchemaVersion: APSExternalSystemsService.collectionSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATED, message: 'APSExternalSystem', details: updated }));

    return updated;
  }

  public delete = async({apsOrganizationId, apsExternalSystemId }: {
    apsOrganizationId: APSOrganizationId;
    apsExternalSystemId: APSExternalSystemId;
  }): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSExternalSystemsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, message: 'APSExternalSystem', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId
    }}));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    // TODO: revisit at a later date
    // for now, hardwire 
    await APSBusinessGroupsService.on_AwaitRequestDelete_ExternalSystem(apsOrganizationId, apsExternalSystemId);
    // // emit delete request
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTING_EVENT, message: 'await_request_delete', details: {
    //   apsOrganizationId: apsOrganizationId,
    //   apsExternalSystemId: apsExternalSystemId
    // }}));
    // // TODO: try: https://github.com/jameslnewell/wait-for-event
    // if(APSExternalSystemsServiceEventEmitter.listeners('await_request_delete').length > 0) {
    //   // TODO: needs to do this for every listener
    //   await new Promise( (resolve, reject) => {
    //     APSExternalSystemsServiceEventEmitter.emit('await_request_delete', apsOrganizationId, apsExternalSystemId, resolve, reject);
    //   }).catch( (e) => {
    //     throw e;
    //   });
    // }
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTED_EVENT, message: 'await_request_delete', details: {
    //   apsOrganizationId: apsOrganizationId,
    //   apsExternalSystemId: apsExternalSystemId
    // }}));

    const deleted: APSExternalSystem = (await this.persistenceService.delete({
      organizationId: apsOrganizationId,
      documentId: apsExternalSystemId
    }) as unknown) as APSExternalSystem;

    // emit deleted event
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTING_EVENT, message: 'deleted', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId
    }}));
    APSExternalSystemsServiceEventEmitter.emit('deleted', apsOrganizationId, apsExternalSystemId);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTED_EVENT, message: 'deleted', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId
    }}));

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETED, message: 'APSExternalSystem', details: deleted }));
  }
}

export default new APSExternalSystemsService();
