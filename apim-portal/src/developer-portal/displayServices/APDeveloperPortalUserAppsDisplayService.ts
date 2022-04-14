import { 
  App,
  AppConnectionStatus,
  AppResponse,
  AppsService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APAppApisDisplayService, { TAPAppApiDisplayList } from '../../displayServices/APAppsDisplayService/APAppApisDisplayService';
import APAppEnvironmentsDisplayService, { 
  TAPAppEnvironmentDisplayList 
} from '../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService';
import { EAPApp_Status } from '../../displayServices/APAppsDisplayService/APAppsDisplayService';
import { 
  APUserAppsDisplayService, 
  IAPUserAppDisplay 
} from '../../displayServices/APAppsDisplayService/APUserAppsDisplayService';
import APEnvironmentsDisplayService, { 
  TAPEnvironmentDisplayList 
} from '../../displayServices/APEnvironmentsDisplayService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import APDeveloperPortalAppApiProductsDisplayService, { 
  TAPDeveloperPortalAppApiProductDisplay, 
  TAPDeveloperPortalAppApiProductDisplayList 
} from './APDeveloperPortalAppApiProductsDisplayService';

export type TAPDeveloperPortalUserAppDisplay = IAPUserAppDisplay & IAPSearchContent &{
  apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  apAppApiDisplayList: TAPAppApiDisplayList;
}
export type TAPDeveloperPortalUserAppDisplayList = Array<TAPDeveloperPortalUserAppDisplay>;

export type TAPDeveloperPortalUserAppDisplay_AllowedActions = {
  isManageWebhooksAllowed: boolean;
  isMonitorStatsAllowed: boolean;
}

class APDeveloperPortalUserAppsDisplayService extends APUserAppsDisplayService {
  private readonly ComponentName = "APDeveloperPortalUserAppsDisplayService";

  public create_Empty_ApDeveloperPortalUserAppDisplay({ userId }:{
    userId: string;
  }): TAPDeveloperPortalUserAppDisplay {

    const apUserAppDisplay: IAPUserAppDisplay = this.create_Empty_ApUserAppDisplay({
      userId: userId
    });

    const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = {
      ...apUserAppDisplay,
      apAppStatus: EAPApp_Status.UNKNOWN,
      apDeveloperPortalUserApp_ApiProductDisplayList: [],
      apAppApiDisplayList: [],
      apSearchContent: ''
    };
    return apDeveloperPortalUserAppDisplay;
  }

  private create_ApDeveloperPortalUserAppDisplay_From_ApiEntities({ 
    userId, 
    connectorAppResponse_smf, 
    connectorAppResponse_mqtt, 
    connectorAppConnectionStatus,
    apDeveloperPortalUserApp_ApiProductDisplayList,
    apAppApiDisplayList,
  }: {
    userId: string;
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
    apAppApiDisplayList: TAPAppApiDisplayList;
  }): TAPDeveloperPortalUserAppDisplay {

    const apUserAppDisplay: IAPUserAppDisplay = this.create_ApUserAppDisplay_From_ApiEntities({
      userId: userId,
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
    });

    const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = {
      ...apUserAppDisplay,
      apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
      apAppApiDisplayList: apAppApiDisplayList,
      apSearchContent: '',      
    };
    return APSearchContentService.add_SearchContent<TAPDeveloperPortalUserAppDisplay>(apDeveloperPortalUserAppDisplay);
  }

  public get_ApDeveloperPortalApp_ApiProductDisplayList({ apDeveloperPortalUserAppDisplay }:{
    apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  }): TAPDeveloperPortalAppApiProductDisplayList {
    return apDeveloperPortalUserAppDisplay.apDeveloperPortalUserApp_ApiProductDisplayList;
  }

