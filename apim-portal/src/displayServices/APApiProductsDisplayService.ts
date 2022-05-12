import { 
  ApiError,
  APIProduct,
  APIProductAccessLevel,
  APIProductPatch,
  ApiProductsService,
  ClientOptions,
  ClientOptionsGuaranteedMessaging,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from '../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
} from '../utils/APEntityIdsService';
import { Globals } from '../utils/Globals';
import APAccessLevelDisplayService from './APAccessLevelDisplayService';
import APApisDisplayService, { 
  TAPApiChannelParameter, 
  TAPApiChannelParameterList, 
  TAPApiDisplayList 
} from './APApisDisplayService';
import APAttributesDisplayService, {
  IAPAttributeDisplay,
  TAPAttributeDisplayList,
  TAPRawAttributeList, 
} from './APAttributesDisplayService/APAttributesDisplayService';
import { TAPBusinessGroupDisplayList } from './APBusinessGroupsDisplayService';
import { 
  TAPEnvironmentDisplay, 
  TAPEnvironmentDisplayList 
} from './APEnvironmentsDisplayService';
import { TAPExternalSystemDisplayList } from './APExternalSystemsDisplayService';
import { 
  APManagedAssetDisplayService, 
  IAPManagedAssetDisplay,
  TAPManagedAssetDisplay_AccessAndState,
  TAPManagedAssetLifecycleInfo,
  TAPManagedAssetPublishDestinationInfo,
} from './APManagedAssetDisplayService';
import APMetaInfoDisplayService, { TAPMetaInfo } from './APMetaInfoDisplayService';
import APProtocolsDisplayService, { 
  TAPProtocolDisplayList 
} from './APProtocolsDisplayService';
import APVersioningDisplayService, { IAPVersionInfo } from './APVersioningDisplayService';

export type TAPControlledChannelParameter = IAPAttributeDisplay;
export type TAPControlledChannelParameterList = Array<TAPControlledChannelParameter>;
export enum EAPApprovalType {
  MANUAL = "manual",
  AUTO = "auto"
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
  apLifecycleInfo: TAPManagedAssetLifecycleInfo;
  apAccessLevel: APIProductAccessLevel;
  apPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo;
}

export type TAPClientOptionsGuaranteedMessagingDisplay = {
  requireQueue: boolean;
  accessType: ClientOptionsGuaranteedMessaging.accessType;
  maxTtl: number;
  maxMsgSpoolUsage: number;
}
export type TAPClientOptionsDisplay = {
  apGuaranteedMessaging: TAPClientOptionsGuaranteedMessagingDisplay;  
}
export interface IAPApiProductDisplay extends IAPManagedAssetDisplay {
  // keep for devel purposes only
  devel_connectorApiProduct: APIProduct;

  // General
  apDescription: string;
  apApiProductCategoryDisplayName: string;

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

  // access & state
  apAccessLevel: APIProductAccessLevel;
}
export type TAPApiProductDisplayList = Array<IAPApiProductDisplay>;

export abstract class APApiProductsDisplayService extends APManagedAssetDisplayService {
  private readonly MiddleComponentName = "APApiProductsDisplayService";

  private readonly CDefaultApiProductCategory = 'Solace AsyncAPI';
  private readonly CDefaultApiProductImageUrl = 'https://www.primefaces.org/primereact/showcase/showcase/demo/images/product/chakra-bracelet.jpg';

  public nameOf<IAPApiProductDisplay>(name: keyof IAPApiProductDisplay) {
    return name;
  }

