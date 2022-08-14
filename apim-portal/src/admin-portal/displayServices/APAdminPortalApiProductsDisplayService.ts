import { 
  ApiError,
  APIProduct,
  APIProductAccessLevel,
  APIProductPatch,
  ApiProductsService, 
  CommonEntityNameList,
  EntityDeriveRequest,
  MetaEntityStage,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { version } from 'dompurify';
import { AuthHelper } from '../../auth/AuthHelper';
import { 
  APApiProductsDisplayService, 
  IAPApiProductDisplay,
  IAPApiProductDisplay4List,
  TAPApiProductDisplay_AccessAndState, 
} from '../../displayServices/APApiProductsDisplayService';
import APAttributesDisplayService, { TAPAttributeDisplayList, TAPRawAttribute, TAPRawAttributeList } from '../../displayServices/APAttributesDisplayService/APAttributesDisplayService';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplay, TAPBusinessGroupDisplayList } from '../../displayServices/APBusinessGroupsDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../../displayServices/APEnvironmentsDisplayService';
import APExternalSystemsDisplayService, { TAPExternalSystemDisplayList } from '../../displayServices/APExternalSystemsDisplayService';
import { EAPManagedAssetAttribute_BusinessGroup_Tag, EAPManagedAssetAttribute_Owner_Tag, EAPManagedAssetAttribute_Publish_Tag, EAPManagedAssetAttribute_Scope, TAPManagedAssetDisplay_BusinessGroupSharing } from '../../displayServices/APManagedAssetDisplayService';
import APRbacDisplayService from '../../displayServices/APRbacDisplayService';
import APMemberOfService, { TAPMemberOfBusinessGroupDisplayTreeNodeList } from '../../displayServices/APUsersDisplayService/APMemberOfService';
import APVersioningDisplayService, { IAPVersionInfo } from '../../displayServices/APVersioningDisplayService';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';
import { EUIAdminPortalResourcePaths } from '../../utils/Globals';
import { EAPSOrganizationAuthRole } from '../../_generated/@solace-iot-team/apim-server-openapi-browser';

