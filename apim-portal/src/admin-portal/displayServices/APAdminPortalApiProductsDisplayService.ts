import { 
  APIProduct,
  APIProductAccessLevel,
  ApiProductsService, 
  CommonEntityNameList,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { AuthHelper } from '../../auth/AuthHelper';
import { 
  APApiProductsDisplayService, 
  IAPApiProductDisplay, 
} from '../../displayServices/APApiProductsDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../../displayServices/APEnvironmentsDisplayService';
import { TAPManagedAssetDisplay_BusinessGroupSharing } from '../../displayServices/APManagedAssetDisplayService';
import APVersioningDisplayService, { IAPVersionInfo } from '../../displayServices/APVersioningDisplayService';
import APEntityIdsService, { TAPEntityIdList } from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import { EUIAdminPortalResourcePaths } from '../../utils/Globals';

export type TAPAdminPortalApiProductDisplay_AllowedActions = {
  isDeleteAllowed: boolean;
  isEditAllowed: boolean;
  isViewAllowed: boolean;
}
export type TAPAdminPortalApiProductDisplay = IAPApiProductDisplay & IAPSearchContent & {
  apAppReferenceEntityIdList: TAPEntityIdList;
}; 
export type TAPAdminPortalApiProductDisplayList = Array<TAPAdminPortalApiProductDisplay>;

class APAdminPortalApiProductsDisplayService extends APApiProductsDisplayService {
  private readonly ComponentName = "APAdminPortalApiProductsDisplayService";

  public get_Empty_AllowedActions(): TAPAdminPortalApiProductDisplay_AllowedActions {
    return {
      isDeleteAllowed: false,
      isEditAllowed: false,
      isViewAllowed: false
    };
  }
  /**
   * Checks:
   * - api product in same business group as user ==> all allowed
   * - api product is owned by user ==> all allowed
   * - user has role organizationAdmin ==> all allowed
   * - if api product has app references ==> delete not allowed
   * - if api product is shared with user business group ==> view allowed
   */
  public get_AllowedActions({ userId, userBusinessGroupId, apAdminPortalApiProductDisplay, authorizedResourcePathAsString }:{
    userId: string;
    userBusinessGroupId?: string;
    authorizedResourcePathAsString: string;
    apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  }): TAPAdminPortalApiProductDisplay_AllowedActions {
    const allowedActions: TAPAdminPortalApiProductDisplay_AllowedActions = {
      isEditAllowed: AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathAsString, EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Edit),
      isDeleteAllowed: AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathAsString, EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_Delete),
      isViewAllowed: AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathAsString, EUIAdminPortalResourcePaths.ManageOrganizationApiProducts_View),
    };
    if(!allowedActions.isEditAllowed || !allowedActions.isDeleteAllowed || !allowedActions.isViewAllowed) {
      // check if owned by user
      if(apAdminPortalApiProductDisplay.apOwnerInfo.id === userId) {
        allowedActions.isEditAllowed = true;
        allowedActions.isDeleteAllowed = true;
        allowedActions.isViewAllowed = true;
      }
    }
    if((!allowedActions.isEditAllowed || !allowedActions.isDeleteAllowed || !allowedActions.isViewAllowed) && userBusinessGroupId !== undefined) {
      // check if api product owned by same business group
      if(userBusinessGroupId === apAdminPortalApiProductDisplay.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id) {
        allowedActions.isEditAllowed = true;
        allowedActions.isDeleteAllowed = true;
        allowedActions.isViewAllowed = true;
      }
    }
    if((!allowedActions.isViewAllowed) && userBusinessGroupId !== undefined) {
      // check if api product shared with user business group
      const foundSharingBusinessGroup: TAPManagedAssetDisplay_BusinessGroupSharing | undefined = apAdminPortalApiProductDisplay.apBusinessGroupInfo.apBusinessGroupSharingList.find( (x) => {
        return x.apEntityId.id === userBusinessGroupId;
      });
      if(foundSharingBusinessGroup !== undefined) {
        allowedActions.isViewAllowed = true;
      }
    }
    if(allowedActions.isDeleteAllowed) {
      // check if api product has references  
      allowedActions.isDeleteAllowed = this.get_IsDeleteAllowed({ apApiProductDisplay: apAdminPortalApiProductDisplay })
    }

    return allowedActions;
  }

  public create_Empty_ApAdminPortalApiProductDisplay(): TAPAdminPortalApiProductDisplay {
    return {
      ...this.create_Empty_ApApiProductDisplay(),
      apAppReferenceEntityIdList: [],
      apSearchContent: '',
    };
  }

  private async create_ApAdminPortalApiProductDisplay_From_ApiEntities({ organizationId, connectorApiProduct, connectorRevisions, completeApEnvironmentDisplayList, default_ownerId, currentVersion }:{
    organizationId: string;
    connectorApiProduct: APIProduct;
    connectorRevisions?: Array<string>;
    completeApEnvironmentDisplayList: TAPEnvironmentDisplayList;
    default_ownerId: string;
    currentVersion?: string;
  }): Promise<TAPAdminPortalApiProductDisplay> {
    
    const base: IAPApiProductDisplay = await this.create_ApApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      connectorRevisions: connectorRevisions, 
      completeApEnvironmentDisplayList: completeApEnvironmentDisplayList,
      default_ownerId: default_ownerId,
      currentVersion: currentVersion,
    });

    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = {
      ...base,
      apAppReferenceEntityIdList: await this.apiGetList_AppReferenceEntityIdList({ 
        organizationId: organizationId,
        apiProductId: connectorApiProduct.name
      }),
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<TAPAdminPortalApiProductDisplay>(apAdminPortalApiProductDisplay);
  }

  public get_IsDeleteAllowed({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): boolean {
    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = apApiProductDisplay as TAPAdminPortalApiProductDisplay;
    if(!super.get_IsDeleteAllowed({
      apApiProductDisplay: apApiProductDisplay
    })) return false;
    if(apAdminPortalApiProductDisplay.apAppReferenceEntityIdList.length > 0) return false;
    return true;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  private apiGetList_AppReferenceEntityIdList = async({organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPEntityIdList> => {
    // const funcName = 'apiGetList_AppReferenceEntityIdList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    const list: CommonEntityNameList = await ApiProductsService.listAppReferencesToApiProducts({
      organizationName: organizationId,
      apiProductName: apiProductId
    });
    return APEntityIdsService.create_SortedApEntityIdList_From_CommonEntityNamesList(list);
  }

  public apiGetMaintainanceList_ApAdminPortalApiProductDisplayList = async({ organizationId, default_ownerId }:{
    organizationId: string;
    default_ownerId: string;
    // currentBusinessGroupId: string;
  }): Promise<TAPAdminPortalApiProductDisplayList> => {

    const connectorApiProductList: Array<APIProduct> = await this.apiGetUnfilteredList_ConnectorApiProductList({
      organizationId: organizationId,
    });

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });

    const apAdminPortalApiProductDisplayList: TAPAdminPortalApiProductDisplayList = [];
    for(const connectorApiProduct of connectorApiProductList) {
      const apVersionInfo: IAPVersionInfo = APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta });
      const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
        organizationId: organizationId,
        connectorApiProduct: connectorApiProduct,
        completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
        default_ownerId: default_ownerId,
        currentVersion: apVersionInfo.apCurrentVersion,
      });

      // apply more filters if needed
      apAdminPortalApiProductDisplayList.push(apAdminPortalApiProductDisplay);

      // // add only to list if this is a recoverable api product
      // if(this.is_recovered_ApManagedAssetDisplay({ apManagedAssetDisplay: apAdminPortalApiProductDisplay })) {
      //   // apAdminPortalApiProductDisplay.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id = default_businessGroupId;
      //   apAdminPortalApiProductDisplayList.push(apAdminPortalApiProductDisplay);
      // }
    }
    return apAdminPortalApiProductDisplayList;

  }

  public apiGetRecoverableList_ApAdminPortalApiProductDisplayList = async({ organizationId, default_businessGroupId, default_ownerId }:{
    organizationId: string;
    default_businessGroupId: string;
    default_ownerId: string;
  }): Promise<TAPAdminPortalApiProductDisplayList> => {

    const connectorApiProductList: Array<APIProduct> = await this.apiGetList_ConnectorApiProductList({
      organizationId: organizationId,
      businessGroupId: default_businessGroupId,
      includeAccessLevelList: [
        APIProductAccessLevel.INTERNAL,
        APIProductAccessLevel.PUBLIC
      ],
    });

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });

    const apAdminPortalApiProductDisplayList: TAPAdminPortalApiProductDisplayList = [];
    for(const connectorApiProduct of connectorApiProductList) {
      const apVersionInfo: IAPVersionInfo = APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta });
      const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
        organizationId: organizationId,
        connectorApiProduct: connectorApiProduct,
        completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
        default_ownerId: default_ownerId,
        currentVersion: apVersionInfo.apCurrentVersion,
      });
      // add only to list if this is a recoverable api product
      if(this.is_recovered_ApManagedAssetDisplay({ apManagedAssetDisplay: apAdminPortalApiProductDisplay })) {
        // apAdminPortalApiProductDisplay.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id = default_businessGroupId;
        apAdminPortalApiProductDisplayList.push(apAdminPortalApiProductDisplay);
      }
    }
    return apAdminPortalApiProductDisplayList;

  }
  /**
   * Returns a list of API products.
   * - in the business group
   * - any public or internal API product
   * - api products shared with this business group (regardless of visibility)
   */
  public apiGetList_ApAdminPortalApiProductDisplayList = async({ organizationId, businessGroupId, default_ownerId }: {
    organizationId: string;
    businessGroupId: string;
    default_ownerId: string;
  }): Promise<TAPAdminPortalApiProductDisplayList> => {
    
    const connectorApiProductList: Array<APIProduct> = await this.apiGetList_ConnectorApiProductList({
      organizationId: organizationId,
      businessGroupId: businessGroupId,
      includeAccessLevelList: [
        APIProductAccessLevel.INTERNAL,
        APIProductAccessLevel.PUBLIC
      ],
    });
    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });

    const apAdminPortalApiProductDisplayList: TAPAdminPortalApiProductDisplayList = [];
    for(const connectorApiProduct of connectorApiProductList) {
      const apVersionInfo: IAPVersionInfo = APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta });
      const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
        organizationId: organizationId,
        connectorApiProduct: connectorApiProduct,
        completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
        default_ownerId: default_ownerId,
        currentVersion: apVersionInfo.apCurrentVersion,
      });
      // if this is a recovered API product, don't add to list
      if(!this.is_recovered_ApManagedAssetDisplay({ apManagedAssetDisplay: apAdminPortalApiProductDisplay })) apAdminPortalApiProductDisplayList.push(apAdminPortalApiProductDisplay);
    }
    return apAdminPortalApiProductDisplayList;
  }

  public apiGetList_ApiProductEntityIdList_By_BusinessGroupId = async({ organizationId, businessGroupId }: {
    organizationId: string;
    businessGroupId: string;
  }): Promise<TAPEntityIdList> => {
    
    const connectorApiProductList: Array<APIProduct> = await this.apiGetList_ConnectorApiProductList({
      organizationId: organizationId,
      businessGroupId: businessGroupId
    })

    const list: TAPEntityIdList = connectorApiProductList.map( (x) => {
      return {
        id: x.name,
        displayName: x.displayName
      };
    });

    return list;
  }

  public apiGet_AdminPortalApApiProductDisplay = async({ organizationId, apiProductId, default_ownerId, fetch_revision_list = false, revision }: {
    organizationId: string;
    apiProductId: string;
    default_ownerId: string;
    fetch_revision_list?: boolean;    
    revision?: string;
  }): Promise<TAPAdminPortalApiProductDisplay> => {

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
    
    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      connectorRevisions: connectorRevisions,
      completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
      default_ownerId: default_ownerId,
      currentVersion: revision,
    });
    return apAdminPortalApiProductDisplay;
  }

}

export default new APAdminPortalApiProductsDisplayService();
