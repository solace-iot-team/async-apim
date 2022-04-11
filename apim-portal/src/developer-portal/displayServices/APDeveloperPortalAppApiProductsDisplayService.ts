import { APIProduct, ApiProductsService, AppApiProductsComplex, AppResponse, AppStatus } from '@solace-iot-team/apim-connector-openapi-browser';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../../displayServices/APEnvironmentsDisplayService';
import APSearchContentService from '../../utils/APSearchContentService';
import { Globals } from '../../utils/Globals';
import { 
  APDeveloperPortalApiProductsDisplayService, 
  TAPDeveloperPortalApiProductDisplay 
} from './APDeveloperPortalApiProductsDisplayService';

export enum EAPApp_ApiProduct_Status {
  UNKNOWN = "UNKNOWN",
  LIVE = "live",
  APPROVAL_PENDING = "approval pending",
  APPROVAL_REVOKED = "approval revoked"
}

// export type TAPAppApiProductApprovalStatus = AppStatus;

export type TAPDeveloperPortalAppApiProductDisplay = TAPDeveloperPortalApiProductDisplay & {
  apApp_ApiProduct_Status: EAPApp_ApiProduct_Status;
}; 
export type TAPDeveloperPortalAppApiProductDisplayList = Array<TAPDeveloperPortalAppApiProductDisplay>;

class APDeveloperPortalAppApiProductsDisplayService extends APDeveloperPortalApiProductsDisplayService {
  private readonly FinalComponentName = "APDeveloperPortalAppApiProductsDisplayService";

  private map_ConnectorAppStatus_To_ApApp_ApiProduct_Status = (connectorAppStatus: AppStatus): EAPApp_ApiProduct_Status => {
    const funcName = 'map_ConnectorAppStatus_To_ApApp_ApiProduct_Status';
    const logName = `${this.FinalComponentName}.${funcName}()`;
    switch(connectorAppStatus) {
      case AppStatus.APPROVED:
        return EAPApp_ApiProduct_Status.LIVE;
      case AppStatus.PENDING:
        return EAPApp_ApiProduct_Status.APPROVAL_PENDING;
      case AppStatus.REVOKED:
        return EAPApp_ApiProduct_Status.APPROVAL_REVOKED;
      default:
        Globals.assertNever(logName, connectorAppStatus);  
    }
    // never gets here
    return EAPApp_ApiProduct_Status.UNKNOWN;
  }

  private create_ApDeveloperPortalAppApiProductDisplay_From_ApiEntities({ 
    apDeveloperPortalApiProductDisplay,
    apApp_ApiProduct_Status,
  }:{
    apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay;
    apApp_ApiProduct_Status: EAPApp_ApiProduct_Status;
  }): TAPDeveloperPortalAppApiProductDisplay {
    const apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay = {
      ...apDeveloperPortalApiProductDisplay,
      apApp_ApiProduct_Status: apApp_ApiProduct_Status,
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<TAPDeveloperPortalAppApiProductDisplay>(apDeveloperPortalAppApiProductDisplay);
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public apiGet_DeveloperPortalApAppApiProductDisplay = async({ organizationId, userId, complete_apEnvironmentDisplayList, connectorAppResponse, connectorAppApiProduct }: {
    organizationId: string;
    // apiProductId: string;
    // apAppApiProductApprovalStatus: TAPAppApiProductApprovalStatus;
    userId: string;
    complete_apEnvironmentDisplayList?: TAPEnvironmentDisplayList;
    connectorAppApiProduct: string | AppApiProductsComplex;
    connectorAppResponse: AppResponse;
  }): Promise<TAPDeveloperPortalAppApiProductDisplay> => {
    const funcName = 'apiGet_DeveloperPortalApAppApiProductDisplay';
    const logName = `${this.FinalComponentName}.${funcName}()`;

    // figure out the apiProductId and status with backwards compatibility

    let apiProductId: string;
    if(typeof connectorAppApiProduct === 'string') {
      // old style, keep here for backwards compatibility
      apiProductId = connectorAppApiProduct;
    } else {
      const complexAppApiProduct: AppApiProductsComplex = connectorAppApiProduct;
      apiProductId = complexAppApiProduct.apiproduct;
    }

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

    let apApp_ApiProduct_Status: EAPApp_ApiProduct_Status = EAPApp_ApiProduct_Status.UNKNOWN;
    if(typeof connectorAppApiProduct === 'string') {
      // it is just the id, attempt to calculate the status from the app
      if(connectorApiProduct.approvalType === undefined) throw new Error(`${logName}: connectorApiProduct.approvalType === undefined`);
      if(connectorApiProduct.approvalType === APIProduct.approvalType.AUTO) apApp_ApiProduct_Status = EAPApp_ApiProduct_Status.LIVE;
      else {
        // approvalType === MANUAL
        if(connectorAppResponse.status === undefined) throw new Error(`${logName}: typeof connectorAppApiProduct === 'string' AND connectorAppResponse.status === undefined`);
        apApp_ApiProduct_Status = this.map_ConnectorAppStatus_To_ApApp_ApiProduct_Status(connectorAppResponse.status);
      }
    } else {
      // take the status from connector api product app status
      const complexAppApiProduct: AppApiProductsComplex = connectorAppApiProduct;
      if(complexAppApiProduct.status === undefined) throw new Error(`${logName}: typeof connectorAppApiProduct !== 'string' AND complexAppApiProduct.status === undefined`);
      apApp_ApiProduct_Status = this.map_ConnectorAppStatus_To_ApApp_ApiProduct_Status(complexAppApiProduct.status);
    }

    const apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay = await this.create_ApDeveloperPortalApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
      default_ownerId: userId,
    });

    return this.create_ApDeveloperPortalAppApiProductDisplay_From_ApiEntities({
      apDeveloperPortalApiProductDisplay: apDeveloperPortalApiProductDisplay,
      apApp_ApiProduct_Status: apApp_ApiProduct_Status
    });
  }

  
}

export default new APDeveloperPortalAppApiProductsDisplayService();
