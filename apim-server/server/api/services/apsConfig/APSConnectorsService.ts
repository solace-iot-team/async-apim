import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import ServerConfig from '../../../common/ServerConfig';
import { MongoPersistenceService, TMongoAllReturn } from '../../../common/MongoPersistenceService';
import { 
  ApiInternalServerError, 
  ApiInternalServerErrorFromError, 
  ApiKeyNotFoundServerError, 
  ApiObjectNotFoundServerError, 
  ApiServerError, 
  BootstrapErrorFromApiError, 
  BootstrapErrorFromError, 
  ConnectorProxyError
} from '../../../common/ServerError';
import { ServerUtils } from '../../../common/ServerUtils';
import { 
  APSConnectorCreate, 
  ApsConfigService, 
  ApiError,
  APSListResponseMeta,
  APSConnectorList,
  APSConnector,
  APSConnectorReplace,
  APSConnectorStatus,
} from '../../../../src/@solace-iot-team/apim-server-openapi-node';
import APSConnectorsServiceEventEmitter from './APSConnetorsServiceEvent';
import { About, AdministrationService } from '@solace-iot-team/apim-connector-openapi-node';
import { ConnectorClient } from '../../../common/ConnectorClient';

export type TAPSListAPSConnectorResponse = APSListResponseMeta & { list: APSConnectorList };

export class APSConnectorsService {
  private static collectionName = "apsConnectors";
  private static collectionSchemaVersion = 0;
  private static boostrapApsConnectorListPath = 'bootstrap/apsConfig/apsConnectors/apsConnectorList.json';
  private persistenceService: MongoPersistenceService;
  
