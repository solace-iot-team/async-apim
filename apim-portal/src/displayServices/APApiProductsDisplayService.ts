import { 
  ApiError,
  APIProduct,
  APIProductAccessLevel,
  APIProductPatch,
  ApiProductsService,
  attributes,
  ClientOptions,
  ClientOptionsGuaranteedMessaging,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { DataTableSortOrderType } from 'primereact/datatable';
import { APClientConnectorOpenApi } from '../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, TAPEntityIdList, 
} from '../utils/APEntityIdsService';
import { Globals } from '../utils/Globals';
import { EAPSApiProductSortFieldName } from '../_generated/@solace-iot-team/apim-server-openapi-browser';
import APAccessLevelDisplayService from './APAccessLevelDisplayService';
import APApisDisplayService, { 
  TAPApiChannelParameter, 
  TAPApiChannelParameterList, 
  TAPApiDisplayList 
} from './APApisDisplayService';
import APAttributesDisplayService, {
  IAPAttributeDisplay,
  TAPAttributeDisplayList,
  TAPRawAttribute,
  TAPRawAttributeList, 
} from './APAttributesDisplayService/APAttributesDisplayService';
import { TAPBusinessGroupDisplayList } from './APBusinessGroupsDisplayService';
import APDisplayUtils from './APDisplayUtils';
import { 
  TAPEnvironmentDisplay, 
  TAPEnvironmentDisplayList 
} from './APEnvironmentsDisplayService';
import { TAPExternalSystemDisplayList } from './APExternalSystemsDisplayService';
import APLifecycleStageInfoDisplayService, { IAPLifecycleStageInfo } from './APLifecycleStageInfoDisplayService';
import { 
  APManagedAssetDisplayService, 
  EAPManagedAssetAttribute_Scope, 
  IAPManagedAssetDisplay,
  TAPManagedAssetDisplay_AccessAndState,
  TAPManagedAssetPublishDestinationInfo,
} from './APManagedAssetDisplayService';
import APMetaInfoDisplayService, { TAPMetaInfo } from './APMetaInfoDisplayService';
import APProtocolsDisplayService, { 
  TAPProtocolDisplayList 
} from './APProtocolsDisplayService';
import APVersioningDisplayService, { IAPVersionInfo } from './APVersioningDisplayService';

export type TAPApiProductDisplay_LazyLoadingTableParameters = {
  isInitialSetting: boolean; // differentiate between first time and subsequent times
  first: number; // index of the first row to be displayed
  rows: number; // number of rows to display per page
  page: number;
  // sortField: (keyof APSUser | keyof APSUserProfile);
  sortField: string;
  sortOrder: DataTableSortOrderType;
}
export type TAPApiProductDisplay_ListOptions = {
  pageNumber: number;
  pageSize: number;
  sortFieldName: string;
  sortDirection: DataTableSortOrderType;
  searchWordList: string | undefined;
}
export type TAPControlledChannelParameter = IAPAttributeDisplay;
export type TAPControlledChannelParameterList = Array<TAPControlledChannelParameter>;
export enum EAPApprovalType {
  MANUAL = "manual",
  AUTO = "auto"
}

export type TAPApiProductDisplay_Documentation = IAPEntityIdDisplay & {
  apApiProductDocumentationDisplay: TAPApiProductDocumentationDisplay;
}
export type TAPApiProductDisplay_General = IAPEntityIdDisplay & {
  apDescription: string;
  apApiProductCategoryDisplayName: string;  
  apVersionInfo: IAPVersionInfo;
}
export type TAPApiProductDisplay_Policies = IAPEntityIdDisplay & {
  apApprovalType: EAPApprovalType;
  apClientOptionsDisplay: TAPClientOptionsDisplay;
}
export type TAPApiProductDisplay_Environments = IAPEntityIdDisplay & {
  apEnvironmentDisplayList: TAPEnvironmentDisplayList;
  apProtocolDisplayList: TAPProtocolDisplayList;  
}
export type TAPApiProductDisplay_Apis = IAPEntityIdDisplay & {
  apApiDisplayList: TAPApiDisplayList;
  apControlledChannelParameterList: TAPControlledChannelParameterList;
}

export type TAPApiProductDisplay_AccessAndState = IAPEntityIdDisplay & TAPManagedAssetDisplay_AccessAndState & {
  apLifecycleStageInfo: IAPLifecycleStageInfo;
  apAccessLevel: APIProductAccessLevel;
  apPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo;
}

export type TAPApiProductDisplay_PublishDestinationInfo = IAPEntityIdDisplay & {
  apPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo;
}

export type TAPClientOptionsGuaranteedMessagingDisplay = {
  requireQueue: boolean;
  accessType: ClientOptionsGuaranteedMessaging.accessType;
  maxTtl: number;
  maxMsgSpoolUsage: number;
  queueGranularity: ClientOptionsGuaranteedMessaging.queueGranularity;
}
export type TAPClientOptionsDisplay = {
  apGuaranteedMessaging: TAPClientOptionsGuaranteedMessagingDisplay;  
}
export type TAPApiProductDocumentationDisplay = {
  apSupportDocumentation?: string;
  apReferenceDocumentation?: string;
}
export enum ETAPApiProductConfigState_IssueType {
  NO_ENVIRONMENTS_CONFIGURED = "No Environments configured",
  NO_PROTOCOLS_CONFIGURED = "No Protocols configured",
  NO_APIS_CONFIGURED = "No Apis configured",
}
export type TAPApiProductConfigState_Issue = {
  issueType: ETAPApiProductConfigState_IssueType;
}
export type TAPApiProductConfigState_IssueList = Array<TAPApiProductConfigState_Issue>;
export type TAPApiProductConfigState = {
  apIsConfigComplete: boolean;
  issueList: TAPApiProductConfigState_IssueList;
}
export enum E_ApApiProductSource {
  UNKNOWN ="unknown source",
  MANUAL = "manually created",
  EP2 = "Solace Event Portal"
}
export interface IAPApiProductDisplay extends IAPManagedAssetDisplay {
  // keep for devel purposes only
  devel_connectorApiProduct: APIProduct;

  // housekeeping
  apApiProductConfigState: TAPApiProductConfigState;
  apApiProductSource: E_ApApiProductSource;

  // General
  apDescription: string;
  apApiProductCategoryDisplayName: string;

  // Documentation
  apApiProductDocumentationDisplay: TAPApiProductDocumentationDisplay;

  // Policies
  apApprovalType: EAPApprovalType;
  apClientOptionsDisplay: TAPClientOptionsDisplay;

  // Apis
  apApiDisplayList: TAPApiDisplayList;
  apControlledChannelParameterList: TAPControlledChannelParameterList;
  
  // Environments
  apEnvironmentDisplayList: TAPEnvironmentDisplayList;
  /** the consolidated protocol list across all environments */
  apProtocolDisplayList: TAPProtocolDisplayList;  

  // version(s)
  apVersionInfo: IAPVersionInfo;

  // meta
  apMetaInfo: TAPMetaInfo;

