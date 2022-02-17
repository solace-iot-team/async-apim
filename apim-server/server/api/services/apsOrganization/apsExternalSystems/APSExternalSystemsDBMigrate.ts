import { EServerStatusCodes, ServerLogger } from '../../../../common/ServerLogger';
import { APSExternalSystemsService } from './APSExternalSystemsService';

// capture all the schema versions over time here
// Version: 1
export type APSExternalSystem_DB_1 = {
  _id: string;
  _schemaVersion: number;
  _organizationId: string;
  externalSystemId: string;
  displayName: string;
}

export class APSExternalSystemsDBMigrate {

  public static migrate = async(apsExternalSytemsService: APSExternalSystemsService): Promise<number> => {
    const funcName = 'migrate';
    const logName = `${APSExternalSystemsDBMigrate.name}.${funcName}()`;
    const targetDBSchemaVersion = apsExternalSytemsService.getDBObjectSchemaVersion();

    // nothing to do at the moment

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'migrating external systems', details: { 
      targetDBSchemaVersion: targetDBSchemaVersion,
    }}));

    return 0;

    // const currentDBRawUserListToMigrate = await apsUsersService.getPersistenceService().allRawLessThanTargetSchemaVersion(targetDBSchemaVersion);
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'migrating users', details: { 
    //   targetDBSchemaVersion: targetDBSchemaVersion,
    //   currentDBRawUserListToMigrate: currentDBRawUserListToMigrate 
    // }}));
    // for(const currentDBRawUser of currentDBRawUserListToMigrate) {
    //   const currentDBSchemaVersion = currentDBRawUser._schemaVersion ? currentDBRawUser._schemaVersion : 0;
    //   if(targetDBSchemaVersion === 1) {
    //     if(currentDBSchemaVersion === 0) await APSUsersDBMigrate.migrate_0_to_1(apsUsersService.getPersistenceService(), currentDBRawUser);
    //     else throw new MigrateServerError(logName, 'no migration path for schema versions found', apsUsersService.getCollectionName(), currentDBSchemaVersion, targetDBSchemaVersion);
    //   }
    // }
    // return currentDBRawUserListToMigrate.length;
  }

}
