import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import ServerStatus from '../../common/ServerStatus';
import APSStatus = Components.Schemas.APSStatus;

export class APSMonitorService {

  // constructor() {}

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSMonitorService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    // do initialization
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public status = async(): Promise<APSStatus> => {
    const funcName = 'status';
    const logName = `${APSMonitorService.name}.${funcName}()`;

    const apsStatus: APSStatus = {
      isReady: ServerStatus.getStatus().isReady,
      timestamp: ServerStatus.getStatus().lastModifiedTimestamp
    }

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'status', details: { status: apsStatus } })); 

    return apsStatus;
  }
}

export default new APSMonitorService();