  // access
  apAccessLevel: APIProductAccessLevel;

  // stage
  apLifecycleStageInfo: IAPLifecycleStageInfo;
}
export type TAPApiProductDisplayList = Array<IAPApiProductDisplay>;

export type IAPApiProductDisplay4List = Omit<IAPApiProductDisplay, "apApiDisplayList" | "apControlledChannelParameterList" | "apEnvironmentDisplayList" | "apProtocolDisplayList"> & {
  apApiEntityIdList: TAPEntityIdList;
};

export abstract class APApiProductsDisplayService extends APManagedAssetDisplayService {
  private readonly MiddleComponentName = "APApiProductsDisplayService";

  private readonly CDefaultApiProductCategory = 'Solace AsyncAPI';
  private readonly CDefaultApiProductImageUrl = 'https://www.primefaces.org/primereact/showcase/showcase/demo/images/product/chakra-bracelet.jpg';

  private create_ApApiProductDocumentation(connectorApiProduct: APIProduct): TAPApiProductDocumentationDisplay {
    return {
      apSupportDocumentation: "<h1>Support Documentation</h1><p>the support doc here</p>",
      apReferenceDocumentation: "<h1>Reference Documentation</h1><p>the reference doc here</p>",
    };
  }

  private create_ApApprovalType(connectorApprovalType?: APIProduct.approvalType): EAPApprovalType {
    const funcName = 'create_ApApprovalType';
    const logName = `${this.MiddleComponentName}.${funcName}()`;
    if(connectorApprovalType === undefined) return EAPApprovalType.MANUAL;
    switch(connectorApprovalType) {
      case APIProduct.approvalType.MANUAL:
        return EAPApprovalType.MANUAL;
      case APIProduct.approvalType.AUTO:
        return EAPApprovalType.AUTO;
      default:
        Globals.assertNever(logName, connectorApprovalType);
    }
    return EAPApprovalType.MANUAL;
  }

  private create_ConnectorApprovalType(apApprovalType: EAPApprovalType): APIProduct.approvalType {
    const funcName = 'create_ConnectorApprovalType';
    const logName = `${this.MiddleComponentName}.${funcName}()`;
    switch(apApprovalType) {
      case EAPApprovalType.MANUAL:
        return APIProduct.approvalType.MANUAL;
      case EAPApprovalType.AUTO:
        return APIProduct.approvalType.AUTO;
      default:
        Globals.assertNever(logName, apApprovalType);
    }
    return APIProduct.approvalType.MANUAL;
  }

  private check_IsGuaranteedMessagingEnabled(connectorClientOptions: ClientOptions | undefined): boolean {
    if(connectorClientOptions === undefined) return false;
    if(connectorClientOptions.guaranteedMessaging === undefined) return false;
    if(connectorClientOptions.guaranteedMessaging.requireQueue === undefined) return false;
    return connectorClientOptions.guaranteedMessaging.requireQueue;
  }

  protected create_Empty_ApClientOptionsDisplay(): TAPClientOptionsDisplay {
    return {
      apGuaranteedMessaging: {
        requireQueue: false,
        accessType: ClientOptionsGuaranteedMessaging.accessType.EXCLUSIVE,
        maxMsgSpoolUsage: 0,
        maxTtl: 1,
        queueGranularity: ClientOptionsGuaranteedMessaging.queueGranularity.API_PRODUCT
      }
    };
  }

  private create_ApClientOptionsDisplay(connectorClientOptions?: ClientOptions): TAPClientOptionsDisplay {
    const funcName = 'create_ApClientOptionsDisplay';
    const logName = `${this.MiddleComponentName}.${funcName}()`;

    if(!this.check_IsGuaranteedMessagingEnabled(connectorClientOptions)) return this.create_Empty_ApClientOptionsDisplay();
    if(connectorClientOptions === undefined) throw new Error(`${logName}: connectorClientOptions === undefined`);
    if(connectorClientOptions.guaranteedMessaging === undefined) throw new Error(`${logName}: connectorClientOptions.guaranteedMessaging === undefined`);
    const apGuaranteedMessaging: TAPClientOptionsGuaranteedMessagingDisplay = {
      accessType: connectorClientOptions.guaranteedMessaging.accessType,
      maxMsgSpoolUsage: connectorClientOptions.guaranteedMessaging.maxMsgSpoolUsage,
      maxTtl: connectorClientOptions.guaranteedMessaging.maxTtl,
      requireQueue: connectorClientOptions.guaranteedMessaging.requireQueue ? connectorClientOptions.guaranteedMessaging.requireQueue : false,
      queueGranularity: connectorClientOptions.guaranteedMessaging.queueGranularity ? connectorClientOptions.guaranteedMessaging.queueGranularity : ClientOptionsGuaranteedMessaging.queueGranularity.API_PRODUCT,
    }
    const apClientOptionsDisplay: TAPClientOptionsDisplay = {
      apGuaranteedMessaging: apGuaranteedMessaging,
    };
    return apClientOptionsDisplay;
  }

  private create_ConnectorClientOptions(apClientOptionsDisplay: TAPClientOptionsDisplay): ClientOptions {
    const clientOptionsGuaranteedMessaging: ClientOptionsGuaranteedMessaging | undefined = apClientOptionsDisplay.apGuaranteedMessaging;
    const connectorClientOptions: ClientOptions = {
      // if disabled, set to undefined 
      // note: loses previously configured options, acceptable for user?
      guaranteedMessaging: clientOptionsGuaranteedMessaging.requireQueue ? clientOptionsGuaranteedMessaging : undefined,
    }
    return connectorClientOptions;
  }

  private create_Empty_ConnectorApiProduct(): APIProduct {
    return {
      apis: [],
      attributes: [],
      name: '',
      displayName: '',
      description: '',
      pubResources: [],
      subResources: [],
      environments: [],
      protocols: [],
    };
  }

  protected create_Empty_ApApiProductDisplay(): IAPApiProductDisplay {
    const apApiProductDisplay: IAPApiProductDisplay = {
      ...this.create_Empty_ApManagedAssetDisplay(),

      devel_connectorApiProduct: this.create_Empty_ConnectorApiProduct(),

      apApiProductConfigState: {
        apIsConfigComplete: false,
        issueList: []
      },
      apApiProductSource: E_ApApiProductSource.UNKNOWN,
      apDescription: '',
      apApiProductDocumentationDisplay: {
        apSupportDocumentation: '',
        apReferenceDocumentation: ''
      },
      apApprovalType: this.create_ApApprovalType(),
      apClientOptionsDisplay: this.create_Empty_ApClientOptionsDisplay(),
      apApiDisplayList: [],
      apControlledChannelParameterList: [],
      apEnvironmentDisplayList: [],
      apProtocolDisplayList: [],
      apApiProductCategoryDisplayName: '',
      apVersionInfo: APVersioningDisplayService.create_Empty_ApVersionInfo(),
      apMetaInfo: APMetaInfoDisplayService.create_Empty_ApMetaInfo(),
      apAccessLevel: APAccessLevelDisplayService.get_Default_AccessLevel(),
      apLifecycleStageInfo: APLifecycleStageInfoDisplayService.create_Empty_ApLifecycleStageInfo(),
    };
    return apApiProductDisplay;
  }

