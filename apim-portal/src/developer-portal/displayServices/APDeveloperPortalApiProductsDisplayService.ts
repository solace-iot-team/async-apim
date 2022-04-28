import { 
  APIProduct,
  APIProductAccessLevel,
  ApiProductsService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APApiProductsDisplayService, 
  EAPApprovalType, 
  IAPApiProductDisplay 
} from '../../displayServices/APApiProductsDisplayService';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from '../../displayServices/APBusinessGroupsDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../../displayServices/APEnvironmentsDisplayService';
import { EAPLifecycleState } from '../../displayServices/APLifecycleDisplayService';
import { E_ManagedAssetDisplay_BusinessGroupSharing_AccessType, TAPManagedAssetDisplay_BusinessGroupSharing } from '../../displayServices/APManagedAssetDisplayService';
import APVersioningDisplayService, { IAPVersionInfo } from '../../displayServices/APVersioningDisplayService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import { Globals } from '../../utils/Globals';

export enum E_APDeveloperPortalApiProductDisplay_AccessDisplay {
  APPROVAL_REQUIRED = "requires approval",
  AUTO_PROVISIONED = "auto provisioned",
  READONLY = "readonly",
  UNDEFINED = "no access"
}
export type TAPDeveloperPortalApiProductDisplay = IAPApiProductDisplay & IAPSearchContent & {}; 
export type TAPDeveloperPortalApiProductDisplayList = Array<TAPDeveloperPortalApiProductDisplay>;

export class APDeveloperPortalApiProductsDisplayService extends APApiProductsDisplayService {
  private readonly ComponentName = "APDeveloperPortalApiProductsDisplayService";

  /**
   * @returns
   * - with approval: if api product requires approval
   * - auto provisioned: if api product is auto provisioned
   * - readonly: if api product is readonly for userId/userBusinessGroupId
   */
  public create_AccessDisplay({ userId, userBusinessGroupId, apDeveloperPortalApiProductDisplay }:{
    userId?: string;
    userBusinessGroupId?: string;
    apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay;
  }): string {
    const funcName = 'create_AccessDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;

    if(!this.isAllowed_To_CreateApp({
      apDeveloperPortalApiProductDisplay: apDeveloperPortalApiProductDisplay,
      userBusinessGroupId: userBusinessGroupId,
      userId: userId
    })) return E_APDeveloperPortalApiProductDisplay_AccessDisplay.READONLY;

    switch(apDeveloperPortalApiProductDisplay.apApprovalType) {
      case EAPApprovalType.AUTO:
        return E_APDeveloperPortalApiProductDisplay_AccessDisplay.AUTO_PROVISIONED;
      case EAPApprovalType.MANUAL:
        return E_APDeveloperPortalApiProductDisplay_AccessDisplay.APPROVAL_REQUIRED;
      default:
        Globals.assertNever(logName, apDeveloperPortalApiProductDisplay.apApprovalType);  
    }
    return E_APDeveloperPortalApiProductDisplay_AccessDisplay.UNDEFINED;
  }

  /**
   * Checks:
   * - api product is not released ==> no
   * - user not logged in ==> no
   * - api product is public ==> yes
   * - api product is internal ==> yes
   * - api product in same business unit as user ==> yes
   * - api product shared to user's business unit with full access ==> yes
   */
  public isAllowed_To_CreateApp({ userId, userBusinessGroupId, apDeveloperPortalApiProductDisplay }:{
    userId?: string;
    userBusinessGroupId?: string;
    apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay;
  }): boolean {
    if(apDeveloperPortalApiProductDisplay.apLifecycleInfo.apLifecycleState !== EAPLifecycleState.RELEASED) return false;
    if(userId === undefined) return false;
    // user is logged in
    if(apDeveloperPortalApiProductDisplay.apAccessLevel === APIProductAccessLevel.PUBLIC) return true;
    if(apDeveloperPortalApiProductDisplay.apAccessLevel === APIProductAccessLevel.INTERNAL) return true;
    if(userBusinessGroupId === undefined) return false;
    if(userBusinessGroupId === apDeveloperPortalApiProductDisplay.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id) return true;
    // see if sharing to user's group is enabled and at what level
    const foundSharingBusinessGroup: TAPManagedAssetDisplay_BusinessGroupSharing | undefined = apDeveloperPortalApiProductDisplay.apBusinessGroupInfo.apBusinessGroupSharingList.find( (x) => {
      return x.apEntityId.id === userBusinessGroupId;
    });
    if(foundSharingBusinessGroup === undefined) return false;
    if(foundSharingBusinessGroup.apSharingAccessType === E_ManagedAssetDisplay_BusinessGroupSharing_AccessType.FULL_ACCESS) return true;
    return false;
  }

  // public isAllowed_To_View({ userId, userBusinessGroupId, apDeveloperPortalApiProductDisplay }: {
  //   userId?: string;
  //   userBusinessGroupId?: string;
  //   apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay;
  // }): boolean {
  //   alert("isAllowed_To_View: implement me");
  //   here
  //   return true;
  // }

