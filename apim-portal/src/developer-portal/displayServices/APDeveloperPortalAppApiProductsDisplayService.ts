import { 
  APIProduct, 
  ApiProductsService, 
  AppApiProductsComplex, 
  AppResponse, 
  AppStatus, 
  ClientInformation, 
  ClientOptionsGuaranteedMessaging
} from '@solace-iot-team/apim-connector-openapi-browser';
import { EAPApprovalType } from '../../displayServices/APApiProductsDisplayService';
import APEnvironmentsDisplayService, { 
  TAPEnvironmentDisplayList 
} from '../../displayServices/APEnvironmentsDisplayService';
import { IAPEntityIdDisplay, TAPEntityId } from '../../utils/APEntityIdsService';
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
  APPROVAL_REVOKED = "approval revoked",
  WILL_REQUIRE_APPROVAL = "will require approval",
  WILL_AUTO_PROVISIONED = "will be auto provisioned",
}

export type TAPAppGuaranteedMessagingDisplay = {
  queueName: string;
  accessType: ClientOptionsGuaranteedMessaging.accessType;
  maxTtl: number;
  maxMsgSpoolUsage: number;
}
export type TAPAppClientInformationDisplay = {
  apGuarenteedMessagingDisplay?: TAPAppGuaranteedMessagingDisplay;
}

export type TAPDeveloperPortalAppApiProductDisplay = TAPDeveloperPortalApiProductDisplay & {
  apApp_ApiProduct_Status: EAPApp_ApiProduct_Status;
  apAppClientInformationDisplay: TAPAppClientInformationDisplay;
}; 
export type TAPDeveloperPortalAppApiProductDisplayList = Array<TAPDeveloperPortalAppApiProductDisplay>;

// convenience
export type TAPApp_ApiProduct_ClientInformationDisplay = IAPEntityIdDisplay & TAPAppClientInformationDisplay;
export type TAPApp_ApiProduct_ClientInformationDisplayList = Array<TAPApp_ApiProduct_ClientInformationDisplay>;

class APDeveloperPortalAppApiProductsDisplayService extends APDeveloperPortalApiProductsDisplayService {
  private readonly FinalComponentName = "APDeveloperPortalAppApiProductsDisplayService";

  private calculate_Future_ApApp_ApiProduct_Status = (apApprovalType: EAPApprovalType): EAPApp_ApiProduct_Status => {
    const funcName = 'calculate_Future_ApApp_ApiProduct_Status';
    const logName = `${this.FinalComponentName}.${funcName}()`;
    switch(apApprovalType) {
      case EAPApprovalType.AUTO:
        return EAPApp_ApiProduct_Status.WILL_AUTO_PROVISIONED;
      case EAPApprovalType.MANUAL:
        return  EAPApp_ApiProduct_Status.WILL_REQUIRE_APPROVAL;
      default:
        Globals.assertNever(logName, apApprovalType);  
    }
    // never gets here
    return EAPApp_ApiProduct_Status.UNKNOWN
  }

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

  private map_ApApp_ApiProduct_Status_To_ConnectorAppStatus = (apApp_ApiProduct_Status: EAPApp_ApiProduct_Status): AppStatus => {
    const funcName = 'map_ApApp_ApiProduct_Status_To_ConnectorAppStatus';
    const logName = `${this.FinalComponentName}.${funcName}()`;
    switch(apApp_ApiProduct_Status) {
      case EAPApp_ApiProduct_Status.APPROVAL_PENDING:
      case EAPApp_ApiProduct_Status.WILL_REQUIRE_APPROVAL:
        return AppStatus.PENDING;
      case EAPApp_ApiProduct_Status.APPROVAL_REVOKED:
        return AppStatus.REVOKED;
      case EAPApp_ApiProduct_Status.LIVE:
      case EAPApp_ApiProduct_Status.WILL_AUTO_PROVISIONED:
        return AppStatus.APPROVED;
      case EAPApp_ApiProduct_Status.UNKNOWN:
        throw new Error(`${logName}: cannot map status=${apApp_ApiProduct_Status} to connector status`);
      default:
        Globals.assertNever(logName, apApp_ApiProduct_Status);
    }
    throw new Error(`${logName}: should never get here`);
  }
  
