import { 
  APIProduct,
  APIProductAccessLevel,
  APIProductPatch,
  ApiProductsService,
  ClientOptions,
  ClientOptionsGuaranteedMessaging,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { 
  IAPEntityIdDisplay, TAPEntityIdList, 
} from '../utils/APEntityIdsService';
import APApisDisplayService, { 
  TAPApiChannelParameter, 
  TAPApiChannelParameterList, 
  TAPApiDisplayList 
} from './APApisDisplayService';
import APAttributesDisplayService, {
  IAPAttributeDisplay,
  TAPAttributeDisplayList, 
} from './APAttributesDisplayService/APAttributesDisplayService';
import { 
  TAPEnvironmentDisplay, 
  TAPEnvironmentDisplayList 
} from './APEnvironmentsDisplayService';
import { 
  APManagedAssetDisplayService, 
  IAPManagedAssetDisplay, 
  TAPManagedAssetDisplay_Attributes
} from './APManagedAssetDisplayService';
import APProtocolsDisplayService, { 
  TAPProtocolDisplayList 
} from './APProtocolsDisplayService';

export type TAPControlledChannelParameter = IAPAttributeDisplay;
export type TAPControlledChannelParameterList = Array<TAPControlledChannelParameter>;

export type TAPApiProductDisplay_General = IAPEntityIdDisplay & {
  apDescription: string;
  apApiProductCategoryDisplayName: string;  
}
export type TAPApiProductDisplay_Policies = IAPEntityIdDisplay & {
  apApprovalType: APIProduct.approvalType;
  apClientOptionsDisplay: TAPClientOptionsDisplay;
}
export type TAPApiProductDisplay_Environments = IAPEntityIdDisplay & {
  apEnvironmentDisplayList: TAPEnvironmentDisplayList;
  apProtocolDisplayList: TAPProtocolDisplayList;  
}
export type TAPApiProductDisplay_Apis = IAPEntityIdDisplay & {
  apApiDisplayList: TAPApiDisplayList;
  apControlledChannelParameterList: TAPControlledChannelParameterList;
  internalReference: {
    apComplete_ApAttributeDisplayList: TAPAttributeDisplayList;
  }
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
  // remove this after
  connectorApiProduct: APIProduct;

  // General
  apDescription: string;
  apApiProductCategoryDisplayName: string;

  // Policies
  apApprovalType: APIProduct.approvalType;
  apClientOptionsDisplay: TAPClientOptionsDisplay;

  // Apis
  apApiDisplayList: TAPApiDisplayList;
  apControlledChannelParameterList: TAPControlledChannelParameterList;
  
  // Environments
  apEnvironmentDisplayList: TAPEnvironmentDisplayList;
  /** the consolidated protocol list across all environments */
  apProtocolDisplayList: TAPProtocolDisplayList;  
}
export type TAPApiProductDisplayList = Array<IAPApiProductDisplay>;

export abstract class APApiProductsDisplayService extends APManagedAssetDisplayService {
  private readonly MiddleComponentName = "APApiProductsDisplayService";

  private readonly CDefaultApiProductCategory = 'Solace AsyncAPI';
  private readonly CDefaultApiProductImageUrl = 'https://www.primefaces.org/primereact/showcase/showcase/demo/images/product/chakra-bracelet.jpg';

  public nameOf<IAPApiProductDisplay>(name: keyof IAPApiProductDisplay) {
    return name;
  }
  public nameOf_ConnectorApiProduct(name: keyof APIProduct) {
    return `${this.nameOf('connectorApiProduct')}.${name}`;
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

  private create_ApApprovalType(approvalType?: APIProduct.approvalType): APIProduct.approvalType {
    if(approvalType === undefined) return APIProduct.approvalType.MANUAL;
    return approvalType;
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
      subResources: []
    };
  }

  protected create_Empty_ApApiProductDisplay(): IAPApiProductDisplay {
    const apApiProductDisplay: IAPApiProductDisplay = {
      ...this.create_Empty_ApManagedAssetDisplay(),
      connectorApiProduct: this.create_Empty_ConnectorApiProduct(),

      apDescription: '',
      apApprovalType: this.create_ApApprovalType(),
      apClientOptionsDisplay: this.create_Empty_ApClientOptionsDisplay(),
      apApiDisplayList: [],
      apControlledChannelParameterList: [],
      apEnvironmentDisplayList: [],
      apProtocolDisplayList: [],
      apApiProductCategoryDisplayName: '',
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

  protected async create_ApApiProductDisplay_From_ApiEntities({ organizationId, connectorApiProduct, completeApEnvironmentDisplayList }:{
    organizationId: string;
    connectorApiProduct: APIProduct;
    completeApEnvironmentDisplayList: TAPEnvironmentDisplayList;
  }): Promise<IAPApiProductDisplay> {
    const funcName = 'create_ApApiProductDisplay_From_ApiEntities';
    const logName = `${this.MiddleComponentName}.${funcName}()`;

    const _base = this.create_ApManagedAssetDisplay({
      apEntityId: {
        id: connectorApiProduct.name,
        displayName: connectorApiProduct.displayName
      },
      complete_ApAttributeDisplayList: APAttributesDisplayService.create_ApAttributeDisplayList({
        apRawAttributeList: connectorApiProduct.attributes
      })
    });
    // get the used Apis
    const apApiDisplayList: TAPApiDisplayList = await APApisDisplayService.apiGetList_ApApiDisplay_For_ApiIdList({ organizationId: organizationId, apiIdList: connectorApiProduct.apis });
    // create the combined channel parameter list across all apis
    const apCombinedApiChannelParameterList: TAPApiChannelParameterList = APApisDisplayService.create_Combined_ApiChannelParameterList({
      apApiDisplayList: apApiDisplayList
    });
    const apControlledChannelParameterList: TAPControlledChannelParameterList = this.extract_ApControlledChannelParameterList({
      apAttributeDisplayList: _base.apExternal_ApAttributeDisplayList,
      apCombinedApiChannelParameterList: apCombinedApiChannelParameterList
    });

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

      connectorApiProduct: connectorApiProduct,

      apApprovalType: this.create_ApApprovalType(connectorApiProduct.approvalType),
      apClientOptionsDisplay: this.create_ApClientOptionsDisplay(connectorApiProduct.clientOptions),
      apDescription: connectorApiProduct.description ? connectorApiProduct.description : '',
      apApiProductCategoryDisplayName: this.CDefaultApiProductCategory,
      apApiDisplayList:  apApiDisplayList,
      apControlledChannelParameterList: apControlledChannelParameterList,
      apEnvironmentDisplayList: apEnvironmentDisplayList,
      apProtocolDisplayList: apProtocolDisplayList,
      // apApiProductImageUrl: this.CDefaultApiProductImageUrl,
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
      if(is_available) return x;
    });
    return filtered_list;
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

  public get_ApiProductDisplay_General({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): TAPApiProductDisplay_General {
    const apApiProductDisplay_General: TAPApiProductDisplay_General = {
      apEntityId: apApiProductDisplay.apEntityId,
      apDescription: apApiProductDisplay.apDescription,
      apApiProductCategoryDisplayName: apApiProductDisplay.apApiProductCategoryDisplayName,
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
      internalReference: {
        apComplete_ApAttributeDisplayList: apApiProductDisplay.apComplete_ApAttributeDisplayList,
      },
    };
    return apApiProductDisplay_Apis;
  }

  /** 
   * Set the api properties. 
   * Does NOT set the apEntityId. 
   * Calculates the new complete attribute list. 
   * @param apApiProductDisplay - updated with input & new complete attribute list
   * @param apApiProductDisplay_Apis - updated with new complete attribute list
   * @returns the modified apApiProductDisplay (not a copy) and updates to the apApiProductDisplay_Apis
  */
   public set_ApApiProductDisplay_Apis({ apApiProductDisplay, apApiProductDisplay_Apis }:{
    apApiProductDisplay: IAPApiProductDisplay;
    apApiProductDisplay_Apis: TAPApiProductDisplay_Apis;
  }): IAPApiProductDisplay {
    // const funcName = 'set_ApApiProductDisplay_Apis';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;

    // create the complete available channel parameter attribute list for APIs in 
    const apCombinedApiChannelParameterList: TAPApiChannelParameterList = APApisDisplayService.create_Combined_ApiChannelParameterList({
      apApiDisplayList: apApiProductDisplay.apApiDisplayList
    });
    // calculate the new complete list 
    const new_complete_ApAttributeDisplayList: TAPAttributeDisplayList = JSON.parse(JSON.stringify(apApiProductDisplay_Apis.apControlledChannelParameterList));
    // add any attributes not in list yet and do not add if they are not available
    apApiProductDisplay_Apis.internalReference.apComplete_ApAttributeDisplayList.forEach( (previous: IAPAttributeDisplay) => {
      // if previous is in combined list ==> do not add
      const isPreviousInCombinedList = apCombinedApiChannelParameterList.find( (x) => {
        return x.apEntityId.id === previous.apEntityId.id;
      });
      if(isPreviousInCombinedList === undefined) {
        new_complete_ApAttributeDisplayList.push(previous);
      }
    });

    apApiProductDisplay_Apis.internalReference.apComplete_ApAttributeDisplayList = new_complete_ApAttributeDisplayList;

    apApiProductDisplay.apApiDisplayList = apApiProductDisplay_Apis.apApiDisplayList;
    apApiProductDisplay.apControlledChannelParameterList = apApiProductDisplay_Apis.apControlledChannelParameterList;
    apApiProductDisplay.apComplete_ApAttributeDisplayList = new_complete_ApAttributeDisplayList;

    return apApiProductDisplay;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

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


  protected async apiUpdate({ organizationId, apiProductId, apiProductUpdate }:{
    organizationId: string;
    apiProductId: string;
    apiProductUpdate: APIProductPatch;
  }): Promise<void> {
    // const funcName = 'apiUpdate';
    // const logName = `${this.MiddleComponentName}.${funcName}()`;
    // alert(`${logName}: apiProductUpdate=${JSON.stringify(apiProductUpdate, null, 2)}`);

    await ApiProductsService.updateApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId,
      requestBody: apiProductUpdate
    });  
  
  }

  public async apiUpdate_ApApiProductDisplay_General({ organizationId, apApiProductDisplay_General }:{
    organizationId: string;
    apApiProductDisplay_General: TAPApiProductDisplay_General;
  }): Promise<void> {
    
    // create mechanism for Api Product category when required
    // use APIProduct attributes

    const update: APIProductPatch = {
      displayName: apApiProductDisplay_General.apEntityId.displayName,
      description: apApiProductDisplay_General.apDescription,
    };

    await this.apiUpdate({
      organizationId: organizationId,
      apiProductId: apApiProductDisplay_General.apEntityId.id,
      apiProductUpdate: update
    });

  }

  /**
   * Updates the attributes. Relies on the complete attributes having been update previously with setter method.
   */
  public async apiUpdate_ApManagedAssetDisplay_Attributes({ organizationId, apManagedAssetDisplay_Attributes }:{
    organizationId: string;
    apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes;
  }): Promise<void> {
    
    const update: APIProductPatch = {
      attributes: APAttributesDisplayService.create_ApRawAttributeList({
        apAttributeDisplayList: apManagedAssetDisplay_Attributes.internalReference.apComplete_ApAttributeDisplayList
      })
    };

    await this.apiUpdate({
      organizationId: organizationId,
      apiProductId: apManagedAssetDisplay_Attributes.apEntityId.id,
      apiProductUpdate: update
    });

  }

  public async apiUpdate_ApApiProductDisplay_Policies({ organizationId, apApiProductDisplay_Policies }:{
    organizationId: string;
    apApiProductDisplay_Policies: TAPApiProductDisplay_Policies;
  }): Promise<void> {

    const update: APIProductPatch = {
      approvalType: apApiProductDisplay_Policies.apApprovalType,
      clientOptions: this.create_ConnectorClientOptions(apApiProductDisplay_Policies.apClientOptionsDisplay)
    };

    await this.apiUpdate({
      organizationId: organizationId,
      apiProductId: apApiProductDisplay_Policies.apEntityId.id,
      apiProductUpdate: update
    });

  }

  public async apiUpdate_ApApiProductDisplay_Environments({ organizationId, apApiProductDisplay_Environments }:{
    organizationId: string;
    apApiProductDisplay_Environments: TAPApiProductDisplay_Environments;
  }): Promise<void> {

    const update: APIProductPatch = {
      environments: APEntityIdsService.create_IdList_From_ApDisplayObjectList(apApiProductDisplay_Environments.apEnvironmentDisplayList),
      protocols: APProtocolsDisplayService.create_ConnectorProtocols_From_ApProtocolDisplayList({ 
        apProtocolDisplayList: apApiProductDisplay_Environments.apProtocolDisplayList
      })
    };

    await this.apiUpdate({
      organizationId: organizationId,
      apiProductId: apApiProductDisplay_Environments.apEntityId.id,
      apiProductUpdate: update
    });

  }

  /**
   * Update Apis sections.
   * Assumes apApiProductDisplay_Apis.internalReference.apComplete_ApAttributeDisplayList is correctly set
   */
  public async apiUpdate_ApApiProductDisplay_Apis({ organizationId, apApiProductDisplay_Apis }:{
    organizationId: string;
    apApiProductDisplay_Apis: TAPApiProductDisplay_Apis;
  }): Promise<void> {

    const update: APIProductPatch = {
      apis: APEntityIdsService.create_IdList_From_ApDisplayObjectList(apApiProductDisplay_Apis.apApiDisplayList),
      attributes: APAttributesDisplayService.create_ApRawAttributeList({
        apAttributeDisplayList: apApiProductDisplay_Apis.internalReference.apComplete_ApAttributeDisplayList
      })
    };

    await this.apiUpdate({
      organizationId: organizationId,
      apiProductId: apApiProductDisplay_Apis.apEntityId.id,
      apiProductUpdate: update
    });

  }

  // protected async apsGetList_ApApiProductDisplayList({ organizationId }: {
  //   organizationId: string;
  //   // includeAccessLevel?: APIProductAccessLevel;
  // }): Promise<TAPApiProductDisplayList> {

  //   const funcName = 'apsGetList_ApApiProductDisplayList';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const _connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
  //     organizationName: organizationId
  //   });
  //   // const connectorApiProductList: Array<APIProduct> = this.filterConnectorApiProductList(_connectorApiProductList, includeAccessLevel);
  //   const list: TAPApiProductDisplayList = [];

  //   for(const connectorApiProduct of _connectorApiProductList) {
  //     // if(!connectorApiProduct.environments) throw new Error(`${logName}: connectorApiProduct.environments is undefined`);
  //     // const productApEnvDisplayList: TAPEnvironmentDisplayList = [];
  //     // for(const envName of connectorApiProduct.environments) {
  //     //   const found = apEnvDisplayList.find( (apEnvDisplay: TAPEnvironmentDisplay) => {
  //     //     return envName === apEnvDisplay.apEntityId.id;
  //     //   });
  //     //   if(found === undefined) throw new Error(`${logName}: found is undefined`);        
  //     //   productApEnvDisplayList.push(found);
  //     // }
  //     // const productApApiDisplayList: TAPApiDisplayList = await APApisService.listApApiDisplayForApiIdList({
  //     //   organizationId: organizationId,
  //     //   apiIdList: connectorApiProduct.apis
  //     // });
  //     // list.push(this.create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct, productApEnvDisplayList, productApApiDisplayList));

  //     list.push(this.create_ApApiProductDisplay_From_ApiEntities({ connectorApiProduct: connectorApiProduct }));
  //   };

    // const apEnvDisplayList = await APEnvironmentsService.listApEnvironmentDisplay({
    //   organizationId: organizationId
    // });
    // for(const connectorApiProduct of connectorApiProductList) {
    //   if(!connectorApiProduct.environments) throw new Error(`${logName}: connectorApiProduct.environments is undefined`);
    //   const productApEnvDisplayList: TAPEnvironmentDisplayList = [];
    //   for(const envName of connectorApiProduct.environments) {
    //     const found = apEnvDisplayList.find( (apEnvDisplay: TAPEnvironmentDisplay) => {
    //       return envName === apEnvDisplay.apEntityId.id;
    //     });
    //     if(found === undefined) throw new Error(`${logName}: found is undefined`);        
    //     productApEnvDisplayList.push(found);
    //   }
    //   const productApApiDisplayList: TAPApiDisplayList = await APApisService.listApApiDisplayForApiIdList({
    //     organizationId: organizationId,
    //     apiIdList: connectorApiProduct.apis
    //   });
    //   list.push(this.create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct, productApEnvDisplayList, productApApiDisplayList));
    // };
  //   return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<IAPApiProductDisplay>(list);    
  // }
  
  // protected async createApApiProductDisplay({ organizationId, apApiProductDisplay}: {
  //   organizationId: string;
  //   apApiProductDisplay: TAPApiProductDisplay;
  // }): Promise<void> {

  //   await ApiProductsService.createApiProduct({
  //     organizationName: organizationId,
  //     requestBody: apApiProductDisplay.connectorApiProduct
  //   });

  // }

  // protected async updateApApiProductDisplay({ organizationId, apApiProductDisplay }: {
  //   organizationId: string;
  //   apApiProductDisplay: TAPApiProductDisplay;
  // }): Promise<void> {

  //   const apiProduct: APIProduct = apApiProductDisplay.connectorApiProduct;
  //   const patch: APIProductPatch = {
  //     displayName: apiProduct.displayName,
  //     description: apiProduct.description,
  //     approvalType: apiProduct.approvalType,
  //     attributes: apiProduct.attributes,
  //     clientOptions: apiProduct.clientOptions,
  //     environments: apiProduct.environments,
  //     protocols: apiProduct.protocols,
  //     pubResources: apiProduct.pubResources,
  //     subResources: apiProduct.subResources,
  //     apis: apiProduct.apis,
  //     accessLevel: apiProduct.accessLevel
  //   };
  
  //   await ApiProductsService.updateApiProduct({
  //     organizationName: organizationId,
  //     apiProductName: apApiProductDisplay.apEntityId.id,
  //     requestBody: patch
  //   });  
  // }

  // public async deleteApApiProductDisplay({ organizationId, apiProductId}: {
  //   organizationId: string;
  //   apiProductId: string;
  // }): Promise<void> {
  //   await ApiProductsService.deleteApiProduct({
  //     organizationName: organizationId,
  //     apiProductName: apiProductId
  //   });
  // }

  // public async getApiSpec({ organizationId, apiProductId, apiEntityId }: {
  //   organizationId: string;
  //   apiProductId: string;
  //   apiEntityId: TAPEntityId;
  // }): Promise<TAPApiSpecDisplay> {
  //   const spec: any = await ApiProductsService.getApiProductApiSpecification({
  //     organizationName: organizationId, 
  //     apiProductName: apiProductId,
  //     apiName: apiEntityId.id,
  //     format: EAPApiSpecFormat.JSON
  //   });
  //   return {
  //     apEntityId: apiEntityId,
  //     format: EAPApiSpecFormat.JSON,
  //     spec: spec
  //   };
  // }
}