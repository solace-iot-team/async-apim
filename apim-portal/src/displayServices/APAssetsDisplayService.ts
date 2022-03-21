import { 
  App, 
  AppsService, 
  Developer 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import APOrganizationUsersDisplayService from './APUsersDisplayService/APOrganizationUsersDisplayService';

export enum EAPAssetType {
  DEVELOPER_APP = "DEVELOPER_APP",
  // add more when ready
}
export type TAPDeveloperAppAssetInfoDisplay = IAPEntityIdDisplay & {
  apAssetType: EAPAssetType.DEVELOPER_APP;
}
// add more types when ready
export type TAPAssetInfoDisplay = TAPDeveloperAppAssetInfoDisplay;
export type TAPAssetInfoDisplayList = Array<TAPAssetInfoDisplay>;

export type TAPOrganizationAssetInfoDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apAssetInfoDisplayList: TAPAssetInfoDisplayList;
}
export type TAPOrganizationAssetInfoDisplayList = Array<TAPOrganizationAssetInfoDisplay>;

class APAssetDisplayService {
  private readonly BaseComponentName = "APAssetDisplayService";

  public nameOf_ApAssetInfoDisplay(name: keyof TAPAssetInfoDisplay) {
    return `${name}`;
  }

  public getNumberOfOrganizationAssets(apOrganizationAssetInfoDisplay: TAPOrganizationAssetInfoDisplay): number {
    return apOrganizationAssetInfoDisplay.apAssetInfoDisplayList.length;
  }

  public getNumberOfAssetsForAllOrganizations(apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList): number {
    let numAssets = 0;
    for(const apOrganizationAssetInfoDisplay of apOrganizationAssetInfoDisplayList) {
      numAssets += this.getNumberOfOrganizationAssets(apOrganizationAssetInfoDisplay)
    }
    return numAssets;
  }

  public find_ApOrganizationAssetInfoDisplay({ organizationId, apOrganizationAssetInfoDisplayList }:{
    organizationId: string;
    apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;
  }): TAPOrganizationAssetInfoDisplay {
    const funcName = 'find_ApOrganizationAssetInfoDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const found = apOrganizationAssetInfoDisplayList.find( (apOrganizationAssetInfoDisplay: TAPOrganizationAssetInfoDisplay) => {
      return apOrganizationAssetInfoDisplay.apEntityId.id === organizationId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found;
  }

  protected create_ApOrganizationAssetInfoDisplay_From_ApiEntities({apOrganizationEntityId, apAssetInfoDisplayList}: {
    apOrganizationEntityId: TAPEntityId;
    apAssetInfoDisplayList: TAPAssetInfoDisplayList;
  }): TAPOrganizationAssetInfoDisplay {

    const base: TAPOrganizationAssetInfoDisplay = {
      apEntityId: apOrganizationEntityId,
      apAssetInfoDisplayList: apAssetInfoDisplayList,
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<TAPOrganizationAssetInfoDisplay>(base);
  }

  private async getDeveloperApp({ organizationId, userId }: {
    organizationId: string;
    userId: string;
  }): Promise<TAPAssetInfoDisplayList> {

    const connectorDeveloper: Developer | undefined = await APOrganizationUsersDisplayService.connectorGet_Developer({
      organizationId: organizationId,
      userId: userId
    });
    if(connectorDeveloper === undefined) return [];
    // check if user has any assets
    const connectorAppList: Array<App> = await AppsService.listDeveloperApps({
      organizationName: organizationId,
      developerUsername: userId
    });
    if(connectorAppList.length === 0) return [];
    const apDeveloperAppAssetInfoDisplayList: TAPAssetInfoDisplayList = [];
    for(const connectorApp of connectorAppList) {
      apDeveloperAppAssetInfoDisplayList.push({
        apAssetType: EAPAssetType.DEVELOPER_APP,
        apEntityId: {
          id: connectorApp.name,
          displayName: connectorApp.displayName ? connectorApp.displayName : connectorApp.name,
        },
      });
    }
    return apDeveloperAppAssetInfoDisplayList;
  }

  public async getApAssetInfoListForUser({userId, organizationEntityIdList } : {
    userId: string;
    organizationEntityIdList: TAPEntityIdList;
  }): Promise<TAPOrganizationAssetInfoDisplayList> {
    // const funcName = 'getApAssetInfoListForUser';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    if(organizationEntityIdList.length === 0) return [];

    const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = [];

    for(const organizationEntityId of organizationEntityIdList) {

      const apDeveloperAppAssetInfoDisplayList: TAPAssetInfoDisplayList = await this.getDeveloperApp({
        organizationId: organizationEntityId.id,
        userId: userId
      });
      // add more when ready

      const apOrganizationAssetInfoDisplay: TAPOrganizationAssetInfoDisplay = this.create_ApOrganizationAssetInfoDisplay_From_ApiEntities({
        apOrganizationEntityId: organizationEntityId,
        apAssetInfoDisplayList: apDeveloperAppAssetInfoDisplayList
      });
      apOrganizationAssetInfoDisplayList.push(apOrganizationAssetInfoDisplay);
    
    }
    return apOrganizationAssetInfoDisplayList;
  }

  // TODO: from APOrganizationService: implement here instead
  // public static getOrganizationAssets = async({ organizationId }: { organizationId: APSId }): Promise<TAPOrganizationAssets> => {
  //   // TODO: move to APAssetDisplayService
  //   // TODO: return at least id and displayName
  //   return {
  //     userList: [ { id: 'userId', displayName: 'displayName-userId'} ],
  //     environmentList: [ { id: 'envId', displayName: 'displayName-envId'} ],
  //     apiList: [ { id: 'apiId', displayName: 'displayName-apiId' } ],
  //     apiProductList: [ { id: 'apiProductId', displayName: 'displayName-apiProductId'} ],
  //     appList: [ { id: 'appId', displayName: 'displayName-appId'}]
  //   };
  // }


}

export default new APAssetDisplayService();
