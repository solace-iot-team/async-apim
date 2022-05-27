import { 
  ApiError,
  APIInfo,
  APIInfoList,
  APIInfoPatch,
  APIList,
  APIParameter,
  ApisService,
  APISummaryList,
  CommonEntityNameList,
  Meta,
  MetaEntityStage,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from '../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList, 
} from '../utils/APEntityIdsService';
import { Globals } from '../utils/Globals';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from './APBusinessGroupsDisplayService';
import APExternalSystemsDisplayService, { TAPExternalSystemDisplayList } from './APExternalSystemsDisplayService';
import APLifecycleStageInfoDisplayService, { IAPLifecycleStageInfo } from './APLifecycleStageInfoDisplayService';
import { 
  APManagedAssetDisplayService, 
  IAPManagedAssetDisplay,
  TAPManagedAssetDisplay_AccessAndState,
} from './APManagedAssetDisplayService';
import APMetaInfoDisplayService, { TAPMetaInfo } from './APMetaInfoDisplayService';
import APVersioningDisplayService, { IAPVersionInfo } from './APVersioningDisplayService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { TAPApiSpecDisplay } from './deleteme.APApiSpecsDisplayService';
import APApiSpecsDisplayService from './APApiSpecsDisplayService';
import { TAPRawAttributeList } from './APAttributesDisplayService/APAttributesDisplayService';

/** apEntityId.id & displayName are the same and represent the parameter name */
export type TAPApiChannelParameter = IAPEntityIdDisplay & {
  valueList: Array<string>;
}
export type TAPApiChannelParameterList = Array<TAPApiChannelParameter>;

export type TAPApiDisplay_AllowedActions = {
  isDeleteAllowed: boolean;
  isEditAllowed: boolean;
  isViewAllowed: boolean;
  isImportFromEventPortalAllowed: boolean;
}
export type TAPApiDisplay_AsyncApiSpec = IAPEntityIdDisplay & {
  apApiSpecDisplay: TAPApiSpecDisplay;
}
export type TAPApiDisplay_General = IAPEntityIdDisplay & {
  description: string;
  summary: string;
}
// export type TAPApiDisplay_AccessAndState = IAPEntityIdDisplay & TAPManagedAssetDisplay_AccessAndState & {
//   apLifecycleStageInfo: IAPLifecycleStageInfo;
// }
export type TAPApiDisplay_Access = IAPEntityIdDisplay & TAPManagedAssetDisplay_AccessAndState & {}
export interface IAPApiDisplay extends IAPManagedAssetDisplay, IAPSearchContent {
  apApiProductReferenceEntityIdList: TAPEntityIdList;
  apApiChannelParameterList: TAPApiChannelParameterList;
  connectorApiInfo: APIInfo;
  description: string;
  summary: string;
  // version(s)
  apVersionInfo: IAPVersionInfo;

  // meta
  apMetaInfo: TAPMetaInfo;

  // stage
  apLifecycleStageInfo: IAPLifecycleStageInfo;

  // spec
  apApiSpecDisplay: TAPApiSpecDisplay;
}
export type TAPApiDisplayList = Array<IAPApiDisplay>;

class APApisDisplayService extends APManagedAssetDisplayService {
  private readonly MiddleComponentName = "APApisDisplayService";

  public nameOf<IAPApiDisplay>(name: keyof IAPApiDisplay) {
    return name;
  }
  public nameOf_ConnectorApiInfo(name: keyof APIInfo) {
    return `${this.nameOf('connectorApiInfo')}.${name}`;
  }
  public nameOf_ApiChannelParameter(name: keyof TAPApiChannelParameter) {
    return name;
  }
  public nameOf_ApLifecycleStageInfo(name: keyof IAPLifecycleStageInfo) {
    return `${this.nameOf<IAPApiDisplay>('apLifecycleStageInfo')}.${name}`;
  }

  private create_Empty_ConnectorApiInfo(): APIInfo {
    return {
      source: APIInfo.source.UPLOAD,
      createdTime: -1,
      createdBy: '',
      description: '',
      name: '',
      summary: '',
      version: APVersioningDisplayService.create_NewVersion(),
      deprecated: false,
    };
  }

