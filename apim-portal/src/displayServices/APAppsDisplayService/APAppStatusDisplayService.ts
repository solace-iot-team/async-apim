import { 
  AppConnectionStatus,
  AppEnvironmentStatus,
  AppsService, 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  IAPEntityIdDisplay, 
  TAPEntityId,
} from '../../utils/APEntityIdsService';
import { TAPAppEnvironmentDisplayList } from './APAppEnvironmentsDisplayService';
import { EAPApp_Status, IAPAppDisplay } from './APAppsDisplayService';
import APAppWebhooksDisplayService, { TAPAppWebhookDisplayList } from './APAppWebhooksDisplayService';

export type TAPAppEnvironmentStatusDisplay = IAPEntityIdDisplay & {
  connectorAppEnvironmentStatus: AppEnvironmentStatus;
}
export type TAPAppEnvironmentStatusDisplayList = Array<TAPAppEnvironmentStatusDisplay>;

export interface IAPAppStatusDisplay extends IAPEntityIdDisplay {
  apAppStatus: EAPApp_Status;
  apAppEnvironmentStatusDisplayList: TAPAppEnvironmentStatusDisplayList;
}

export class APAppStatusDisplayService {
  private readonly BaseComponentName = "APAppStatusDisplayService";

  public nameOf<T extends IAPAppStatusDisplay>(name: keyof T) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }

  protected create_ApAppStatusDisplay_From_ApiEntities({ connector_AppConnectionStatus, appEntityId, apAppStatus, apAppEnvironmentDisplayList, apAppWebhookDisplayList }:{
    connector_AppConnectionStatus: AppConnectionStatus;
    appEntityId: TAPEntityId;
    apAppStatus: EAPApp_Status;
    apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
    apAppWebhookDisplayList: TAPAppWebhookDisplayList;
  }): IAPAppStatusDisplay {
    const funcName = 'create_ApAppStatusDisplay_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const apAppStatusDisplay: IAPAppStatusDisplay = {
      apEntityId: appEntityId,
      apAppStatus: apAppStatus,
      apAppEnvironmentStatusDisplayList: []
    };
    if(connector_AppConnectionStatus.environments === undefined) return apAppStatusDisplay;

    const apAppEnvironmentStatusDisplayList: TAPAppEnvironmentStatusDisplayList = [];

    for(const apAppEnvironmentDisplay of apAppEnvironmentDisplayList) {
      const connector_AppEnvironmentStatus: AppEnvironmentStatus | undefined = connector_AppConnectionStatus.environments.find( (x) => {
        return x.name === apAppEnvironmentDisplay.apEntityId.id;
      });
      if(connector_AppEnvironmentStatus === undefined) throw new Error(`${logName}: connector_AppEnvironmentStatus === undefined`);
      const apAppEnvironmentStatusDisplay: TAPAppEnvironmentStatusDisplay = {
        apEntityId: apAppEnvironmentDisplay.apEntityId,
        connectorAppEnvironmentStatus: connector_AppEnvironmentStatus
      };
      apAppEnvironmentStatusDisplayList.push(apAppEnvironmentStatusDisplay);
    }
    apAppStatusDisplay.apAppEnvironmentStatusDisplayList = apAppEnvironmentStatusDisplayList;
    return apAppStatusDisplay;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public apiGet_ApAppStatusDisplay = async({ organizationId, apAppDisplay }:{
    organizationId: string;
    apAppDisplay: IAPAppDisplay;
  }): Promise<IAPAppStatusDisplay> => {

    const connector_AppConnectionStatus: AppConnectionStatus = await AppsService.getAppStatus({
      organizationName: organizationId,
      appName: apAppDisplay.apEntityId.id
    });

    const apAppWebhookDisplayList: TAPAppWebhookDisplayList = await APAppWebhooksDisplayService.apiGetList_ApAppWebhookDisplayList({
      organizationId: organizationId,
      appId: apAppDisplay.apEntityId.id,
      apAppMeta: apAppDisplay.apAppMeta,
      apAppEnvironmentDisplayList: apAppDisplay.apAppEnvironmentDisplayList
    });

    return this.create_ApAppStatusDisplay_From_ApiEntities({
      connector_AppConnectionStatus: connector_AppConnectionStatus,
      appEntityId: apAppDisplay.apEntityId,
      apAppStatus: apAppDisplay.apAppStatus,
      apAppEnvironmentDisplayList: apAppDisplay.apAppEnvironmentDisplayList,
      apAppWebhookDisplayList: apAppWebhookDisplayList
    });

  }

}

export default new APAppStatusDisplayService();