  public set_ApDeveloperPortalApp_ApiProductDisplayList({ apDeveloperPortalUserAppDisplay, apDeveloperPortalUserApp_ApiProductDisplayList }:{
    apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
    apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): TAPDeveloperPortalUserAppDisplay {
    apDeveloperPortalUserAppDisplay.apDeveloperPortalUserApp_ApiProductDisplayList = apDeveloperPortalUserApp_ApiProductDisplayList;
    return apDeveloperPortalUserAppDisplay;
  }

  public get_Empty_AllowedActions(): TAPDeveloperPortalUserAppDisplay_AllowedActions {
    return {
      isManageWebhooksAllowed: false,
      isMonitorStatsAllowed: false
    };
  }

  private is_ManageWebhooks_Allowed({ apAppEnvironmentDisplayList }:{
    apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  }): boolean {
    return APAppEnvironmentsDisplayService.isAny_ApAppEnvironmentDisplay_Webhook_Capable({
      apAppEnvironmentDisplayList: apAppEnvironmentDisplayList
    });
  }

  public get_AllowedActions({ apDeveloperPortalUserAppDisplay }: {
    apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  }): TAPDeveloperPortalUserAppDisplay_AllowedActions {
    const allowedActions: TAPDeveloperPortalUserAppDisplay_AllowedActions = {
      isManageWebhooksAllowed: this.is_ManageWebhooks_Allowed({ apAppEnvironmentDisplayList: apDeveloperPortalUserAppDisplay.apAppEnvironmentDisplayList }),
      isMonitorStatsAllowed: this.is_MonitorStats_Allowed({ apAppDisplay: apDeveloperPortalUserAppDisplay }),
    };
    return allowedActions;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  private apiGet_ApDeveloperPortalAppApiProductDisplayList = async({ organizationId, userId, connectorAppResponse }:{
    organizationId: string;
    userId: string;
    connectorAppResponse: AppResponse;
  }): Promise<TAPDeveloperPortalAppApiProductDisplayList> => {
    // const funcName = 'apiGet_ApDeveloperPortalAppApiProductDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });
    
    const apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = [];
    
    for(const connectorAppApiProduct of connectorAppResponse.apiProducts) {
      const apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay = await APDeveloperPortalAppApiProductsDisplayService.apiGet_DeveloperPortalApAppApiProductDisplay({
        organizationId: organizationId,
        userId: userId,
        connectorAppApiProduct: connectorAppApiProduct,
        connectorAppResponse: connectorAppResponse,
        complete_apEnvironmentDisplayList: complete_apEnvironmentDisplayList
      });
      apDeveloperPortalAppApiProductDisplayList.push(apDeveloperPortalAppApiProductDisplay);
    }

    return apDeveloperPortalAppApiProductDisplayList;
  }

  public apiGet_ApDeveloperPortalUserAppDisplay = async({ organizationId, userId, appId }:{
    organizationId: string;
    userId: string;
    appId: string;
  }): Promise<TAPDeveloperPortalUserAppDisplay> => {
    const funcName = 'apiGet_ApDeveloperPortalUserAppDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;

    // // TEST upstream error handling
    // throw new Error(`${logName}: test error handling`);

    const exists_userId: boolean = await this.apiCheck_UserIdExists({
      organizationId: organizationId,
      userId: userId,
    });
    if(!exists_userId) throw new Error(`${logName}: !exists_userId`);

    const connectorAppResponse_smf: AppResponse = await AppsService.getDeveloperApp({
      organizationName: organizationId,
      developerUsername: userId,
      appName: appId,
      topicSyntax: 'smf'
    });

    const connectorAppResponse_mqtt: AppResponse = await AppsService.getDeveloperApp({
      organizationName: organizationId,
      developerUsername: userId,
      appName: appId,
      topicSyntax: 'mqtt'
    });

    const connectorAppConnectionStatus: AppConnectionStatus = await AppsService.getAppStatus({
      organizationName: organizationId,
      appName: appId
    });  

    // get every api product
    const apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = await this.apiGet_ApDeveloperPortalAppApiProductDisplayList({
      organizationId: organizationId,
      userId: userId,
      connectorAppResponse: connectorAppResponse_smf,
    });

    // create the app api display list
    const apAppApiDisplayList: TAPAppApiDisplayList = await APAppApisDisplayService.apiGetList_ApAppApiDisplay({
      organizationId: organizationId,
      appId: appId,
      apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
    });

    const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = this.create_ApDeveloperPortalUserAppDisplay_From_ApiEntities({
      userId: userId,
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
      apAppApiDisplayList: apAppApiDisplayList,
    });

    return apDeveloperPortalUserAppDisplay;
  }

  public apiGetList_ApDeveloperPortalUserAppDisplayList = async({ organizationId, userId }: {
    organizationId: string;
    userId: string;
  }): Promise<TAPDeveloperPortalUserAppDisplayList> => {
    // const funcName = 'apiGetList_ApDeveloperPortalUserAppDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const exists_userId: boolean = await this.apiCheck_UserIdExists({
      organizationId: organizationId,
      userId: userId,
    });
    if(!exists_userId) return [];

    const apDeveloperPortalUserAppDisplayList: TAPDeveloperPortalUserAppDisplayList = [];

    const connectorAppList: Array<App> = await AppsService.listDeveloperApps({
      organizationName: organizationId, 
      developerUsername: userId
    });

    // get details for each App
    for(const connectorApp of connectorAppList) {

      const connectorAppResponse_smf: AppResponse = await AppsService.getDeveloperApp({
        organizationName: organizationId,
        developerUsername: userId,
        appName: connectorApp.name,
        topicSyntax: 'smf'
      });

      const apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = await this.apiGet_ApDeveloperPortalAppApiProductDisplayList({
        organizationId: organizationId,
        userId: userId,
        connectorAppResponse: connectorAppResponse_smf,
      });
    
      // create the app api display list
      const apAppApiDisplayList: TAPAppApiDisplayList = await APAppApisDisplayService.apiGetList_ApAppApiDisplay({
        organizationId: organizationId,
        appId: connectorApp.name,
        apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
      });

      const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = this.create_ApDeveloperPortalUserAppDisplay_From_ApiEntities({
        userId: userId,
        connectorAppConnectionStatus: {},
        connectorAppResponse_smf: connectorAppResponse_smf,
        connectorAppResponse_mqtt: undefined,
        apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
        apAppApiDisplayList: apAppApiDisplayList,
      });

      apDeveloperPortalUserAppDisplayList.push(apDeveloperPortalUserAppDisplay);

    }

    return apDeveloperPortalUserAppDisplayList;
  }

