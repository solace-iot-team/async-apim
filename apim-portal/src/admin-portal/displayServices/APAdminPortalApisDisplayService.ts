
import { APApisDisplayService } from '../../displayServices/APApisDisplayService';

class APAdminPortalApisDisplayService extends APApisDisplayService {
  private readonly ComponentName = "APAdminPortalApisDisplayService";

  // public getSortedApiInfoListAsDisplayStringList = (apiInfoList: APIInfoList ): Array<string> => {
  //   return apiInfoList.map( (apiInfo: APIInfo) => {
  //     return `${apiInfo.name} (${apiInfo.source})`;
  //   });  
  // }
      
}

export default new APAdminPortalApisDisplayService();
