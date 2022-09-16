import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { MongoPersistenceService, TMongoAllReturn } from '../../../common/MongoPersistenceService';
import { 
  APSServiceAccount,
  APSServiceAccountCreate,
  APSServiceAccountCreateResponse,
  APSServiceAccountList,
  ListAPSServiceAccountsResponse
} from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSAuthStrategyService from '../../../common/authstrategies/APSAuthStrategyService';

export interface APSServiceAccountInternal extends APSServiceAccount {
  token: string;
}
export type APSServiceAccountInternalList = Array<APSServiceAccountInternal>;

export class APSServiceAccountsService {
  private static collectionName = "apsServiceAccounts";
  private static collectionSchemaVersion = 1;
  private persistenceService: MongoPersistenceService;

  // create the articifial internal service account id
  private static internalApsServiceAccountId = 'theApsInternalServiceAccountId';
  private static internalApsServiceAccount: APSServiceAccountInternal;
  
  constructor() {
    this.persistenceService = new MongoPersistenceService(APSServiceAccountsService.collectionName);
  }

  public getPersistenceService = (): MongoPersistenceService => { return this.persistenceService; }
  public getCollectionName = (): string => { return APSServiceAccountsService.collectionName; }
  public getDBObjectSchemaVersion = (): number => { return APSServiceAccountsService.collectionSchemaVersion; }
  public getInternalApsServiceAccountId = (): string => { return APSServiceAccountsService.internalApsServiceAccountId; }
  
  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSServiceAccountsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));

    // create the articifial internal service account id
    APSServiceAccountsService.internalApsServiceAccount = {
      serviceAccountId: APSServiceAccountsService.internalApsServiceAccountId,
      description: 'service account for internal APS calls to Connector',
      displayName: 'The APS internal service account',
      token: APSAuthStrategyService.generateServiceAccountBearerToken_For_InternalAuth({ serviceAccountId: APSServiceAccountsService.internalApsServiceAccountId })
    };

    // for devel: drops the connector collection
    // await this.persistenceService.dropCollection();

    await this.persistenceService.initialize();
    
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public bootstrap = async(): Promise<void> => {
    const funcName = 'bootstrap';
    const logName = `${APSServiceAccountsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING }));
    // placeholder
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPED }));
  }

  // public migrate = async(): Promise<void> => {
  //   const funcName = 'migrate';
  //   const logName = `${APSOrganizationsService.name}.${funcName}()`;
  //   ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATING }));
  //   await APSOrganizationsDBMigrate.migrate(this);
  //   ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MIGRATED }));
  // }

  public all = async(): Promise<ListAPSServiceAccountsResponse> => {
    const funcName = 'all';
    const logName = `${APSServiceAccountsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSServiceAccountInternalList' }));

    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({});
    const apsServiceAccountInternalList: APSServiceAccountInternalList = mongoAllReturn.documentList;
    const apsServiceAccountList: APSServiceAccountList = await this.createAPSServiceAccountList({
      apsServiceAccountInternalList: apsServiceAccountInternalList
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'apsServiceAccountList', details: apsServiceAccountList }));

    return {
      list: apsServiceAccountList,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async({ serviceAccountId }:{
    serviceAccountId: string
  }): Promise<APSServiceAccount> => {
    const funcName = 'byId';
    const logName = `${APSServiceAccountsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSServiceAccount', details: {
      serviceAccountId: serviceAccountId
    }}));

    let apsServiceAccountInternal: APSServiceAccountInternal;
    if(serviceAccountId === APSServiceAccountsService.internalApsServiceAccount.serviceAccountId) {
      apsServiceAccountInternal = APSServiceAccountsService.internalApsServiceAccount;
    } else {
      apsServiceAccountInternal = await this.persistenceService.byId({
        documentId: serviceAccountId
      }) as APSServiceAccountInternal;
    }
    const apsServiceAccount: APSServiceAccount = this.createAPSServiceAccount({ apsServiceAccountInternal: apsServiceAccountInternal });
    
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSServiceAccount', details: apsServiceAccount }));

    return apsServiceAccount;
  }

  public create = async({ apsServiceAccountCreate }:{
    apsServiceAccountCreate: APSServiceAccountCreate;
  }): Promise<APSServiceAccountCreateResponse> => {
    const funcName = 'create';
    const logName = `${APSServiceAccountsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, message: 'APSServiceAccountCreate', details: apsServiceAccountCreate }));

    const toCreate: APSServiceAccountInternal = {
      ...apsServiceAccountCreate,
      token: APSAuthStrategyService.generateServiceAccountBearerToken_For_InternalAuth({ serviceAccountId: apsServiceAccountCreate.serviceAccountId })
    };
    const created: APSServiceAccountInternal = await this.persistenceService.create({
      collectionDocumentId: toCreate.serviceAccountId,
      collectionDocument: toCreate,
      collectionSchemaVersion: APSServiceAccountsService.collectionSchemaVersion
    });
    
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATED, message: 'APSServiceAccountCreate', details: created}));

    return created;
  }

  public delete = async({ serviceAccountId }:{
    serviceAccountId: string
  }): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSServiceAccountsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, message: 'APSServiceAccount', details: {
      serviceAccountId: serviceAccountId
    }}));

    const deleted = (await this.persistenceService.delete({
      documentId: serviceAccountId
    }) as unknown) as APSServiceAccountInternal;
    
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETED, message: 'APSServiceAccount', details: deleted }));

  }

  private createAPSServiceAccount = ({ apsServiceAccountInternal}:{
    apsServiceAccountInternal: APSServiceAccountInternal
  }): APSServiceAccount => {
    return {
      serviceAccountId: apsServiceAccountInternal.serviceAccountId,
      displayName: apsServiceAccountInternal.displayName,
      description: apsServiceAccountInternal.description
    };
  }

  private createAPSServiceAccountList = async({ apsServiceAccountInternalList }:{
    apsServiceAccountInternalList: APSServiceAccountInternalList
  }): Promise<APSServiceAccountList> => {
    const apsServiceAccountList: APSServiceAccountList = apsServiceAccountInternalList.map( (apsServiceAccountInternal: APSServiceAccountInternal) => {
      return this.createAPSServiceAccount({ apsServiceAccountInternal: apsServiceAccountInternal });
    });
    return apsServiceAccountList;
  }

}

export default new APSServiceAccountsService();
