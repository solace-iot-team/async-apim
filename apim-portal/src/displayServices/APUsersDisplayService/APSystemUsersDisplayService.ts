import { ApsUsersService, APSUserUpdate } from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import { 
  APUsersDisplayService, 
} from './APUsersDisplayService';

class APSystemUsersDisplayService extends APUsersDisplayService {
  private readonly ComponentName = "APSystemUsersDisplayService";

  protected async apsUpdate_ApsUserUpdate({
    userId, apsUserUpdate
  }: {
    userId: string;
    apsUserUpdate: APSUserUpdate,
  }): Promise<void> {
    const funcName = 'apsUpdate_ApsUserUpdate';
    const logName = `${this.ComponentName}.${funcName}()`;

    await ApsUsersService.updateApsUser({
      userId: userId, 
      requestBody: apsUserUpdate
    });
  }

  
}

export default new APSystemUsersDisplayService();
