import { 
  App,
  AppApiProductsComplex,
  AppConnectionStatus,
  AppResponse,
  AppsService,
  AppStatus,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APUserAppsDisplayService, 
  IAPUserAppDisplay 
} from '../../displayServices/APAppsDisplayService/APUserAppsDisplayService';
import APEnvironmentsDisplayService, { 
  TAPEnvironmentDisplayList 
} from '../../displayServices/APEnvironmentsDisplayService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import APDeveloperPortalAppApiProductsDisplayService, { 
  TAPAppApiProductApprovalStatus, 
  TAPDeveloperPortalAppApiProductDisplay, 
  TAPDeveloperPortalAppApiProductDisplayList 
} from './APDeveloperPortalAppApiProductsDisplayService';

export type TAPDeveloperPortalUserAppDisplay = IAPUserAppDisplay & IAPSearchContent &{
  apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
}
export type TAPDeveloperPortalUserAppDisplayList = Array<TAPDeveloperPortalUserAppDisplay>;

class APDeveloperPortalUserAppsDisplayService extends APUserAppsDisplayService {
  private readonly ComponentName = "APDeveloperPortalUserAppsDisplayService";


  private create_ApDeveloperPortalUserAppDisplay_From_ApiEntities({ 
    userId, 
    connectorAppResponse_smf, 
    connectorAppResponse_mqtt, 
    connectorAppConnectionStatus,
    apDeveloperPortalAppApiProductDisplayList,
  }: {
    userId: string;
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): TAPDeveloperPortalUserAppDisplay {

    const apUserAppDisplay: IAPUserAppDisplay = this.create_ApUserAppDisplay_From_ApiEntities({
      userId: userId,
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt 
    });

    const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = {
      ...apUserAppDisplay,
      apDeveloperPortalAppApiProductDisplayList: apDeveloperPortalAppApiProductDisplayList,
      apSearchContent: '',      
    };
    return APSearchContentService.add_SearchContent<TAPDeveloperPortalUserAppDisplay>(apDeveloperPortalUserAppDisplay);
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public apiGetList_ApDeveloperPortalUserAppDisplayList = async({ organizationId, userId }: {
    organizationId: string;
    userId: string;
  }): Promise<TAPDeveloperPortalUserAppDisplayList> => {
    const funcName = 'apiGetList_ApDeveloperPortalUserAppDisplayList';
    const logName = `${this.ComponentName}.${funcName}()`;

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

      // not required for list
      const connectorAppResponse_mqtt: AppResponse = await AppsService.getDeveloperApp({
        organizationName: organizationId,
        developerUsername: userId,
        appName: connectorApp.name,
        topicSyntax: 'mqtt'
      });

      // not required for list
      // const connectorAppConnectionStatus: AppConnectionStatus = {};
      // let _apiAppConnectionStatus: AppConnectionStatus = {};
  // try {
  //   _apiAppConnectionStatus = await AppsService.getAppStatus({
  //     organizationName: props.organizationId,
  //     appName: apiApp.name
  //   });  
  // } catch (e:any) {
  //   APClientConnectorOpenApi.logError(logName, e);
  // }

      // get the complete env list for reference
      const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
        organizationId: organizationId
      });
  
      const apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = [];
      // get every api product
      for(const connectorAppApiProduct of connectorAppResponse_smf.apiProducts) {
        let apiProductId: string;
        let apAppApiProductApprovalStatus: TAPAppApiProductApprovalStatus = AppStatus.PENDING;
        if(typeof connectorAppApiProduct === 'string') {
          apiProductId = connectorAppApiProduct;
          // it is just the id, take the status from the app
          if(connectorAppResponse_smf.status === undefined) throw new Error(`${logName}: typeof connectorAppApiProduct === 'string' AND connectorAppResponse_smf.status === undefined`);
          apAppApiProductApprovalStatus = connectorAppResponse_smf.status;
        } else {
          const complexAppApiProduct: AppApiProductsComplex = connectorAppApiProduct;
          apiProductId = complexAppApiProduct.apiproduct;
          if(complexAppApiProduct.status === undefined) throw new Error(`${logName}: typeof connectorAppApiProduct !== 'string' AND complexAppApiProduct.status === undefined`);
          apAppApiProductApprovalStatus = complexAppApiProduct.status;
        }

        const apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay = await APDeveloperPortalAppApiProductsDisplayService.apiGet_DeveloperPortalApAppApiProductDisplay({
          organizationId: organizationId,
          userId: userId,
          apiProductId: apiProductId,
          apAppApiProductApprovalStatus: apAppApiProductApprovalStatus,
          complete_apEnvironmentDisplayList: complete_apEnvironmentDisplayList
        });
        apDeveloperPortalAppApiProductDisplayList.push(apDeveloperPortalAppApiProductDisplay);
      }

      const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = this.create_ApDeveloperPortalUserAppDisplay_From_ApiEntities({
        userId: userId,
        connectorAppConnectionStatus: {},
        connectorAppResponse_smf: connectorAppResponse_smf,
        connectorAppResponse_mqtt: connectorAppResponse_mqtt,
        apDeveloperPortalAppApiProductDisplayList: apDeveloperPortalAppApiProductDisplayList
      });

      apDeveloperPortalUserAppDisplayList.push(apDeveloperPortalUserAppDisplay);

    }

    return apDeveloperPortalUserAppDisplayList;
  }
}

export default new APDeveloperPortalUserAppsDisplayService();


