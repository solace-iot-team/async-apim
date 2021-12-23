import { ServerError } from '../../../common/ServerError';
import { EServerStatusCodes, ServerLogger } from '../../../common/ServerLogger';
import { ServerUtils } from '../../../common/ServerUtils';

import APSAbout = Components.Schemas.APSAbout;

export class APSAboutService {
  private apsAbout: APSAbout;
  
  // constructor() {}

  public initialize = async(expressServerRootDir: string) => {
    const funcName = 'initialize';
    const logName = `${APSAboutService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));

    const fileName = `${expressServerRootDir}/public/apim-server-about.json`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING, message: 'server about file', details: { filename: fileName } })); 
    const absoluteFilePath: string | undefined = ServerUtils.validateFilePathWithReadPermission(fileName);
    if(!absoluteFilePath) throw new ServerError(logName, `about file not present or not readable, file=${fileName}`);
    const contentObj = ServerUtils.readFileContentsAsJson(absoluteFilePath);
    // any validation required here?
    this.apsAbout = contentObj;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING, message: 'server about object', details: { about: this.apsAbout } })); 
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public about = async(): Promise<APSAbout> => {
    return this.apsAbout;
  }
}

export default new APSAboutService();
