import { Mutex } from "async-mutex";
import { Filter } from 'mongodb';
import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { 
  MongoPersistenceService, 
  TMongoAllReturn 
} from '../../../common/MongoPersistenceService';
import { 
  ListAPSBusinessGroupsResponse,
  APSBusinessGroupResponseList,
  APSBusinessGroupUpdate,
  APSBusinessGroupCreate,
  APSBusinessGroupResponse,
  APSBusinessGroupBase,
  APSIdList,
  ListAPSBusinessGroupsExternalSystemResponse,
  APSBusinessGroupExternalResponseList,
  APSExternalReference,
  APSBusinessGroupExternalResponse
 } from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import { 
  ApiDuplicateKeyServerError,
  ApiInternalServerError, 
  ApiInvalidObjectReferencesServerError, 
  ApiKeyNotFoundServerError, 
  OrganizationNotFoundServerError, 
  ServerErrorFromError, 
  TApiInvalidObjectReferenceError
} from '../../../common/ServerError';
import APSOrganizationsServiceEventEmitter from '../apsAdministration/APSOrganizationsServiceEvent';
import APSOrganizationsService from '../apsAdministration/APSOrganizationsService';
import { APSBusinessGroupsDBMigrate } from './APSBusinessGroupsDBMigrate';
import APSOrganizationId = Components.Schemas.APSId;
import APSBusinessGroupId = Components.Schemas.APSId;
import APSExternalSystemId = Components.Schemas.APSId;
import APSExternalReferenceId = Components.Schemas.APSId;


export class APSBusinessGroupsService {
  private static collectionName = "apsBusinessGroups";
  private static apiObjectName = "APSBusinessGroup";
  private static collectionSchemaVersion = 1;
  // private static rootApsBusinessGroup: Components.Schemas.APSBusinessGroup;
  private persistenceService: MongoPersistenceService;
  private collectionMutex = new Mutex();

  constructor() {
    this.persistenceService = new MongoPersistenceService(APSBusinessGroupsService.collectionName, false);
    APSOrganizationsServiceEventEmitter.on('deleted', this.onOrganizationDeleted);
  }

