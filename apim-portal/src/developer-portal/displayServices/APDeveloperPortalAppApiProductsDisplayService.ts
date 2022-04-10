import { APIProduct, ApiProductsService, AppStatus } from '@solace-iot-team/apim-connector-openapi-browser';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../../displayServices/APEnvironmentsDisplayService';
import APSearchContentService from '../../utils/APSearchContentService';
import { 
  APDeveloperPortalApiProductsDisplayService, 
  TAPDeveloperPortalApiProductDisplay 
} from './APDeveloperPortalApiProductsDisplayService';

export type TAPAppApiProductApprovalStatus = AppStatus;

export type TAPDeveloperPortalAppApiProductDisplay = TAPDeveloperPortalApiProductDisplay & {
  apAppApiProductApprovalStatus: TAPAppApiProductApprovalStatus;
}; 
export type TAPDeveloperPortalAppApiProductDisplayList = Array<TAPDeveloperPortalAppApiProductDisplay>;

class APDeveloperPortalAppApiProductsDisplayService extends APDeveloperPortalApiProductsDisplayService {
  private readonly FinalComponentName = "APDeveloperPortalAppApiProductsDisplayService";

  private create_ApDeveloperPortalAppApiProductDisplay_From_ApiEntities({ 
    apDeveloperPortalApiProductDisplay,
    apAppApiProductApprovalStatus,
  }:{
    apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay;
    apAppApiProductApprovalStatus: TAPAppApiProductApprovalStatus;
  }): TAPDeveloperPortalAppApiProductDisplay {
    const apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay = {
      ...apDeveloperPortalApiProductDisplay,
      apAppApiProductApprovalStatus: apAppApiProductApprovalStatus,
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<TAPDeveloperPortalAppApiProductDisplay>(apDeveloperPortalAppApiProductDisplay);
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public apiGet_DeveloperPortalApAppApiProductDisplay = async({ organizationId, userId, apiProductId, apAppApiProductApprovalStatus, complete_apEnvironmentDisplayList }: {
    organizationId: string;
    apiProductId: string;
    apAppApiProductApprovalStatus: TAPAppApiProductApprovalStatus;
    userId: string;
    complete_apEnvironmentDisplayList?: TAPEnvironmentDisplayList;
  }): Promise<TAPDeveloperPortalAppApiProductDisplay> => {

    const connectorApiProduct = await ApiProductsService.getApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId
    });
    
    // get the complete env list for reference
    if(complete_apEnvironmentDisplayList === undefined) {
      complete_apEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
        organizationId: organizationId
      });  
    }

    const apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay = await this.create_ApDeveloperPortalApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
      default_ownerId: userId,
    });

    return this.create_ApDeveloperPortalAppApiProductDisplay_From_ApiEntities({
      apDeveloperPortalApiProductDisplay: apDeveloperPortalApiProductDisplay,
      apAppApiProductApprovalStatus: apAppApiProductApprovalStatus
    });
  }

  
}

export default new APDeveloperPortalAppApiProductsDisplayService();