  protected async create_ApDeveloperPortalApiProductDisplay_From_ApiEntities({ 
    organizationId, 
    connectorApiProduct, 
    connectorRevisions, 
    completeApEnvironmentDisplayList, 
    currentVersion, 
    default_ownerId,
    complete_ApBusinessGroupDisplayList,
    create_skinny,
  }:{
    organizationId: string;
    connectorApiProduct: APIProduct;
    connectorRevisions?: Array<string>;
    completeApEnvironmentDisplayList: TAPEnvironmentDisplayList;
    default_ownerId: string;
    currentVersion?: string;
    complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;    
    create_skinny?: boolean;
  }): Promise<TAPDeveloperPortalApiProductDisplay> {
    
    const base: IAPApiProductDisplay = await this.create_ApApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      connectorRevisions: connectorRevisions, 
      completeApEnvironmentDisplayList: completeApEnvironmentDisplayList,
      default_ownerId: default_ownerId,
      currentVersion: currentVersion,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      create_skinny: create_skinny
    });

    const apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay = {
      ...base,
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<TAPDeveloperPortalApiProductDisplay>(apDeveloperPortalApiProductDisplay);
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  /**
   * Returns a list of API products to view.
   * - in the business group
   * - any  public or internal API product
   * - api products shared with this business group (regardless of visibility)
   * - lifecycle not = draft
   * - optionally: filtered by isAllowed_To_CreateApp
   * - optionally: exclude list of api product ids
   */
  public apiGetList_ApDeveloperPortalApiProductDisplayList = async({ organizationId, businessGroupId, userId, filterByIsAllowed_To_CreateApp, exclude_ApiProductIdList }: {
    organizationId: string;
    businessGroupId: string;
    userId: string;
    filterByIsAllowed_To_CreateApp: boolean;
    exclude_ApiProductIdList?: Array<string>;
  }): Promise<TAPDeveloperPortalApiProductDisplayList> => {
    
    const connectorApiProductList: Array<APIProduct> = await this.apiGetList_ConnectorApiProductList({
      organizationId: organizationId,
      businessGroupId: businessGroupId,
      includeAccessLevelList: [
        APIProductAccessLevel.INTERNAL,
        APIProductAccessLevel.PUBLIC
      ],
    });
    if(exclude_ApiProductIdList && exclude_ApiProductIdList.length > 0) {
      for(let idx=0; idx<connectorApiProductList.length; idx++) {
        const exclude = exclude_ApiProductIdList.find( (id: string) => {
          return id === connectorApiProductList[idx].name;
        });
        if(exclude !== undefined) {
          connectorApiProductList.splice(idx, 1);
          idx--;
        }
      }
    }

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });
    // get the complete business group list for reference
    const complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId,
      fetchAssetReferences: false
    });

    const apDeveloperPortalApiProductDisplayList: TAPDeveloperPortalApiProductDisplayList = [];
    for(const connectorApiProduct of connectorApiProductList) {
      const apVersionInfo: IAPVersionInfo = APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta });
      const apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay = await this.create_ApDeveloperPortalApiProductDisplay_From_ApiEntities({
        organizationId: organizationId,
        connectorApiProduct: connectorApiProduct,
        completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
        default_ownerId: userId,
        currentVersion: apVersionInfo.apCurrentVersion,
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList
      });      

      // if this is a recovered API product, don't add to list
      if(!this.is_recovered_ApManagedAssetDisplay({ apManagedAssetDisplay: apDeveloperPortalApiProductDisplay })) {
        // check if lifecycle status != draft
        if(apDeveloperPortalApiProductDisplay.apLifecycleInfo.apLifecycleState !== EAPLifecycleState.DRAFT) {
          if(filterByIsAllowed_To_CreateApp && this.isAllowed_To_CreateApp({
            apDeveloperPortalApiProductDisplay: apDeveloperPortalApiProductDisplay,
            userBusinessGroupId: businessGroupId,
            userId: userId
          })) {
            apDeveloperPortalApiProductDisplayList.push(apDeveloperPortalApiProductDisplay);
          } else {
            apDeveloperPortalApiProductDisplayList.push(apDeveloperPortalApiProductDisplay);
          }
        }
      } 
    }
    return apDeveloperPortalApiProductDisplayList;
  }

  public apiGet_DeveloperPortalApApiProductDisplay = async({ organizationId, apiProductId, default_ownerId, fetch_revision_list = false, revision }: {
    organizationId: string;
    apiProductId: string;
    default_ownerId: string;
    fetch_revision_list?: boolean;    
    revision?: string;
  }): Promise<TAPDeveloperPortalApiProductDisplay> => {

    let connectorApiProduct: APIProduct;
    if(revision === undefined) {
      connectorApiProduct = await ApiProductsService.getApiProduct({
        organizationName: organizationId,
        apiProductName: apiProductId
      });
    } else {
      connectorApiProduct = await ApiProductsService.getApiProductRevision({
        organizationName: organizationId,
        apiProductName: apiProductId,
        semver: revision
      });
    }
    // get the revision list
    let connectorRevisions: Array<string> | undefined = undefined;
    if(fetch_revision_list) {
      connectorRevisions = await ApiProductsService.listApiProductRevisions({
        organizationName: organizationId,
        apiProductName: apiProductId
      });
    }

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });
    // get the complete business group list for reference
    const complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId,
      fetchAssetReferences: false
    });
    
    const apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay = await this.create_ApDeveloperPortalApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      connectorRevisions: connectorRevisions,
      completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
      default_ownerId: default_ownerId,
      currentVersion: revision,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList
    });
    return apDeveloperPortalApiProductDisplay;
  }

}

export default new APDeveloperPortalApiProductsDisplayService();
