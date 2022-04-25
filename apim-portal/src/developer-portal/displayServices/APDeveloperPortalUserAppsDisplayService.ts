import { 
  ApiError,
  App,
  AppApiProductsComplex,
  AppConnectionStatus,
  AppPatch,
  AppResponse,
  AppsService,
  DevelopersService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APAppApisDisplayService, { TAPAppApiDisplayList } from '../../displayServices/APAppsDisplayService/APAppApisDisplayService';
import APAppEnvironmentsDisplayService, { 
  TAPAppEnvironmentDisplayList 
} from '../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService';
import { 
  APAppsDisplayService,
  EAPApp_OwnerType, 
  EAPApp_Type, 
  IAPAppDisplay, 
  TAPAppDisplay_AllowedActions, 
  TAPAppMeta 
} from '../../displayServices/APAppsDisplayService/APAppsDisplayService';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import APDeveloperPortalAppApiProductsDisplayService, { 
  TAPDeveloperPortalAppApiProductDisplayList 
} from './APDeveloperPortalAppApiProductsDisplayService';

export type TAPDeveloperPortalUserAppDisplay = IAPAppDisplay & IAPSearchContent & {
  // nothing to add at the moment
}
export type TAPDeveloperPortalUserAppDisplayList = Array<TAPDeveloperPortalUserAppDisplay>;

export type TAPDeveloperPortalUserAppDisplay_AllowedActions = TAPAppDisplay_AllowedActions & {
  isManageWebhooksAllowed: boolean;
}

class APDeveloperPortalUserAppsDisplayService extends APAppsDisplayService {
  private readonly ComponentName = "APDeveloperPortalUserAppsDisplayService";

  private create_ApDeveloperPortalUserApp_ApAppMeta({ userId }:{
    userId: string;
  }): TAPAppMeta {
    return {
      apAppType: EAPApp_Type.USER,
      apAppOwnerType: EAPApp_OwnerType.INTERNAL,
      appOwnerId: userId
    };
  }

  public create_Empty_ApDeveloperPortalUserAppDisplay({ userId }:{
    userId: string;
  }): TAPDeveloperPortalUserAppDisplay {

    const apAppDisplay: IAPAppDisplay = this.create_Empty_ApAppDisplay({ apAppMeta: this.create_ApDeveloperPortalUserApp_ApAppMeta({ userId: userId }) });

    const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = {
      ...apAppDisplay,
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

    const apAppDisplay: IAPAppDisplay = this.create_ApAppDisplay_From_ApiEntities({
      apAppMeta: this.create_ApDeveloperPortalUserApp_ApAppMeta({ userId: userId }),
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      apAppApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
      apAppApiDisplayList: apAppApiDisplayList
    });

    const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = {
      ...apAppDisplay,
      apSearchContent: '',      
    };
    return APSearchContentService.add_SearchContent<TAPDeveloperPortalUserAppDisplay>(apDeveloperPortalUserAppDisplay);
  }

  public get_ApDeveloperPortalApp_ApiProductDisplayList({ apDeveloperPortalUserAppDisplay }:{
    apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  }): TAPDeveloperPortalAppApiProductDisplayList {
    return apDeveloperPortalUserAppDisplay.apAppApiProductDisplayList;
  }

  public get_Empty_AllowedActions(): TAPDeveloperPortalUserAppDisplay_AllowedActions {
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
  }): TAPDeveloperPortalUserAppDisplay_AllowedActions {
    const allowedActions: TAPDeveloperPortalUserAppDisplay_AllowedActions = {
      ...super.get_AllowedActions({ apAppDisplay: apAppDisplay }),
      isManageWebhooksAllowed: this.is_ManageWebhooks_Allowed({ apAppEnvironmentDisplayList: apAppDisplay.apAppEnvironmentDisplayList }),
    };
    return allowedActions;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiCheck_UserIdExists({ organizationId, userId }:{
    organizationId: string;
    userId: string;
  }): Promise<boolean> {
    const funcName = 'apiCheck_UserIdExists';
    const logName = `${this.ComponentName}.${funcName}()`;

    let anyError: any = undefined;
    try {
      await DevelopersService.getDeveloper({
        organizationName: organizationId, 
        developerUsername: userId
      });
      return true;
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return false;
        else anyError = e;
      } else anyError = e;
    }
    if(anyError) {
      APClientConnectorOpenApi.logError(logName, anyError);
      throw anyError;
    }    
    return false;
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
      ownerId: userId,
      connectorAppResponse: connectorAppResponse_smf,
    });

    // create the app api display list
    const apAppApiDisplayList: TAPAppApiDisplayList = await APAppApisDisplayService.apiGetList_ApAppApiDisplay({
      organizationId: organizationId,
      appId: appId,
      apApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
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

  /**
   * List of User Apps. 
   * NOTE: does not include api list.
   */
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

      // required to calculate the app status
      const apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = await this.apiGet_ApDeveloperPortalAppApiProductDisplayList({
        organizationId: organizationId,
        ownerId: userId,
        connectorAppResponse: connectorAppResponse_smf,
      });
    
      // // create the app api display list
      // const apAppApiDisplayList: TAPAppApiDisplayList = await APAppApisDisplayService.apiGetList_ApAppApiDisplay({
      //   organizationId: organizationId,
      //   appId: connectorApp.name,
      //   apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
      // });

      const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = this.create_ApDeveloperPortalUserAppDisplay_From_ApiEntities({
        userId: userId,
        connectorAppConnectionStatus: {},
        connectorAppResponse_smf: connectorAppResponse_smf,
        connectorAppResponse_mqtt: undefined,
        apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
        apAppApiDisplayList: [],
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
      credentials: {}
    };

    await AppsService.createDeveloperApp({
      organizationName: organizationId,
      developerUsername: userId,
      requestBody: create
    });

    // patch the empty app with status approved
    const update: AppPatch = {}
    await this.apiUpdate({
      organizationId: organizationId,
      appId: apDeveloperPortalUserAppDisplay.apEntityId.id,
      apAppMeta: apDeveloperPortalUserAppDisplay.apAppMeta,
      connectorAppPatch: update
    });

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
  
  public async apiUpdate_ApDeveloperPortalUserAppDisplay_AppApiProductDisplayList({ organizationId, apDeveloperPortalUserAppDisplay, apDeveloperPortalAppApiProductDisplayList }:{
    organizationId: string;
    apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
    apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): Promise<void> {
    // const funcName = 'apiUpdate_AppApiProductDisplayList';
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
      appId: apDeveloperPortalUserAppDisplay.apEntityId.id,
      apAppMeta: apDeveloperPortalUserAppDisplay.apAppMeta,
      connectorAppPatch: update
    });

  }

}

export default new APDeveloperPortalUserAppsDisplayService();