  private wait4CollectionUnlock = async() => {
    const funcName = 'wait4CollectionUnlock';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;
    
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
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    try {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'organizationId', details: {
        organizationId: apsOrganizationId
      }}));

      const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
        organizationId: apsOrganizationId
      });
      const list: APSBusinessGroupResponseList = mongoAllReturn.documentList;
      for(const apsBusinessGroup of list) {
        await this.persistenceService.delete({
          organizationId: apsOrganizationId,
          collectionDocumentId: apsBusinessGroup.businessGroupId
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
    return APSBusinessGroupsService.collectionName;
  }
  public getDBObjectSchemaVersion = (): number => {
    return APSBusinessGroupsService.collectionSchemaVersion;
  }
  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    
    // for devel: drop the collection
    // await this.persistenceService.dropCollection();
    
    await this.persistenceService.initialize();
    
    // probably not required
    // APSBusinessGroupsService.rootApsBusinessGroup = {
    //   businessGroupId: '_aps_root_business_group_',
    //   businessGroupDisplayName: 'Root Business Group',
    //   ownerId: APSUsersService.getRootApsUser().userId,
    // }

    // custom, one time maintenance
    // await this.persistenceService.delete("master.user@aps.com");

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public bootstrap = async(): Promise<void> => {
    const funcName = 'bootstrap';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING }));
    // placeholder
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPED }));
  }

  public migrate = async(): Promise<void> => {
    const funcName = 'migrate';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING }));
    await APSBusinessGroupsDBMigrate.migrate(this);
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED }));
  }

  public all = async({ apsOrganizationId }: {
    apsOrganizationId: APSOrganizationId
  }): Promise<ListAPSBusinessGroupsResponse> => {
    const funcName = 'all';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsOrganizationId', details: {
      apsOrganizationId: apsOrganizationId,
     }}));

    await this.validateOrganization(apsOrganizationId);

    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      organizationId: apsOrganizationId
    });
    const apsBusinessGroupResponseList: APSBusinessGroupResponseList = mongoAllReturn.documentList;
    // collect all the children
    for(const apsBusinessGroupResponse of apsBusinessGroupResponseList) {
      apsBusinessGroupResponse.businessGroupChildIds = await this.listChildren(apsOrganizationId, apsBusinessGroupResponse.businessGroupId);
    }
    
    ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsBusinessGroupResponseList', details: apsBusinessGroupResponseList }));

    return {
      list: apsBusinessGroupResponseList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public allByExternalSystemId = async({ apsOrganizationId, apsExternalSystemId }: {
    apsOrganizationId: APSOrganizationId;
    apsExternalSystemId: APSExternalSystemId;
  }): Promise<ListAPSBusinessGroupsExternalSystemResponse> => {
    const funcName = 'allByExternalSystemId';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'externalSystem', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId
    }}));

    await this.validateOrganization(apsOrganizationId);

    // construct key
    const k: keyof APSBusinessGroupBase = 'externalReference';
    const sk: keyof APSExternalReference = 'externalSystemId';
    const filterKey = `${k}.${sk}`;
    const filter: Filter<any> = {};
    filter[filterKey] = apsExternalSystemId;

    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      organizationId: apsOrganizationId,
      searchInfo: {
        filter: filter
      }
    });
    const responseList: APSBusinessGroupExternalResponseList = mongoAllReturn.documentList;
    // collect all the children
    for(const response of responseList) {
      response.businessGroupChildIds = await this.listChildren(apsOrganizationId, response.businessGroupId);
    }

    ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'APSBusinessGroupExternalResponseList', details: responseList }));

    return {
      list: responseList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async({ apsOrganizationId, apsBusinessGroupId }: {
    apsOrganizationId: APSOrganizationId;
    apsBusinessGroupId: APSBusinessGroupId;    
  }): Promise<APSBusinessGroupResponse> => {
    const funcName = 'byId';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'input', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));

    await this.validateOrganization(apsOrganizationId);

    const apsBusinessGroup: APSBusinessGroupResponse = await this.persistenceService.byId({
      organizationId: apsOrganizationId,
      collectionDocumentId: apsBusinessGroupId 
    });
    apsBusinessGroup.businessGroupChildIds = await this.listChildren(apsOrganizationId, apsBusinessGroupId);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsBusinessGroup', details: apsBusinessGroup }));

    return apsBusinessGroup;
  }

  public byExternalReferenceId = async({ apsOrganizationId, apsExternalReferenceId }: {
    apsOrganizationId: APSOrganizationId;
    apsExternalReferenceId: APSExternalReferenceId;    
  }): Promise<APSBusinessGroupExternalResponse> => {
    const funcName = 'byExternalReferenceId';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'input', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalReferenceId: apsExternalReferenceId
    }}));

    await this.validateOrganization(apsOrganizationId);

    // construct key
    const k: keyof APSBusinessGroupBase = 'externalReference';
    const sk: keyof APSExternalReference = 'externalId';
    const filterKey = `${k}.${sk}`;
    const filter: Filter<any> = {};
    filter[filterKey] = apsExternalReferenceId;
    
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      organizationId: apsOrganizationId,
      searchInfo: {
        filter: filter
      }
    });
    const responseList: APSBusinessGroupExternalResponseList = mongoAllReturn.documentList;
    if(responseList.length === 0) {
      throw new ApiKeyNotFoundServerError(logName, undefined, { organizationId: apsOrganizationId, id: apsExternalReferenceId, collectionName: APSBusinessGroupsService.collectionName });
    } 
    if(responseList.length > 1) {
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.API_SERVICE_ERROR, message: 'multiple business groups found for external reference id', details: {
        apsOrganizationId: apsOrganizationId,
        apsExternalReferenceId: apsExternalReferenceId,
        responseList: responseList
      }}));
      throw new ApiInternalServerError(logName, 'api resource not operational');
    }
    const responseGroup: APSBusinessGroupExternalResponse = responseList[0];
    // collect all the children
    responseGroup.businessGroupChildIds = await this.listChildren(apsOrganizationId, responseGroup.businessGroupId);

    ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'APSBusinessGroupExternalResponse', details: responseGroup }));
    
    return responseGroup;
  }

  public create = async({ apsOrganizationId, apsBusinessGroup }: {
    apsOrganizationId: APSOrganizationId;
    apsBusinessGroup: APSBusinessGroupCreate;
  }): Promise<APSBusinessGroupResponse> => {
    const funcName = 'create';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'create', details: {
    //   apsOrganizationId: apsOrganizationId,
    //   apsBusinessGroup: apsBusinessGroup
    // } }));

    await this.validateOrganization(apsOrganizationId);
    await this.validateUniqueConstraints(apsOrganizationId, apsBusinessGroup);
    await this.validateReferences(apsOrganizationId, apsBusinessGroup);

    const created: APSBusinessGroupResponse = await this.persistenceService.create({
      organizationId: apsOrganizationId,
      collectionDocumentId: apsBusinessGroup.businessGroupId,
      collectionDocument: apsBusinessGroup,
      collectionSchemaVersion: APSBusinessGroupsService.collectionSchemaVersion
    });

    created.businessGroupChildIds = await this.listChildren(apsOrganizationId, apsBusinessGroup.businessGroupId);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'created', details: created }));
    
    return created;
  }

  public update = async({ apsOrganizationId, apsBusinessGroupId, apsBusinessGroupUpdate }: {
    apsOrganizationId: APSOrganizationId;
    apsBusinessGroupId: APSBusinessGroupId;
    apsBusinessGroupUpdate: APSBusinessGroupUpdate;
  }): Promise<APSBusinessGroupResponse> => {
    const funcName = 'update';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    await this.validateOrganization(apsOrganizationId);
    await this.validateUniqueConstraints(apsOrganizationId, apsBusinessGroupUpdate);
    await this.validateReferences(apsOrganizationId, { ...apsBusinessGroupUpdate, businessGroupId: apsBusinessGroupId });

    const updated: APSBusinessGroupResponse = await this.persistenceService.update({
      organizationId: apsOrganizationId,
      collectionDocumentId: apsBusinessGroupId,
      collectionDocument: apsBusinessGroupUpdate,
      collectionSchemaVersion: APSBusinessGroupsService.collectionSchemaVersion
    });
    updated.businessGroupChildIds = await this.listChildren(apsOrganizationId, apsBusinessGroupId);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'updated', details: updated }));

    return updated;
  }

  public delete = async({apsOrganizationId, apsBusinessGroupId }: {
    apsOrganizationId: APSOrganizationId;
    apsBusinessGroupId: APSBusinessGroupId;
  }): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'info', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));

    await this.validateOrganization(apsOrganizationId);
    await this.validateNoChildReferences(apsOrganizationId, apsBusinessGroupId);

    const deleted: APSBusinessGroupResponse = (await this.persistenceService.delete({
      organizationId: apsOrganizationId,
      collectionDocumentId: apsBusinessGroupId
    }) as unknown) as APSBusinessGroupResponse;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'deleted', details: deleted }));
  }

  private listChildren = async(apsOrganizationId: APSOrganizationId, apsBusinessGroupId: APSBusinessGroupId): Promise<APSIdList> => {

    const filter: Filter<APSBusinessGroupBase> = {
      businessGroupParentId: apsBusinessGroupId
    };
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      organizationId: apsOrganizationId,
      searchInfo: {
        filter: filter
      }
    });
    const childrenResponseList: APSBusinessGroupResponseList = mongoAllReturn.documentList;
    return childrenResponseList.map( (x) => {
      return x.businessGroupId
    });

  }

  private validateOrganization = async(apsOrganizationId: APSOrganizationId): Promise<void> => {
    const funcName = 'validateOrganization';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;
    try {
      await APSOrganizationsService.byId(apsOrganizationId);
    } catch(e) {
      // re-write error
      if(e instanceof ApiKeyNotFoundServerError) throw new OrganizationNotFoundServerError(logName, undefined, { organizationId: apsOrganizationId });
      else throw e;
    }
  }

  private validateUniqueConstraints = async(apsOrganizationId: APSOrganizationId, apsBusinessGroup: APSBusinessGroupCreate | APSBusinessGroupUpdate): Promise<void> => {
    const funcName = 'validateUniqueConstraints';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'starting', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroup: apsBusinessGroup
    }}));

    if(apsBusinessGroup.externalReference === undefined) return;

    // construct key
    const k: keyof APSBusinessGroupBase = 'externalReference';
    const sk: keyof APSExternalReference = 'externalId';
    const filterKey = `${k}.${sk}`;
    const filter: Filter<any> = {};
    filter[filterKey] = apsBusinessGroup.externalReference.externalId;
        
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      organizationId: apsOrganizationId,
      searchInfo: {
        filter: filter
      }
    });
    const responseList: APSBusinessGroupExternalResponseList = mongoAllReturn.documentList;
    if(responseList.length > 0) {
      throw new ApiDuplicateKeyServerError(logName, 'externalId already exists', { 
        organizationId: apsOrganizationId, 
        id: '',
        externalId: apsBusinessGroup.externalReference.externalId, 
        collectionName: APSBusinessGroupsService.collectionName 
      });
    } 
  }

  private validateNoChildReferences = async(apsOrganizationId: APSOrganizationId, apsBusinessGroupId: APSBusinessGroupId): Promise<void> => {
    const funcName = 'validateNoChildReferences';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'starting', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));

    const filter: Filter<APSBusinessGroupBase> = {
      businessGroupParentId: apsBusinessGroupId
    };
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      organizationId: apsOrganizationId,
      searchInfo: {
        filter: filter
      }
    });

    const apsBusinessGroupResponseList: APSBusinessGroupResponseList = mongoAllReturn.documentList;
    
    // create error 
    if(apsBusinessGroupResponseList.length > 0) {
      const invalidReferencesList: Array<TApiInvalidObjectReferenceError> = [];
      invalidReferencesList.push({
        referenceId: apsBusinessGroupId,
        referenceType: 'businessGroupChildren',
        referenceDetails: apsBusinessGroupResponseList.map( (value: APSBusinessGroupResponse) => {
          return {
            businessGroupDisplayName: value.businessGroupDisplayName,
            businessGroupId: value.businessGroupId,
            businessGroupParentId: value.businessGroupParentId
          };
        })
      });
      throw new ApiInvalidObjectReferencesServerError(logName, 'invalid business group child references', { 
        id: apsBusinessGroupId,
        collectionName: APSBusinessGroupsService.collectionName,
        invalidReferenceList: invalidReferencesList
      });      
    }
  }

  private validateReferences = async(apsOrganizationId: APSOrganizationId, apsBusinessGroup: Partial<APSBusinessGroupCreate>): Promise<void> => {
    const funcName = 'validateReferences';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    if(apsBusinessGroup.businessGroupId === undefined) throw new ApiInternalServerError(logName, 'businessGroupId is undefined');

    const invalidReferencesList: Array<TApiInvalidObjectReferenceError> = [];
    // check if organizationId exists
    try {
      await APSOrganizationsService.byId(apsOrganizationId);
    } catch(e) {
      invalidReferencesList.push({
        referenceId: apsOrganizationId,
        referenceType: APSOrganizationsService.getCollectionName()
      });
    }
    // check businessGroupParentId exists if not undefined
    if(apsBusinessGroup.businessGroupParentId) {
      try {
        await this.byId({
          apsOrganizationId: apsOrganizationId,
          apsBusinessGroupId: apsBusinessGroup.businessGroupParentId
        })
      } catch(e) {
        invalidReferencesList.push({
          referenceId: apsBusinessGroup.businessGroupParentId,
          referenceType: 'businessGroupParentId'
        });  
      }
    }
    // create error 
    if(invalidReferencesList.length > 0) {
      throw new ApiInvalidObjectReferencesServerError(logName, 'invalid business group parent references', { 
        id: apsBusinessGroup.businessGroupId,
        collectionName: APSBusinessGroupsService.collectionName,
        invalidReferenceList: invalidReferencesList
      });      
    }
  }
}

export default new APSBusinessGroupsService();