  private extract_ApControlledChannelParameterList({ apAttributeDisplayList, apCombinedApiChannelParameterList }:{
    apAttributeDisplayList: TAPAttributeDisplayList;
    apCombinedApiChannelParameterList: TAPApiChannelParameterList;
  }): TAPControlledChannelParameterList {
    const apControlledChannelParameterList: TAPControlledChannelParameterList = APAttributesDisplayService.extract_ByEntityIdList({
      apAttributeDisplayList: apAttributeDisplayList,
      idList_To_extract: APEntityIdsService.create_IdList_From_ApDisplayObjectList<TAPApiChannelParameter>(apCombinedApiChannelParameterList)
    });
    return apControlledChannelParameterList;
  }

  private create_ApRawAttributeList_From_ApiEntities({ connectorApiProduct }:{
    connectorApiProduct: APIProduct;
  }): TAPRawAttributeList {
    // const funcName = 'create_ApRawAttributeList_From_ApiEntities';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;
    // meta attributes override product attributes
    const metaRawAttributes: TAPRawAttributeList = connectorApiProduct.meta !== undefined && connectorApiProduct.meta.attributes !== undefined ? connectorApiProduct.meta.attributes : [];
    // console.log(`${logName}: connectorApiProduct.displayName=${connectorApiProduct.displayName}, metaRawAttributes=${JSON.stringify(metaRawAttributes)}`);
    // metaRawAttributes could have null values in it, filter them out
    const apRawAttributeList: TAPRawAttributeList = metaRawAttributes.filter( (x) => {
      return x !== null;
    });
    // console.log(`${logName}: apRawAttributeList=${JSON.stringify(apRawAttributeList)}`);
    for(const nameValuePair of connectorApiProduct.attributes) {
      // console.log(`${logName}: nameValuePair=${JSON.stringify(nameValuePair)}`);
      if(nameValuePair !== null) {
        const exists: TAPRawAttribute | undefined = apRawAttributeList.find( (apRawAttribute: TAPRawAttribute) => {
          // console.log(`${logName}: apRawAttribute=${JSON.stringify(apRawAttribute)}`);
          return apRawAttribute.name === nameValuePair.name;
        });
        if(exists === undefined) apRawAttributeList.push(nameValuePair);  
      }
    }
    return apRawAttributeList;
  }

  protected map_APApiProductDisplaySortFieldName_To_APSApiProductSortFieldName({ apApiProductDisplay_SortFieldName }:{
    apApiProductDisplay_SortFieldName: string;
  }): EAPSApiProductSortFieldName {
    const funcName = 'map_APApiProductDisplaySortFieldName_To_APSApiProductSortFieldName';
    const logName = `${this.MiddleComponentName}.${funcName}()`;
    switch(apApiProductDisplay_SortFieldName) {
      case APDisplayUtils.nameOf<IAPApiProductDisplay>('apEntityId.displayName'):
        return EAPSApiProductSortFieldName.DISPLAY_NAME;
      case APDisplayUtils.nameOf<IAPApiProductDisplay>('apLifecycleStageInfo.stage'):
        return EAPSApiProductSortFieldName.STAGE;
      case APDisplayUtils.nameOf<IAPApiProductDisplay>('apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName'):
        return EAPSApiProductSortFieldName.OWNING_BUSINESS_GROUP_DISPLAY_NAME;
      case APDisplayUtils.nameOf<IAPApiProductDisplay>('apApiProductSource'):
        return EAPSApiProductSortFieldName.SOURCE;
      default:
        throw new Error(`${logName}: cannot map apApiProductDisplay_SortFieldName=${apApiProductDisplay_SortFieldName} to EAPSApiProductSortFieldName=${JSON.stringify(Object.values(EAPSApiProductSortFieldName))}`);
    }
  }

  protected determine_ApApiProductConfigState( connectorApiProduct: APIProduct ): TAPApiProductConfigState {
    const apApiProductConfigState: TAPApiProductConfigState = {
      apIsConfigComplete: true,
      issueList: []
    };
    // check if it has environments
    if(connectorApiProduct.environments.length === 0) {
      apApiProductConfigState.issueList.push({
        issueType: ETAPApiProductConfigState_IssueType.NO_ENVIRONMENTS_CONFIGURED,
      });
    }
    // check if it has protocols
    if(connectorApiProduct.protocols.length === 0) {
      apApiProductConfigState.issueList.push({
        issueType: ETAPApiProductConfigState_IssueType.NO_PROTOCOLS_CONFIGURED,
      });
    }
    // check if it has apis
    if(connectorApiProduct.apis.length === 0) {
      apApiProductConfigState.issueList.push({
        issueType: ETAPApiProductConfigState_IssueType.NO_APIS_CONFIGURED,
      });
    }
    if(apApiProductConfigState.issueList.length > 0) apApiProductConfigState.apIsConfigComplete = false;
    return apApiProductConfigState;
  }

