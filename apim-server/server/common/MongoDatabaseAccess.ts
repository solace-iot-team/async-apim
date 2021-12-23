import mongodb, { MongoClient } from 'mongodb';
import { EServerStatusCodes, ServerLogger } from './ServerLogger';
import ServerConfig from './ServerConfig';
import { ServerErrorFromError } from './ServerError';
import { TConnectionTestDetails } from './ServerStatus';


export class MongoDatabaseAccess {
  private static mongoClient: mongodb.MongoClient;
  private static mongoDatabase: mongodb.Db;

  private static validateUrl(url: string): string {
    url = url.trim().replace(/^[\'\"]|[\'\"]$/g, '');
    new URL(url);
    return url;
  }

  // private static connect = async (url: string) => {
  //   DatabaseAccess.client = await MongoClient.connect(url);  
  // }

  public static initialize = async () => {
    const funcName = 'initialize';
    const logName = `${MongoDatabaseAccess.name}.${funcName}()`;

    // docs.mongodb.org/manual/reference/connection-string/
    // solace-platform?retryWrites=true&w=majority

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING, message: 'connecting ...', details: { mongoConnectionString: ServerConfig.getMongoDBConfig().mongoConnectionString }}));
      
    // L.info(`${logName}: Connecting mongo, connection string=${ServerConfig.getMongoDBConfig().mongoConnectionString} ...`);

    const connectionString: string = MongoDatabaseAccess.validateUrl(ServerConfig.getMongoDBConfig().mongoConnectionString);    
    // throws: MongoServerSelectionError
    // catch, mark Server status and rethrow 
    MongoDatabaseAccess.mongoClient = await MongoClient.connect(connectionString);

    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED, message: 'connected.', details: undefined } ));
    
    MongoDatabaseAccess.mongoDatabase = MongoDatabaseAccess.mongoClient.db(ServerConfig.getMongoDBConfig().serverMongoDatabaseName);
  
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
      success: true
    }
    try {
      const res = await MongoDatabaseAccess.mongoDatabase.command( { connectionStatus: 1, showPrivileges: true});
      ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MONITOR_DB_CONNECTION, message: 'result', details: { result: res } } ));
      return testDetails;
    } catch (e: any) {
      testDetails.success = false;
      testDetails.error = new ServerErrorFromError(e, logName);
      ServerLogger.warn(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.MONITOR_DB_CONNECTION, message: 'connection test failed', details: testDetails } ));
      return testDetails;
    }

  }

}



