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
  EAPApp_Status,
  IAPAppDisplay, 
  TAPAppDisplay_AllowedActions, 
  TAPAppMeta, 
  TAPOrganizationAppSettings
} from '../../displayServices/APAppsDisplayService/APAppsDisplayService';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from '../../displayServices/APBusinessGroupsDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../../displayServices/APEnvironmentsDisplayService';
import { IAPEntityIdDisplay } from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import APDeveloperPortalAppApiProductsDisplayService, { 
  TAPDeveloperPortalAppApiProductDisplayList 
} from './APDeveloperPortalAppApiProductsDisplayService';

export type TAPDeveloperPortalAppDisplay = IAPAppDisplay & {
  // nothing to add at the moment
}

/**
 * Display for list.
 */
 export interface IAPDeveloperPortalAppListDisplay extends IAPEntityIdDisplay, IAPSearchContent {
  connectorAppResponse: AppResponse;
  apAppStatus: EAPApp_Status;
}
export type TAPDeveloperPortalAppListDisplayList = Array<IAPDeveloperPortalAppListDisplay>;

export type TAPDeveloperPortalAppDisplay_AllowedActions = TAPAppDisplay_AllowedActions & {
  isManageWebhooksAllowed: boolean;
}

export abstract class APDeveloperPortalAppsDisplayService extends APAppsDisplayService {
  private readonly MiddleComponentName = "APDeveloperPortalAppsDisplayService";

  protected abstract create_ApDeveloperPortalApp_ApAppMeta({ ownerId }:{
    ownerId: string;
  }): TAPAppMeta;

  protected create_Empty_ApDeveloperPortalAppDisplay({ ownerId, apOrganizationAppSettings }:{
    ownerId: string;
    apOrganizationAppSettings: TAPOrganizationAppSettings;
  }): TAPDeveloperPortalAppDisplay {

    const apAppDisplay: IAPAppDisplay = this.create_Empty_ApAppDisplay({ 
      apAppMeta: this.create_ApDeveloperPortalApp_ApAppMeta({ ownerId: ownerId }),
      apOrganizationAppSettings: apOrganizationAppSettings
    });

    return apAppDisplay;
  }

  protected create_ApDeveloperPortalAppDisplay_From_ApiEntities({ 
    ownerId, 
    connectorAppResponse_smf, 
    connectorAppResponse_mqtt, 
    connectorAppConnectionStatus,
    apDeveloperPortalApp_ApiProductDisplayList,
    apAppApiDisplayList,
    apOrganizationAppSettings,
    complete_ApEnvironmentDisplayList,
  }: {
    ownerId: string;
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
    apAppApiDisplayList: TAPAppApiDisplayList;
    apOrganizationAppSettings: TAPOrganizationAppSettings;
    complete_ApEnvironmentDisplayList: TAPEnvironmentDisplayList;
  }): TAPDeveloperPortalAppDisplay {

    const apAppDisplay: IAPAppDisplay = this.create_ApAppDisplay_From_ApiEntities({
      apAppMeta: this.create_ApDeveloperPortalApp_ApAppMeta({ ownerId: ownerId }),
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      apAppApiProductDisplayList: apDeveloperPortalApp_ApiProductDisplayList,
      apAppApiDisplayList: apAppApiDisplayList,
      apOrganizationAppSettings: apOrganizationAppSettings,
      complete_ApEnvironmentDisplayList: complete_ApEnvironmentDisplayList
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
  
  public apiGetList_ApDeveloperPortalAppListDisplayList = async({ organizationId, ownerId, connectorAppResponseList, apOrganizationAppSettings }: {
    organizationId: string;
    ownerId: string;
    connectorAppResponseList: Array<AppResponse>;
    apOrganizationAppSettings: TAPOrganizationAppSettings;
  }): Promise<TAPDeveloperPortalAppListDisplayList> => {

    const apDeveloperPortalAppListDisplayList: TAPDeveloperPortalAppListDisplayList = [];

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });
    // get the complete business group list for reference
    const complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId,
      fetchAssetReferences: false
    });

    // cache passed to get app api product list call
    const cache_apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = [];

    for(const connectorAppResponse of connectorAppResponseList) {

      // required to calculate the app status
      // use and update the cache
      const apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = await this.apiGet_ApDeveloperPortalAppApiProductDisplayList({
        organizationId: organizationId,
        ownerId: ownerId,
        connectorAppResponse: connectorAppResponse,
        complete_apEnvironmentDisplayList: complete_apEnvironmentDisplayList,
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
        create_skinny: true,
        cache_apDeveloperPortalApp_ApiProductDisplayList: cache_apDeveloperPortalApp_ApiProductDisplayList
      });

      const apDeveloperPortalAppDisplay: TAPDeveloperPortalAppDisplay = this.create_ApDeveloperPortalAppDisplay_From_ApiEntities({
        ownerId: ownerId,
        connectorAppConnectionStatus: {},
        connectorAppResponse_smf: connectorAppResponse,
        connectorAppResponse_mqtt: undefined,
        apDeveloperPortalApp_ApiProductDisplayList: apDeveloperPortalApp_ApiProductDisplayList,
        apAppApiDisplayList: [],
        apOrganizationAppSettings: apOrganizationAppSettings,
        complete_ApEnvironmentDisplayList: complete_apEnvironmentDisplayList
      });

      const apDeveloperPortalAppListDisplay: IAPDeveloperPortalAppListDisplay = {
        apEntityId: apDeveloperPortalAppDisplay.apEntityId,
        apAppStatus: apDeveloperPortalAppDisplay.apAppStatus,
        connectorAppResponse: connectorAppResponse,
        apSearchContent: ''
      };

      apDeveloperPortalAppListDisplayList.push(APSearchContentService.add_SearchContent<IAPDeveloperPortalAppListDisplay>(apDeveloperPortalAppListDisplay));

    }

    return apDeveloperPortalAppListDisplayList;
  }

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



