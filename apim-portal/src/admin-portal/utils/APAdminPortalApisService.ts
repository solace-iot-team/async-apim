import { 
  APIInfo, 
  APIInfoList, 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APApisService } from '../../utils/APApisService';

class APAdminPortalApisService extends APApisService {
  private readonly ComponentName = "APAdminPortalApisService";

  public getSortedApiInfoListAsDisplayStringList = (apiInfoList: APIInfoList ): Array<string> => {
    return apiInfoList.map( (apiInfo: APIInfo) => {
      return `${apiInfo.name} (${apiInfo.source})`;
    });  
  }
      
}

export default new APAdminPortalApisService();
