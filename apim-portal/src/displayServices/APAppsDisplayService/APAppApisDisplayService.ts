import { 
  TAPDeveloperPortalAppApiProductDisplay, 
  TAPDeveloperPortalAppApiProductDisplayList 
} from '../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId 
} from '../../utils/APEntityIdsService';
import { IAPApiDisplay } from '../APApisDisplayService';
import { IAPLifecycleStageInfo } from '../APLifecycleStageInfoDisplayService';

export type TAPAppApiDisplay = IAPEntityIdDisplay & {
  apVersion: string;
  apApiProductEntityId: TAPEntityId;
  apLifecycleStageInfo: IAPLifecycleStageInfo;
  // apApiChannelParameterList: TAPApiChannelParameterList;
}
export type TAPAppApiDisplayList = Array<TAPAppApiDisplay>;

export class APAppApisDisplayService {
  private readonly BaseComponentName = "APAppApisDisplayService";

  private create_ApAppApiDisplayList_From_ApiEntities = ({ apApp_ApiProductDisplay }:{
    apApp_ApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay;
  }): TAPAppApiDisplayList => {

    const list: TAPAppApiDisplayList = [];
    apApp_ApiProductDisplay.apApiDisplayList.forEach( (apApiDisplay: IAPApiDisplay) => {
      const apAppApiDisplay: TAPAppApiDisplay = {
        apEntityId: apApiDisplay.apEntityId,
        apVersion: apApiDisplay.apVersionInfo.apCurrentVersion,
        apApiProductEntityId: apApp_ApiProductDisplay.apEntityId,
        apLifecycleStageInfo: apApiDisplay.apLifecycleStageInfo,
      };
      list.push(apAppApiDisplay);
    });
    return list;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************


  public async apiGetList_ApAppApiDisplay({ organizationId, appId, apApp_ApiProductDisplayList }: {
    organizationId: string;
    appId: string;
    apApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;    
  }): Promise<TAPAppApiDisplayList> {
    // const funcName = 'apiGetList_ApAppApiDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;
    
    // // get the list of api ids for app
    // const appApiIdList: Array<string> = await AppsService.listAppApiSpecifications({
    //   organizationName: organizationId,
    //   appName: appId
    // });
    // // cross check with api id list in api product list
    // let allCrossCheckOk: boolean = true;
    // appApiIdList.forEach( (appApiId: string) => {
    //   let crossCheckOk: boolean = false;
    //   apDeveloperPortalUserApp_ApiProductDisplayList.forEach( (apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay) => {
    //     const found = apDeveloperPortalAppApiProductDisplay.apApiDisplayList.find( (x) => {
    //       return x.apEntityId.id === appApiId;
    //     });
    //     crossCheckOk = found !== undefined;
    //   });
    //   allCrossCheckOk = crossCheckOk;
    // });

    // if(!allCrossCheckOk) {
    //   console.error(`${logName}: appApiIdList=\n${JSON.stringify(appApiIdList)}`);
    //   throw new Error(`${logName}: allCrossCheckOk === false, see console for details`);
    // }

    const list: TAPAppApiDisplayList = [];
    apApp_ApiProductDisplayList.forEach( (apApp_ApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay) => {
      list.push(...this.create_ApAppApiDisplayList_From_ApiEntities({ apApp_ApiProductDisplay: apApp_ApiProductDisplay }));
    }); 
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPAppApiDisplay>(list);    
  }
  
}

export default new APAppApisDisplayService();
