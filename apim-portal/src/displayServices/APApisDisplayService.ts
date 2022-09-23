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
import { EUIAdminPortalResourcePaths, Globals } from '../utils/Globals';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from './APBusinessGroupsDisplayService';
import APExternalSystemsDisplayService, { TAPExternalSystemDisplayList } from './APExternalSystemsDisplayService';
import APLifecycleStageInfoDisplayService, { IAPLifecycleStageInfo } from './APLifecycleStageInfoDisplayService';
import { 
  APManagedAssetDisplayService, 
  IAPManagedAssetDisplay,
  TAPManagedAssetDisplay_AccessAndState,
  TAPManagedAssetDisplay_Attributes,
  TAPManagedAssetDisplay_BusinessGroupSharing,
} from './APManagedAssetDisplayService';
import APMetaInfoDisplayService, { TAPMetaInfo } from './APMetaInfoDisplayService';
import APVersioningDisplayService, { IAPVersionInfo, TAPVersionList } from './APVersioningDisplayService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import APApiSpecsDisplayService, { TAPApiSpecDisplay } from './APApiSpecsDisplayService';
import { TAPAttributeDisplayList, TAPRawAttributeList } from './APAttributesDisplayService/APAttributesDisplayService';
import APMemberOfService, { TAPMemberOfBusinessGroupDisplayTreeNodeList } from './APUsersDisplayService/APMemberOfService';
import { EAPSOrganizationAuthRole } from '../_generated/@solace-iot-team/apim-server-openapi-browser';
import APRbacDisplayService from './APRbacDisplayService';
import { E_AP_OPS_MODE } from '../utils/APOperationMode';
import { AuthHelper } from '../auth/AuthHelper';

/** apEntityId.id & displayName are the same and represent the parameter name */
export type TAPApiChannelParameter = IAPEntityIdDisplay & {
  valueList: Array<string>;
}
export type TAPApiChannelParameterList = Array<TAPApiChannelParameter>;

export type TAPApiDisplay_AllowedActions = {
  isDeleteAllowed: boolean;
  isEditAllowed: boolean;
  isViewAllowed: boolean;
  // deprecated
  isImportFromEventPortalAllowed: boolean;
}
export type TAPApiDisplay_AsyncApiSpec = IAPEntityIdDisplay & {
  apApiSpecDisplay: TAPApiSpecDisplay;
}
export type TAPApiDisplay_General = IAPEntityIdDisplay & {
  description: string;
  summary: string;
}
export type TAPApiDisplay_Access = IAPEntityIdDisplay & TAPManagedAssetDisplay_AccessAndState & {}
export type TAPApiDisplay_State = IAPEntityIdDisplay & {
  version: string;
  readonly apVersionList: TAPVersionList;
  apLifecycleStageInfo: IAPLifecycleStageInfo;
}

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

export interface IAPApiVersionDisplay extends IAPEntityIdDisplay, IAPSearchContent {
  apVersion: string;
  connectorVersion: string;
  apMetaInfo: TAPMetaInfo;
  stage: MetaEntityStage;
}
export type TAPApiVersionDisplayList = Array<IAPApiVersionDisplay>

