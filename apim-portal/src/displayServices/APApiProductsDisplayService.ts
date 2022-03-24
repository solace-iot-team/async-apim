import { 
  APIProduct,
  APIProductAccessLevel,
  APIProductPatch,
  ApiProductsService,
  ClientOptions,
  ClientOptionsGuaranteedMessaging,
  attributes as ConnectorAttributes,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from '../utils/APEntityIdsService';
import { Globals } from '../utils/Globals';
// import APAttributesService, { TAPAttributeDisplay, TAPAttributeDisplayList } from "./APAttributes/APAttributesService";
// import APEnvironmentsService, { TAPEnvironmentDisplay, TAPEnvironmentDisplayList } from './APEnvironmentsService';
// import APApisService, { TAPApiDisplay, TAPApiDisplayList } from './APApisService';
// import { EAPApiSpecFormat, TAPApiSpecDisplay } from './APApiSpecsService';
// import APProtocolsService, { TAPProtocolDisplay, TAPProtocolDisplayList } from './APProtocolsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import APApisDisplayService, { TAPApiDisplayList } from './APApisDisplayService';



export interface IAPApiProductDisplay extends IAPEntityIdDisplay, IAPSearchContent {
  // remove this after
  connectorApiProduct: APIProduct;
  apIsGuaranteedMessagingEnabled: boolean;
  apApiDisplayList: TAPApiDisplayList;

  // // todo: the name list is not required
  // apEnvironmentDisplayList: TAPEnvironmentDisplayList;
  // apEnvironmentDisplayNameList: Array<string>;
    
  // // todo the name list is not required
  // apProtocolDisplayList: TAPProtocolDisplayList;
  // apProtocolDisplayNameList: Array<string>;

  // // TODO: separate Ap Special Attributes & attributes
  // apAttributeDisplayList: TAPAttributeDisplayList;
  // apAttributeDisplayNameList: Array<string>;
  
}
export type TAPApiProductDisplayList = Array<IAPApiProductDisplay>;

export abstract class APApiProductsDisplayService {
  private readonly BaseComponentName = "APApiProductsDisplayService";

  private readonly CDefaultApiProductCategory = 'Solace AsyncAPI';
  private readonly CDefaultApiProductImageUrl = 'https://www.primefaces.org/primereact/showcase/showcase/demo/images/product/chakra-bracelet.jpg';

  public nameOf(name: keyof IAPApiProductDisplay) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
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
      apEntityId: APEntityIdsService.create_EmptyObject(),
      connectorApiProduct: this.create_Empty_ConnectorApiProduct(),
      apIsGuaranteedMessagingEnabled: false,
      apApiDisplayList: [],
      apSearchContent: ''
    };
    return apApiProductDisplay;
  }

  private get_IsGuaranteedMessagingEnabled(clientOptions: ClientOptions | undefined): boolean {
    if(clientOptions === undefined) return false;
    if(clientOptions.guaranteedMessaging === undefined) return false;
    if(clientOptions.guaranteedMessaging.requireQueue === undefined) return false;
    return clientOptions.guaranteedMessaging.requireQueue;
  }
  /**
   * Does not create search content.
   */
  protected async create_ApApiProductDisplay_From_ApiEntities({ organizationId, connectorApiProduct }:{
    organizationId: string;
    connectorApiProduct: APIProduct;
  }): Promise<IAPApiProductDisplay> {
    // const apProtocolDisplayList: TAPProtocolDisplayList = APProtocolsService.create_SortedApProtocolDisplayList_From_ConnectorProtocolList(connectorApiProduct.protocols);
    // const apAttributeDisplayList: TAPAttributeDisplayList = APAttributesService.create_SortedApAttributeDisplayList_From_ConnectorAttributeList(connectorApiProduct.attributes);

    // APApisAttributesDisplayService.create_Api_AttributeEntities({
    //   connectorAttributes: connectorApiInfo.a
    // })

    create the controlledChannelParameters:
    // - create the combined paramter list using ApisDisplayService
    // - check which ones are in the API product ==> these are the controllerChannelParameters



    const _base: IAPApiProductDisplay = {
      apEntityId: {
        id: connectorApiProduct.name,
        displayName: connectorApiProduct.displayName
      },
      connectorApiProduct: connectorApiProduct,
      apIsGuaranteedMessagingEnabled: this.get_IsGuaranteedMessagingEnabled(connectorApiProduct.clientOptions),
      apApiDisplayList:  await APApisDisplayService.apiGetList_ApApiDisplay_For_ApiIdList({ organizationId: organizationId, apiIdList: connectorApiProduct.apis }),
      // apEnvironmentDisplayList: apEnvironmentDisplayList,
      // apEnvironmentDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPEnvironmentDisplay>(apEnvironmentDisplayList),
      // apProtocolDisplayList: apProtocolDisplayList,
      // apProtocolDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPProtocolDisplay>(apProtocolDisplayList),
      // apAttributeDisplayList: apAttributeDisplayList,
      // apAttributeDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPAttributeDisplay>(apAttributeDisplayList), 
      // apApiProductCategory: this.CDefaultApiProductCategory,
      // apApiProductImageUrl: this.CDefaultApiProductImageUrl,
      apSearchContent: ''
    };
    return _base;
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
  
  // protected async getApApiProductDisplay({ organizationId, apiProductId }: {
  //   organizationId: string;
  //   apiProductId: string;
  // }): Promise<TAPApiProductDisplay> {

  //   const funcName = 'getApApiProductDisplay';
  //   const logName = `${this.BaseComponentName}.${funcName}()`;

  //   const connectorApiProduct: APIProduct = await ApiProductsService.getApiProduct({
  //     organizationName: organizationId,
  //     apiProductName: apiProductId
  //   });

  //   if(!connectorApiProduct.environments) throw new Error(`${logName}: connectorApiProduct.environments is undefined`);
  //   const apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsService.listApEnvironmentDisplayForEnvIdList({
  //     organizationId: organizationId,
  //     envIdList: connectorApiProduct.environments
  //   });
  //   const apApiDisplayList: TAPApiDisplayList = await APApisService.listApApiDisplayForApiIdList({
  //     organizationId: organizationId,
  //     apiIdList: connectorApiProduct.apis
  //   });
  //   return this.create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct, apEnvironmentDisplayList, apApiDisplayList);
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