export type TAPAdminPortalApiProductDisplay_CloningInfo = {
  apOriginalEntityId: TAPEntityId;
  apOriginalVersionString: string;
  apCloneEntityId: TAPEntityId;
  // apCloneDescription: string;
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
export type TAPAdminPortalApiProductDisplay4List = IAPApiProductDisplay4List & IAPSearchContent & {
  apAppReferenceEntityIdList: TAPEntityIdList;
};
export type TAPAdminPortalApiProductDisplay4ListList = Array<TAPAdminPortalApiProductDisplay4List>;

class APAdminPortalApiProductsDisplayService extends APApiProductsDisplayService {
  private readonly ComponentName = "APAdminPortalApiProductsDisplayService";
  private readonly RAW_ATTRIBUTE_VALUE_UNDEFINED = "RAW_ATTRIBUTE_VALUE_UNDEFINED";

  public get_CloningInfo({ apAdminPortalApiProductDisplay }:{
    apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  }): TAPAdminPortalApiProductDisplay_CloningInfo {
    // const funcName = 'get_CloningInfo';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const cloningInfo: TAPAdminPortalApiProductDisplay_CloningInfo = {
      apOriginalEntityId: apAdminPortalApiProductDisplay.apEntityId,
      apOriginalVersionString: apAdminPortalApiProductDisplay.apVersionInfo.apLastVersion,
      apCloneEntityId: {
        ...APEntityIdsService.create_EmptyObject(),
        displayName: `Clone of ${apAdminPortalApiProductDisplay.apEntityId.displayName}`
      },
      // apCloneDescription: `Clone of ${apAdminPortalApiProductDisplay.apDescription}`,
      apCloneVersionString: APVersioningDisplayService.create_NewVersion(),
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
    apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay | TAPAdminPortalApiProductDisplay4List;
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

  private async create_ApAdminPortalApiProductDisplay4List_From_ApiEntities({
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
  }): Promise<TAPAdminPortalApiProductDisplay4List> {

    const base: IAPApiProductDisplay4List = await this.create_ApApiProductDisplay4List_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      connectorRevisions: connectorRevisions, 
      completeApEnvironmentDisplayList: completeApEnvironmentDisplayList,
      default_ownerId: default_ownerId,
      currentVersion: currentVersion,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });
    const apAdminPortalApiProductDisplay4List: TAPAdminPortalApiProductDisplay4List = {
      ...base,
      apAppReferenceEntityIdList: await this.apiGetList_AppReferenceEntityIdList({ 
        organizationId: organizationId,
        apiProductId: connectorApiProduct.name
      }),
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<TAPAdminPortalApiProductDisplay4List>(apAdminPortalApiProductDisplay4List);
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
    apApiProductDisplay: IAPApiProductDisplay | IAPApiProductDisplay4List;
  }): boolean {
    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = apApiProductDisplay as TAPAdminPortalApiProductDisplay;
    if(!super.get_IsDeleteAllowed({
      apApiProductDisplay: apApiProductDisplay
    })) return false;
    if(apAdminPortalApiProductDisplay.apAppReferenceEntityIdList.length > 0) return false;
    return true;
  }

  public get_IsManagePublishAllowed({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay | IAPApiProductDisplay4List;
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

  public deleteme_apiGetRecoverableList_ApAdminPortalApiProductDisplayList = async({ organizationId, default_businessGroupId, default_ownerId }:{
    organizationId: string;
    default_businessGroupId: string;
    default_ownerId: string;
  }): Promise<TAPAdminPortalApiProductDisplayList> => {

    const connectorApiProductList: Array<APIProduct> = await this.deleteme_apiGetList_ConnectorApiProductList({
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

  public apiGetList_ApAdminPortalApiProductDisplay4ListList_For_ApiProductEntityIdList = async({ organizationId, default_ownerId, apiProductEntityIdList }:{ 
    organizationId: string;
    default_ownerId: string;
    apiProductEntityIdList: TAPEntityIdList;
  }): Promise<TAPAdminPortalApiProductDisplay4ListList> => {
    // const funcName = 'apiGetList_ApAdminPortalApiProductDisplay4ListList_For_ApiProductEntityIdList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // alert(`${logName}: apiProductEntityIdList=${JSON.stringify(apiProductEntityIdList)}`);

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
    const apAdminPortalApiProductDisplay4ListList: TAPAdminPortalApiProductDisplay4ListList = [];
    for(const apiProductEntityId of apiProductEntityIdList) {
      const connectorApiProduct = await ApiProductsService.getApiProduct({
        organizationName: organizationId,
        apiProductName: apiProductEntityId.id,
      });
      const apVersionInfo: IAPVersionInfo = APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta });
      const apAdminPortalApiProductDisplay4List: TAPAdminPortalApiProductDisplay4List = await this.create_ApAdminPortalApiProductDisplay4List_From_ApiEntities({
        organizationId: organizationId,
        connectorApiProduct: connectorApiProduct,
        completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
        default_ownerId: default_ownerId,
        currentVersion: apVersionInfo.apCurrentVersion,
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
      });
      apAdminPortalApiProductDisplay4ListList.push(apAdminPortalApiProductDisplay4List);
    }
    return apAdminPortalApiProductDisplay4ListList;
  }


  public apiGetList_ApAdminPortalApiProductDisplay4ListList = async({ organizationId, businessGroupId, default_ownerId, apMemberOfBusinessGroupDisplayTreeNodeList=[] }:{
    organizationId: string;
    businessGroupId: string;
    default_ownerId: string;
    apMemberOfBusinessGroupDisplayTreeNodeList?: TAPMemberOfBusinessGroupDisplayTreeNodeList;
  }): Promise<TAPAdminPortalApiProductDisplay4ListList> => {
    // const funcName = 'apiGetList_ApAdminPortalApiProductDisplay4ListList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // alert(`${logName}: apMemberOfBusinessGroupDisplayTreeNodeList = ${JSON.stringify(apMemberOfBusinessGroupDisplayTreeNodeList)}`);

    const businessGroupIdList: Array<string> = [];
    if(apMemberOfBusinessGroupDisplayTreeNodeList.length > 0) {
      const _businessGroupIdList: Array<string> = APMemberOfService.getChildrenBusinessGroupIdList_WithRole({
        businessGroupId: businessGroupId,
        apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
        role: APRbacDisplayService.get_RoleEntityId(EAPSOrganizationAuthRole.API_TEAM)
      });
      businessGroupIdList.push(..._businessGroupIdList);
    } else {
      businessGroupIdList.push(businessGroupId);
    }
    
    const connectorApiProductList: Array<APIProduct> = await this.apiGetFilteredList_ConnectorApiProduct({
      organizationId: organizationId,
      businessGroupIdList: businessGroupIdList,
      includeAccessLevelList: [
        APIProductAccessLevel.INTERNAL,
        APIProductAccessLevel.PUBLIC
      ],
    });
    // get the complete business group list for reference
    const complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId,
      fetchAssetReferences: false
    });
    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });
    // get the complete external system list for reference
    const complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
      organizationId: organizationId,
    });
    const apAdminPortalApiProductDisplay4ListList: TAPAdminPortalApiProductDisplay4ListList = [];
    for(const connectorApiProduct of connectorApiProductList) {
      const apVersionInfo: IAPVersionInfo = APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta });
      const apAdminPortalApiProductDisplay4List: TAPAdminPortalApiProductDisplay4List = await this.create_ApAdminPortalApiProductDisplay4List_From_ApiEntities({
        organizationId: organizationId,
        connectorApiProduct: connectorApiProduct,
        completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
        default_ownerId: default_ownerId,
        currentVersion: apVersionInfo.apCurrentVersion,
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
      });
      // if this is a recovered API product, don't add to list
      if(!this.is_recovered_ApManagedAssetDisplay({ apManagedAssetDisplay: apAdminPortalApiProductDisplay4List })) apAdminPortalApiProductDisplay4ListList.push(apAdminPortalApiProductDisplay4List);
    }
    return apAdminPortalApiProductDisplay4ListList;

  }
  /**
   * Returns a list of API products.
   * - in the business group
   * - any public or internal API product
   * - api products shared with this business group (regardless of visibility)
   */
  public deleteme_apiGetList_ApAdminPortalApiProductDisplayList = async({ organizationId, businessGroupId, default_ownerId }: {
    organizationId: string;
    businessGroupId: string;
    default_ownerId: string;
  }): Promise<TAPAdminPortalApiProductDisplayList> => {
    // const funcName = 'apiGetList_ApAdminPortalApiProductDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    const connectorApiProductList: Array<APIProduct> = await this.deleteme_apiGetList_ConnectorApiProductList({
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
    
    const connectorApiProductList: Array<APIProduct> = await this.apiGetFilteredList_ConnectorApiProduct({
      organizationId: organizationId,
      businessGroupIdList: [businessGroupId]
    });

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
    // const funcName = 'apiGet_AdminPortalApApiProductDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

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

  public apiClone_AdminPortalApApiProductDisplay = async({ organizationId, userId, apAdminPortalApiProductDisplay_CloningInfo }:{
    organizationId: string;
    userId: string;
    apAdminPortalApiProductDisplay_CloningInfo: TAPAdminPortalApiProductDisplay_CloningInfo;
  }): Promise<void> => {
    // const funcName = 'apiClone_AdminPortalApApiProductDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);
    // alert(`${logName}: remove patch call once connector fixed`);

    const clone: EntityDeriveRequest = {
      names: {
        name: apAdminPortalApiProductDisplay_CloningInfo.apCloneEntityId.id,
        displayName: apAdminPortalApiProductDisplay_CloningInfo.apCloneEntityId.displayName
      },
      meta: {
        createdBy: userId,
        version: apAdminPortalApiProductDisplay_CloningInfo.apCloneVersionString
      }
    };
    
    // const connectorApiProduct: APIProduct = await ApiProductsService.createDerivedApiProduct({
    await ApiProductsService.createDerivedApiProduct({
      organizationName: organizationId,
      apiProductName: apAdminPortalApiProductDisplay_CloningInfo.apOriginalEntityId.id,
      requestBody: clone
    });

    // // get the api product to patch it
    // const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.apiGet_AdminPortalApApiProductDisplay({
    //   organizationId: organizationId,
    //   apiProductId: connectorApiProduct.name,
    //   default_ownerId: userId,
    // });
    // // unpublish
    // apAdminPortalApiProductDisplay.apVersionInfo.apCurrentVersion = APVersioningDisplayService.create_NextVersion(apAdminPortalApiProductDisplay.apVersionInfo.apLastVersion);
    // // apAdminPortalApiProductDisplay.apPublishDestinationInfo.apExternalSystemEntityIdList = [];
    // // stage=draft
    // apAdminPortalApiProductDisplay.apLifecycleStageInfo.stage = MetaEntityStage.DRAFT;
    // await this.apiUpdate_ApApiProductDisplay({
    //   organizationId: organizationId,
    //   apApiProductDisplay: apAdminPortalApiProductDisplay,
    //   userId: userId,
    // });  

  }

  private getChangedProperty = ({ existingProperty, newProperty }:{
    existingProperty: any;
    newProperty: any;
  }): any => {
    if(existingProperty === newProperty) return undefined;
    return newProperty;
  }

  private isObjectEmpty = (obj: any): boolean => {
    return Object.getOwnPropertyNames(obj).length === 0;
  }

  private apiManagePresence_Meta_Attribute = async({ organizationId, apiProductId, apRawAttribute }: {
    organizationId: string;
    apiProductId: string;
    apRawAttribute: TAPRawAttribute;
  }): Promise<void> => {
    const funcName = 'apiManagePresence_Meta_Attribute';
    const logName = `${this.ComponentName}.${funcName}()`;

    console.log(`${logName}: checking apRawAttribute=${JSON.stringify(apRawAttribute)}`);

    let exists: boolean = true;
    try {
      await ApiProductsService.getApiProductAttribute({
        organizationName: organizationId,
        apiProductName: apiProductId,
        attributeName: apRawAttribute.name
      });
      exists = true;
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) exists = false;
      } else throw e;
    }
    if(exists) {
      if(apRawAttribute.value === this.RAW_ATTRIBUTE_VALUE_UNDEFINED) {
        // delete it
        console.log(`${logName}: deleting apRawAttribute=${JSON.stringify(apRawAttribute)}`);
        await ApiProductsService.deleteApiProductAttribute({
          organizationName: organizationId,
          apiProductName: apiProductId,
          attributeName: apRawAttribute.name,
        });  
      } else {
        // update it
        console.log(`${logName}: updating apRawAttribute=${JSON.stringify(apRawAttribute)}`);
        await ApiProductsService.updateApiProductAttribute({
          organizationName: organizationId,
          apiProductName: apiProductId,
          attributeName: apRawAttribute.name,
          requestBody: apRawAttribute.value
        });  
      }
    } else {
      // create it
      console.log(`${logName}: creating apRawAttribute=${JSON.stringify(apRawAttribute)}`);
      await ApiProductsService.createApiProductAttribute({
        organizationName: organizationId,
        apiProductName: apiProductId,
        attributeName: apRawAttribute.name,
        requestBody: apRawAttribute.value
      });
    }
  }


  private create_Meta_ApAttributeList = async({ organizationId, apApiProductDisplay_AccessAndState }:{
    organizationId: string;
    apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState;
  }): Promise<TAPAttributeDisplayList> => {
    // const funcName = 'create_Meta_ApAttributeList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const apAttributeDisplayList: TAPAttributeDisplayList = [];

    // get the business group
    const apBusinessGroupDisplay: TAPBusinessGroupDisplay = await APBusinessGroupsDisplayService.apsGet_ApBusinessGroupDisplay({
      organizationId: organizationId,
      businessGroupId: apApiProductDisplay_AccessAndState.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id,
    });
    // add the business group info attributes
    // business group id
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_ID }), 
      value: apBusinessGroupDisplay.apEntityId.id
    }));
    // business group displayName
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_DISPLAY_NAME }), 
      value: apBusinessGroupDisplay.apEntityId.displayName
    }));
    if(apBusinessGroupDisplay.apExternalReference !== undefined) {
      // external business group id
      apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_EXTERNAL_ID }), 
        value: apBusinessGroupDisplay.apExternalReference.externalId,
      }));
      // external business group displayName
      apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_EXTERNAL_DISPLAY_NAME }), 
        value: apBusinessGroupDisplay.apExternalReference.displayName
      }));
      // external system id
      apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.EXTERNAL_SYSTEM_ID }), 
        value: apBusinessGroupDisplay.apExternalReference.externalSystemId
      }));    
    }
    // business group sharing
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.SHARING_LIST }), 
      value: this.create_BusinessGroupSharingListString(apApiProductDisplay_AccessAndState.apBusinessGroupInfo.apBusinessGroupSharingList)
    }));
    
    // owner info
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.ASSET_OWNER, tag: EAPManagedAssetAttribute_Owner_Tag.ID }), 
      value: apApiProductDisplay_AccessAndState.apOwnerInfo.id
    }));

    // publishDestination info
    const publishDestinationInfoStr: string | undefined = this.create_PublishDestinationInfoString(apApiProductDisplay_AccessAndState.apPublishDestinationInfo);
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.PUBLISH, tag: EAPManagedAssetAttribute_Publish_Tag.DESTINATION }), 
      value: publishDestinationInfoStr !== undefined ? publishDestinationInfoStr : this.RAW_ATTRIBUTE_VALUE_UNDEFINED
    }));  
    return apAttributeDisplayList;
  }

  private async apiUpdate_Meta_AttributeList({ organizationId, apApiProductDisplay_AccessAndState }: {
    organizationId: string;
    apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState;
  }): Promise<void> {

    const apRawAttributeList: TAPRawAttributeList = APAttributesDisplayService.create_ApRawAttributeList({
      apAttributeDisplayList:  await this.create_Meta_ApAttributeList({
        organizationId: organizationId,
        apApiProductDisplay_AccessAndState: apApiProductDisplay_AccessAndState
      })
    });

    for(const apRawAttribute of apRawAttributeList) {
      await this.apiManagePresence_Meta_Attribute({ 
        organizationId: organizationId,
        apiProductId: apApiProductDisplay_AccessAndState.apEntityId.id,
        apRawAttribute: apRawAttribute
      });
    }
  }

  public async apiUpdate_ApApiProductDisplay_AccessAndState({ organizationId, userId, apApiProductDisplay, apApiProductDisplay_AccessAndState }:{
    organizationId: string;
    userId: string;
    apApiProductDisplay: IAPApiProductDisplay;
    apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState;
  }): Promise<void> { 
    const funcName = 'apiUpdate_ApApiProductDisplay_AccessAndState';
    const logName = `${this.ComponentName}.${funcName}()`;

    // compare old and new access & state and see what needs updating
    // const existing_ApApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState = this.get_ApApiProductDisplay_AccessAndState({
    //   apApiProductDisplay: apApiProductDisplay
    // });

    // TODO:
    // attributes: create the complete list of attributes based on existing and here new info
    // apPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo;
    // apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
    // apOwnerInfo: TAPManagedAssetOwnerInfo;

    await this.apiUpdate_Meta_AttributeList({
      organizationId: organizationId,
      apApiProductDisplay_AccessAndState: apApiProductDisplay_AccessAndState
    });

    throw new Error(`${logName}: check meta attributes & version of the api product`);

    const apiProductPatch: APIProductPatch = {
      accessLevel: this.getChangedProperty({ existingProperty: apApiProductDisplay.apAccessLevel, newProperty: apApiProductDisplay_AccessAndState.apAccessLevel }),
      meta: {
        stage: this.getChangedProperty({ existingProperty: apApiProductDisplay.apLifecycleStageInfo.stage, newProperty: apApiProductDisplay_AccessAndState.apLifecycleStageInfo.stage }),
      }
    };
    // // TODO: lets see if stage triggers a new version first, otherwise keep the old version
    // // if apiProductPatch has any not undefined properties, then update the version
    // if(!this.isObjectEmpty(apiProductPatch)) {
    //   if(apiProductPatch.meta !== undefined) {
    //     apiProductPatch.meta.version = apApiProductDisplay.apVersionInfo.apCurrentVersion;
    //   } else {
    //     apiProductPatch.meta = {
    //       version: apApiProductDisplay.apVersionInfo.apCurrentVersion,
    //     };
    //   }
    // }

    console.log(`${logName}: apiProductPatch = ${JSON.stringify(apiProductPatch, null, 2)}`);

    // await this.apiUpdate({
    //   organizationId: organizationId,
    //   apiProductId: apApiProductDisplay.apEntityId.id,
    //   apiProductPatch: apiProductPatch,

    //   // apRawAttributeList: await this.create_Complete_ApRawAttributeList({
    //   //   organizationId: organizationId,
    //   //   apManagedAssetDisplay: apApiProductDisplay
    //   // })
    // });


  }


}

export default new APAdminPortalApiProductsDisplayService();
