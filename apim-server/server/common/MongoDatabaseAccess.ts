import mongodb, { MongoClient, MongoClientOptions, MongoParseError, MongoServerError } from 'mongodb';
import { EServerStatusCodes, ServerLogger } from './ServerLogger';
import ServerConfig from './ServerConfig';
import { ServerError, ServerErrorFactory, ServerErrorFromError, ServerFatalError } from './ServerError';
import { TConnectionTestDetails } from './ServerStatus';
import { ServerUtils } from './ServerUtils';


export class MongoDatabaseAccess {
  private static mongoClient: mongodb.MongoClient;
  private static mongoDatabase: mongodb.Db;
  private static mongoClientOptions: MongoClientOptions = {
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000
  };

  private static validateUrl(url: string): string {
    url = url.trim().replace(/^[\'\"]|[\'\"]$/g, '');
    new URL(url);
    return url;
  }

  public static logServerInfo = async() => {
    const funcName = 'logServerInfo';
    const logName = `${MongoDatabaseAccess.name}.${funcName}()`;
    try {
      if(MongoDatabaseAccess.mongoClient && MongoDatabaseAccess.mongoDatabase) {
        const serverInfo = await MongoDatabaseAccess.mongoDatabase.admin().serverInfo();
        const clientInfo = MongoDatabaseAccess.mongoClient.options;
        ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DB_INFO, message: 'DB server info', details: { 
          serverInfo: serverInfo,
          clientInfo: clientInfo
        } } ));  
      } else {
        ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DB_INFO, message: 'cannot log DB server info, DB not initialized' }));        
      }
    } catch(e) {
      const serverError = ServerErrorFactory.createServerError(e, logName);
      ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DB_INFO, message: 'error logging DB info', details: { error: serverError.toObject() } }));              
    }
  }  

  public static initializeWithRetry = async(maxRetries: number, waitBetweenRetries_ms: number) => {
    const funcName = 'initializeWithRetry';
    const logName = `${MongoDatabaseAccess.name}.${funcName}()`;

    const isRetry = (): boolean => {
      if(maxRetries === -1) return true;
      if(tryNumber < maxRetries) return true;
      return false;
    }
    let isConnected = false;
    let tryNumber = 0;
    while (!isConnected && isRetry()) {
      try {
        await MongoDatabaseAccess.initialize();
        isConnected = true;
      } catch(e: any) {
        const serverError = ServerErrorFactory.createServerError(e, logName);
        if(serverError instanceof ServerFatalError) {
          throw serverError;
        }
        const details = {
          try: tryNumber,
          maxRetries: maxRetries,
          error: serverError.toObject()
        }
        let message = 'initializing DB failed, ';
        if(isRetry()) message += `retrying in ${waitBetweenRetries_ms} milli seconds ...`;
        else message += `max retries exceeded, aborting`;
        ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DB_CONNECTION_ERROR, message: message, details: details } ));  
      }
      if(!isConnected && isRetry()) await ServerUtils.sleep(waitBetweenRetries_ms);
      ++tryNumber;
    }
    if(!isConnected) throw new ServerError(logName, 'initializing DB failed');
  }

  public static initialize = async (mongoClientOptions: MongoClientOptions = MongoDatabaseAccess.mongoClientOptions) => {
    const funcName = 'initialize';
    const logName = `${MongoDatabaseAccess.name}.${funcName}()`;

    // docs.mongodb.org/manual/reference/connection-string/
    // solace-platform?retryWrites=true&w=majority
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING, message: 'connecting to DB ...', details: { mongoConnectionString: ServerConfig.getMongoDBConfig().mongoConnectionString }}));

    try {
      const connectionString: string = MongoDatabaseAccess.validateUrl(ServerConfig.getMongoDBConfig().mongoConnectionString);    
      MongoDatabaseAccess.mongoClient = await MongoClient.connect(connectionString, mongoClientOptions);
    } catch(e: any) {
      if(e.name === MongoParseError.name || e.name === MongoServerError.name) {
        throw new ServerFatalError(e, logName);
      } else throw e;
    }  

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED, message: 'connected.', details: undefined } ));
    
    MongoDatabaseAccess.mongoDatabase = MongoDatabaseAccess.mongoClient.db(ServerConfig.getMongoDBConfig().serverMongoDatabaseName);
  
    await MongoDatabaseAccess.logServerInfo();
  }

  public static disconnect(): void {
    MongoDatabaseAccess.mongoClient.close();
  }

  public static getDb = (): mongodb.Db => {
    return MongoDatabaseAccess.mongoDatabase;
  }

  public static isConnected = async(): Promise<TConnectionTestDetails> => {
    const funcName = 'isConnected';
    const logName = `${MongoDatabaseAccess.name}.${funcName}()`;

    const testDetails: TConnectionTestDetails = {
      lastTested: Date.now(),
      success: false
    }
    try {
      // https://mongodb.github.io/node-mongodb-native/api-generated/db.html#command
      const res = await MongoDatabaseAccess.mongoDatabase.command( { ping: 1 }, { maxTimeMS: 100 });
      // const res = await MongoDatabaseAccess.mongoDatabase.command( { connectionStatus: 1, showPrivileges: true});
      ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MONITOR_DB_CONNECTION, message: 'result', details: { result: res } } ));
      testDetails.success = (res.ok === 1);

      // any need to test actual reading as well?
      // if (!databaseaccess.client) {
      //   return false;
      // }
      // try {
      //   await databaseaccess.client.db('platform').collection('organizations').find({}).maxTimeMS(100).toArray();
      //   return true;
      // } catch (e) {
      //   L.error(`database probe timed out`)
      //   return false;
      // }    

      return testDetails;
    } catch (e: any) {
      testDetails.success = false;
      testDetails.error = new ServerErrorFromError(e, logName);
      ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MONITOR_DB_CONNECTION, message: 'connection test failed', details: testDetails } ));
      return testDetails;
    }

  }

}