  protected determine_ApApiProductSource(apConnector_ApAttributeDisplayList: TAPAttributeDisplayList): E_ApApiProductSource {
    // const funcName = 'determine_ApApiProductSource';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;
    // console.log(`${logName}: apConnector_ApAttributeDisplayList=${JSON.stringify(apConnector_ApAttributeDisplayList, null, 2)}`);
    const apApiProductSourceAttributeList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_Connector_AC_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.SOURCE }),
      apAttributeDisplayList: apConnector_ApAttributeDisplayList
    });
    if(apApiProductSourceAttributeList.length === 0) return E_ApApiProductSource.MANUAL;
    const value = apApiProductSourceAttributeList[0].value;
    // alert(`${logName}: value = ${value}`);
    if(value.includes(E_ApApiProductSource.EP2)) return E_ApApiProductSource.EP2;
    return E_ApApiProductSource.MANUAL;
  }

  protected async create_ApApiProductDisplay4List_From_ApiEntities({ 
    connectorApiProduct, 
    connectorRevisions,
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
  }): Promise<IAPApiProductDisplay4List> {
    // const funcName = 'create_ApApiProductDisplay4List_From_ApiEntities';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    const apRawAttributeList: TAPRawAttributeList = this.create_ApRawAttributeList_From_ApiEntities({ connectorApiProduct: connectorApiProduct });

    const _base: IAPManagedAssetDisplay = this.create_ApManagedAssetDisplay_From_ApiEntities({
      id: connectorApiProduct.name,
      displayName: connectorApiProduct.displayName,
      apRawAttributeList: apRawAttributeList,
      default_ownerId: default_ownerId,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });

    const apApiProductDisplay4List: IAPApiProductDisplay4List = {
      ..._base,

      devel_connectorApiProduct: connectorApiProduct,

      apApiProductConfigState: this.determine_ApApiProductConfigState(connectorApiProduct),

      apApiProductSource: this.determine_ApApiProductSource(_base.apConnector_ApAttributeDisplayList),

      apApiProductDocumentationDisplay: this.create_ApApiProductDocumentation(connectorApiProduct),

      apApprovalType: this.create_ApApprovalType(connectorApiProduct.approvalType),
      apClientOptionsDisplay: this.create_ApClientOptionsDisplay(connectorApiProduct.clientOptions),
      apDescription: connectorApiProduct.description ? connectorApiProduct.description : '',
      apApiProductCategoryDisplayName: this.CDefaultApiProductCategory,
      apApiEntityIdList: APEntityIdsService.create_EntityIdList_From_IdList(connectorApiProduct.apis),
      apVersionInfo: APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ 
        connectorMeta: connectorApiProduct.meta, 
        apVersionList: connectorRevisions,
        connectorRevisionList: connectorRevisions,
        currentVersion: currentVersion,
       }),
       apMetaInfo: APMetaInfoDisplayService.create_ApMetaInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta, apRawAttributeList: apRawAttributeList, apManagedAssetAttributePrefix: this.create_AP_ManagedAssetAttribute_Prefix() }),
       apAccessLevel: (connectorApiProduct.accessLevel ? connectorApiProduct.accessLevel : APAccessLevelDisplayService.get_Default_AccessLevel()),
       apLifecycleStageInfo: APLifecycleStageInfoDisplayService.create_ApLifecycleStageInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta }),
    };
    return apApiProductDisplay4List;
  }

  protected async create_ApApiProductDisplay_From_ApiEntities({ 
    organizationId, 
    connectorApiProduct, 
    connectorRevisions, 
    completeApEnvironmentDisplayList, 
    default_ownerId, 
    currentVersion,
    complete_ApBusinessGroupDisplayList,
    complete_ApExternalSystemDisplayList,
    create_skinny,
   }:{
    organizationId: string;
    connectorApiProduct: APIProduct;
    connectorRevisions?: Array<string>;
    completeApEnvironmentDisplayList: TAPEnvironmentDisplayList;
    default_ownerId: string;
    currentVersion?: string;
    complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;    
    complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList;
    create_skinny?: boolean;
  }): Promise<IAPApiProductDisplay> {
    const funcName = 'create_ApApiProductDisplay_From_ApiEntities';
    const logName = `${this.MiddleComponentName}.${funcName}()`;

    const apRawAttributeList: TAPRawAttributeList = this.create_ApRawAttributeList_From_ApiEntities({ connectorApiProduct: connectorApiProduct });

    const _base = this.create_ApManagedAssetDisplay_From_ApiEntities({
      id: connectorApiProduct.name,
      displayName: connectorApiProduct.displayName,
      apRawAttributeList: apRawAttributeList,
      default_ownerId: default_ownerId,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });

    // allow to create a skinny version of the api product
    let apApiDisplayList: TAPApiDisplayList = [];
    let apCombinedApiChannelParameterList: TAPApiChannelParameterList = [];
    let apControlledChannelParameterList: TAPControlledChannelParameterList = [];
    if(create_skinny === undefined || create_skinny === false) {
      // include all apis, parameter lists
      // get the used Apis
      apApiDisplayList = await APApisDisplayService.apiGetList_ApApiDisplay_For_ApiIdList({ 
        organizationId: organizationId, 
        apiIdList: connectorApiProduct.apis,
        default_ownerId: default_ownerId,
      });
      // create the combined channel parameter list across all apis
      apCombinedApiChannelParameterList = APApisDisplayService.create_Combined_ApiChannelParameterList({
        apApiDisplayList: apApiDisplayList
      });
      apControlledChannelParameterList = this.extract_ApControlledChannelParameterList({
        apAttributeDisplayList: _base.apExternal_ApAttributeDisplayList,
        apCombinedApiChannelParameterList: apCombinedApiChannelParameterList
      });
    }

    // get environments
    const apEnvironmentDisplayList: TAPEnvironmentDisplayList = [];
    if(connectorApiProduct.environments !== undefined) {
      connectorApiProduct.environments.forEach( (envId: string) => {
        const found: TAPEnvironmentDisplay | undefined = completeApEnvironmentDisplayList.find( (apEnvironmentDisplay: TAPEnvironmentDisplay) => {
          return apEnvironmentDisplay.apEntityId.id === envId;
        });
        if(found === undefined) throw new Error(`${logName}: found === undefined`);
        apEnvironmentDisplayList.push(found);
      });
    }
    // get combined protocols
    const apProtocolDisplayList: TAPProtocolDisplayList = APProtocolsDisplayService.create_SortedApProtocolDisplayList_From_ConnectorProtocolList({
      connectorProtocolList: connectorApiProduct.protocols
    });
   
    const apApiProductDisplay: IAPApiProductDisplay = {
      ..._base,

      devel_connectorApiProduct: connectorApiProduct,
      apApiProductConfigState: this.determine_ApApiProductConfigState(connectorApiProduct),
      apApiProductSource: this.determine_ApApiProductSource(_base.apConnector_ApAttributeDisplayList),
      apApiProductDocumentationDisplay: this.create_ApApiProductDocumentation(connectorApiProduct),
      apApprovalType: this.create_ApApprovalType(connectorApiProduct.approvalType),
      apClientOptionsDisplay: this.create_ApClientOptionsDisplay(connectorApiProduct.clientOptions),
      apDescription: connectorApiProduct.description ? connectorApiProduct.description : '',
      apApiProductCategoryDisplayName: this.CDefaultApiProductCategory,
      apApiDisplayList:  apApiDisplayList,
      apControlledChannelParameterList: apControlledChannelParameterList,
      apEnvironmentDisplayList: apEnvironmentDisplayList,
      apProtocolDisplayList: apProtocolDisplayList,
      // apApiProductImageUrl: this.CDefaultApiProductImageUrl,
      apVersionInfo: APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ 
        connectorMeta: connectorApiProduct.meta, 
        apVersionList: connectorRevisions,
        connectorRevisionList: connectorRevisions,
        currentVersion: currentVersion,
       }),
       apMetaInfo: APMetaInfoDisplayService.create_ApMetaInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta, apRawAttributeList: apRawAttributeList, apManagedAssetAttributePrefix: this.create_AP_ManagedAssetAttribute_Prefix() }),
       apAccessLevel: (connectorApiProduct.accessLevel ? connectorApiProduct.accessLevel : APAccessLevelDisplayService.get_Default_AccessLevel()),
       apLifecycleStageInfo: APLifecycleStageInfoDisplayService.create_ApLifecycleStageInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta }),
    };
    return apApiProductDisplay;
  }

  public filter_ApControlledChannelParameterList({ apControlledChannelParameterList, available_ApApiChannelParameterList }:{
    apControlledChannelParameterList: TAPControlledChannelParameterList;
    available_ApApiChannelParameterList: TAPApiChannelParameterList;
  }): TAPControlledChannelParameterList {
    const filtered_list: TAPControlledChannelParameterList = apControlledChannelParameterList.filter( (x: TAPControlledChannelParameter) => {
      const is_available = available_ApApiChannelParameterList.find((y) => {
        return y.apEntityId.id === x.apEntityId.id;
      });
      if(is_available !== undefined) return true;
      return false;
    });
    return filtered_list;
  }

  public create_Combined_ApControlledChannelParameterList({ apApiProductDisplayList }: {
    apApiProductDisplayList: TAPApiProductDisplayList;
  }): TAPControlledChannelParameterList {
    const combined_ApControlledChannelParameterList: TAPControlledChannelParameterList = [];

    for(const apApiProductDisplay of apApiProductDisplayList) {
      for(const apControlledChannelParameter of apApiProductDisplay.apControlledChannelParameterList) {
        const existing_ApControlledChannelParameter: TAPControlledChannelParameter | undefined = combined_ApControlledChannelParameterList.find( (x) => {
          return x.apEntityId.id === apControlledChannelParameter.apEntityId.id;
        });
        if(existing_ApControlledChannelParameter !== undefined) {
          // merge values and update
          const existing_value_list: Array<string> = existing_ApControlledChannelParameter.value.split(',');
          const new_value_list: Array<string> = existing_value_list.concat(apControlledChannelParameter.value.split(','));
          // dedup and set
          apControlledChannelParameter.value = Globals.deDuplicateStringList(new_value_list).join(',');
        }
        combined_ApControlledChannelParameterList.push(apControlledChannelParameter);
      }
    }
    return combined_ApControlledChannelParameterList;
  }


  public get_SelectList_For_QueueGranularity(): Array<ClientOptionsGuaranteedMessaging.queueGranularity> {
    const e: any = ClientOptionsGuaranteedMessaging.queueGranularity;
    return Object.keys(e).map(k => e[k]);
  }

  public get_SelectList_For_QueueAccessType(): Array<ClientOptionsGuaranteedMessaging.accessType> {
    const e: any = ClientOptionsGuaranteedMessaging.accessType;
    return Object.keys(e).map(k => e[k]);
  }

  public get_SelectList_For_ApprovalType(): Array<APIProduct.approvalType> {
    const e: any = APIProduct.approvalType;
    return Object.keys(e).map(k => e[k]);
  }  

  public get_SelectList_For_AccessLevel(): Array<APIProductAccessLevel> {
    const e: any = APIProductAccessLevel;
    return Object.keys(e).map(k => e[k]);
  }  

  protected get_IsDeleteAllowed({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay | IAPApiProductDisplay4List;
  }): boolean {
    return true;
  }

  public get_ApiProductDisplay_General({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): TAPApiProductDisplay_General {
    const apApiProductDisplay_General: TAPApiProductDisplay_General = {
      apEntityId: apApiProductDisplay.apEntityId,
      apDescription: apApiProductDisplay.apDescription,
      apApiProductCategoryDisplayName: apApiProductDisplay.apApiProductCategoryDisplayName,
      apVersionInfo: apApiProductDisplay.apVersionInfo,
    };
    return apApiProductDisplay_General;
  }

  /**
   * Set the general properties. 
   * Sets the apEntity as well. 
   * @returns the modified apApiProductDisplay (not a copy)
  */
  public set_ApiProductDisplay_General({ apApiProductDisplay, apApiProductDisplay_General }:{
    apApiProductDisplay: IAPApiProductDisplay;
    apApiProductDisplay_General: TAPApiProductDisplay_General;
  }): IAPApiProductDisplay {
    apApiProductDisplay.apDescription = apApiProductDisplay_General.apDescription;
    apApiProductDisplay.apApiProductCategoryDisplayName = apApiProductDisplay_General.apApiProductCategoryDisplayName;
    apApiProductDisplay.apEntityId = apApiProductDisplay_General.apEntityId;
    apApiProductDisplay.apVersionInfo = apApiProductDisplay_General.apVersionInfo;
    return apApiProductDisplay;
  }

  public get_ApiProductDisplay_Documentation({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): TAPApiProductDisplay_Documentation {
    const apApiProductDisplay_Documentation: TAPApiProductDisplay_Documentation = {
      apEntityId: apApiProductDisplay.apEntityId,
      apApiProductDocumentationDisplay: apApiProductDisplay.apApiProductDocumentationDisplay
    };
    return apApiProductDisplay_Documentation;
  }

  public set_ApiProductDisplay_Documentation({ apApiProductDisplay, apApiProductDisplay_Documentation }:{
    apApiProductDisplay: IAPApiProductDisplay;
    apApiProductDisplay_Documentation: TAPApiProductDisplay_Documentation;
  }): IAPApiProductDisplay {
    apApiProductDisplay.apApiProductDocumentationDisplay = apApiProductDisplay_Documentation.apApiProductDocumentationDisplay;
    return apApiProductDisplay;
  }

  public get_ApApiProductDisplay_Policies({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): TAPApiProductDisplay_Policies {
    const apApiProductDisplay_Policies: TAPApiProductDisplay_Policies = {
      apEntityId: apApiProductDisplay.apEntityId,
      apApprovalType: apApiProductDisplay.apApprovalType,
      apClientOptionsDisplay: apApiProductDisplay.apClientOptionsDisplay,
    };
    return apApiProductDisplay_Policies;
  }

  /** 
   * Set the policy properties. 
   * Does NOT set the apEntityId. 
   * @returns the modified apApiProductDisplay (not a copy)
  */
   public set_ApApiProductDisplay_Policies({ apApiProductDisplay, apApiProductDisplay_Policies }:{
    apApiProductDisplay: IAPApiProductDisplay;
    apApiProductDisplay_Policies: TAPApiProductDisplay_Policies;
  }): IAPApiProductDisplay {
    apApiProductDisplay.apApprovalType = apApiProductDisplay_Policies.apApprovalType;
    apApiProductDisplay.apClientOptionsDisplay = apApiProductDisplay_Policies.apClientOptionsDisplay;
    return apApiProductDisplay;
  }

  public get_ApApiProductDisplay_Environments({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): TAPApiProductDisplay_Environments {
    const apApiProductDisplay_Environments: TAPApiProductDisplay_Environments = {
      apEntityId: apApiProductDisplay.apEntityId,
      apEnvironmentDisplayList: apApiProductDisplay.apEnvironmentDisplayList,
      apProtocolDisplayList: apApiProductDisplay.apProtocolDisplayList
    };
    return apApiProductDisplay_Environments;
  }

  /** 
   * Set the environment properties. 
   * Does NOT set the apEntityId. 
   * @returns the modified apApiProductDisplay (not a copy)
  */
   public set_ApApiProductDisplay_Environments({ apApiProductDisplay, apApiProductDisplay_Environments }:{
    apApiProductDisplay: IAPApiProductDisplay;
    apApiProductDisplay_Environments: TAPApiProductDisplay_Environments;
  }): IAPApiProductDisplay {
    apApiProductDisplay.apEnvironmentDisplayList = apApiProductDisplay_Environments.apEnvironmentDisplayList;
    apApiProductDisplay.apProtocolDisplayList = apApiProductDisplay_Environments.apProtocolDisplayList;
    return apApiProductDisplay;
  }

  public get_ApApiProductDisplay_Apis({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): TAPApiProductDisplay_Apis {
    const apApiProductDisplay_Apis: TAPApiProductDisplay_Apis = {
      apEntityId: apApiProductDisplay.apEntityId,
      apApiDisplayList: apApiProductDisplay.apApiDisplayList,
      apControlledChannelParameterList: apApiProductDisplay.apControlledChannelParameterList,      
    };
    return apApiProductDisplay_Apis;
  }

  /** 
   * Set the api properties. 
   * Does NOT set the apEntityId. 
   * Makes a copy of apApiProductDisplay_Apis.
  */
  public set_ApApiProductDisplay_Apis({ apApiProductDisplay, apApiProductDisplay_Apis }:{
    apApiProductDisplay: IAPApiProductDisplay;
    apApiProductDisplay_Apis: TAPApiProductDisplay_Apis;
  }): IAPApiProductDisplay {

    apApiProductDisplay.apApiDisplayList = JSON.parse(JSON.stringify(apApiProductDisplay_Apis.apApiDisplayList));
    apApiProductDisplay.apControlledChannelParameterList = JSON.parse(JSON.stringify(apApiProductDisplay_Apis.apControlledChannelParameterList));

    return apApiProductDisplay;
  }

  public get_ApApiProductDisplay_PublishDestinationInfo({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): TAPApiProductDisplay_PublishDestinationInfo {
    const apApiProductDisplay_PublishDestinationInfo: TAPApiProductDisplay_PublishDestinationInfo = {
      apEntityId: apApiProductDisplay.apEntityId,
      apPublishDestinationInfo: apApiProductDisplay.apPublishDestinationInfo,
    };
    return apApiProductDisplay_PublishDestinationInfo;
  }
  /** 
   * Does NOT set the apEntityId. 
   * @returns the modified apApiProductDisplay (not a copy)
  */
   public set_ApApiProductDisplay_PublishDestinationInfo({ apApiProductDisplay, apApiProductDisplay_PublishDestinationInfo }:{
    apApiProductDisplay: IAPApiProductDisplay;
    apApiProductDisplay_PublishDestinationInfo: TAPApiProductDisplay_PublishDestinationInfo;
  }): IAPApiProductDisplay {
    apApiProductDisplay.apPublishDestinationInfo = apApiProductDisplay_PublishDestinationInfo.apPublishDestinationInfo;
    return apApiProductDisplay;
  }

  public get_ApApiProductDisplay_AccessAndState({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): TAPApiProductDisplay_AccessAndState {
    const apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState = {
      ...this.get_ApManagedAssetDisplay_AccessAndState({ apManagedAssetDisplay: apApiProductDisplay }),
      apEntityId: apApiProductDisplay.apEntityId,
      apAccessLevel: apApiProductDisplay.apAccessLevel,
      apLifecycleStageInfo: apApiProductDisplay.apLifecycleStageInfo,
      apPublishDestinationInfo: apApiProductDisplay.apPublishDestinationInfo,
    };
    return apApiProductDisplay_AccessAndState;
  }

  /** 
   * Set the access & state properties. 
   * Does NOT set the apEntityId. 
   * @returns the modified apApiProductDisplay (not a copy)
  */
   public set_ApApiProductDisplay_AccessAndState({ apApiProductDisplay, apApiProductDisplay_AccessAndState }:{
    apApiProductDisplay: IAPApiProductDisplay;
    apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState;
  }): IAPApiProductDisplay {
    this.set_ApManagedAssetDisplay_AccessAndState({ apManagedAssetDisplay: apApiProductDisplay, apManagedAssetDisplay_AccessAndState: apApiProductDisplay_AccessAndState });
    apApiProductDisplay.apAccessLevel = apApiProductDisplay_AccessAndState.apAccessLevel;
    apApiProductDisplay.apLifecycleStageInfo = apApiProductDisplay_AccessAndState.apLifecycleStageInfo;
    apApiProductDisplay.apPublishDestinationInfo = apApiProductDisplay_AccessAndState.apPublishDestinationInfo;
    return apApiProductDisplay;
  }

  public async create_Complete_ApAttributeList({ organizationId, apManagedAssetDisplay }:{
    organizationId: string;
    apManagedAssetDisplay: IAPApiProductDisplay;
  }): Promise<TAPAttributeDisplayList> {
    // const funcName = 'create_Complete_ApAttributeList';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    const _complete_ApAttributeList: TAPAttributeDisplayList = await super.create_Complete_ApAttributeList({
      organizationId: organizationId,
      apManagedAssetDisplay: apManagedAssetDisplay,
      // includeManagedAssetsAttributes: true
    });

    // add controlled channel parameters
    const apApiProductDisplay: IAPApiProductDisplay = apManagedAssetDisplay as IAPApiProductDisplay;
    for(const apControlledChannelParameter of apApiProductDisplay.apControlledChannelParameterList) {
      _complete_ApAttributeList.push({
        apEntityId: apControlledChannelParameter.apEntityId,
        value: apControlledChannelParameter.value
      });  
    }
    return _complete_ApAttributeList;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  protected clean_ConnectorApiProduct = ({ connectorApiProduct }:{
    connectorApiProduct: APIProduct;
  }): APIProduct => {
    const filteredAttributes: attributes = connectorApiProduct.attributes.filter( (x) => {
      return x !== null;
    });
    connectorApiProduct.attributes = filteredAttributes;
    if(connectorApiProduct.meta !== undefined && connectorApiProduct.meta.attributes !== undefined) {
      const filteredMetaAttributes: attributes = connectorApiProduct.meta.attributes.filter( (x) => {
        return x !== null;
      });
      connectorApiProduct.meta.attributes = filteredMetaAttributes;
    }
    return connectorApiProduct;
  }

  protected ApiProductsService_listApiProducts = async ({ organizationId, filter }:{
    organizationId: string;
    filter?: string;
  }): Promise<Array<APIProduct>> => {

    const connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId,
      filter: filter
    });

    // workaround
    // filter all attributes that are null
    // meta and object
    for(const connectorApiProduct of connectorApiProductList) {

      this.clean_ConnectorApiProduct({ connectorApiProduct: connectorApiProduct });

    }
    return connectorApiProductList;
  }

  protected ApiProductsService_getApiProduct = async({ organizationId, apiProductId }:{
    organizationId: string;
    apiProductId: string;

  }): Promise<APIProduct> => {

    const connectorApiProduct: APIProduct = await ApiProductsService.getApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId
    });

    return this.clean_ConnectorApiProduct({ connectorApiProduct: connectorApiProduct });
  }

  public async apiCheck_ApApiProductDisplay_Exists({ organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<boolean> {
    try {
      await ApiProductsService.getApiProduct({
        organizationName: organizationId,
        apiProductName: apiProductId
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

  /**
   * Retrieves the unfiltered list of APIProducts.
   */
  protected apiGetUnfilteredList_ConnectorApiProductList = async({ organizationId }: {
    organizationId: string;
  }): Promise<Array<APIProduct>> => {

    const connectorApiProductList: Array<APIProduct> = await this.ApiProductsService_listApiProducts({
      organizationId: organizationId,
    });

    return connectorApiProductList;
  }

  // /**
  //  * Use APS Api instead of connector API.
  //  * @param param0 
  //  * @returns 
  //  */
  // protected apsGetList_ListAPSApiProductsResponse = async({ organizationId, businessGroupIdList, accessLevelList, exclude_ApiProductIdList, apiProductIdList }: {
  //   organizationId: string;
  //   businessGroupIdList: Array<string>;
  //   accessLevelList?: Array<APIProductAccessLevel>;
  //   exclude_ApiProductIdList?: Array<string>;
  //   apiProductIdList?: Array<string>;

  // }): Promise<ListAPSApiProductsResponse> => {
  //   const funcName = 'apsGetFilteredList_ConnectorApiProduct';
  //   const logName = `${this.MiddleComponentName}.${funcName}()`;

  //   const listAPSApiProductsResponse: ListAPSApiProductsResponse = await ApsApiProductsService.listApsApiProducts({
  //     organizationId: organizationId,
  //     businessGroupIdList: businessGroupIdList,
  //     accessLevelList: accessLevelList,
  //     excludeApiProductIdList: exclude_ApiProductIdList,
  //     apiProductIdList: apiProductIdList,
  //     pageNumber: 1,
  //     pageSize: 100,
  //     searchWordList: 'one two three',
  //     sortDirection: EAPSSortDirection.ASC,
  //     sortFieldName: 'sortFieldName',
  //   });
  //   // console.log(`${logName}: listAPSApiProductsResponse=${JSON.stringify(listAPSApiProductsResponse, null, 2)}`);
  //   // const list: APSApiProductResponseList = listAPSApiProductsResponse.list;
  //   // const cleanConnectorApiProductList: Array<APIProduct> = [];
  //   // for(const apsApiProductResponse of list) {
  //   //   const connectorApiProduct: APIProduct = this.filter_ConnectorApiProduct( { connectorApiProduct: apsApiProductResponse.connectorApiProduct });
  //   //   connectorApiProductList.push(connectorApiProduct);
  //   // }
  //   return listAPSApiProductsResponse;
  // }

  protected apiGetFilteredList_ConnectorApiProduct = async({ organizationId, businessGroupIdList, includeAccessLevelList, exclude_ApiProductIdList }: {
    organizationId: string;
    businessGroupIdList: Array<string>;
    includeAccessLevelList?: Array<APIProductAccessLevel>;
    exclude_ApiProductIdList?: Array<string>;
  }): Promise<Array<APIProduct>> => {
    // const funcName = 'apiGetFilteredList_ConnectorApiProduct';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    const completeConnectorApiProductList: Array<APIProduct> = await this.ApiProductsService_listApiProducts({
      organizationId: organizationId,
    });

    const filteredConnectorApiProductList: Array<APIProduct> = [];
    if(businessGroupIdList.length > 0) {
      const owningBusinessGroup_AttributeName: string = this.get_AttributeName_OwningBusinessGroupId();
      const sharingBusinessGroup_AttributeName: string = this.get_AttributeName_SharingBusinessGroupId();
      for(const connectorApiProduct of completeConnectorApiProductList) {
        let exclude: boolean = false;
        let add2List: boolean = false;
        if(exclude_ApiProductIdList && exclude_ApiProductIdList.length > 0) {
          const foundExclude = exclude_ApiProductIdList.find( (id: string) => {
            return id === connectorApiProduct.name;
          });
          if(foundExclude !== undefined) exclude = true;
        }
        if(!exclude) {
          if(includeAccessLevelList !== undefined && connectorApiProduct.accessLevel !== undefined) {
            add2List = includeAccessLevelList.includes(connectorApiProduct.accessLevel);
          }
          const apRawAttributeList: TAPRawAttributeList = this.create_ApRawAttributeList_From_ApiEntities({
            connectorApiProduct: connectorApiProduct
          });
          const owningAttribute = apRawAttributeList.find( (x) => {
            return x.name === owningBusinessGroup_AttributeName;
          });
          const sharingAttribute = apRawAttributeList.find( (x) => {
            return x.name === sharingBusinessGroup_AttributeName;
          });
          // check if attributes contain any id is the list
          for(const businessGroupId of businessGroupIdList) {
            if(
              (owningAttribute !== undefined && owningAttribute.value.includes(businessGroupId)) ||
              (sharingAttribute !== undefined && sharingAttribute.value.includes(businessGroupId))
            ) {
              // don't add again if already in
              const found = filteredConnectorApiProductList.find( (x) => {
                return x.name === connectorApiProduct.name;
              });
              if(found === undefined) add2List = true;  
            }
          }
          if(add2List) {
            filteredConnectorApiProductList.push(connectorApiProduct);  
          }
        }
      }
    }
    return filteredConnectorApiProductList;
  }

  
  /**
   * Retrieves a list of APIProducts filtered by:
   * - owningBusinessGroupId = businessGroupId 
   * - sharingBusinessGroupIdList contains businessGroupId
   */
  protected deleteme_apiGetList_ConnectorApiProductList = async({ organizationId, businessGroupId, includeAccessLevelList }: {
    organizationId: string;
    businessGroupId?: string;
    includeAccessLevelList?: Array<APIProductAccessLevel>;
  }): Promise<Array<APIProduct>> => {
    const funcName = 'deleteme_apiGetList_ConnectorApiProductList';
    const logName = `${this.MiddleComponentName}.${funcName}()`;

    alert(`${logName}: optimize me ...`)

    const connectorApiProductList: Array<APIProduct> = [];
    // get the business group Id first
    let filter: string | undefined = undefined;
    if(businessGroupId !== undefined) {
      filter = this.create_ConnectorFilter_For_Attribute({
        attributeName: this.get_AttributeName_OwningBusinessGroupId(),
        attributeValue: businessGroupId
      });
    }

    const businessGroupConnectorApiProductList: Array<APIProduct> = await this.ApiProductsService_listApiProducts({
      organizationId: organizationId,
      filter: filter
    });
    // console.log(`${logName}: filter = ${filter}`);
    // console.log(`${logName}: businessGroupConnectorApiProductList=${JSON.stringify(businessGroupConnectorApiProductList, null, 2)}`);

    // TODO: filter again, until connector search is fixed
    if(businessGroupId !== undefined) {
      const owningBusinessGroup_AttributeName: string = this.get_AttributeName_OwningBusinessGroupId();
      for(const connectorApiProduct of businessGroupConnectorApiProductList) {
        const attribute = connectorApiProduct.attributes.find( (x) => {
          return x.name === owningBusinessGroup_AttributeName;
        });
        if(attribute !== undefined && attribute.value.includes(businessGroupId)) {
          connectorApiProductList.push(connectorApiProduct);
        }
      }
    }
    // now get the sharing business group ids
    if(businessGroupId !== undefined) {
      filter = this.create_ConnectorFilter_For_Attribute({
        attributeName: this.get_AttributeName_SharingBusinessGroupId(),
        attributeValue: businessGroupId
      });
      const sharingConnectorApiProductList: Array<APIProduct> = await this.ApiProductsService_listApiProducts({
        organizationId: organizationId,
        filter: filter
      });
      // console.log(`${logName}: sharing filter = ${filter}`);
      // console.log(`${logName}: sharingConnectorApiProductList=${JSON.stringify(sharingConnectorApiProductList, null, 2)}`);
      // TODO: filter again, until connector search is fixed
      const sharingBusinessGroup_AttributeName: string = this.get_AttributeName_SharingBusinessGroupId();
      for(const connectorApiProduct of sharingConnectorApiProductList) {
        const attribute = connectorApiProduct.attributes.find( (x) => {
          return x.name === sharingBusinessGroup_AttributeName;
        });
        if(attribute !== undefined && attribute.value.includes(businessGroupId)) {
          connectorApiProductList.push(connectorApiProduct);
        }
      }
    }

    // now include all products not in businessGroup but with accessLevel in list
    if(includeAccessLevelList !== undefined) {
      const accessLevelConnectorApiProductList: Array<APIProduct> = await this.ApiProductsService_listApiProducts({
        organizationId: organizationId,
      });
      for(const connectorApiProduct of accessLevelConnectorApiProductList) {
        if(connectorApiProduct.accessLevel !== undefined) {
          if(includeAccessLevelList.includes(connectorApiProduct.accessLevel)) {
            // add if not in list already
            const found = connectorApiProductList.find( (x) => {
              return x.name === connectorApiProduct.name;
            });
            if(found === undefined) connectorApiProductList.push(connectorApiProduct);
          }
        }
      }
    }
    return connectorApiProductList;
  }

  protected async apiUpdate({ organizationId, apiProductId, apiProductPatch, apRawAttributeList } : {
    organizationId: string;
    apiProductId: string;
    apiProductPatch: APIProductPatch;    
    apRawAttributeList?: TAPRawAttributeList;    
  }): Promise<void> {
    // const funcName = 'apiUpdate';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;
    // alert(`${logName}: apiProductUpdate=${JSON.stringify(apiProductUpdate, null, 2)}`);
    const update: APIProductPatch = {
      ...apiProductPatch,
      attributes: apRawAttributeList
    }
    await ApiProductsService.updateApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId,
      requestBody: update
    });  
  
  }

  protected apiUpdate_ApplyRules({apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): IAPApiProductDisplay {
    // // only allow state=released to be published on marketplaces
    // if(apApiProductDisplay.apLifecycleStageInfo.stage !== MetaEntityStage.RELEASED) {
    //   apApiProductDisplay.apPublishDestinationInfo.apExternalSystemEntityIdList = [];
    // }
    return apApiProductDisplay;
  }

  public async apiUpdate_ApApiProductDisplay({ organizationId, apApiProductDisplay, userId }:{
    organizationId: string;
    apApiProductDisplay: IAPApiProductDisplay;
    userId: string;
  }): Promise<void> { 
    // const funcName = 'apiUpdate_ApApiProductDisplay';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);
   
    apApiProductDisplay = this.apiUpdate_ApplyRules({ apApiProductDisplay: apApiProductDisplay });

    const update: APIProductPatch = {
      displayName: apApiProductDisplay.apEntityId.displayName,
      description: apApiProductDisplay.apDescription,
      approvalType: this.create_ConnectorApprovalType(apApiProductDisplay.apApprovalType),
      clientOptions: this.create_ConnectorClientOptions(apApiProductDisplay.apClientOptionsDisplay),
      environments: APEntityIdsService.create_IdList_From_ApDisplayObjectList(apApiProductDisplay.apEnvironmentDisplayList),
      protocols: APProtocolsDisplayService.create_ConnectorProtocols_From_ApProtocolDisplayList({ 
        apProtocolDisplayList: apApiProductDisplay.apProtocolDisplayList
      }),
      apis: APEntityIdsService.create_IdList_From_ApDisplayObjectList(apApiProductDisplay.apApiDisplayList),
      meta: {
        version: apApiProductDisplay.apVersionInfo.apCurrentVersion,
        stage: apApiProductDisplay.apLifecycleStageInfo.stage,
        // now set by connector from token
        // lastModifiedBy: userId,
      },
      accessLevel: apApiProductDisplay.apAccessLevel
    };

    // always update with the full attribute list
    const apRawAttributeList: TAPRawAttributeList = await this.create_Complete_ApRawAttributeList({
      organizationId: organizationId,
      apManagedAssetDisplay: apApiProductDisplay
    });
    await this.apiUpdate({
      organizationId: organizationId,
      apiProductId: apApiProductDisplay.apEntityId.id,
      apiProductPatch: update,
      apRawAttributeList: apRawAttributeList
    });

  }

  public async apiCreate_ApApiProductDisplay({ organizationId, apApiProductDisplay, userId }: {
    organizationId: string;
    apApiProductDisplay: IAPApiProductDisplay;
    userId: string;
  }): Promise<void> {
    // const funcName = 'apiCreate_ApApiProductDisplay';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;
    // // test upstream error handling
    // throw new Error(`${logName}: test error handling`);

    const apRawAttributeList: TAPRawAttributeList = await this.create_Complete_ApRawAttributeList({ 
      organizationId: organizationId,
      apManagedAssetDisplay: apApiProductDisplay 
    });
    const create: APIProduct = {
      apis: APEntityIdsService.create_IdList_From_ApDisplayObjectList(apApiProductDisplay.apApiDisplayList),
      approvalType: this.create_ConnectorApprovalType(apApiProductDisplay.apApprovalType),
      accessLevel: apApiProductDisplay.apAccessLevel,
      displayName: apApiProductDisplay.apEntityId.displayName,
      name: apApiProductDisplay.apEntityId.id,
      description: apApiProductDisplay.apDescription,
      pubResources: [],
      subResources: [],
      // accessLevel: 
      attributes: apRawAttributeList,
      environments: APEntityIdsService.create_IdList_From_ApDisplayObjectList(apApiProductDisplay.apEnvironmentDisplayList),
      protocols: APProtocolsDisplayService.create_ConnectorProtocols_From_ApProtocolDisplayList({ 
        apProtocolDisplayList: apApiProductDisplay.apProtocolDisplayList
      }),
      clientOptions: this.create_ConnectorClientOptions(apApiProductDisplay.apClientOptionsDisplay),
      meta: {
        version: apApiProductDisplay.apVersionInfo.apCurrentVersion,
        stage: apApiProductDisplay.apLifecycleStageInfo.stage,
        createdBy: userId
      }
    }

    await ApiProductsService.createApiProduct({
      organizationName: organizationId,
      requestBody: create
    });  
  }
  
  public async apiDelete_ApApiProductDisplay({ organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<void> {

    await ApiProductsService.deleteApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId
    });
  }

}