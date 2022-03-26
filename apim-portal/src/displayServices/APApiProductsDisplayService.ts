import { 
  APIProduct,
  APIProductAccessLevel,
  APIProductPatch,
  ApiProductsService,
  ClientOptions,
  ClientOptionsGuaranteedMessaging,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay } from '../utils/APEntityIdsService';
import APApisDisplayService, { 
  TAPApiChannelParameter, 
  TAPApiChannelParameterList, 
  TAPApiDisplayList 
} from './APApisDisplayService';
import APAttributesDisplayService, { 
  IAPAttributeDisplay,
  TAPAttributeDisplayList, 
} from './APAttributesDisplayService/APAttributesDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplay, TAPEnvironmentDisplayList } from './APEnvironmentsDisplayService';
import { APManagedAssetDisplayService, IAPManagedAssetDisplay } from './APManagedAssetDisplayService';
import { TAPProtocolDisplayList } from './APProtocolsDisplayService';

export type TAPControlledChannelParameter = IAPAttributeDisplay;
export type TAPControlledChannelParameterList = Array<TAPControlledChannelParameter>;

export type TAPApiProductDisplay_General = IAPEntityIdDisplay & {
  description: string;
}

export interface IAPApiProductDisplay extends IAPManagedAssetDisplay {
  // remove this after
  connectorApiProduct: APIProduct;

  apDescription: string;
  apApiProductCategoryDisplayName: string;

  apIsGuaranteedMessagingEnabled: boolean;
  apApiDisplayList: TAPApiDisplayList;
  apControlledChannelParameterList: TAPControlledChannelParameterList;
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
      apIsGuaranteedMessagingEnabled: false,
      apApiDisplayList: [],
      apControlledChannelParameterList: [],
      apEnvironmentDisplayList: [],
      apProtocolDisplayList: [],
      apApiProductCategoryDisplayName: '',
    };
    return apApiProductDisplay;
  }

  private get_IsGuaranteedMessagingEnabled(clientOptions: ClientOptions | undefined): boolean {
    if(clientOptions === undefined) return false;
    if(clientOptions.guaranteedMessaging === undefined) return false;
    if(clientOptions.guaranteedMessaging.requireQueue === undefined) return false;
    return clientOptions.guaranteedMessaging.requireQueue;
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


  //   return apControlledChannelParameterList;
  // }
  /**
   * Does not create search content.
   */
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
      apAttributeDisplayList: _base.external_ApAttributeDisplayList,
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
    const consolidated_ApProtocolDisplayList: TAPProtocolDisplayList = APEnvironmentsDisplayService.create_ConsolidatedApProtocolDisplayList({
      apEnvironmentDisplayList: apEnvironmentDisplayList
    });

    const apApiProductDisplay: IAPApiProductDisplay = {
      ..._base,

      connectorApiProduct: connectorApiProduct,

      apDescription: connectorApiProduct.description ? connectorApiProduct.description : '',
      apApiProductCategoryDisplayName: this.CDefaultApiProductCategory,
      apIsGuaranteedMessagingEnabled: this.get_IsGuaranteedMessagingEnabled(connectorApiProduct.clientOptions),
      apApiDisplayList:  apApiDisplayList,
      apControlledChannelParameterList: apControlledChannelParameterList,
      apEnvironmentDisplayList: apEnvironmentDisplayList,
      apProtocolDisplayList: consolidated_ApProtocolDisplayList,
      // apApiProductImageUrl: this.CDefaultApiProductImageUrl,
    };
    return apApiProductDisplay;
  }

  // protected create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct: APIProduct, apEnvironmentDisplayList: TAPEnvironmentDisplayList, apApiDisplayList: TAPApiDisplayList): TAPApiProductDisplay {
  //   const apProtocolDisplayList: TAPProtocolDisplayList = APProtocolsService.create_SortedApProtocolDisplayList_From_ConnectorProtocolList(connectorApiProduct.protocols);
  //   const apAttributeDisplayList: TAPAttributeDisplayList = APAttributesService.create_SortedApAttributeDisplayList_From_ConnectorAttributeList(connectorApiProduct.attributes);
  //   const _base: TAPApiProductDisplay = {
  //     apEntityId: {
  //       id: connectorApiProduct.name,
  //       displayName: connectorApiProduct.displayName
  //     },
  //     connectorApiProduct: {
  //       ...connectorApiProduct,
  //       accessLevel: connectorApiProduct.accessLevel ? connectorApiProduct.accessLevel : APIProductAccessLevel.PRIVATE
  //     },
  //     apEnvironmentDisplayList: apEnvironmentDisplayList,
  //     apEnvironmentDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPEnvironmentDisplay>(apEnvironmentDisplayList),
  //     apApiDisplayList: apApiDisplayList,
  //     apApiDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPApiDisplay>(apApiDisplayList),
  //     apProtocolDisplayList: apProtocolDisplayList,
  //     apProtocolDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPProtocolDisplay>(apProtocolDisplayList),
  //     apAttributeDisplayList: apAttributeDisplayList,
  //     apAttributeDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPAttributeDisplay>(apAttributeDisplayList), 
  //     apApiProductCategory: this.CDefaultApiProductCategory,
  //     apApiProductImageUrl: this.CDefaultApiProductImageUrl,
  //     apSearchContent: ''
  //   };
  //   return APSearchContentService.add_SearchContent<TAPApiProductDisplay>(_base);
  // }

  public create_SelectList_From_QueueAccessType(): Array<ClientOptionsGuaranteedMessaging.accessType> {
    const e: any = ClientOptionsGuaranteedMessaging.accessType;
    return Object.keys(e).map(k => e[k]);
  }

  public create_SelectList_From_ApprovalType(): Array<APIProduct.approvalType> {
    const e: any = APIProduct.approvalType;
    return Object.keys(e).map(k => e[k]);
  }  

  public create_SelectList_From_AccessLevel(): Array<APIProductAccessLevel> {
    const e: any = APIProductAccessLevel;
    return Object.keys(e).map(k => e[k]);
  }  

  public getApApiDisplayNameListAsString(displayNameList: Array<string> ): string {
    if(displayNameList.length > 0) return displayNameList.join(', ');
    else return '';
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  protected async apiUpdate({ organizationId, apiProductId, apiProductUpdate }:{
    organizationId: string;
    apiProductId: string;
    apiProductUpdate: APIProductPatch;
  }): Promise<void> {

    await ApiProductsService.updateApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId,
      requestBody: apiProductUpdate
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