  public create_Empty_ApApiDisplay(): IAPApiDisplay {
    const emptyConnectorApiInfo: APIInfo = this.create_Empty_ConnectorApiInfo();
    const apApiDisplay: IAPApiDisplay = {
      ...this.create_Empty_ApManagedAssetDisplay(),
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      description: '',
      summary: '',
      apApiChannelParameterList: [],
      apApiProductReferenceEntityIdList: [],
      apVersionInfo: APVersioningDisplayService.create_New_ApVersionInfo(),
      apMetaInfo: APMetaInfoDisplayService.create_Empty_ApMetaInfo(),
      connectorApiInfo: emptyConnectorApiInfo,
      apLifecycleStageInfo: APLifecycleStageInfoDisplayService.create_ApLifecycleStageInfo_From_ApiEntities({ connectorMeta: this.create_ConnectorMeta_From_ApiEntities({
        connectorApiInfo: emptyConnectorApiInfo
      })}),
      apApiSpecDisplay: APApiSpecsDisplayService.create_Empty_ApApiSpecDisplay(),
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<IAPApiDisplay>(apApiDisplay);
  }

  private create_ApApiChannelParameterList({ connectorParameters }:{
    connectorParameters?: Array<APIParameter>;
  }): TAPApiChannelParameterList {
    if(connectorParameters === undefined) return [];
    const apApiChannelParameterList: TAPApiChannelParameterList = [];
    connectorParameters.forEach( (x) => {
      const apApiChannelParameter: TAPApiChannelParameter = {
        apEntityId: {
          id: x.name, 
          displayName: x.name
        },
        valueList: x.enum ? x.enum : []
      };
      apApiChannelParameterList.push(apApiChannelParameter);
    });
    return apApiChannelParameterList;
  }

  private create_ConnectorMeta_From_ApiEntities({ connectorApiInfo }:{
    connectorApiInfo: APIInfo;
  }): Meta {
    let connectorMeta: Meta
    if(connectorApiInfo.meta === undefined) {
      connectorMeta = {
        version: APVersioningDisplayService.create_SemVerString(connectorApiInfo.version),
        created: connectorApiInfo.createdTime,
        createdBy: connectorApiInfo.createdBy,
        lastModified: connectorApiInfo.updatedTime,
        lastModifiedBy: 'unknown',
        stage: MetaEntityStage.RELEASED,
      };
    } else {
      connectorMeta = connectorApiInfo.meta;
      if(connectorApiInfo.meta.version !== undefined) {
        connectorMeta.version = APVersioningDisplayService.create_SemVerString(connectorApiInfo.meta.version);
      } else {
        connectorMeta.version = APVersioningDisplayService.create_SemVerString(connectorApiInfo.version);
      }
    }
    return connectorMeta;
  }

  private create_ApApiDisplay_From_ApiEntities = ({ 
    connectorApiInfo, 
    connectorRevisions,
    currentVersion,
    apApiProductReferenceEntityIdList, 
    default_ownerId, 
    complete_ApBusinessGroupDisplayList,
    complete_ApExternalSystemDisplayList,
    apApiSpecDisplay,
  }:{
    connectorApiInfo: APIInfo;
    connectorRevisions?: Array<string>;
    currentVersion?: string;
    apApiProductReferenceEntityIdList: TAPEntityIdList;
    default_ownerId: string;
    complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList;
    apApiSpecDisplay: TAPApiSpecDisplay;
  }): IAPApiDisplay => {
    // const funcName = 'create_ApApiDisplay_From_ApiEntities';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    const _base = this.create_ApManagedAssetDisplay_From_ApiEntities({
      id: connectorApiInfo.name,
      displayName: connectorApiInfo.name,
      apRawAttributeList: connectorApiInfo.attributes ? connectorApiInfo.attributes : [],
      default_ownerId: default_ownerId,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });

    const connectorMeta: Meta = this.create_ConnectorMeta_From_ApiEntities({ connectorApiInfo: connectorApiInfo });
    const apApiDisplay: IAPApiDisplay = {
      ..._base,
      connectorApiInfo: connectorApiInfo,
      description: connectorApiInfo.description,
      summary: connectorApiInfo.summary,
      apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
      apApiChannelParameterList: this.create_ApApiChannelParameterList({ connectorParameters: connectorApiInfo.apiParameters }),
      apMetaInfo: APMetaInfoDisplayService.create_ApMetaInfo_From_ApiEntities({ connectorMeta: connectorMeta }),
      apVersionInfo: APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ 
        connectorMeta: connectorMeta, 
        connectorRevisions: connectorRevisions,
        currentVersion: currentVersion,
      }),
      apLifecycleStageInfo: APLifecycleStageInfoDisplayService.create_ApLifecycleStageInfo_From_ApiEntities({ connectorMeta: connectorMeta }),
      apApiSpecDisplay: apApiSpecDisplay,
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<IAPApiDisplay>(apApiDisplay);
  }

  public create_Combined_ApiChannelParameterList({ apApiDisplayList }:{
    apApiDisplayList: TAPApiDisplayList;
  }): TAPApiChannelParameterList {
    // const funcName = 'create_Combined_ApiChannelParameterList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const mergeValueLists = (one: Array<string>, two: Array<string>): Array<string> => {
      return Globals.deDuplicateStringList(one.concat(two));
    }

    const apComginedApiChannelParameterList: TAPApiChannelParameterList = [];
    
    for(const apApiDisplay of apApiDisplayList) {
      for(const newApiParameter of apApiDisplay.apApiChannelParameterList) {
        // alert(`${logName}: checking parameter: apApiDisplay=${apApiDisplay.apEntityId.displayName}, parameter=${JSON.stringify(newApiParameter, null, 2)}`);
        // get the index if already in list
        const existing_idx = apComginedApiChannelParameterList.findIndex( (existing: TAPApiChannelParameter) => {
          return existing.apEntityId.id === newApiParameter.apEntityId.id;
        });
        if(existing_idx > -1) {
          // alert(`${logName}: merging parameters, existing=${JSON.stringify(apComginedApiChannelParameterList[existing_idx], null, 2)}, newApiParameter=${JSON.stringify(newApiParameter, null, 2)}`);
          const newValueList: Array<string> = mergeValueLists(apComginedApiChannelParameterList[existing_idx].valueList, newApiParameter.valueList);
          apComginedApiChannelParameterList[existing_idx].valueList = newValueList;
        } else {
          // add parameter to list
          // alert(`${logName}: adding parameter=${JSON.stringify(newApiParameter, null, 2)}`);
          apComginedApiChannelParameterList.push(newApiParameter);            
        }
      }
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPApiChannelParameter>(apComginedApiChannelParameterList);  
  }

  // public async create_Complete_ApRawAttributeList({ organizationId, apManagedAssetDisplay }:{
  //   organizationId: string;
  //   apManagedAssetDisplay: IAPManagedAssetDisplay;
  // }): Promise<TAPRawAttributeList> {
  //   const rawAttributeList: TAPRawAttributeList = APAttributesDisplayService.create_ApRawAttributeList({
  //     apAttributeDisplayList: await this.create_Complete_ApAttributeList({ 
  //       organizationId: organizationId,
  //       apManagedAssetDisplay: apManagedAssetDisplay 
  //     })
  //   });
  //   return rawAttributeList;
  // }

  public generate_Id_From_Title({ title }:{ 
    title: string; 
  }): string {
    return title.replaceAll(/\s/g, '-');
  } 


  public get_Empty_AllowedActions(): TAPApiDisplay_AllowedActions {
    return {
      isDeleteAllowed: false,
      isEditAllowed: false,
      isViewAllowed: false,
      isImportFromEventPortalAllowed: false,
    };
  }

  public get_AllowedActions({ userId, userBusinessGroupId, apApiDisplay, authorizedResourcePathAsString, isEventPortalApisProxyMode, hasEventPortalConnectivity }:{
    userId: string;
    userBusinessGroupId?: string;
    authorizedResourcePathAsString: string;
    isEventPortalApisProxyMode: boolean;
    hasEventPortalConnectivity: boolean;
    apApiDisplay: IAPApiDisplay;
  }): TAPApiDisplay_AllowedActions {

// const eventPortalConnectivity: boolean  = APSystemOrganizationsDisplayService.has_EventPortalConnectivity({ 
//   apOrganizationDisplay: organizationContext
// });
// const showImportEventPortalButton: boolean = (!configContext.connectorInfo?.connectorAbout.portalAbout.isEventPortalApisProxyMode) && (eventPortalConnectivity);

    const isApiLinked: boolean = apApiDisplay.connectorApiInfo.source === APIInfo.source.EVENT_PORTAL_LINK; 
    const allowedActions: TAPApiDisplay_AllowedActions = {
      isEditAllowed: !isApiLinked,
      isDeleteAllowed: apApiDisplay.apApiProductReferenceEntityIdList.length === 0,
      isViewAllowed: true,
      isImportFromEventPortalAllowed: !isEventPortalApisProxyMode && hasEventPortalConnectivity,
    };
    // additional checks: see AdminPortalApiProductDisplayService
    // if(!allowedActions.isEditAllowed || !allowedActions.isDeleteAllowed || !allowedActions.isViewAllowed) {
    //   // check if owned by user
    //   if(apAdminPortalApiProductDisplay.apOwnerInfo.id === userId) {
    //     allowedActions.isEditAllowed = true;
    //     allowedActions.isDeleteAllowed = true;
    //     allowedActions.isViewAllowed = true;
    //   }
    // }
    // if((!allowedActions.isEditAllowed || !allowedActions.isDeleteAllowed || !allowedActions.isViewAllowed) && userBusinessGroupId !== undefined) {
    //   // check if api product owned by same business group
    //   if(userBusinessGroupId === apAdminPortalApiProductDisplay.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id) {
    //     allowedActions.isEditAllowed = true;
    //     allowedActions.isDeleteAllowed = true;
    //     allowedActions.isViewAllowed = true;
    //   }
    // }
    // if((!allowedActions.isViewAllowed) && userBusinessGroupId !== undefined) {
    //   // check if api product shared with user business group
    //   const foundSharingBusinessGroup: TAPManagedAssetDisplay_BusinessGroupSharing | undefined = apAdminPortalApiProductDisplay.apBusinessGroupInfo.apBusinessGroupSharingList.find( (x) => {
    //     return x.apEntityId.id === userBusinessGroupId;
    //   });
    //   if(foundSharingBusinessGroup !== undefined) {
    //     allowedActions.isViewAllowed = true;
    //   }
    // }
    return allowedActions;
  }

  public get_ApApiDisplay_AsyncApiSpec({ apApiDisplay }: {
    apApiDisplay: IAPApiDisplay;
  }): TAPApiDisplay_AsyncApiSpec {
    const apApiDisplay_AsyncApiSpec: TAPApiDisplay_AsyncApiSpec = {
      apEntityId: apApiDisplay.apEntityId,
      apApiSpecDisplay: apApiDisplay.apApiSpecDisplay,
    };
    return apApiDisplay_AsyncApiSpec;
  }
  public set_ApApiDisplay_AsyncApiSpec({ apApiDisplay, apApiDisplay_AsyncApiSpec }:{
    apApiDisplay: IAPApiDisplay;
    apApiDisplay_AsyncApiSpec: TAPApiDisplay_AsyncApiSpec;
  }): IAPApiDisplay {
    apApiDisplay.apEntityId = apApiDisplay_AsyncApiSpec.apEntityId;
    apApiDisplay.apApiSpecDisplay = apApiDisplay_AsyncApiSpec.apApiSpecDisplay;
    return apApiDisplay;
  }

  public get_ApApiDisplay_General({ apApiDisplay }:{
    apApiDisplay: IAPApiDisplay;
  }): TAPApiDisplay_General {
    const apApiDisplay_General: TAPApiDisplay_General = {
      apEntityId: apApiDisplay.apEntityId,
      description: apApiDisplay.description,
      summary: apApiDisplay.summary,
    };
    return apApiDisplay_General;
  }
  /**
   * Set the general properties. 
   * Sets the apEntity as well. 
   * @returns the modified apApiProductDisplay (not a copy)
  */
  public set_ApApiDisplay_General({ apApiDisplay, apApiDisplay_General }:{
    apApiDisplay: IAPApiDisplay;
    apApiDisplay_General: TAPApiDisplay_General;
  }): IAPApiDisplay {
    apApiDisplay.apEntityId = apApiDisplay_General.apEntityId;
    apApiDisplay.description = apApiDisplay_General.description;
    apApiDisplay.summary = apApiDisplay_General.summary;
    return apApiDisplay;
  }

  public get_ApApiDisplay_Access({ apApiDisplay }:{
    apApiDisplay: IAPApiDisplay;
  }): TAPApiDisplay_Access {
    const apApiDisplay_Access: TAPApiDisplay_Access = {
      ...this.get_ApManagedAssetDisplay_AccessAndState({ apManagedAssetDisplay: apApiDisplay }),
      apEntityId: apApiDisplay.apEntityId,
    };
    return apApiDisplay_Access;
  }
  /** 
   * Set the access properties. 
   * Does NOT set the apEntityId. 
   * @returns the modified apApiProductDisplay (not a copy)
  */
   public set_ApApiDisplay_Access({ apApiDisplay, apApiDisplay_Access }:{
    apApiDisplay: IAPApiDisplay;
    apApiDisplay_Access: TAPApiDisplay_Access;
  }): IAPApiDisplay {
    this.set_ApManagedAssetDisplay_AccessAndState({ apManagedAssetDisplay: apApiDisplay, apManagedAssetDisplay_AccessAndState: apApiDisplay_Access });
    return apApiDisplay;
  }

  // public get_ApApiDisplay_AccessAndState({ apApiDisplay }:{
  //   apApiDisplay: IAPApiDisplay;
  // }): TAPApiDisplay_AccessAndState {
  //   const apApiDisplay_AccessAndState: TAPApiDisplay_AccessAndState = {
  //     ...this.get_ApManagedAssetDisplay_AccessAndState({ apManagedAssetDisplay: apApiDisplay }),
  //     apEntityId: apApiDisplay.apEntityId,
  //     apLifecycleStageInfo: apApiDisplay.apLifecycleStageInfo,
  //   };
  //   return apApiDisplay_AccessAndState;
  // }
  // /** 
  //  * Set the access & state properties. 
  //  * Does NOT set the apEntityId. 
  //  * @returns the modified apApiProductDisplay (not a copy)
  // */
  //  public set_ApApiDisplay_AccessAndState({ apApiDisplay, apApiDisplay_AccessAndState }:{
  //   apApiDisplay: IAPApiDisplay;
  //   apApiDisplay_AccessAndState: TAPApiDisplay_AccessAndState;
  // }): IAPApiDisplay {
  //   this.set_ApManagedAssetDisplay_AccessAndState({ apManagedAssetDisplay: apApiDisplay, apManagedAssetDisplay_AccessAndState: apApiDisplay_AccessAndState });
  //   apApiDisplay.apLifecycleStageInfo = apApiDisplay_AccessAndState.apLifecycleStageInfo;
  //   return apApiDisplay;
  // }


  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiCheck_ApApiDisplay_Exists({ organizationId, apiId }: {
    organizationId: string;
    apiId: string;
  }): Promise<boolean> {
    try {
      await ApisService.getApiInfo({
        organizationName: organizationId,
        apiName: apiId,
      });
      return true;
     } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return false;
      }
      throw e;
    }
  }

  public apiGetList_ApiProductReferenceEntityIdList = async({ organizationId, apiId }: {
    organizationId: string;
    apiId: string;
  }): Promise<TAPEntityIdList> => {
    const list: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
      organizationName: organizationId,
      apiName: apiId
    });
    return APEntityIdsService.create_SortedApEntityIdList_From_CommonEntityNamesList(list);
  }

  public async apiGetList_ApApiDisplay_For_ApiIdList({ organizationId, apiIdList, default_ownerId }: {
    organizationId: string;    
    apiIdList: Array<string>;
    default_ownerId: string;
  }): Promise<TAPApiDisplayList> {
    const list: TAPApiDisplayList = [];
    // TODO: PARALLELIZE
    for(const apiId of apiIdList) {
      list.push(await this.apiGet_ApApiDisplay({
        organizationId: organizationId,
        apiId: apiId,
        default_ownerId: default_ownerId
      }));
    };
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<IAPApiDisplay>(list);    
  }

  public apiGetMaintainanceList_ApApiDisplayList = async({ organizationId, default_ownerId }:{
    organizationId: string;
    default_ownerId: string;
  }): Promise<TAPApiDisplayList> => {

    const result: APIList | APISummaryList | APIInfoList = await ApisService.listApis({
      organizationName: organizationId,
      format: 'extended'
    });
    const apiInfoList: APIInfoList = result as APIInfoList;

    // get the complete business group list for reference
    const complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
      organizationId: organizationId,
      fetchAssetReferences: false
    });
    // get the complete external system list for reference
    const complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
      organizationId: organizationId,
    });

    const list: TAPApiDisplayList = [];
    // TODO: PARALLELIZE
    for(const apiInfo of apiInfoList) {
      // TODO: when connector ready: get reference list for this version
      const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.apiGetList_ApiProductReferenceEntityIdList({
        organizationId: organizationId, 
        apiId: apiInfo.name
      });
      list.push(this.create_ApApiDisplay_From_ApiEntities({
        connectorApiInfo: apiInfo,
        apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
        // apApiProductReferenceEntityIdList: [],
        default_ownerId: default_ownerId,
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
        apApiSpecDisplay: APApiSpecsDisplayService.create_Empty_ApApiSpecDisplay(),
      }));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(list);
  }

  private async apiGetFilteredList_ConnectorApiInfo({ organizationId, businessGroupId }:{
    organizationId: string;
    businessGroupId?: string;
  }): Promise<APIInfoList> {

    const result: APIList | APISummaryList | APIInfoList = await ApisService.listApis({
      organizationName: organizationId,
      format: 'extended'
    });
    const completeApiInfoList: APIInfoList = result as APIInfoList;

    // filter by business group id & sharing business group id
    const filteredApiInfoList: APIInfoList = [];
    if(businessGroupId !== undefined) {
      const owningBusinessGroup_AttributeName: string = this.get_AttributeName_OwningBusinessGroupId();
      const sharingBusinessGroup_AttributeName: string = this.get_AttributeName_SharingBusinessGroupId();
      for(const apiInfo of completeApiInfoList) {
        if(apiInfo.attributes !== undefined) {
          const owningAttribute = apiInfo.attributes.find( (x) => {
            return x.name === owningBusinessGroup_AttributeName;
          });
          const sharingAttribute = apiInfo.attributes.find( (x) => {
            return x.name === sharingBusinessGroup_AttributeName;
          });
          if(
            (owningAttribute !== undefined && owningAttribute.value.includes(businessGroupId)) ||
            (sharingAttribute !== undefined && sharingAttribute.value.includes(businessGroupId))
          ) {
            filteredApiInfoList.push(apiInfo);
          }
        }
      }
    }
    return filteredApiInfoList;
  }

  public async apiGetList_ApApiDisplayList({ organizationId, default_ownerId, businessGroupId }:{
    organizationId: string;
    default_ownerId: string;
    businessGroupId: string;
  }): Promise<TAPApiDisplayList> {

    const apiInfoList: APIInfoList = await this.apiGetFilteredList_ConnectorApiInfo({
      organizationId: organizationId,
      businessGroupId: businessGroupId
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

    const list: TAPApiDisplayList = [];
    // TODO: PARALLELIZE
    for(const apiInfo of apiInfoList) {
      // TODO: when connector ready: get reference list for this version
      const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.apiGetList_ApiProductReferenceEntityIdList({
        organizationId: organizationId, 
        apiId: apiInfo.name
      });
      list.push(this.create_ApApiDisplay_From_ApiEntities({
        connectorApiInfo: apiInfo,
        apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
        // apApiProductReferenceEntityIdList: [],
        default_ownerId: default_ownerId,
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
        apApiSpecDisplay: APApiSpecsDisplayService.create_Empty_ApApiSpecDisplay(),
      }));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(list);
  }

  private async apiGetList_ApiVersions({ organizationId, apiId }:{
    organizationId: string;
    apiId: string;
  }): Promise<Array<string>> {
    // list may consit of number strings or semVer strings
    // convert all number strings to semVer strings
    const connectorRevisions: Array<string> = await ApisService.listApiRevisions({
      organizationName: organizationId,
      apiName: apiId
    });
    const semVerStringList: Array<string> = [];
    connectorRevisions.forEach( (x: string) => {
      // is semVer?
      semVerStringList.push(APVersioningDisplayService.create_SemVerString(x));
    });  
    return semVerStringList;
  }

  public async apiGet_ApApiDisplay({ 
    organizationId, 
    apiId, 
    version, 
    default_ownerId, 
    fetch_revision_list, 
    complete_ApBusinessGroupDisplayList,
    complete_ApExternalSystemDisplayList,
    fetch_async_api_spec,
  }: {
    organizationId: string;
    apiId: string;
    default_ownerId: string;
    fetch_revision_list?: boolean;    
    version?: string;
    fetch_async_api_spec?: boolean;
    complete_ApBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
    complete_ApExternalSystemDisplayList?: TAPExternalSystemDisplayList;    
  }): Promise<IAPApiDisplay> {
    const funcName = 'apiGet_ApApiDisplay';
    const logName = `${this.MiddleComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    // TODO: rework the versions, not implemented in Connector yet
    let connectorApiInfo: APIInfo;
    if(version  === undefined) {
      connectorApiInfo = await ApisService.getApiInfo({
        organizationName: organizationId,
        apiName: apiId
      });  
    } else {
      // const _apiId: string = version !== undefined ? `${apiId}@${version}` : apiId; 
      throw new Error(`${logName}: getting a specific version of APIInfo not implemented yet.`);
    }

    // get the complete business group list for reference
    if(complete_ApBusinessGroupDisplayList === undefined) {
      complete_ApBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: organizationId,
        fetchAssetReferences: false
      });  
    }
    // get the complete external system list for reference
    if(complete_ApExternalSystemDisplayList === undefined) {
      complete_ApExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
        organizationId: organizationId,
      });  
    }
    const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.apiGetList_ApiProductReferenceEntityIdList({
      organizationId: organizationId, 
      apiId: apiId
    });
    // get the revision list
    let connectorRevisions: Array<string> | undefined = undefined;
    if(fetch_revision_list) {
      // for old apis, list could be empty
      connectorRevisions = await this.apiGetList_ApiVersions({ 
        organizationId: organizationId,
        apiId: apiId,
      });
    }

    // get the spec
    let apApiSpecDisplay: TAPApiSpecDisplay = APApiSpecsDisplayService.create_Empty_ApApiSpecDisplay();
    if(fetch_async_api_spec) {
      const apiEntityId: TAPEntityId = {
        id: connectorApiInfo.name,
        displayName: connectorApiInfo.name,
      };
      apApiSpecDisplay = await APApiSpecsDisplayService.apiGet_Api_ApiSpec({
        organizationId: organizationId,
        apiEntityId: apiEntityId,
        version: version
      });  
    }

    return this.create_ApApiDisplay_From_ApiEntities({
      connectorApiInfo: connectorApiInfo, 
      apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
      default_ownerId: default_ownerId, 
      currentVersion: version,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
      connectorRevisions: connectorRevisions,
      apApiSpecDisplay: apApiSpecDisplay,
    });
  }

  public async apiCreate_ApApiDisplay({ organizationId, apApiDisplay, userId }: {
    organizationId: string;
    apApiDisplay: IAPApiDisplay;
    userId: string;
  }): Promise<void> {
    const funcName = 'apiCreate_ApApiDisplay';
    const logName = `${this.MiddleComponentName}.${funcName}()`;

    // create the api in connector
    await ApisService.createApi({
      organizationName: organizationId, 
      apiName: apApiDisplay.apEntityId.id,
      requestBody: APApiSpecsDisplayService.get_AsyncApiSpec_As_Yaml_String({ apApiSpecDisplay: apApiDisplay.apApiSpecDisplay })
    });

    // // get API Info
    // const connectorApiInfo: APIInfo = await ApisService.getApiInfo({
    //   organizationName: organizationId,
    //   apiName: apApiDisplay.apEntityId.id
    // });  
    // patch attributes & meta on api info
    const apRawAttributeList: TAPRawAttributeList = await this.create_Complete_ApRawAttributeList({ 
      organizationId: organizationId,
      apManagedAssetDisplay: apApiDisplay 
    });

    const update: APIInfoPatch = {
      meta: {
        createdBy: userId,
        lastModifiedBy: userId
      },
    };

    // alert(`${logName}: check console log`);
    // console.log(`${logName}: apRawAttributeList=${JSON.stringify(apRawAttributeList, null, 2)}`);
    // console.log(`${logName}: update=${JSON.stringify(update, null, 2)}`);


    await this.apiUpdate({
      organizationId: organizationId, 
      apiId: apApiDisplay.apEntityId.id,
      apRawAttributeList: apRawAttributeList,
      apiInfoUpdate: update,
    });

  }

  private async apiUpdate({ organizationId, apiId, apiInfoUpdate, apRawAttributeList }: {
    organizationId: string;
    apiId: string;
    apiInfoUpdate: APIInfoPatch;
    apRawAttributeList: TAPRawAttributeList;
  }): Promise<void> {
    // const funcName = 'apiUpdate';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    // always add attributes
    const update: APIInfoPatch = {
      ...apiInfoUpdate,
      attributes: apRawAttributeList,
    };
    await ApisService.updateApiInfo({
      organizationName: organizationId,
      apiName: apiId,
      requestBody: update,
    });
  }

  public async apiUpdate_ApApiDisplay_Access({ organizationId, apApiDisplay, apApiDisplay_Access, userId }:{
    organizationId: string;
    userId: string;
    apApiDisplay: IAPApiDisplay;
    apApiDisplay_Access: TAPApiDisplay_Access;
  }): Promise<void> {
    // const funcName = 'apiUpdate_ApApiDisplay_Access';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    apApiDisplay = this.set_ApApiDisplay_Access({ 
      apApiDisplay: apApiDisplay,
      apApiDisplay_Access: apApiDisplay_Access
    });
    const apRawAttributeList: TAPRawAttributeList = await this.create_Complete_ApRawAttributeList({ 
      organizationId: organizationId,
      apManagedAssetDisplay: apApiDisplay 
    });
    await this.apiUpdate ({
      organizationId: organizationId,
      apiId: apApiDisplay.apEntityId.id,
      apRawAttributeList: apRawAttributeList,
      apiInfoUpdate: {
        meta: {
          lastModifiedBy: userId
        }
      }
    })
  }

  // public async apiUpdate_ApApiDisplay_AccessAndState({ organizationId, apApiDisplay, apApiDisplay_AccessAndState }:{
  //   organizationId: string;
  //   apApiDisplay: IAPApiDisplay;
  //   apApiDisplay_AccessAndState: TAPApiDisplay_AccessAndState;
  // }): Promise<void> {
  //   // const funcName = 'apiUpdate_ApApiDisplay_AccessAndState';
  //   // const logName = `${this.MiddleComponentName}.${funcName}()`;

  //   apApiDisplay = this.set_ApApiDisplay_AccessAndState({ 
  //     apApiDisplay: apApiDisplay,
  //     apApiDisplay_AccessAndState: apApiDisplay_AccessAndState
  //   });
  //   const apRawAttributeList: TAPRawAttributeList = await this.create_Complete_ApRawAttributeList({ 
  //     organizationId: organizationId,
  //     apManagedAssetDisplay: apApiDisplay 
  //   });
  //   await this.apiUpdate ({
  //     organizationId: organizationId,
  //     apiId: apApiDisplay.apEntityId.id,
  //     apRawAttributeList: apRawAttributeList,
  //     apiInfoUpdate: {}
  //   })
  // }

  public async apiUpdate_ApApiDisplay_General({ organizationId, apApiDisplay, apApiDisplay_General }:{
    organizationId: string;
    apApiDisplay: IAPApiDisplay;
    apApiDisplay_General: TAPApiDisplay_General;
  }): Promise<void> {
    const funcName = 'apiUpdate_ApApiDisplay_General';
    const logName = `${this.MiddleComponentName}.${funcName}()`;

    alert(`${logName}: TODO: implement me`);

    // await ApisService.updateApi({
    //   organizationName: organizationId,
    //   apiName: apApiDisplay.apEntityId.id,
    //   requestBody: APApiSpecsDisplayService.get_AsyncApiSpec_As_Yaml_String({ apApiSpecDisplay: apApiDisplay.apApiSpecDisplay })
    // });

  }

  // public async apiUpdate_ApApiDisplay({ organizationId, apApiDisplay }:{
  //   organizationId: string;
  //   apApiDisplay: IAPApiDisplay;
  // }): Promise<void> {
  //   const funcName = 'apiUpdate_ApApiDisplay';
  //   const logName = `${this.MiddleComponentName}.${funcName}()`;

  //   // apApiProductDisplay = this.apiUpdate_ApplyRules({ apApiProductDisplay: apApiProductDisplay });

  //   const apRawAttributeList: TAPRawAttributeList = await this.create_Complete_ApRawAttributeList({ 
  //     organizationId: organizationId,
  //     apManagedAssetDisplay: apApiDisplay 
  //   });
  //   console.log(`${logName}: apRawAttributeList=${JSON.stringify(apRawAttributeList, null, 2)}`);
  //   alert(`${logName}: TODO: set attributes, etc`);

  //   await ApisService.updateApi({
  //     organizationName: organizationId,
  //     apiName: apApiDisplay.apEntityId.id,
  //     requestBody: APApiSpecsDisplayService.get_AsyncApiSpec_As_Yaml_String({ apApiSpecDisplay: apApiDisplay.apApiSpecDisplay })
  //   });

  // }

  // await APApisDisplayService.apiDelete_ApApiDisplay({
  //   organizationId: props.organizationId,
  //   apiId: props.apiEntityId.id,
  // });

  public async apiDelete_ApApiDisplay({ organizationId, apiId }:{
    organizationId: string;
    apiId: string;
  }): Promise<void> {

    await ApisService.deleteApi({
      organizationName: organizationId,
      apiName: apiId
    });

  }

}

export default new APApisDisplayService();