class APApisDisplayService extends APManagedAssetDisplayService {
  private readonly MiddleComponentName = "APApisDisplayService";

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
        connectorApiInfo: emptyConnectorApiInfo,
      }),
      }),
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
    let connectorMeta: Meta;
    if(connectorApiInfo.meta === undefined) {
      let stage: MetaEntityStage = MetaEntityStage.RELEASED;
      if(connectorApiInfo.deprecated !== undefined && connectorApiInfo.deprecated) stage = MetaEntityStage.DEPRECATED;
      connectorMeta = {
        version: APVersioningDisplayService.create_SemVerString(connectorApiInfo.version),
        created: connectorApiInfo.createdTime,
        createdBy: connectorApiInfo.createdBy,
        lastModified: connectorApiInfo.updatedTime,
        lastModifiedBy: 'unknown',
        stage: stage,
      };
    } else {
      connectorMeta = connectorApiInfo.meta;
      if(connectorApiInfo.meta.version !== undefined) {
        connectorMeta.version = APVersioningDisplayService.create_SemVerString(connectorApiInfo.meta.version);
      } else {
        connectorMeta.version = APVersioningDisplayService.create_SemVerString(connectorApiInfo.version);
      }
      // stage info not in meta, only deprecated or released
      if(connectorApiInfo.deprecated) connectorMeta.stage = MetaEntityStage.DEPRECATED;
      else connectorMeta.stage = MetaEntityStage.RELEASED;
    }
    return connectorMeta;
  }

  private create_ApApiDisplay_From_ApiEntities = ({ 
    connectorApiInfo, 
    apVersionList,
    connectorRevisionList,
    currentVersion,
    apApiProductReferenceEntityIdList,
    default_ownerId, 
    complete_ApBusinessGroupDisplayList,
    complete_ApExternalSystemDisplayList,
    apApiSpecDisplay,
  }:{
    connectorApiInfo: APIInfo;
    apVersionList?: TAPVersionList;
    connectorRevisionList?: Array<string>;
    currentVersion?: string;
    apApiProductReferenceEntityIdList: TAPEntityIdList;
    default_ownerId: string;
    complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList;
    apApiSpecDisplay: TAPApiSpecDisplay;
  }): IAPApiDisplay => {
    // const funcName = 'create_ApApiDisplay_From_ApiEntities';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    const apVersionRawAttributeList: TAPRawAttributeList = connectorApiInfo.attributes ? connectorApiInfo.attributes : [];

    const _base = this.create_ApManagedAssetDisplay_From_ApiEntities({
      id: connectorApiInfo.name,
      displayName: connectorApiInfo.name,
      apVersionRawAttributeList: apVersionRawAttributeList,
      apMetaRawAttributeList: [],
      default_ownerId: default_ownerId,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });

    const connectorMeta: Meta = this.create_ConnectorMeta_From_ApiEntities({ connectorApiInfo: connectorApiInfo });    
    // alert(`${logName}: connectorApiInfo.deprecated = ${connectorApiInfo.deprecated}, connectorMeta=${JSON.stringify(connectorMeta, null, 2)}`);

    const apApiDisplay: IAPApiDisplay = {
      ..._base,
      connectorApiInfo: connectorApiInfo,
      description: connectorApiInfo.description,
      summary: connectorApiInfo.summary,
      apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
      apApiChannelParameterList: this.create_ApApiChannelParameterList({ connectorParameters: connectorApiInfo.apiParameters }),
      apMetaInfo: APMetaInfoDisplayService.create_ApMetaInfo_From_ApiEntities({ 
        connectorMeta: connectorMeta, 
        removeApManagedAssetAttributePrefixList: []
      }),
      apVersionInfo: APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ 
        connectorMeta: connectorMeta, 
        apVersionList: apVersionList,
        connectorRevisionList: connectorRevisionList,
        currentVersion: currentVersion,
      }),

      apLifecycleStageInfo: APLifecycleStageInfoDisplayService.create_ApLifecycleStageInfo_From_ApiEntities({ 
        connectorMeta: connectorMeta,
        notes: connectorApiInfo.deprecatedDescription
      }),
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
    return title.replaceAll(/[^0-9a-zA-Z]+/g, '-');
  } 

  public get_ApMetaAttributeList({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPApiDisplay;
  }): TAPAttributeDisplayList {
    return apManagedAssetDisplay.apMetaInfo.apAttributeDisplayList;
  }

  public set_ApMetaAttributeList({ apManagedAssetDisplay, apMeta_ApAttributeDisplayList }:{
    apManagedAssetDisplay: IAPApiDisplay;
    apMeta_ApAttributeDisplayList: TAPAttributeDisplayList;
  }): IAPApiDisplay {
    apManagedAssetDisplay.apMetaInfo.apAttributeDisplayList = apMeta_ApAttributeDisplayList;
    return apManagedAssetDisplay;
  }

  public get_Empty_AllowedActions(): TAPApiDisplay_AllowedActions {
    return {
      isDeleteAllowed: false,
      isEditAllowed: false,
      isViewAllowed: false,
      isImportFromEventPortalAllowed: false,
    };
  }

  public get_IsDeleteAllowed({ apApiDisplay }:{
    apApiDisplay: IAPApiDisplay;
  }): boolean {
    if(apApiDisplay.apApiProductReferenceEntityIdList.length > 0) return false;
    return true;
  }

  public get_AllowedActions({ userId, userBusinessGroupId, apApiDisplay, authorizedResourcePathAsString, isEventPortalApisProxyMode, hasEventPortalConnectivity, apOperationsMode }:{
    userId: string;
    userBusinessGroupId?: string;
    authorizedResourcePathAsString: string;
    isEventPortalApisProxyMode: boolean;
    hasEventPortalConnectivity: boolean;
    apApiDisplay: IAPApiDisplay;
    apOperationsMode: E_AP_OPS_MODE;
  }): TAPApiDisplay_AllowedActions {
    const funcName = 'get_AllowedActions';
    const logName = `${this.MiddleComponentName}.${funcName}()`;

    const allowedActions: TAPApiDisplay_AllowedActions = {
      isEditAllowed: AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathAsString, EUIAdminPortalResourcePaths.ManageOrganizationApis_Edit),
      isDeleteAllowed: AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathAsString, EUIAdminPortalResourcePaths.ManageOrganizationApis_Delete),
      isViewAllowed: AuthHelper.isAuthorizedToAccessResource(authorizedResourcePathAsString, EUIAdminPortalResourcePaths.ManageOrganizationApis_View),
      isImportFromEventPortalAllowed: !isEventPortalApisProxyMode && hasEventPortalConnectivity,
    };
    if(!allowedActions.isEditAllowed || !allowedActions.isDeleteAllowed || !allowedActions.isViewAllowed) {
      // check if owned by user
      if(apApiDisplay.apOwnerInfo.id === userId) {
        allowedActions.isEditAllowed = true;
        allowedActions.isDeleteAllowed = true;
        allowedActions.isViewAllowed = true;
      }
    }
    if((!allowedActions.isEditAllowed || !allowedActions.isDeleteAllowed || !allowedActions.isViewAllowed) && userBusinessGroupId !== undefined) {
      // check if api product owned by same business group
      if(userBusinessGroupId === apApiDisplay.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id) {
        allowedActions.isEditAllowed = true;
        allowedActions.isDeleteAllowed = true;
        allowedActions.isViewAllowed = true;
      }
    }
    if((!allowedActions.isViewAllowed) && userBusinessGroupId !== undefined) {
      // check if api shared with user business group
      const foundSharingBusinessGroup: TAPManagedAssetDisplay_BusinessGroupSharing | undefined = apApiDisplay.apBusinessGroupInfo.apBusinessGroupSharingList.find( (x) => {
        return x.apEntityId.id === userBusinessGroupId;
      });
      if(foundSharingBusinessGroup !== undefined) {
        allowedActions.isViewAllowed = true;
      }
    }
    if(allowedActions.isDeleteAllowed) {
      // check if api has references  
      allowedActions.isDeleteAllowed = this.get_IsDeleteAllowed({ apApiDisplay: apApiDisplay });
    }
    // check the source
    switch(apApiDisplay.connectorApiInfo.source) {
      case APIInfo.source.EVENT_PORTAL_LINK:
        throw new Error(`${logName}: unsupported source = ${apApiDisplay.connectorApiInfo.source}`);
      case APIInfo.source.UPLOAD:
        // good as is
        break;
      case APIInfo.source.EVENT_APIPRODUCT:
        allowedActions.isEditAllowed = false;
        allowedActions.isDeleteAllowed = false;
        break;
      default:
        Globals.assertNever(logName, apApiDisplay.connectorApiInfo.source);
    }
    return allowedActions;
  }

  public get_Empty_ApApiDisplay_AsyncApiSpec({ apApiDisplay }: {
    apApiDisplay: IAPApiDisplay;
  }): TAPApiDisplay_AsyncApiSpec {
    const apApiDisplay_AsyncApiSpec: TAPApiDisplay_AsyncApiSpec = {
      apEntityId: apApiDisplay.apEntityId,
      apApiSpecDisplay: APApiSpecsDisplayService.create_Empty_ApApiSpecDisplay()
    };
    return apApiDisplay_AsyncApiSpec;
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

  public get_ApApiDisplay_State({ apApiDisplay }:{
    apApiDisplay: IAPApiDisplay;
  }): TAPApiDisplay_State {
    const apApiDisplay_State: TAPApiDisplay_State = {
      apEntityId: apApiDisplay.apEntityId,
      apLifecycleStageInfo: apApiDisplay.apLifecycleStageInfo,
      version: apApiDisplay.apVersionInfo.apCurrentVersion,
      apVersionList: apApiDisplay.apVersionInfo.apVersionList,
    };
    return apApiDisplay_State;
  }

  public set_ApApiDisplay_State({ apApiDisplay, apApiDisplay_State }:{
    apApiDisplay: IAPApiDisplay;
    apApiDisplay_State: TAPApiDisplay_State;
  }): IAPApiDisplay {
    apApiDisplay.apLifecycleStageInfo = apApiDisplay_State.apLifecycleStageInfo;
    apApiDisplay.apVersionInfo.apCurrentVersion = apApiDisplay_State.version;
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

  public async apiCheck_ApApiDisplay_Version_Exists({ organizationId, apiId, version }: {
    organizationId: string;
    apiId: string;
    version: string;
  }): Promise<boolean> {
    try {
      await ApisService.getApiVersionInfo({
        organizationName: organizationId,
        apiName: apiId,
        version: version
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

  public async apiCheck_ApApiDisplay_IsApiSpecValid({ organizationId, apApiSpecDisplay }: {
    organizationId: string;
    apApiSpecDisplay: TAPApiSpecDisplay;
  }): Promise<boolean | ApiError> {
    // const funcName = 'apiCheck_ApApiDisplay_IsApiSpecValid';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    try {
      await ApisService.createApi({
        organizationName: organizationId,
        apiName: Globals.getUUID(),
        mode: "test",
        requestBody: APApiSpecsDisplayService.get_AsyncApiSpec_As_Yaml_String({ apApiSpecDisplay: apApiSpecDisplay })
      });
      return true;
     } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        // // DEBUG
        // console.log(`${logName}: apiError=${JSON.stringify(apiError, null, 2)}`);
        return apiError;
      }
      // must be some other error
      throw e;
    }
  }

  public apiGetList_ApiProductReferenceEntityIdList = async({ organizationId, apiId, version }: {
    organizationId: string;
    apiId: string;
    version?: string;
  }): Promise<TAPEntityIdList> => {
    // const funcName = 'apiGetList_ApiProductReferenceEntityIdList';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    // must get the reference list for that version
    let list: CommonEntityNameList = [];
    if(version === undefined) {
      list = await ApisService.getApiReferencedByApiProducts({
        organizationName: organizationId,
        apiName: apiId
      });  
    } else {
      list = await ApisService.getApiRevisionApiProductReferences({
        organizationName: organizationId,
        apiName: apiId,
        version: version,
      });  
    }
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
        default_ownerId: default_ownerId,
        complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
        apApiSpecDisplay: APApiSpecsDisplayService.create_Empty_ApApiSpecDisplay(),
      }));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(list);
  }

  private async apiGetFilteredList_ConnectorApiInfo({ organizationId, businessGroupIdList }:{
    organizationId: string;
    businessGroupIdList: Array<string>;
  }): Promise<APIInfoList> {
    // const funcName = 'apiGetFilteredList_ConnectorApiInfo';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);
    const result: APIList | APISummaryList | APIInfoList = await ApisService.listApis({
      organizationName: organizationId,
      format: 'extended'
    });
    const completeApiInfoList: APIInfoList = result as APIInfoList;

    // filter by business group id & sharing business group id
    const filteredApiInfoList: APIInfoList = [];
    if(businessGroupIdList.length > 0) {
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
          for(const businessGroupId of businessGroupIdList) {
            if(
              (owningAttribute !== undefined && owningAttribute.value.includes(businessGroupId)) ||
              (sharingAttribute !== undefined && sharingAttribute.value.includes(businessGroupId))
             ) {
              // don't add again if already in
              const found = filteredApiInfoList.find( (x) => {
                return x.name === apiInfo.name;
              });
              if(found === undefined) filteredApiInfoList.push(apiInfo);
             }
          }
        }
      }
    }
    return filteredApiInfoList;
  }

  public async apiGetList_ApApiVersionDisplayList({ organizationId, default_ownerId, businessGroupId }:{
    organizationId: string;
    default_ownerId: string;
    businessGroupId: string;
  }): Promise<TAPApiVersionDisplayList> {

    const apApiVersionDisplayList: TAPApiVersionDisplayList = [];

    // get each version
    const masterApiInfoList: APIInfoList = await this.apiGetFilteredList_ConnectorApiInfo({
      organizationId: organizationId,
      businessGroupIdList: [businessGroupId]
    });
    if(masterApiInfoList.length === 0) return apApiVersionDisplayList;

    // get the complete business group list for reference
    // const complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
    //   organizationId: organizationId,
    //   fetchAssetReferences: false
    // });
    // // get the complete external system list for reference
    // const complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
    //   organizationId: organizationId,
    // });
    
    for(const masterApiInfo of masterApiInfoList) {
      const connectorRevisionList: Array<string> = await ApisService.listApiRevisions({
        organizationName: organizationId,
        apiName: masterApiInfo.name
      });
      for(const connectorRevision of connectorRevisionList) {
        const apApiDisplay: IAPApiDisplay = await this.apiGet_ApApiDisplay({
          organizationId: organizationId,
          apiId: masterApiInfo.name,
          default_ownerId: default_ownerId,
          version: connectorRevision
        });
        // map
        const apApiVersionDisplay: IAPApiVersionDisplay = {
          apEntityId: {
            id: `${apApiDisplay.apEntityId.id}@${connectorRevision}`,
            displayName: `${apApiDisplay.apEntityId.displayName}@${connectorRevision}`
          },
          apMetaInfo: apApiDisplay.apMetaInfo,
          apVersion: apApiDisplay.apVersionInfo.apCurrentVersion,
          connectorVersion: connectorRevision,
          stage: apApiDisplay.apLifecycleStageInfo.stage,
          apSearchContent: ''
        };
        apApiVersionDisplayList.push(APSearchContentService.add_SearchContent<IAPApiVersionDisplay>(apApiVersionDisplay));
      }
    }
    return apApiVersionDisplayList;
  }

  public async apiGetList_ApApiDisplayList({ organizationId, default_ownerId, businessGroupId, apMemberOfBusinessGroupDisplayTreeNodeList=[], apOperationsMode }:{
    organizationId: string;
    default_ownerId: string;
    businessGroupId: string;
    apMemberOfBusinessGroupDisplayTreeNodeList?: TAPMemberOfBusinessGroupDisplayTreeNodeList;
    apOperationsMode: E_AP_OPS_MODE;
  }): Promise<TAPApiDisplayList> {
    const funcName = 'apiGetList_ApApiDisplayList';
    const logName = `${this.MiddleComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

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

    const apiInfoList: APIInfoList = await this.apiGetFilteredList_ConnectorApiInfo({
      organizationId: organizationId,
      businessGroupIdList: businessGroupIdList,
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
      // alert(`${logName}: apiInfo.deprecated=${apiInfo.deprecated} for ${apiInfo.name}`);
      const apApiProductReferenceEntityIdList: TAPEntityIdList = await this.apiGetList_ApiProductReferenceEntityIdList({
        organizationId: organizationId, 
        apiId: apiInfo.name
      });
      let doInclude: boolean = true;
      switch(apOperationsMode) {
        case E_AP_OPS_MODE.FULL_OPS_MODE:
          doInclude = true;
          break;
        case E_AP_OPS_MODE.EP2_OPS_MODE:
          if(apiInfo.source === APIInfo.source.EVENT_APIPRODUCT) doInclude = true;
          else doInclude = false;
          break;
        default:
          Globals.assertNever(logName, apOperationsMode);
      } 
      if(doInclude) {
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
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(list);
  }

  private async apiGetList_ApiVersions({ organizationId, apiId }:{
    organizationId: string;
    apiId: string;
  }): Promise<{ connectorRevisionList: Array<string>; apVersionList: TAPVersionList }> {
    // list may consist of number strings or semVer strings
    // convert all number strings to semVer strings
    const connectorRevisionList: Array<string> = await ApisService.listApiRevisions({
      organizationName: organizationId,
      apiName: apiId
    });
    const apVersionList: TAPVersionList = [];
    connectorRevisionList.forEach( (x: string) => {
      // is semVer?
      apVersionList.push(APVersioningDisplayService.create_SemVerString(x));
    });  
    return {
      apVersionList: apVersionList,
      connectorRevisionList: connectorRevisionList
    };
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
    // const funcName = 'apiGet_ApApiDisplay';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    let connectorApiInfo: APIInfo;
    if(version  === undefined) {
      connectorApiInfo = await ApisService.getApiInfo({
        organizationName: organizationId,
        apiName: apiId
      });  
    } else {
      const versionConnectorApiInfo = await ApisService.getApiVersionInfo({
        organizationName: organizationId,
        apiName: apiId,
        version: version
      });
      // now get the latest api info to ensure all attributes are correct
      const latestConnectorApiInfo = await ApisService.getApiInfo({
        organizationName: organizationId,
        apiName: apiId
      });
      connectorApiInfo = {
        ...versionConnectorApiInfo,
        attributes: latestConnectorApiInfo.attributes,
        deprecated: latestConnectorApiInfo.deprecated,
        deprecatedDescription: latestConnectorApiInfo.deprecatedDescription
      };
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
      apiId: apiId,
      version: version,
    });
    // get the revision list
    let _apVersionList: TAPVersionList | undefined = undefined;
    let _connectorRevisionList: Array<string> | undefined = undefined;
    if(fetch_revision_list) {
      const { connectorRevisionList, apVersionList } = await this.apiGetList_ApiVersions({ 
        organizationId: organizationId,
        apiId: apiId,
      });
      _apVersionList = apVersionList;
      _connectorRevisionList = connectorRevisionList;
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

    // alert(`${logName}: _apVersionList=${JSON.stringify(_apVersionList, null, 2)} `);
    // alert(`${logName}: _connectorRevisionList=${JSON.stringify(_connectorRevisionList, null, 2)} `);

    return this.create_ApApiDisplay_From_ApiEntities({
      connectorApiInfo: connectorApiInfo, 
      apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
      default_ownerId: default_ownerId, 
      currentVersion: version,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,

      apVersionList: _apVersionList,
      connectorRevisionList: _connectorRevisionList,

      apApiSpecDisplay: apApiSpecDisplay,
    });
  }

  public async apiCreate_ApApiDisplay({ organizationId, apApiDisplay, userId }: {
    organizationId: string;
    apApiDisplay: IAPApiDisplay;
    userId: string;
  }): Promise<void> {
    // const funcName = 'apiCreate_ApApiDisplay';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    // create the api in connector
    await ApisService.createApi({
      organizationName: organizationId, 
      apiName: apApiDisplay.apEntityId.id,
      requestBody: APApiSpecsDisplayService.get_AsyncApiSpec_As_Yaml_String({ apApiSpecDisplay: apApiDisplay.apApiSpecDisplay })
    });
    // patch attributes & meta on api info
    const apRawAttributeList: TAPRawAttributeList = await this.create_Complete_ApRawAttributeList({ 
      organizationId: organizationId,
      apManagedAssetDisplay: apApiDisplay 
    });
    const update: APIInfoPatch = {
      deprecated: false,
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

  public async apiCreate_ApApiDisplay_AsyncApiSpec({ organizationId, userId, apApiDisplay, apApiDisplay_AsyncApiSpec }:{
    organizationId: string;
    userId: string;
    apApiDisplay: IAPApiDisplay;
    apApiDisplay_AsyncApiSpec: TAPApiDisplay_AsyncApiSpec;
  }): Promise<void> {
    // const funcName = 'apiUpdate_ApApiDisplay_AsyncApiSpec';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    const yaml: string = APApiSpecsDisplayService.get_AsyncApiSpec_As_Yaml_String({ apApiSpecDisplay: apApiDisplay_AsyncApiSpec.apApiSpecDisplay });
    // const version: string = APApiSpecsDisplayService.get_RawVersionString({ apApiSpecDisplay: apApiDisplay_AsyncApiSpec.apApiSpecDisplay });
    await ApisService.updateApi({
      organizationName: organizationId,
      apiName: apApiDisplay.apEntityId.id,
      requestBody: yaml
    });
    // update meta on latest
    await ApisService.updateApiInfo({
      organizationName: organizationId,
      apiName: apApiDisplay.apEntityId.id,
      requestBody: {
        deprecated: false,
        meta: {
          lastModifiedBy: userId,
          createdBy: userId,
        }
      }
    });
  }

  public async apiUpdate_ApApiDisplay_Attributes({ organizationId, userId, apApiDisplay, apManagedAssetDisplay_Attributes }:{
    organizationId: string;
    userId: string;
    apApiDisplay: IAPApiDisplay;
    apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes;
  }): Promise<void> {
    // const funcName = 'apiUpdate_ApApiDisplay_Attributes';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    apApiDisplay = this.set_ApManagedAssetDisplay_Attributes({ 
      apManagedAssetDisplay: apApiDisplay,
      apManagedAssetDisplay_Attributes: apManagedAssetDisplay_Attributes
    }) as IAPApiDisplay;
    
    const apRawAttributeList: TAPRawAttributeList = await this.create_Complete_ApRawAttributeList({ 
      organizationId: organizationId,
      apManagedAssetDisplay: apApiDisplay 
    });
    await this.apiUpdate({
      organizationId: organizationId,
      apiId: apApiDisplay.apEntityId.id,
      apRawAttributeList: apRawAttributeList,
      apiInfoUpdate: {
        deprecated: apApiDisplay.apLifecycleStageInfo.stage === MetaEntityStage.DEPRECATED,
        meta: {
          lastModifiedBy: userId
        }
      }
    });
  }

  public async apiUpdate_ApApiDisplay_State({ organizationId, userId, apApiDisplay, apApiDisplay_State }:{
    organizationId: string;
    userId: string;
    apApiDisplay: IAPApiDisplay;
    apApiDisplay_State: TAPApiDisplay_State;
  }): Promise<void> {
    const funcName = 'apiUpdate_ApApiDisplay_State';
    const logName = `${this.MiddleComponentName}.${funcName}()`;
    apApiDisplay = this.set_ApApiDisplay_State({ apApiDisplay: apApiDisplay, apApiDisplay_State: apApiDisplay_State });
    if(apApiDisplay.apLifecycleStageInfo.stage !== MetaEntityStage.DEPRECATED && apApiDisplay.apLifecycleStageInfo.stage !== MetaEntityStage.RELEASED) {
      throw new Error(`${logName}: invalid apApiDisplay.apLifecycleStageInfo.stage=${apApiDisplay.apLifecycleStageInfo.stage}`);
    }
    const deprecated: boolean = (apApiDisplay.apLifecycleStageInfo.stage === MetaEntityStage.DEPRECATED);
    // update on latest
    // alert(`${logName}: deprecated = ${deprecated}`);
    await ApisService.updateApiInfo({
      organizationName: organizationId,
      apiName: apApiDisplay.apEntityId.id,
      requestBody: {
        deprecated: deprecated,
        deprecatedDescription: apApiDisplay.apLifecycleStageInfo.notes,
        meta: {
          lastModifiedBy: userId,
        }
      }
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
    await this.apiUpdate({
      organizationId: organizationId,
      apiId: apApiDisplay.apEntityId.id,
      apRawAttributeList: apRawAttributeList,
      apiInfoUpdate: {
        deprecated: apApiDisplay.apLifecycleStageInfo.stage === MetaEntityStage.DEPRECATED,
        meta: {
          lastModifiedBy: userId
        }
      }
    });
  }

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
