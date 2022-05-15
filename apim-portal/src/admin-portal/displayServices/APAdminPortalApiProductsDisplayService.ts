import { 
  APIProduct,
  APIProductAccessLevel,
  ApiProductsService, 
  CommonEntityNameList,
  MetaEntityStage,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { AuthHelper } from '../../auth/AuthHelper';
import { 
  APApiProductsDisplayService, 
  IAPApiProductDisplay, 
} from '../../displayServices/APApiProductsDisplayService';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from '../../displayServices/APBusinessGroupsDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../../displayServices/APEnvironmentsDisplayService';
import APExternalSystemsDisplayService, { TAPExternalSystemDisplayList } from '../../displayServices/APExternalSystemsDisplayService';
import { TAPManagedAssetDisplay_BusinessGroupSharing } from '../../displayServices/APManagedAssetDisplayService';
import APVersioningDisplayService, { IAPVersionInfo } from '../../displayServices/APVersioningDisplayService';
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import { EUIAdminPortalResourcePaths } from '../../utils/Globals';

export type TAPAdminPortalApiProductDisplay_CloningInfo = {
  apOriginalEntityId: TAPEntityId;
  apOriginalVersionString: string;
  apCloneEntityId: TAPEntityId;
  apCloneDescription: string;
  apCloneVersionString: string;
}

export type TAPAdminPortalApiProductDisplay_AllowedActions = {
  isDeleteAllowed: boolean;
  isEditAllowed: boolean;
  isViewAllowed: boolean;
  isManagePublishAllowed: boolean;
}
export type TAPAdminPortalApiProductDisplay = IAPApiProductDisplay & IAPSearchContent & {
  apAppReferenceEntityIdList: TAPEntityIdList;
}; 
export type TAPAdminPortalApiProductDisplayList = Array<TAPAdminPortalApiProductDisplay>;

class APAdminPortalApiProductsDisplayService extends APApiProductsDisplayService {
  private readonly ComponentName = "APAdminPortalApiProductsDisplayService";

  public get_CloningInfo({ apAdminPortalApiProductDisplay }:{
    apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  }): TAPAdminPortalApiProductDisplay_CloningInfo {
    const cloningInfo: TAPAdminPortalApiProductDisplay_CloningInfo = {
      apOriginalEntityId: apAdminPortalApiProductDisplay.apEntityId,
      apOriginalVersionString: apAdminPortalApiProductDisplay.apVersionInfo.apLastVersion,
      apCloneEntityId: {
        ...APEntityIdsService.create_EmptyObject(),
        displayName: `Clone of ${apAdminPortalApiProductDisplay.apEntityId.displayName}`
      },
      apCloneDescription: `Clone of ${apAdminPortalApiProductDisplay.apDescription}`,
      apCloneVersionString: APVersioningDisplayService.create_NextMajorVersion(apAdminPortalApiProductDisplay.apVersionInfo.apLastVersion),
    };
    return cloningInfo;
  }

  public get_Empty_AllowedActions(): TAPAdminPortalApiProductDisplay_AllowedActions {
    return {
      isDeleteAllowed: false,
      isEditAllowed: false,
      isViewAllowed: false,
      isManagePublishAllowed: false,
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
      isManagePublishAllowed: this.get_IsManagePublishAllowed({ apApiProductDisplay: apAdminPortalApiProductDisplay }),
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

  private async create_ApAdminPortalApiProductDisplay_From_ApiEntities({ 
    organizationId, 
    connectorApiProduct, 
    connectorRevisions, 
    completeApEnvironmentDisplayList, 
    default_ownerId, 
    currentVersion,
    complete_ApBusinessGroupDisplayList,
    complete_ApExternalSystemDisplayList,
  }:{
    organizationId: string;
    connectorApiProduct: APIProduct;
    connectorRevisions?: Array<string>;
    completeApEnvironmentDisplayList: TAPEnvironmentDisplayList;
    default_ownerId: string;
    currentVersion?: string;
    complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;    
    complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList;
  }): Promise<TAPAdminPortalApiProductDisplay> {
    // const funcName = 'create_ApAdminPortalApiProductDisplay_From_ApiEntities';
    // const logName = `${this.ComponentName}.${funcName}()`;

    // console.log(`${logName}: starting ...`);

    const base: IAPApiProductDisplay = await this.create_ApApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      connectorRevisions: connectorRevisions, 
      completeApEnvironmentDisplayList: completeApEnvironmentDisplayList,
      default_ownerId: default_ownerId,
      currentVersion: currentVersion,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });

    // console.log(`${logName}: base=${JSON.stringify(base.apVersionInfo, null, 2)}`);

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

  public get_IsManagePublishAllowed({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): boolean {
    if(apApiProductDisplay.apLifecycleStageInfo.stage === MetaEntityStage.RELEASED) return true;
    // if(apApiProductDisplay.apPublishDestinationInfo.apExternalSystemEntityIdList.length > 0) return true;
    return false;
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
  }): Promise<TAPAdminPortalApiProductDisplayList> => {

    const connectorApiProductList: Array<APIProduct> = await this.apiGetUnfilteredList_ConnectorApiProductList({
      organizationId: organizationId,
    });

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });

    // get the complete business group list for reference
    const complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId,
      fetchAssetReferences: false
    });

    // get the complete external system list for reference
    const complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
      organizationId: organizationId,
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
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
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

    // get the complete business group list for reference
    const complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId,
      fetchAssetReferences: false
    });
    
    // get the complete external system list for reference
    const complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
      organizationId: organizationId,
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
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
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
    // get the complete business group list for reference
    const complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId,
      fetchAssetReferences: false
    });
    // get the complete external system list for reference
    const complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
      organizationId: organizationId,
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
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
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
      // for old api products, could be empty list
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
    // get the complete external system list for reference
    const complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
      organizationId: organizationId,
    });
    
    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      connectorRevisions: connectorRevisions,
      completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
      default_ownerId: default_ownerId,
      currentVersion: revision,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });
    return apAdminPortalApiProductDisplay;
  }

}

export default new APAdminPortalApiProductsDisplayService();
