import { 
  ApiError,
  App,
  AppConnectionStatus,
  AppPatch,
  AppResponse,
  AppsService,
  AppStatus,
  TeamsService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APAppApisDisplayService, { TAPAppApiDisplayList } from '../../displayServices/APAppsDisplayService/APAppApisDisplayService';
import { 
  EAPApp_OwnerType, 
  EAPApp_Type, 
  TAPAppMeta, 
  TAPOrganizationAppSettings
} from '../../displayServices/APAppsDisplayService/APAppsDisplayService';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import { 
  TAPDeveloperPortalAppApiProductDisplayList 
} from './APDeveloperPortalAppApiProductsDisplayService';
import { 
  APDeveloperPortalAppsDisplayService, 
  TAPDeveloperPortalAppDisplay, 
  TAPDeveloperPortalAppDisplay_AllowedActions, 
  TAPDeveloperPortalAppListDisplayList
} from './APDeveloperPortalAppsDisplayService';

export type TAPDeveloperPortalTeamAppDisplay = TAPDeveloperPortalAppDisplay & IAPSearchContent & {
  // nothing to add at the moment
}
export type TAPDeveloperPortalTeamAppDisplayList = Array<TAPDeveloperPortalTeamAppDisplay>;

export type TAPDeveloperPortalTeamAppDisplay_AllowedActions = TAPDeveloperPortalAppDisplay_AllowedActions & {
  // nothing to add at the moment
}

class APDeveloperPortalTeamAppsDisplayService extends APDeveloperPortalAppsDisplayService {
  private readonly ComponentName = "APDeveloperPortalTeamAppsDisplayService";

  protected create_ApDeveloperPortalApp_ApAppMeta({ ownerId }:{
    ownerId: string;
  }): TAPAppMeta {
    return {
      apAppType: EAPApp_Type.TEAM,
      apAppOwnerType: EAPApp_OwnerType.INTERNAL,
      appOwnerId: ownerId,
      // do we need the business group display name here?
      appOwnerDisplayName: ownerId
    };
  }

  public create_Empty_ApDeveloperPortalTeamAppDisplay({ teamId, apOrganizationAppSettings }:{
    teamId: string;
    apOrganizationAppSettings: TAPOrganizationAppSettings;
  }): TAPDeveloperPortalTeamAppDisplay {

    const apDevPortalAppDisplay: TAPDeveloperPortalAppDisplay = this.create_Empty_ApDeveloperPortalAppDisplay({
      ownerId: teamId,
      apOrganizationAppSettings: apOrganizationAppSettings
    });

    const apDeveloperPortalUserAppDisplay: TAPDeveloperPortalTeamAppDisplay = {
      ...apDevPortalAppDisplay,
      apSearchContent: ''
    };
    return apDeveloperPortalUserAppDisplay;
  }

  private create_ApDeveloperPortalTeamAppDisplay_From_ApiEntities({ 
    teamId, 
    connectorAppResponse_smf, 
    connectorAppResponse_mqtt, 
    connectorAppConnectionStatus,
    apDeveloperPortalApp_ApiProductDisplayList,
    apAppApiDisplayList,
    apOrganizationAppSettings,
  }: {
    teamId: string;
    connectorAppResponse_smf: AppResponse;
    connectorAppResponse_mqtt?: AppResponse;
    connectorAppConnectionStatus: AppConnectionStatus;
    apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
    apAppApiDisplayList: TAPAppApiDisplayList;
    apOrganizationAppSettings: TAPOrganizationAppSettings;
  }): TAPDeveloperPortalTeamAppDisplay {

    const apDeveloperPortalAppDisplay: TAPDeveloperPortalAppDisplay = this.create_ApDeveloperPortalAppDisplay_From_ApiEntities({
      ownerId: teamId,
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      apDeveloperPortalApp_ApiProductDisplayList: apDeveloperPortalApp_ApiProductDisplayList,
      apAppApiDisplayList: apAppApiDisplayList,
      apOrganizationAppSettings: apOrganizationAppSettings
    });

    const apDeveloperPortalTeamAppDisplay: TAPDeveloperPortalTeamAppDisplay = {
      ...apDeveloperPortalAppDisplay,
      apSearchContent: '',      
    };
    return APSearchContentService.add_SearchContent<TAPDeveloperPortalTeamAppDisplay>(apDeveloperPortalTeamAppDisplay);
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiCheck_TeamIdExists({ organizationId, teamId }:{
    organizationId: string;
    teamId: string;
  }): Promise<boolean> {
    const funcName = 'apiCheck_TeamIdExists';
    const logName = `${this.ComponentName}.${funcName}()`;

    let anyError: any = undefined;
    try {
      await TeamsService.getTeam({
        organizationName: organizationId, 
        teamName: teamId
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

  public apiGet_ApDeveloperPortalTeamAppDisplay = async({ organizationId, teamId, appId, apOrganizationAppSettings }:{
    organizationId: string;
    teamId: string;
    appId: string;
    apOrganizationAppSettings: TAPOrganizationAppSettings;
  }): Promise<TAPDeveloperPortalTeamAppDisplay> => {
    const funcName = 'apiGet_ApDeveloperPortalTeamAppDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;

    // // TEST upstream error handling
    // throw new Error(`${logName}: test error handling`);

    const exists_teamId: boolean = await this.apiCheck_TeamIdExists({
      organizationId: organizationId,
      teamId: teamId,
    });
    if(!exists_teamId) throw new Error(`${logName}: !exists_teamId`);

    const connectorAppResponse_smf: AppResponse = await AppsService.getTeamApp({
      organizationName: organizationId,
      teamName: teamId,
      appName: appId,
      topicSyntax: 'smf'
    });

    const connectorAppResponse_mqtt: AppResponse = await AppsService.getTeamApp({
      organizationName: organizationId,
      teamName: teamId,
      appName: appId,
      topicSyntax: 'mqtt'
    });

    const connectorAppConnectionStatus: AppConnectionStatus = await AppsService.getAppStatus({
      organizationName: organizationId,
      appName: appId
    });  

    // get every api product
    const apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = await this.apiGet_ApDeveloperPortalAppApiProductDisplayList({
      organizationId: organizationId,
      ownerId: teamId,
      connectorAppResponse: connectorAppResponse_smf,
    });

    // create the app api display list
    const apAppApiDisplayList: TAPAppApiDisplayList = await APAppApisDisplayService.apiGetList_ApAppApiDisplay({
      organizationId: organizationId,
      appId: appId,
      apApp_ApiProductDisplayList: apDeveloperPortalApp_ApiProductDisplayList,
    });

    const apDeveloperPortalTeamAppDisplay: TAPDeveloperPortalTeamAppDisplay = this.create_ApDeveloperPortalTeamAppDisplay_From_ApiEntities({
      teamId: teamId,
      connectorAppConnectionStatus: connectorAppConnectionStatus,
      connectorAppResponse_smf: connectorAppResponse_smf,
      connectorAppResponse_mqtt: connectorAppResponse_mqtt,
      apDeveloperPortalApp_ApiProductDisplayList: apDeveloperPortalApp_ApiProductDisplayList,
      apAppApiDisplayList: apAppApiDisplayList,
      apOrganizationAppSettings: apOrganizationAppSettings,
    });

    return apDeveloperPortalTeamAppDisplay;
  }

  /**
   * Returns list of team apps.
   */
  public apiGetList_ApDeveloperPortalTeamAppListDisplayList = async({ organizationId, teamId, apOrganizationAppSettings }: {
    organizationId: string;
    teamId: string;
    apOrganizationAppSettings: TAPOrganizationAppSettings;
  }): Promise<TAPDeveloperPortalAppListDisplayList> => {
    const funcName = 'apiGetList_ApDeveloperPortalTeamAppListDisplayList';
    const logName = `${this.ComponentName}.${funcName}()`;

    let anyError: any = undefined;
    try {
      const connectorAppResponseList: Array<AppResponse> = await AppsService.listTeamApps({
        organizationName: organizationId, 
        teamName: teamId
      });
      return await this.apiGetList_ApDeveloperPortalAppListDisplayList({
        organizationId: organizationId,
        ownerId: teamId,
        connectorAppResponseList: connectorAppResponseList,
        apOrganizationAppSettings: apOrganizationAppSettings
      });
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return [];
        else anyError = e;
      } else anyError = e;
    }
    if(anyError) {
      APClientConnectorOpenApi.logError(logName, anyError);
      throw anyError;
    }
    return [];
  }

  /**
   * List of Team Apps. 
   * NOTE: does not include api list.
   */
  // public apiGetList_ApDeveloperPortalTeamAppDisplayList = async({ organizationId, teamId }: {
  //   organizationId: string;
  //   teamId: string;
  // }): Promise<TAPDeveloperPortalTeamAppDisplayList> => {
  //   // const funcName = 'TAPDeveloperPortalTeamAppDisplayList';
  //   // const logName = `${this.ComponentName}.${funcName}()`;

  //   const exists_teamId: boolean = await this.apiCheck_TeamIdExists({
  //     organizationId: organizationId,
  //     teamId: teamId,
  //   });
  //   if(!exists_teamId) return [];

  //   const apDeveloperPortalTeamAppDisplayList: TAPDeveloperPortalTeamAppDisplayList = [];

  //   const connectorAppList: Array<App> = await AppsService.listTeamApps({
  //     organizationName: organizationId, 
  //     teamName: teamId
  //   });

  //   // get details for each App
  //   for(const connectorApp of connectorAppList) {

  //     const connectorAppResponse_smf: AppResponse = await AppsService.getTeamApp({
  //       organizationName: organizationId,
  //       teamName: teamId,
  //       appName: connectorApp.name,
  //       topicSyntax: 'smf'
  //     });

  //     // required to calculate the app status
  //     const apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList = await this.apiGet_ApDeveloperPortalAppApiProductDisplayList({
  //       organizationId: organizationId,
  //       ownerId: teamId,
  //       connectorAppResponse: connectorAppResponse_smf,
  //     });
    
  //     // // create the app api display list
  //     // const apAppApiDisplayList: TAPAppApiDisplayList = await APAppApisDisplayService.apiGetList_ApAppApiDisplay({
  //     //   organizationId: organizationId,
  //     //   appId: connectorApp.name,
  //     //   apDeveloperPortalUserApp_ApiProductDisplayList: apDeveloperPortalUserApp_ApiProductDisplayList,
  //     // });

  //     const apDeveloperPortalTeamAppDisplay: TAPDeveloperPortalTeamAppDisplay = this.create_ApDeveloperPortalTeamAppDisplay_From_ApiEntities({
  //       teamId: teamId,
  //       connectorAppConnectionStatus: {},
  //       connectorAppResponse_smf: connectorAppResponse_smf,
  //       connectorAppResponse_mqtt: undefined,
  //       apDeveloperPortalApp_ApiProductDisplayList: apDeveloperPortalApp_ApiProductDisplayList,
  //       apAppApiDisplayList: [],
  //     });

  //     apDeveloperPortalTeamAppDisplayList.push(apDeveloperPortalTeamAppDisplay);

  //   }

  //   return apDeveloperPortalTeamAppDisplayList;
  // }

  public async apiCreate_ApDeveloperPortalTeamAppDisplay({ organizationId, teamId, apDeveloperPortalTeamAppDisplay }:{
    organizationId: string;
    teamId: string;
    apDeveloperPortalTeamAppDisplay: TAPDeveloperPortalTeamAppDisplay;
  }): Promise<void> {
    // const funcName = 'apiCreate_ApDeveloperPortalTeamAppDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const create: App = {
      name: apDeveloperPortalTeamAppDisplay.apEntityId.id,
      displayName: apDeveloperPortalTeamAppDisplay.apEntityId.displayName,
      apiProducts: [],
      expiresIn: apDeveloperPortalTeamAppDisplay.apAppCredentials.apConsumerKeyExiresIn,
      credentials: {}
    };

    await AppsService.createTeamApp({
      organizationName: organizationId,
      teamName: teamId,
      requestBody: create
    });

    // patch the empty app with status approved
    const update: AppPatch = {
      status: AppStatus.APPROVED
    }
    await this.apiUpdate({
      organizationId: organizationId,
      appId: apDeveloperPortalTeamAppDisplay.apEntityId.id,
      apAppMeta: apDeveloperPortalTeamAppDisplay.apAppMeta,
      connectorAppPatch: update
    });

  }

  public async apiDelete_ApDeveloperPortalTeamAppDisplay({ organizationId, teamId, appId }:{
    organizationId: string;
    teamId: string;
    appId: string;
  }): Promise<void> {

    await AppsService.deleteTeamApp({
      organizationName: organizationId,
      teamName: teamId,
      appName: appId
    });

  }
  
}

export default new APDeveloperPortalTeamAppsDisplayService();


