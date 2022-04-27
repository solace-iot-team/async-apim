import { 
  AppApiProductsComplex,
  AppConnectionStatus,
  AppPatch,
  AppResponse,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPAppApiDisplayList } from '../../displayServices/APAppsDisplayService/APAppApisDisplayService';
import APAppEnvironmentsDisplayService, { 
  TAPAppEnvironmentDisplayList 
} from '../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService';
import { 
  APAppsDisplayService,
  IAPAppDisplay, 
  TAPAppDisplay_AllowedActions, 
  TAPAppMeta 
} from '../../displayServices/APAppsDisplayService/APAppsDisplayService';
import APDeveloperPortalAppApiProductsDisplayService, { 
  TAPDeveloperPortalAppApiProductDisplayList 
} from './APDeveloperPortalAppApiProductsDisplayService';

export type TAPDeveloperPortalAppDisplay = IAPAppDisplay & {
  // nothing to add at the moment
}
export type TAPDeveloperPortalAppDisplayList = Array<TAPDeveloperPortalAppDisplay>;

export type TAPDeveloperPortalAppDisplay_AllowedActions = TAPAppDisplay_AllowedActions & {
  isManageWebhooksAllowed: boolean;
}

export abstract class APDeveloperPortalAppsDisplayService extends APAppsDisplayService {
  private readonly MiddleComponentName = "APDeveloperPortalAppsDisplayService";

  protected abstract create_ApDeveloperPortalApp_ApAppMeta({ ownerId }:{
    ownerId: string;
  }): TAPAppMeta;

  protected create_Empty_ApDeveloperPortalAppDisplay({ ownerId }:{
    ownerId: string;
  }): TAPDeveloperPortalAppDisplay {

    const apAppDisplay: IAPAppDisplay = this.create_Empty_ApAppDisplay({ apAppMeta: this.create_ApDeveloperPortalApp_ApAppMeta({ ownerId: ownerId }) });

    return apAppDisplay;
  }

  protected create_ApDeveloperPortalAppDisplay_From_ApiEntities({ 
    ownerId, 
    connectorAppResponse_smf, 
    connectorAppResponse_mqtt, 
    connectorAppConnectionStatus,
    apDeveloperPortalApp_ApiProductDisplayList,
    apAppApiDisplayList,
  }: {
    ownerId: string;
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
    apAppApiDisplayList: TAPAppApiDisplayList;
  }): TAPDeveloperPortalAppDisplay {

    const apAppDisplay: IAPAppDisplay = this.create_ApAppDisplay_From_ApiEntities({
      apAppMeta: this.create_ApDeveloperPortalApp_ApAppMeta({ ownerId: ownerId }),
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      apAppApiProductDisplayList: apDeveloperPortalApp_ApiProductDisplayList,
      apAppApiDisplayList: apAppApiDisplayList
    });

    return apAppDisplay;
  }

  public get_ApDeveloperPortalApp_ApiProductDisplayList({ apDeveloperPortalAppDisplay }:{
    apDeveloperPortalAppDisplay: TAPDeveloperPortalAppDisplay;
  }): TAPDeveloperPortalAppApiProductDisplayList {
    return apDeveloperPortalAppDisplay.apAppApiProductDisplayList;
  }

  public get_Empty_AllowedActions(): TAPDeveloperPortalAppDisplay_AllowedActions {
    return {
      ...super.get_Empty_AllowedActions(),
      isManageWebhooksAllowed: false
    };
  }

  private is_ManageWebhooks_Allowed({ apAppEnvironmentDisplayList }:{
    apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  }): boolean {
    return APAppEnvironmentsDisplayService.isAny_ApAppEnvironmentDisplay_Webhook_Capable({
      apAppEnvironmentDisplayList: apAppEnvironmentDisplayList
    });
  }

  public get_AllowedActions({ apAppDisplay }: {
    apAppDisplay: IAPAppDisplay;
  }): TAPDeveloperPortalAppDisplay_AllowedActions {
    const allowedActions: TAPDeveloperPortalAppDisplay_AllowedActions = {
      ...super.get_AllowedActions({ apAppDisplay: apAppDisplay }),
      isManageWebhooksAllowed: this.is_ManageWebhooks_Allowed({ apAppEnvironmentDisplayList: apAppDisplay.apAppEnvironmentDisplayList }),
    };
    return allowedActions;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************
  
  public async apiUpdate_ApDeveloperPortalAppDisplay_AppApiProductDisplayList({ organizationId, apDeveloperPortalAppDisplay, apDeveloperPortalAppApiProductDisplayList }:{
    organizationId: string;
    apDeveloperPortalAppDisplay: TAPDeveloperPortalAppDisplay;
    apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): Promise<void> {
    // const funcName = 'apiUpdate_ApDeveloperPortalAppDisplay_AppApiProductDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // test downstream error handling
    // throw new Error(`${logName}: test error handling`);

    const connectorAppApiProductList: Array<AppApiProductsComplex> = APDeveloperPortalAppApiProductsDisplayService.create_ConnectorApiProductList({
      apDeveloperPortalAppApiProductDisplayList: apDeveloperPortalAppApiProductDisplayList
    });
    const update: AppPatch = {
      apiProducts: connectorAppApiProductList,
    }

    // alert(`${logName}: update api product list, update=${JSON.stringify(update, null, 2)}`);

    await this.apiUpdate({
      organizationId: organizationId,
      appId: apDeveloperPortalAppDisplay.apEntityId.id,
      apAppMeta: apDeveloperPortalAppDisplay.apAppMeta,
      connectorAppPatch: update
    });

  }

}