  // private filterConnectorApiProductList(connectorApiProductList: Array<APIProduct>, includeAccessLevel?: APIProductAccessLevel): Array<APIProduct> {
  //   if(includeAccessLevel === undefined) return connectorApiProductList;
  //   const indicesToDelete: Array<number> = connectorApiProductList.map( (connectorApiProduct: APIProduct, idx: number) => {
  //     // return -1 if not found, otherwise the actual index
  //     if(connectorApiProduct.accessLevel?.includes(includeAccessLevel)) return -1;
  //     else return idx;
  //   }).filter(idx => idx !== -1); // filter all indeces === -1 out
  //   for(let idx = indicesToDelete.length -1; idx >= 0; idx--) {
  //     connectorApiProductList.splice(indicesToDelete[idx], 1);
  //   }
  //   return connectorApiProductList;
  // }

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
        maxTtl: 1
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
      requireQueue: connectorClientOptions.guaranteedMessaging.requireQueue ? connectorClientOptions.guaranteedMessaging.requireQueue : false
    }
    const apClientOptionsDisplay: TAPClientOptionsDisplay = {
      apGuaranteedMessaging: apGuaranteedMessaging,
    };
    return apClientOptionsDisplay;
  }

  private create_ConnectorClientOptions(apClientOptionsDisplay: TAPClientOptionsDisplay): ClientOptions {
    const clientOptionsGuaranteedMessaging: ClientOptionsGuaranteedMessaging | undefined = apClientOptionsDisplay.apGuaranteedMessaging;
    const connectorClientOptions: ClientOptions = {
      guaranteedMessaging: clientOptionsGuaranteedMessaging,
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

      apDescription: '',
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

    const _base = this.create_ApManagedAssetDisplay_From_ApiEntities({
      id: connectorApiProduct.name,
      displayName: connectorApiProduct.displayName,
      apRawAttributeList: connectorApiProduct.attributes,
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
      apApiDisplayList = await APApisDisplayService.apiGetList_ApApiDisplay_For_ApiIdList({ organizationId: organizationId, apiIdList: connectorApiProduct.apis });
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
        connectorRevisions: connectorRevisions,
        currentVersion: currentVersion,
       }),
       apMetaInfo: APMetaInfoDisplayService.create_ApMetaInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta }),
       apAccessLevel: (connectorApiProduct.accessLevel ? connectorApiProduct.accessLevel : APAccessLevelDisplayService.get_Default_AccessLevel())
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
    apApiProductDisplay: IAPApiProductDisplay;
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
    apApiProductDisplay_General: TAPApiProductDisplay_General
  }): IAPApiProductDisplay {
    apApiProductDisplay.apDescription = apApiProductDisplay_General.apDescription;
    apApiProductDisplay.apApiProductCategoryDisplayName = apApiProductDisplay_General.apApiProductCategoryDisplayName;
    apApiProductDisplay.apEntityId = apApiProductDisplay_General.apEntityId;
    apApiProductDisplay.apVersionInfo = apApiProductDisplay_General.apVersionInfo;
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

  public get_ApApiProductDisplay_AccessAndState({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): TAPApiProductDisplay_AccessAndState {
    const apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState = {
      ...this.get_ApManagedAssetDisplay_AccessAndState({ apManagedAssetDisplay: apApiProductDisplay }),
      apEntityId: apApiProductDisplay.apEntityId,
      apAccessLevel: apApiProductDisplay.apAccessLevel,
      apLifecycleInfo: apApiProductDisplay.apLifecycleInfo,
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
    apApiProductDisplay.apLifecycleInfo = apApiProductDisplay_AccessAndState.apLifecycleInfo;
    apApiProductDisplay.apPublishDestinationInfo = apApiProductDisplay_AccessAndState.apPublishDestinationInfo;
    return apApiProductDisplay;
  }

  public async create_Complete_ApAttributeList({ organizationId, apManagedAssetDisplay }:{
    organizationId: string;
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): Promise<TAPAttributeDisplayList> {

    const _complete_ApAttributeList: TAPAttributeDisplayList = await super.create_Complete_ApAttributeList({
      organizationId: organizationId,
      apManagedAssetDisplay: apManagedAssetDisplay
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

  public async create_Complete_ApRawAttributeList({ organizationId, apManagedAssetDisplay }:{
    organizationId: string;
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): Promise<TAPRawAttributeList> {
    const rawAttributeList: TAPRawAttributeList = APAttributesDisplayService.create_ApRawAttributeList({
      apAttributeDisplayList: await this.create_Complete_ApAttributeList({ 
        organizationId: organizationId,
        apManagedAssetDisplay: apManagedAssetDisplay 
      })
    });
    return rawAttributeList;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

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

    const connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId,
    });

    return connectorApiProductList;
  }
  
  /**
   * Retrieves a list of APIProducts filtered by:
   * - owningBusinessGroupId = businessGroupId 
   * - sharingBusinessGroupIdList contains businessGroupId
   */
  protected apiGetList_ConnectorApiProductList = async({ organizationId, businessGroupId, includeAccessLevelList }: {
    organizationId: string;
    businessGroupId?: string;
    includeAccessLevelList?: Array<APIProductAccessLevel>;
  }): Promise<Array<APIProduct>> => {
    // const funcName = 'apiGetList_ConnectorApiProductList';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    const connectorApiProductList: Array<APIProduct> = [];
    // get the business group Id first
    let filter: string | undefined = undefined;
    if(businessGroupId !== undefined) {
      filter = this.create_ConnectorFilter_For_Attribute({
        attributeName: this.get_AttributeName_OwningBusinessGroupId(),
        attributeValue: businessGroupId
      });
    }

    const businessGroupConnectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId,
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
      const sharingConnectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
        organizationName: organizationId,
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
      const accessLevelConnectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
        organizationName: organizationId,
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

    // const patch: APIProductPatch = {
  //   displayName: apiProduct.displayName,
  //   description: apiProduct.description,
  //   approvalType: apiProduct.approvalType,
  //   attributes: apiProduct.attributes,
  //   clientOptions: apiProduct.clientOptions,
  //   environments: apiProduct.environments,
  //   protocols: apiProduct.protocols,
  //   pubResources: apiProduct.pubResources,
  //   subResources: apiProduct.subResources,
  //   apis: apiProduct.apis,
  //   accessLevel: apiProduct.accessLevel
  // };


  protected async apiUpdate({ organizationId, apiProductId, apiProductUpdate, apRawAttributeList }:{
    organizationId: string;
    apiProductId: string;
    apiProductUpdate: APIProductPatch;    
    apRawAttributeList: TAPRawAttributeList;    
  }): Promise<void> {
    // const funcName = 'apiUpdate';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;
    // alert(`${logName}: apiProductUpdate=${JSON.stringify(apiProductUpdate, null, 2)}`);
    const update: APIProductPatch = {
      ...apiProductUpdate,
      attributes: apRawAttributeList
    }
    await ApiProductsService.updateApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId,
      requestBody: update
    });  
  
  }

  public async apiUpdate_ApApiProductDisplay({ organizationId, apApiProductDisplay }:{
    organizationId: string;
    apApiProductDisplay: IAPApiProductDisplay;
  }): Promise<void> { 

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
      },
      accessLevel: apApiProductDisplay.apAccessLevel
    };

    // always update with the full attribute list
    await this.apiUpdate({
      organizationId: organizationId,
      apiProductId: apApiProductDisplay.apEntityId.id,
      apiProductUpdate: update,
      apRawAttributeList: await this.create_Complete_ApRawAttributeList({
        organizationId: organizationId,
        apManagedAssetDisplay: apApiProductDisplay
      })
    });

  }

  public async apiCreate_ApApiProductDisplay({ organizationId, apApiProductDisplay }: {
    organizationId: string;
    apApiProductDisplay: IAPApiProductDisplay;
  }): Promise<void> {
    // const funcName = 'apiCreate_ApApiProductDisplay';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    const apRawAttributeList: TAPRawAttributeList = await this.create_Complete_ApRawAttributeList({ 
      organizationId: organizationId,
      apManagedAssetDisplay: apApiProductDisplay 
    });

    // alert(`${logName}: check console ...`);
    // console.log(`${logName}: apRawAttributeList = ${JSON.stringify(apRawAttributeList, null, 2)}`);
    // test upstream error handling
    // throw new Error(`${logName}: test create error case: check attributes not set to raw attributes`);

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