  public async apiCreate_ApDeveloperPortalUserAppDisplay({ organizationId, userId, apDeveloperPortalUserAppDisplay }:{
    organizationId: string;
    userId: string;
    apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  }): Promise<void> {
    // const funcName = 'apiCreate_ApDeveloperPortalUserAppDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const create: App = {
      name: apDeveloperPortalUserAppDisplay.apEntityId.id,
      displayName: apDeveloperPortalUserAppDisplay.apEntityId.displayName,
      apiProducts: [],
      expiresIn: apDeveloperPortalUserAppDisplay.apAppCredentials.apConsumerKeyExiresIn,
      credentials: {
      // TODO: remove once not manadatory in API
      expiresAt: apDeveloperPortalUserAppDisplay.apAppCredentials.expiresAt,
      }
    };

    await AppsService.createDeveloperApp({
      organizationName: organizationId,
      developerUsername: userId,
      requestBody: create
    });
  }

  public async apiUpdate_ApDeveloperPortalUserAppDisplay({ organizationId, apDeveloperPortalUserAppDisplay }:{
    organizationId: string;
    apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  }): Promise<void> {
    const funcName = 'apiUpdate_ApDeveloperPortalUserAppDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;

    alert(`${logName}: implement me `);
  }

  public async apiDelete_ApDeveloperPortalUserAppDisplay({ organizationId, userId, appId }:{
    organizationId: string;
    userId: string;
    appId: string;
  }): Promise<void> {

    await AppsService.deleteDeveloperApp({
      organizationName: organizationId,
      developerUsername: userId,
      appName: appId
    });

  }
  
}

export default new APDeveloperPortalUserAppsDisplayService();


