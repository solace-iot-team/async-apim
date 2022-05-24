import { 
  ApiError,
  APIInfo,
  APIInfoList,
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
} from './APManagedAssetDisplayService';
import APMetaInfoDisplayService, { TAPMetaInfo } from './APMetaInfoDisplayService';
import APVersioningDisplayService, { IAPVersionInfo } from './APVersioningDisplayService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { TAPApiSpecDisplay } from './deleteme.APApiSpecsDisplayService';
import APApiSpecsDisplayService from './APApiSpecsDisplayService';

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

export interface IAPApiDisplay extends IAPManagedAssetDisplay, IAPSearchContent {
  apApiProductReferenceEntityIdList: TAPEntityIdList;
  apApiChannelParameterList: TAPApiChannelParameterList;
  connectorApiInfo: APIInfo;
  // version(s)
  apVersionInfo: IAPVersionInfo;

  // meta
  apMetaInfo: TAPMetaInfo;

  // stage
  apLifecycleStageInfo: IAPLifecycleStageInfo;

  // spec
  apApiSpecDisplay?: TAPApiSpecDisplay;
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

  private create_Empty_ConnectorApiInfo(): APIInfo {
    return {
      source: APIInfo.source.UPLOAD,
      createdTime: -1,
      createdBy: '',
      description: '',
      name: '',
      summary: '',
      version: '',
    };
  }

  protected create_Empty_ApApiDisplay(): IAPApiDisplay {
    const apApiDisplay: IAPApiDisplay = {
      ...this.create_Empty_ApManagedAssetDisplay(),
      apApiChannelParameterList: [],
      apApiProductReferenceEntityIdList: [],
      apVersionInfo: APVersioningDisplayService.create_Empty_ApVersionInfo(),
      apMetaInfo: APMetaInfoDisplayService.create_Empty_ApMetaInfo(),
      connectorApiInfo: this.create_Empty_ConnectorApiInfo(),
      apLifecycleStageInfo: APLifecycleStageInfoDisplayService.create_ApLifecycleStageInfo_From_ApiEntities({ connectorMeta: this.create_ConnectorMeta_From_ApiEntities({
        connectorApiInfo: this.create_Empty_ConnectorApiInfo()
      })}),
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
    const connectorMeta: Meta = {
      version: connectorApiInfo.version,
      created: connectorApiInfo.createdTime,
      createdBy: connectorApiInfo.createdBy,
      lastModified: connectorApiInfo.updatedTime,
      lastModifiedBy: 'unknown',
      stage: MetaEntityStage.RELEASED,
    };
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
    apApiSpecDisplay?: TAPApiSpecDisplay;
  }): IAPApiDisplay => {
    // const funcName = 'create_ApApiDisplay_From_ApiEntities';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    const _base = this.create_ApManagedAssetDisplay_From_ApiEntities({
      id: connectorApiInfo.name,
      displayName: connectorApiInfo.name,
      apRawAttributeList: [],
      default_ownerId: default_ownerId,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });

    const connectorMeta: Meta = this.create_ConnectorMeta_From_ApiEntities({ connectorApiInfo: connectorApiInfo });
    const apApiDisplay: IAPApiDisplay = {
      ..._base,
      connectorApiInfo: connectorApiInfo,
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

  public async apiGetList_ApApiDisplayList({ organizationId, default_ownerId }:{
    organizationId: string;
    default_ownerId: string;
  }): Promise<TAPApiDisplayList> {

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
    let apApiSpecDisplay: TAPApiSpecDisplay | undefined = undefined;
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

}

export default new APApisDisplayService();