  private isExisting_ApApp_ApiProduct_Status = (apApp_ApiProduct_Status: EAPApp_ApiProduct_Status): boolean => {
    const funcName = 'map_ApApp_ApiProduct_Status_To_ConnectorAppStatus';
    const logName = `${this.FinalComponentName}.${funcName}()`;
    switch(apApp_ApiProduct_Status) {
      case EAPApp_ApiProduct_Status.APPROVAL_PENDING:
      case EAPApp_ApiProduct_Status.APPROVAL_REVOKED:
      case EAPApp_ApiProduct_Status.LIVE:
        return true;
      case EAPApp_ApiProduct_Status.WILL_REQUIRE_APPROVAL:
      case EAPApp_ApiProduct_Status.WILL_AUTO_PROVISIONED:
        return false;
      case EAPApp_ApiProduct_Status.UNKNOWN:
        throw new Error(`${logName}: cannot calculate from status=${apApp_ApiProduct_Status}`);
      default:
        Globals.assertNever(logName, apApp_ApiProduct_Status);
    }
    throw new Error(`${logName}: should never get here`);
  }

  private create_Empty_ApAppClientInformationDisplay(): TAPAppClientInformationDisplay {
    return {
      apGuarenteedMessagingDisplay: undefined
    };
  }

  private create_ApDeveloperPortalAppApiProductDisplay_From_ApiEntities({ 
    apDeveloperPortalApiProductDisplay,
    apApp_ApiProduct_Status,
    connectorAppResponse,
  }:{
    apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay;
    apApp_ApiProduct_Status: EAPApp_ApiProduct_Status;
    connectorAppResponse: AppResponse;
  }): TAPDeveloperPortalAppApiProductDisplay {

    // find the matching client information
    const apAppClientInformationDisplay: TAPAppClientInformationDisplay = {
      apGuarenteedMessagingDisplay: undefined
    };
    if(connectorAppResponse.clientInformation !== undefined && connectorAppResponse.clientInformation.length > 0) {
      const found: ClientInformation | undefined = connectorAppResponse.clientInformation.find( (x) => {
        return x.guaranteedMessaging?.apiProduct === apDeveloperPortalApiProductDisplay.apEntityId.id;
      });
      if(found && found.guaranteedMessaging && found.guaranteedMessaging.name) {
        const apAppGuaranteedMessagingDisplay: TAPAppGuaranteedMessagingDisplay = {
          queueName: found.guaranteedMessaging.name,
          accessType: found.guaranteedMessaging.accessType,
          maxMsgSpoolUsage: found.guaranteedMessaging.maxMsgSpoolUsage,
          maxTtl: found.guaranteedMessaging.maxTtl
        };
        apAppClientInformationDisplay.apGuarenteedMessagingDisplay = apAppGuaranteedMessagingDisplay;
      }
    }

    const apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay = {
      ...apDeveloperPortalApiProductDisplay,
      apApp_ApiProduct_Status: apApp_ApiProduct_Status,
      apAppClientInformationDisplay: apAppClientInformationDisplay,
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<TAPDeveloperPortalAppApiProductDisplay>(apDeveloperPortalAppApiProductDisplay);
  }

  /**
   * Create a new TAPDeveloperPortalAppApiProductDisplay from TAPDeveloperPortalApiProductDisplay.
   * - empty apAppClientInformationDisplay
   * - empty apSearchContent
   * - apApp_ApiProduct_Status
   * @returns TAPDeveloperPortalAppApiProductDisplay
   */
  public create_ApDeveloperPortalAppApiProductDisplay_From_ApDeveloperPortalApiProductDisplay({ apDeveloperPortalApiProductDisplay }:{
    apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay;

  }): TAPDeveloperPortalAppApiProductDisplay {
    const apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay = {
      ...apDeveloperPortalApiProductDisplay,
      apApp_ApiProduct_Status: this.calculate_Future_ApApp_ApiProduct_Status(apDeveloperPortalApiProductDisplay.apApprovalType),
      apAppClientInformationDisplay: this.create_Empty_ApAppClientInformationDisplay(),
      apSearchContent: '',
    };
    return apDeveloperPortalAppApiProductDisplay;
  }

  public get_ApApp_ApiProduct_ClientInformationDisplayList({ apDeveloperPortalAppApiProductDisplayList }:{
    apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): TAPApp_ApiProduct_ClientInformationDisplayList {
    const apApp_ApiProduct_ClientInformationDisplayList: TAPApp_ApiProduct_ClientInformationDisplayList = [];
    for(const apDeveloperPortalAppApiProductDisplay of apDeveloperPortalAppApiProductDisplayList) {
      const apApp_ApiProduct_ClientInformationDisplay: TAPApp_ApiProduct_ClientInformationDisplay = {
        apEntityId: apDeveloperPortalAppApiProductDisplay.apEntityId,
        apGuarenteedMessagingDisplay: apDeveloperPortalAppApiProductDisplay.apAppClientInformationDisplay.apGuarenteedMessagingDisplay,
      };
      apApp_ApiProduct_ClientInformationDisplayList.push(apApp_ApiProduct_ClientInformationDisplay);
    }
    return apApp_ApiProduct_ClientInformationDisplayList;
  }

  public remove_ApDeveloperPortalAppApiProductDisplay_From_List({ apiProductEntityId, apDeveloperPortalAppApiProductDisplayList }:{
    apiProductEntityId: TAPEntityId;
    apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): TAPDeveloperPortalAppApiProductDisplayList {
    const idx = apDeveloperPortalAppApiProductDisplayList.findIndex( (x) => {
      return x.apEntityId.id === apiProductEntityId.id;
    });
    if(idx > -1) apDeveloperPortalAppApiProductDisplayList.splice(idx, 1);
    return apDeveloperPortalAppApiProductDisplayList;
  }

  /**
   * @returns modified TAPDeveloperPortalAppApiProductDisplayList
   * @throws if apiProduct already in list
   */
  public add_ApDeveloperPortalApiProductDisplay_To_List({ apDeveloperPortalAppApiProductDisplay, apDeveloperPortalAppApiProductDisplayList }:{
    apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay;
    apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): TAPDeveloperPortalAppApiProductDisplayList {
    const funcName = 'add_ApDeveloperPortalAppApiProductDisplay_To_List';
    const logName = `${this.FinalComponentName}.${funcName}()`;
    // test downstream error handling
    // throw new Error(`${logName}: test error handling`);

    const exists = apDeveloperPortalAppApiProductDisplayList.find( (x) => {
      return x.apEntityId.id === apDeveloperPortalAppApiProductDisplay.apEntityId.id;
    });
    if(exists !== undefined) throw new Error(`${logName}: exists !== undefined`);

    // add it to existing list
    apDeveloperPortalAppApiProductDisplayList.push(apDeveloperPortalAppApiProductDisplay);
    return apDeveloperPortalAppApiProductDisplayList;
  }
  
  public create_ConnectorApiProductList({ apDeveloperPortalAppApiProductDisplayList }:{
    apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  }): Array<AppApiProductsComplex> {

    const connectorAppApiProductList: Array<AppApiProductsComplex> = [];
    for(const apDeveloperPortalAppApiProductDisplay of apDeveloperPortalAppApiProductDisplayList) {
      const connectorAppApiProductsComplex: AppApiProductsComplex = {
        apiproduct: apDeveloperPortalAppApiProductDisplay.apEntityId.id,
        status: this.map_ApApp_ApiProduct_Status_To_ConnectorAppStatus(apDeveloperPortalAppApiProductDisplay.apApp_ApiProduct_Status),
      };
      connectorAppApiProductList.push(connectorAppApiProductsComplex);
    }
    return connectorAppApiProductList;
  }

  public isExisting_ApDeveloperPortalAppApiProductDisplay({ apDeveloperPortalAppApiProductDisplay }:{
    apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay;
  }): boolean {
    return this.isExisting_ApApp_ApiProduct_Status(apDeveloperPortalAppApiProductDisplay.apApp_ApiProduct_Status);
  }
  
  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public apiGet_DeveloperPortalApAppApiProductDisplay = async({ organizationId, userId, complete_apEnvironmentDisplayList, connectorAppResponse, connectorAppApiProduct }: {
    organizationId: string;
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
      apApp_ApiProduct_Status: apApp_ApiProduct_Status,
      connectorAppResponse: connectorAppResponse,
    });
  }

  
}

export default new APDeveloperPortalAppApiProductsDisplayService();