  constructor() {
    this.persistenceService = new MongoPersistenceService(APSConnectorsService.collectionName);
  }

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));

    // for devel: drops the connector collection
    // await this.persistenceService.dropCollection();

    await this.persistenceService.initialize();
    
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public bootstrap = async(): Promise<void> => {
    const funcName = 'bootstrap';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING }));

    if(ServerConfig.getConfig().dataPath) {
      const bootstrapApsConnectorListFileName = `${ServerConfig.getConfig().dataPath}/${APSConnectorsService.boostrapApsConnectorListPath}`;
      const bootstrapApsConnectorListFile: string | undefined = ServerUtils.validateFilePathWithReadPermission(bootstrapApsConnectorListFileName);
      if(bootstrapApsConnectorListFile) {
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'boostrap connector list file', details: { file: bootstrapApsConnectorListFile } }));  

        // read file
        const bootstrapApsConnectorListData = ServerUtils.readFileContentsAsJson(bootstrapApsConnectorListFile);
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'bootstrap connector list', details: { bootstrapConnectorList: bootstrapApsConnectorListData } }));  

        // bootstrap via OpenAPI as root user ==> same validation rules ...
        // at server start: 
        // if connector id exists: do nothing
        // else: create
        const bootstrapApsConnectorList: APSConnectorList = bootstrapApsConnectorListData;
        for(const bootstrapApsConnector of bootstrapApsConnectorList) {
          let found = false;
          try {
            await this.byId(bootstrapApsConnector.connectorId);
            found = true;
          } catch(e) {
            if(e instanceof ApiKeyNotFoundServerError) {
              found = false;
            } else {
              throw new ApiInternalServerErrorFromError(e, logName);
            }
          }
          if(!found) {
            const create: APSConnectorCreate = bootstrapApsConnector as APSConnectorCreate;
            // let location: APSLocation | undefined = undefined;
            // if(bootstrapApsConnector.connectorClientConfig.location) {
            //   location = {
            //     ...bootstrapApsConnector.connectorClientConfig.location,
            //     protocol: bootstrapApsConnector.connectorClientConfig.location.protocol === EAPSClientProtocol.HTTP ? EAPSClientProtocol.HTTP: EAPSClientProtocol.HTTPS
            //   }
            // }
            // const create: APSConnectorCreate = 
            // { 
            //   ...bootstrapApsConnector,
            //   connectorClientConfig: {
            //     ...bootstrapApsConnector.connectorClientConfig,
            //     configType: bootstrapApsConnector.connectorClientConfig.configType === EAPSConnectorClientConfigType.INTERNAL_PROXY ? EAPSConnectorClientConfigType.INTERNAL_PROXY : EAPSConnectorClientConfigType.EXTERNAL,
            //     location: location
            //   }
            // };
            try {
              await ApsConfigService.createApsConnector({
                requestBody: create
              });
            } catch (e: any) {
              ServerLogger.debug(ServerLogger.createLogEntry(logName, 
                { 
                  code: EServerStatusCodes.BOOTSTRAP_ERROR, 
                  message: 'creating connector', 
                  details: { 
                    bootstrapConnector: bootstrapApsConnector,
                    error: e
                   } 
                }));  
              if(e instanceof ApiError) {
                throw new BootstrapErrorFromApiError(e, logName, 'creating connector');
              } else {
                throw new BootstrapErrorFromError(e, logName, 'creating connector');
              }
            }
            // set to active if so
            if(bootstrapApsConnector.isActive) {
              try {
                await ApsConfigService.setApsConnectorActive({
                  connectorId: bootstrapApsConnector.connectorId
                });
              } catch(e: any) {
                ServerLogger.debug(ServerLogger.createLogEntry(logName, 
                  { 
                    code: EServerStatusCodes.BOOTSTRAP_ERROR, 
                    message: 'set connector to active', 
                    details: { 
                      connectorId: bootstrapApsConnector.connectorId,
                      error: e
                     } 
                  }));  
                if(e instanceof ApiError) {
                  throw new BootstrapErrorFromApiError(e, logName, 'creating connector');
                } else {
                  throw new BootstrapErrorFromError(e, logName, 'creating connector');
                }
              }
            }
          } else {
            ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'bootstrap connector already exists', details: { bootstrapApsConnector: bootstrapApsConnector } }));  
          }
        }
      } else {
        ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'bootstrap connector list file not found, skipping', details: { file: bootstrapApsConnectorListFileName } }));  
      }
    } else {
      ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'skipping connector list bootstrap, no data path' }));  
    }

    // cache the active connector info if it exists
    try {
      const activeApsConnector: APSConnector = await this.byActive();
      ServerConfig.setConnectorConfig(activeApsConnector);
      ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPING, message: 'setting active connector', details: { activeApsConnector: activeApsConnector } }));  
    } catch (e: any) {
      if(e instanceof ApiServerError) {
        if(e.apiStatusCode === 404) {
          ServerLogger.warn(ServerLogger.createLogEntry(logName, { 
            code: EServerStatusCodes.BOOTSTRAPPING, 
            message: 'no active connector configured', 
          }));    
        } else {
          throw e;
        }
      } else {
        throw e;
      }
    }
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.BOOTSTRAPPED }));
  }

  public all = async(): Promise<TAPSListAPSConnectorResponse> => {
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({});
    return {
      list: mongoAllReturn.documentList as Array<APSConnector>,
      meta: {
        totalCount: mongoAllReturn.totalDocumentCount
      }
    }
  }

  public byId = async(apsConnectorId: string): Promise<APSConnector> => {
    const funcName = 'byId';
    const logName = `${APSConnectorsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnectorId', details: apsConnectorId}));

    const apsConnector: APSConnector = await this.persistenceService.byId({
      documentId: apsConnectorId
    }) as APSConnector;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnector', details: apsConnector}));

    return apsConnector;
  }

  public byActive = async(): Promise<APSConnector> => {
    const funcName = 'byActive';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    const filter = { isActive: true };
    const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
      searchInfo: {
        filter: filter
      }
    });

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

  public create = async(apsConnectorCreateRequest: APSConnectorCreate): Promise<APSConnector> => {
    const funcName = 'create';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    const create: APSConnector = {
      ...apsConnectorCreateRequest,
      isActive: false
    }
    const created: APSConnector = await this.persistenceService.create({
      collectionDocumentId: apsConnectorCreateRequest.connectorId,
      collectionDocument: create,
      collectionSchemaVersion: APSConnectorsService.collectionSchemaVersion
    });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'created', details: created}));

    return created;
  }

  public replace = async(apsConnectorId: string, apsConnectorReplaceRequest: APSConnectorReplace): Promise<APSConnector> => {
    const funcName = 'replace';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    const current: APSConnector = await this.persistenceService.byId({
      documentId: apsConnectorId
    }) as APSConnector;
    const replace: APSConnector = {
      ...apsConnectorReplaceRequest,
      connectorId: apsConnectorId,
      isActive: current.isActive
    }
    const replaced: APSConnector = await this.persistenceService.replace({
      collectionDocumentId: apsConnectorId,
      collectionDocument: replace,
      collectionSchemaVersion: APSConnectorsService.collectionSchemaVersion
    });
    if(replaced.isActive) {
      // emit changed event
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTING_EVENT, message: 'activeChanged', details: {
        connectorId: replaced.connectorId,
      }}));
      APSConnectorsServiceEventEmitter.emit('activeChanged', replaced.connectorId );
    }
    
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replaced', details: replaced}));

    return replaced;
  }

  public setActive = async(apsConnectorId: string): Promise<APSConnector> => {
    const funcName = 'setActive';
    const logName = `${APSConnectorsService.name}.${funcName}()`;
    const newActive: APSConnector = await this.persistenceService.byId({
      documentId: apsConnectorId
    }) as APSConnector;
    let oldActive: APSConnector | undefined = undefined;
    try {
      oldActive = await this.byActive();
    } catch (e) {
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'no active connector found', details: undefined }));
    }
    if(oldActive) {
      oldActive.isActive = false;
      const replacedOldActive: APSConnector = await this.persistenceService.replace({
        collectionDocumentId: oldActive.connectorId,
        collectionDocument: oldActive,
        collectionSchemaVersion: APSConnectorsService.collectionSchemaVersion
      });
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replacedOldActive', details: replacedOldActive }));
    }
    newActive.isActive = true;
    const replacedNewActive: APSConnector = await this.persistenceService.replace({
      collectionDocumentId: apsConnectorId,
      collectionDocument: newActive,
      collectionSchemaVersion: APSConnectorsService.collectionSchemaVersion
    });

    // cache the active connector info 
    ServerConfig.setConnectorConfig(replacedNewActive);

    // emit changed event
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTING_EVENT, message: 'activeChanged', details: {
      connectorId: replacedNewActive.connectorId,
    }}));
    APSConnectorsServiceEventEmitter.emit('activeChanged', replacedNewActive.connectorId );
        
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replacedNewActive', details: replacedNewActive }));

    return replacedNewActive;
  }

  public delete = async(apsConnectorId: string): Promise<void> => {
    const funcName = 'delete';
    const logName = `${APSConnectorsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnectorId', details: apsConnectorId }));

    const deletedConnector: APSConnector = (await this.persistenceService.delete({
      documentId: apsConnectorId
    }) as unknown) as APSConnector;

    if(deletedConnector.isActive) {
      // emit changed event
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.EMITTING_EVENT, message: 'activeChanged', details: {
        connectorId: deletedConnector.connectorId,
      }}));
      APSConnectorsServiceEventEmitter.emit('activeChanged', deletedConnector.connectorId );
    }

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'deletedConnector', details: deletedConnector }));

  }

  public connectorStatus = async({ apsConnectorId }:{
    apsConnectorId?: string
  }): Promise<APSConnectorStatus> => {
    const funcName = 'connectorStatus';
    const logName = `${APSConnectorsService.name}.${funcName}()`;

    if(apsConnectorId === undefined) {
      try {
        ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'apsConnectorId', details: {
          apsConnectorId: 'currentlyActiveConnector'
        }}));

        const connectorAbout: About = await AdministrationService.about();

        const connectorHealthCheckStatus: { status: string } = await AdministrationService.healthcheck();
  
        return {
          connectorAbout: connectorAbout,
          connectorHealthCheckStatus: connectorHealthCheckStatus.status,
        };

      } catch(e: any) {
        const connectorProxyError: ConnectorProxyError = new ConnectorProxyError(logName, undefined, {
          connectorError: e
        });
        ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CONNECTOR_API_ERROR, details: {
          connectorProxyError: connectorProxyError
        }}));  
        throw connectorProxyError;
      }

    } else {

      // switch connectors in OpenApi for proxy
      const activeApsConnector: APSConnector | undefined = ServerConfig.getConnectorConfig();
      try {
        const apsConnector: APSConnector = await this.byId(apsConnectorId);
        ServerConfig.setConnectorConfig(apsConnector);
        const connectorAbout: About = await AdministrationService.about();
        const connectorHealthCheckStatus: { status: string } = await AdministrationService.healthcheck();
        ServerConfig.setConnectorConfig(activeApsConnector);
        return {
          connectorAbout: connectorAbout,
          connectorHealthCheckStatus: connectorHealthCheckStatus.status,
        };
      } catch (e: any) {
        ServerConfig.setConnectorConfig(activeApsConnector);
        const connectorProxyError: ConnectorProxyError = new ConnectorProxyError(logName, undefined, {
          connectorError: e
        });
        ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CONNECTOR_API_ERROR, details: {
          connectorProxyError: connectorProxyError
        }}));  
        throw connectorProxyError;
      } 
    }
  }


}

export default new APSConnectorsService();
