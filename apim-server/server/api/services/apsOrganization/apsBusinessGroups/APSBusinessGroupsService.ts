import { Mutex } from "async-mutex";
import { Filter } from 'mongodb';
import { EServerStatusCodes, ServerLogger } from '../../../../common/ServerLogger';
import { 
  MongoPersistenceService, 
  TMongoAllReturn 
} from '../../../../common/MongoPersistenceService';
import { 
  ListAPSBusinessGroupsResponse,
  APSBusinessGroupResponseList,
  APSBusinessGroupUpdate,
  APSBusinessGroupCreate,
  APSBusinessGroupResponse,
  APSIdList,
  APSExternalReference,
  APSExternalSystem,
  ListAPSExternalSystemsResponse,
  APSExternalSystemList,
  APSOrganization,
  APSMemberOfOrganizationGroups,
  ListApsUsersResponse,
  APSUserResponseList,
  APSUserResponse,
  APSUserIdList,
 } from '../../../../../src/@solace-iot-team/apim-server-openapi-node';
import { 
  ApiDeleteNotAllowedForKeyServerError,
  ApiDependantsReferencesServerError,
  ApiDuplicateKeyServerError,
  ApiInternalServerError, 
  ApiInvalidObjectReferencesServerError, 
  ApiKeyNotFoundServerError, 
  ServerErrorFromError, 
  TApiInvalidObjectReferenceError
} from '../../../../common/ServerError';
import APSOrganizationsServiceEventEmitter from '../../apsAdministration/APSOrganizationsServiceEvent';
import { APSBusinessGroupsDBMigrate } from './APSBusinessGroupsDBMigrate';
import APSBusinessGroupsServiceEventEmitter from "./APSBusinessGroupsServiceEvent";
import APSExternalSystemsService from "../apsExternalSystems/APSExternalSystemsService";
import { ValidationUtils } from "../../../utils/ValidationUtils";
import { APSOptional, ServerUtils } from "../../../../common/ServerUtils";
import APSUsersService from "../../APSUsersService/APSUsersService";


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
    APSOrganizationsServiceEventEmitter.on('created', this.onOrganizationCreated);
    APSOrganizationsServiceEventEmitter.on('updated', this.onOrganizationUpdated);
    // APSExternalSystemsServiceEventEmitter.on('await_request_delete', this.on_AwaitRequestDelete_ExternalSystem);
  }

  // make public for test access
  public wait4CollectionUnlock = async() => {
    const funcName = 'wait4CollectionUnlock';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;
    // await this.collectionMutex.waitForUnlock();
    const releaser = await this.collectionMutex.acquire();
    releaser();
    if(this.collectionMutex.isLocked()) throw new Error(`${logName}: mutex is locked`);
  }
  private onOrganizationCreated = async(organizationId: string, apsOrganization: APSOrganization): Promise<void> => {
    const x = async(): Promise<void> => {
      await this._onOrganizationCreated(organizationId, apsOrganization);
    }
    await this.collectionMutex.runExclusive(x);
  }
  private _onOrganizationCreated = async(organizationId: string, apsOrganization: APSOrganization): Promise<void> => {
    const funcName = '_onOrganizationCreated';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    try {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_CREATED, message: 'APSOrganization', details: {
        organizationId: organizationId,
        apsOrganization: apsOrganization
      }}));

      // create same business group
      const create: APSOptional<APSBusinessGroupCreate, 'businessGroupParentId'> = {
        businessGroupId: organizationId,
        description: `Root for ${apsOrganization.displayName}`,
        displayName: apsOrganization.displayName,
      }
      const created: APSBusinessGroupResponse = await this._create({
        apsOrganizationId: organizationId,
        apsBusinessGroupCreate: create
      });

      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSED_ON_EVENT_CREATED, message: 'created: APSBusinessGroupResponse', details: {
        APSBusinessGroupResponse: created
      }}));
  
    } catch(e) {
      const ex = new ServerErrorFromError(e, logName);
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_CREATED, message: ex.message , details: ex.toObject() }));
    } 
  }
  private onOrganizationUpdated = async(organizationId: string, apsOrganization: APSOrganization): Promise<void> => {
    const x = async(): Promise<void> => {
      await this._onOrganizationUpdated(organizationId, apsOrganization);
    }
    await this.collectionMutex.runExclusive(x);
  }
  private _onOrganizationUpdated = async(apsOrganizationId: string, apsOrganization: APSOrganization): Promise<void> => {
    const funcName = '_onOrganizationUpdated';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    try {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_UPDATED, message: 'APSOrganization', details: {
        organizationId: apsOrganizationId,
        apsOrganization: apsOrganization
      }}));

      // find the root business group and update it's display name if changed
      const apsBusinessGroupResponse: APSBusinessGroupResponse = await this.persistenceService.byId({
        organizationId: apsOrganizationId,
        documentId: apsOrganizationId 
      });
      if(apsBusinessGroupResponse.displayName !== apsOrganization.displayName) {
        // update display name
        const apsBusinessGroupUpdate: APSBusinessGroupUpdate = {
          displayName: apsOrganization.displayName
        };
        const updated: APSBusinessGroupResponse = await this.persistenceService.update({
          organizationId: apsOrganizationId,
          collectionDocumentId: apsOrganizationId,
          collectionDocument: apsBusinessGroupUpdate,
          collectionSchemaVersion: APSBusinessGroupsService.collectionSchemaVersion
        });
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSED_ON_EVENT_UPDATED, message: 'updated: APSBusinessGroupResponse', details: {
          APSBusinessGroupResponse: updated
        }}));
      } else {
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSED_ON_EVENT_UPDATED, message: 'nothing to do' }));  
      }
  
    } catch(e) {
      const ex = new ServerErrorFromError(e, logName);
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_UPDATED, message: ex.message , details: ex.toObject() }));
    } 
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
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    try {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_DELETED, message: 'APSOrganizationId', details: {
        organizationId: apsOrganizationId
      }}));

      const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
        organizationId: apsOrganizationId
      });
      const list: APSBusinessGroupResponseList = mongoAllReturn.documentList;
      for(const apsBusinessGroup of list) {
        await this.persistenceService.delete({
          organizationId: apsOrganizationId,
          documentId: apsBusinessGroup.businessGroupId
        });
        this._emitDeletedEvent({ logName: logName, apsOrganizationId: apsOrganizationId, apsBusinessGroupId: apsBusinessGroup.businessGroupId });
      }

      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSED_ON_EVENT_DELETED, message: 'APSOrganizationId', details: {
        organizationId: apsOrganizationId
      }}));
  
    } catch(e) {
      const ex = new ServerErrorFromError(e, logName);
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_DELETED, message: ex.message , details: ex.toObject() }));
    } 
  }
  // TODO: revisit at a later date
  // private on_AwaitRequestDelete_ExternalSystem = async(apsOrganizationId: string, apsExternalSystemId: string, resolveCallback: (value: unknown) => void, rejectCallback: (reason: any) => void): Promise<void> => {
  //   const funcName = 'on_AwaitRequestDelete_ExternalSystem';
  //   const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

  //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATING_DEPENDANTS, message: 'APSBusinessGroupExternalResponseList', details: {
  //     apsOrganizationId: apsOrganizationId,
  //     apsExternalSystemId: apsExternalSystemId
  //   }}));

  //   // check if any business groups reference the external system
  //   const listResponse: ListAPSBusinessGroupsExternalSystemResponse = await this.allByExternalSystemId({
  //     apsOrganizationId: apsOrganizationId,
  //     apsExternalSystemId: apsExternalSystemId
  //   });
  //   if(listResponse.list.length > 0) {
  //     ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATE_DEPENDANTS_ERROR, message: 'APSBusinessGroupExternalResponseList', details: {
  //       apsOrganizationId: apsOrganizationId,
  //       apsExternalSystemId: apsExternalSystemId,
  //       apsBusinessGroupExternalResponseList: listResponse.list
  //     }}));
  //     rejectCallback(new ApiDependantsReferencesServerError(logName, undefined, { 
  //       collectionName: APSBusinessGroupsService.collectionName,
  //       id: apsOrganizationId,
  //       parentType: `APSExternalSystem`,
  //       parentId: apsExternalSystemId,
  //       dependantList: listResponse.list,
  //     }));
  //     // throw new ApiDependantsReferencesServerError(logName, undefined, { 
  //     //   collectionName: APSBusinessGroupsService.collectionName,
  //     //   id: apsOrganizationId,
  //     //   parentType: `APSExternalSystem`,
  //     //   parentId: apsExternalSystemId,
  //     //   dependantList: listResponse.list,
  //     // });
  //   }
  //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATED_DEPENDANTS, message: 'APSBusinessGroupExternalResponseList', details: {
  //     apsOrganizationId: apsOrganizationId,
  //     apsExternalSystemId: apsExternalSystemId,
  //     apsBusinessGroupExternalResponseList: listResponse.list
  //   }}));
  //   resolveCallback({});
  // }
  public on_AwaitRequestDelete_ExternalSystem = async(apsOrganizationId: string, apsExternalSystemId: string): Promise<void> => {
    const funcName = 'on_AwaitRequestDelete_ExternalSystem';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATING_DEPENDANTS, message: 'APSBusinessGroupExternalResponseList', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId
    }}));

    // check if any business groups reference the external system
    const listResponse: ListAPSBusinessGroupsResponse = await this.allByExternalSystemId({
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId
    });
    if(listResponse.list.length > 0) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATE_DEPENDANTS_ERROR, message: 'APSBusinessGroupExternalResponseList', details: {
        apsOrganizationId: apsOrganizationId,
        apsExternalSystemId: apsExternalSystemId,
        apsBusinessGroupExternalResponseList: listResponse.list
      }}));
      throw new ApiDependantsReferencesServerError(logName, undefined, { 
        collectionName: APSBusinessGroupsService.collectionName,
        id: apsOrganizationId,
        parentType: `APSExternalSystem`,
        parentId: apsExternalSystemId,
        dependantList: listResponse.list,
      });
    }
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATED_DEPENDANTS, message: 'APSBusinessGroupExternalResponseList', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId,
      apsBusinessGroupExternalResponseList: listResponse.list
    }}));
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
    apsOrganizationId: string;
  }): Promise<ListAPSBusinessGroupsResponse> => {
    const funcName = 'all';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'ListAPSBusinessGroupsResponse', details: {
      apsOrganizationId: apsOrganizationId,
     }}));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      organizationId: apsOrganizationId
    });
    const apsBusinessGroupResponseList: APSBusinessGroupResponseList = mongoAllReturn.documentList;
    // collect all the children
    for(const apsBusinessGroupResponse of apsBusinessGroupResponseList) {
      apsBusinessGroupResponse.businessGroupChildIds = await this.listChildren(apsOrganizationId, apsBusinessGroupResponse.businessGroupId);
      apsBusinessGroupResponse.members = await this._allMembers({ apsOrganizationId: apsOrganizationId, apsBusinessGroupId: apsBusinessGroupResponse.businessGroupId});
    }
    
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSBusinessGroupResponseList', details: apsBusinessGroupResponseList }));

    return {
      list: apsBusinessGroupResponseList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public allByExternalSystemId = async({ apsOrganizationId, apsExternalSystemId }: {
    apsOrganizationId: string;
    apsExternalSystemId: string;
  }): Promise<ListAPSBusinessGroupsResponse> => {
    const funcName = 'allByExternalSystemId';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'ListAPSBusinessGroupsResponse', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalSystemId: apsExternalSystemId
    }}));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    // construct key
    const k: keyof APSBusinessGroupResponse = 'externalReference';
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
    const apsBusinessGroupResponseList: APSBusinessGroupResponseList = mongoAllReturn.documentList;
    // collect all the children
    for(const apsBusinessGroupResponse of apsBusinessGroupResponseList) {
      apsBusinessGroupResponse.businessGroupChildIds = await this.listChildren(apsOrganizationId, apsBusinessGroupResponse.businessGroupId);
      apsBusinessGroupResponse.members = await this._allMembers({ apsOrganizationId: apsOrganizationId, apsBusinessGroupId: apsBusinessGroupResponse.businessGroupId});
    }

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSBusinessGroupResponseList', details: apsBusinessGroupResponseList }));

    return {
      list: apsBusinessGroupResponseList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async({ apsOrganizationId, apsBusinessGroupId }: {
    apsOrganizationId: string;
    apsBusinessGroupId: string;    
  }): Promise<APSBusinessGroupResponse> => {
    const funcName = 'byId';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSBusinessGroupResponse', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    const apsBusinessGroupResponse: APSBusinessGroupResponse = await this.persistenceService.byId({
      organizationId: apsOrganizationId,
      documentId: apsBusinessGroupId 
    });
    apsBusinessGroupResponse.businessGroupChildIds = await this.listChildren(apsOrganizationId, apsBusinessGroupId);
    apsBusinessGroupResponse.members = await this._allMembers({ apsOrganizationId: apsOrganizationId, apsBusinessGroupId: apsBusinessGroupResponse.businessGroupId});

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSBusinessGroupResponse', details: apsBusinessGroupResponse }));

    return apsBusinessGroupResponse;
  }

  private _allMembers = async({apsOrganizationId, apsBusinessGroupId }:{
    apsOrganizationId: string;
    apsBusinessGroupId: string;    
  }): Promise<APSUserIdList> => {
    const funcName = '_allMembers';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSUserIdList', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));

    const listApsUsersResponse: ListApsUsersResponse = await APSUsersService.allByOrganizationId({
      apsOrganizationId: apsOrganizationId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'apsOrganizationUserList', details: {
      apsOrganizationUserList: listApsUsersResponse,
    }}));
    const apsUserResponseList: APSUserResponseList = listApsUsersResponse.list;

    // create the reference list
    const apsUserIdList: APSUserIdList = [];
    apsUserResponseList.forEach( (apsUser: APSUserResponse) => {
      const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups | undefined = apsUser.memberOfOrganizationGroups?.find( (x) => {
        return x.organizationId === apsOrganizationId;
      });
      // discard not found
      if(apsMemberOfOrganizationGroups !== undefined) {
        apsMemberOfOrganizationGroups.memberOfBusinessGroupList.forEach( (x) => {
          if(x.businessGroupId === apsBusinessGroupId) apsUserIdList.push(apsUser.userId);
        });
      }
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSUserIdList', details: { apsUserIdList: apsUserIdList} }));

    return apsUserIdList; 
  }
  
  public allMembers = async({ apsOrganizationId, apsBusinessGroupId }:{
    apsOrganizationId: string;
    apsBusinessGroupId: string;    
  }): Promise<APSUserIdList> => {
    // const funcName = 'allMembers';
    // const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    return await this._allMembers({ apsOrganizationId: apsOrganizationId, apsBusinessGroupId: apsBusinessGroupId });
  }


  public byExternalReferenceId = async({ apsOrganizationId, apsExternalReferenceId }: {
    apsOrganizationId: string;
    apsExternalReferenceId: string;    
  }): Promise<APSBusinessGroupResponse> => {
    const funcName = 'byExternalReferenceId';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSBusinessGroupResponse', details: {
      apsOrganizationId: apsOrganizationId,
      apsExternalReferenceId: apsExternalReferenceId
    }}));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);

    // construct key
    const k: keyof APSBusinessGroupResponse = 'externalReference';
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
    const responseList: APSBusinessGroupResponseList = mongoAllReturn.documentList;
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
    const responseGroup: APSBusinessGroupResponse = responseList[0];
    // collect all the children
    responseGroup.businessGroupChildIds = await this.listChildren(apsOrganizationId, responseGroup.businessGroupId);
    // collect all the members
    responseGroup.members = await this._allMembers({ apsOrganizationId: apsOrganizationId, apsBusinessGroupId: responseGroup.businessGroupId});

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSBusinessGroupResponse', details: responseGroup }));
    
    return responseGroup;
  }

  public _create = async({ apsOrganizationId, apsBusinessGroupCreate }: {
    apsOrganizationId: string;
    apsBusinessGroupCreate: APSOptional<APSBusinessGroupCreate, 'businessGroupParentId'>;
  }): Promise<APSBusinessGroupResponse> => {
    const funcName = '_create';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, message: 'APSBusinessGroupCreate', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupCreate: apsBusinessGroupCreate
    } }));

    // if group doesn't have a parent, assign the root group as parent. except for the root group.
    if(apsBusinessGroupCreate.businessGroupParentId === undefined && apsBusinessGroupCreate.businessGroupId !== apsOrganizationId) {
      apsBusinessGroupCreate.businessGroupParentId = apsOrganizationId;
    }
    await ValidationUtils.validateOrganization(logName, apsOrganizationId);
    await this.validateUniqueConstraints(apsOrganizationId, apsBusinessGroupCreate);
    await this.validateReferences(apsOrganizationId, apsBusinessGroupCreate);

    const created: APSBusinessGroupResponse = await this.persistenceService.create({
      organizationId: apsOrganizationId,
      collectionDocumentId: apsBusinessGroupCreate.businessGroupId,
      collectionDocument: apsBusinessGroupCreate,
      collectionSchemaVersion: APSBusinessGroupsService.collectionSchemaVersion
    });

    created.businessGroupChildIds = await this.listChildren(apsOrganizationId, apsBusinessGroupCreate.businessGroupId);
    created.members = [];

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATED, message: 'APSBusinessGroupResponse', details: created }));
    
    return created;
  }
  public create = async({ apsOrganizationId, apsBusinessGroupCreate }: {
    apsOrganizationId: string;
    apsBusinessGroupCreate: APSBusinessGroupCreate;
  }): Promise<APSBusinessGroupResponse> => {
    // const funcName = 'create';
    // const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    return await this._create({
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupCreate: apsBusinessGroupCreate
    });
  }

  public update = async({ apsOrganizationId, apsBusinessGroupId, apsBusinessGroupUpdate }: {
    apsOrganizationId: string;
    apsBusinessGroupId: string;
    apsBusinessGroupUpdate: APSBusinessGroupUpdate;
  }): Promise<APSBusinessGroupResponse> => {
    const funcName = 'update';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, message: 'APSBusinessGroupUpdate', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId,
      apsBusinessGroupUpdate: apsBusinessGroupUpdate
    } }));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);
    await this.validateUniqueConstraints(apsOrganizationId, apsBusinessGroupUpdate);
    await this.validateReferences(apsOrganizationId, { ...apsBusinessGroupUpdate, businessGroupId: apsBusinessGroupId });

    const updated: APSBusinessGroupResponse = await this.persistenceService.update({
      organizationId: apsOrganizationId,
      collectionDocumentId: apsBusinessGroupId,
      collectionDocument: apsBusinessGroupUpdate,
      collectionSchemaVersion: APSBusinessGroupsService.collectionSchemaVersion
    });
    updated.businessGroupChildIds = await this.listChildren(apsOrganizationId, apsBusinessGroupId);
    updated.members = await this._allMembers({ apsOrganizationId: apsOrganizationId, apsBusinessGroupId: updated.businessGroupId});

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATED, message: 'APSBusinessGroupResponse', details: updated }));

    return updated;
  }

  private _emitDeletedEvent = ({logName, apsOrganizationId, apsBusinessGroupId }: {
    logName: string;
    apsOrganizationId: string;
    apsBusinessGroupId: string;
  }) => {
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTING_EVENT, message: 'deleted', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));
    APSBusinessGroupsServiceEventEmitter.emit('deleted', apsOrganizationId, apsBusinessGroupId);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTED_EVENT, message: 'deleted', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));    
  }

  private _delete = async({apsOrganizationId, apsBusinessGroupId }: {
    apsOrganizationId: string;
    apsBusinessGroupId: string;
  }): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, message: 'keys', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));

    await ValidationUtils.validateOrganization(logName, apsOrganizationId);
    // check group is not root
    if(apsOrganizationId === apsBusinessGroupId) {
      throw new ApiDeleteNotAllowedForKeyServerError(logName, 'cannot delete root APSBusinessGroup', { 
        organizationId: apsOrganizationId, 
        id: apsBusinessGroupId,
        collectionName: APSBusinessGroupsService.collectionName 
      });
    }
    await this.validateNoChildReferences(apsOrganizationId, apsBusinessGroupId);

    const deleted: APSBusinessGroupResponse = (await this.persistenceService.delete({
      organizationId: apsOrganizationId,
      documentId: apsBusinessGroupId
    }) as unknown) as APSBusinessGroupResponse;

    this._emitDeletedEvent({ logName: logName, apsOrganizationId: apsOrganizationId, apsBusinessGroupId: apsBusinessGroupId });
    
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETED, message: 'APSBusinessGroupResponse', details: deleted }));
  }

  public delete = async({apsOrganizationId, apsBusinessGroupId }: {
    apsOrganizationId: string;
    apsBusinessGroupId: string;
  }): Promise<void> => {
    // const funcName = 'delete';
    // const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    await this.wait4CollectionUnlock();

    await this.validateReferences_For_DeleteRequest({ apsOrganizationId: apsOrganizationId, apsBusinessGroupId: apsBusinessGroupId });

    await this._delete({
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    });
  }

  private listChildren = async(apsOrganizationId: string, apsBusinessGroupId: string): Promise<APSIdList> => {

    const filter: Filter<APSBusinessGroupResponse> = {
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

  private validateUniqueConstraints = async(apsOrganizationId: string, apsBusinessGroup: APSBusinessGroupCreate | APSBusinessGroupUpdate): Promise<void> => {
    const funcName = 'validateUniqueConstraints';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'starting', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroup: apsBusinessGroup
    }}));

    // * validate external reference *
    if(apsBusinessGroup.externalReference === undefined) return;

    // construct key
    const k: keyof APSBusinessGroupResponse = 'externalReference';
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
    const responseList: APSBusinessGroupResponseList = mongoAllReturn.documentList;
    if(responseList.length > 0) {
      throw new ApiDuplicateKeyServerError(logName, 'APSBusinessGroup with externalId already exists', { 
        organizationId: apsOrganizationId, 
        id: '',
        externalId: apsBusinessGroup.externalReference.externalId, 
        collectionName: APSBusinessGroupsService.collectionName 
      });
    } 
  }

  private validateNoChildReferences = async(apsOrganizationId: string, apsBusinessGroupId: string): Promise<void> => {
    const funcName = 'validateNoChildReferences';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'starting', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));

    const filter: Filter<APSBusinessGroupResponse> = {
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
            businessGroupDisplayName: value.displayName,
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

  private validateReferences = async(apsOrganizationId: string, apsBusinessGroup: Partial<APSBusinessGroupCreate>): Promise<void> => {
    const funcName = 'validateReferences';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    if(apsBusinessGroup.businessGroupId === undefined) throw new ApiInternalServerError(logName, 'businessGroupId is undefined');

    const invalidReferencesList: Array<TApiInvalidObjectReferenceError> = [];

    // check businessGroupParentId exists if not undefined
    if(apsBusinessGroup.businessGroupParentId !== undefined) {
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
    // check if externalSystemId exists if not undefined
    if(apsBusinessGroup.externalReference !== undefined) {
      // get complete list once
      const listApsExternalSystemResponse: ListAPSExternalSystemsResponse = await APSExternalSystemsService.all({
        apsOrganizationId: apsOrganizationId
      });
      const apsExternalSystemList: APSExternalSystemList = listApsExternalSystemResponse.list;
      const foundApsExternalSystem = apsExternalSystemList.find( (apsExternalSystem: APSExternalSystem) => {
        return apsExternalSystem.externalSystemId === apsBusinessGroup.externalReference?.externalSystemId;
      });
      if(!foundApsExternalSystem) {
        const externalReferenceName = ServerUtils.getPropertyNameString(apsBusinessGroup, (x) => x.externalReference);
        const externalSystemIdName = ServerUtils.getPropertyNameString(apsBusinessGroup.externalReference, (x) => x.externalSystemId);
        invalidReferencesList.push({
          referenceId: apsBusinessGroup.externalReference.externalSystemId,
          referenceType: `${externalReferenceName}.${externalSystemIdName}`,
        });
      }
    }

    // create error 
    if(invalidReferencesList.length > 0) {
      throw new ApiInvalidObjectReferencesServerError(logName, 'invalid business group reference(s)', { 
        id: apsBusinessGroup.businessGroupId,
        collectionName: APSBusinessGroupsService.collectionName,
        invalidReferenceList: invalidReferencesList
      });      
    }
  }

  private validateReferences_For_DeleteRequest = async({ apsOrganizationId, apsBusinessGroupId }:{ 
    apsOrganizationId: string;
    apsBusinessGroupId: string;
   }): Promise<void> => {
    const funcName = 'validateReferences_For_DeleteRequest';
    const logName = `${APSBusinessGroupsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATING_DEPENDANTS, message: 'members', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));

    const apsUserIdList: APSUserIdList = await this._allMembers({ apsOrganizationId: apsOrganizationId, apsBusinessGroupId: apsBusinessGroupId });

    const invalidReferencesList: Array<TApiInvalidObjectReferenceError> = [];
    apsUserIdList.forEach( (userId) => {
      invalidReferencesList.push({
        referenceType: 'userId',
        referenceId: userId
      });
    });
    // create error 
    if(invalidReferencesList.length > 0) {
      throw new ApiInvalidObjectReferencesServerError(logName, 'business group has members', { 
        id: `${apsOrganizationId}.${apsBusinessGroupId}`,
        collectionName: APSBusinessGroupsService.collectionName,
        invalidReferenceList: invalidReferencesList
      });      
    }
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.VALIDATED_DEPENDANTS, message: 'members', details: {
      apsOrganizationId: apsOrganizationId,
      apsBusinessGroupId: apsBusinessGroupId
    }}));

  }

}

export default new APSBusinessGroupsService();
