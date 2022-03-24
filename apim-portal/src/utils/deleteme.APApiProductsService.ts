import { 
  APIProduct,
  APIProductAccessLevel,
  APIProductPatch,
  ApiProductsService,
  ClientOptionsGuaranteedMessaging,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId } from './APEntityIdsService';
import { Globals } from './Globals';
import APAttributesService, { TAPAttributeDisplay, TAPAttributeDisplayList } from "./APAttributes/deleteme.APAttributesService";
import APEnvironmentsService, { TAPEnvironmentDisplay, TAPEnvironmentDisplayList } from './APEnvironmentsService';
import APApisService, { TAPApiDisplay, TAPApiDisplayList } from './deleteme.APApisService';
import { EAPApiSpecFormat, TAPApiSpecDisplay } from './deleteme.APApiSpecsService';
import APProtocolsService, { TAPProtocolDisplay, TAPProtocolDisplayList } from './APProtocolsService';
import APSearchContentService, { IAPSearchContent } from './APSearchContentService';

export type TAPApiProductDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  connectorApiProduct: APIProduct;
  apEnvironmentDisplayList: TAPEnvironmentDisplayList;
  apEnvironmentDisplayNameList: Array<string>;
  apApiDisplayList: TAPApiDisplayList;
  apApiDisplayNameList: Array<string>;
  apProtocolDisplayList: TAPProtocolDisplayList;
  apProtocolDisplayNameList: Array<string>;
  // TODO: separate Ap Special Attributes & attributes
  apAttributeDisplayList: TAPAttributeDisplayList;
  apAttributeDisplayNameList: Array<string>;
  // re-work this concept
  apApiProductCategory: string;
  apApiProductImageUrl: string;
}
export type TAPApiProductDisplayList = Array<TAPApiProductDisplay>;

export class APApiProductsService {
  private readonly BaseComponentName = "APApiProductsService";

  private readonly CDefaultApiProductCategory = 'Solace AsyncAPI';
  private readonly CDefaultApiProductImageUrl = 'https://www.primefaces.org/primereact/showcase/showcase/demo/images/product/chakra-bracelet.jpg';

  private filterConnectorApiProductList(connectorApiProductList: Array<APIProduct>, includeAccessLevel?: APIProductAccessLevel): Array<APIProduct> {
    if(includeAccessLevel === undefined) return connectorApiProductList;
    const indicesToDelete: Array<number> = connectorApiProductList.map( (connectorApiProduct: APIProduct, idx: number) => {
      // return -1 if not found, otherwise the actual index
      if(connectorApiProduct.accessLevel?.includes(includeAccessLevel)) return -1;
      else return idx;
    }).filter(idx => idx !== -1); // filter all indeces === -1 out
    for(let idx = indicesToDelete.length -1; idx >= 0; idx--) {
      connectorApiProductList.splice(indicesToDelete[idx], 1);
    }
    return connectorApiProductList;
  }

  private create_EmptyConnectorApiProduct(): APIProduct {
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

  protected create_EmptyObject(): TAPApiProductDisplay {
    return this.create_ApApiProductDisplay_From_ApiEntities(
      this.create_EmptyConnectorApiProduct(),
      [],
      []
    );
  }

  protected create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct: APIProduct, apEnvironmentDisplayList: TAPEnvironmentDisplayList, apApiDisplayList: TAPApiDisplayList): TAPApiProductDisplay {
    const apProtocolDisplayList: TAPProtocolDisplayList = APProtocolsService.create_SortedApProtocolDisplayList_From_ConnectorProtocolList(connectorApiProduct.protocols);
    const apAttributeDisplayList: TAPAttributeDisplayList = APAttributesService.create_SortedApAttributeDisplayList_From_ConnectorAttributeList(connectorApiProduct.attributes);
    const _base: TAPApiProductDisplay = {
      apEntityId: {
        id: connectorApiProduct.name,
        displayName: connectorApiProduct.displayName
      },
      connectorApiProduct: {
        ...connectorApiProduct,
        accessLevel: connectorApiProduct.accessLevel ? connectorApiProduct.accessLevel : APIProductAccessLevel.PRIVATE
      },
      apEnvironmentDisplayList: apEnvironmentDisplayList,
      apEnvironmentDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPEnvironmentDisplay>(apEnvironmentDisplayList),
      apApiDisplayList: apApiDisplayList,
      apApiDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPApiDisplay>(apApiDisplayList),
      apProtocolDisplayList: apProtocolDisplayList,
      apProtocolDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPProtocolDisplay>(apProtocolDisplayList),
      apAttributeDisplayList: apAttributeDisplayList,
      apAttributeDisplayNameList: APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPAttributeDisplay>(apAttributeDisplayList), 
      apApiProductCategory: this.CDefaultApiProductCategory,
      apApiProductImageUrl: this.CDefaultApiProductImageUrl,
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<TAPApiProductDisplay>(_base);
  }

  public generateGlobalSearchContent(apProductDisplay: TAPApiProductDisplay): string {
    return Globals.generateDeepObjectValuesString(apProductDisplay).toLowerCase();
  }

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

  protected async listApApiProductDisplay({ organizationId, includeAccessLevel }: {
    organizationId: string;
    includeAccessLevel?: APIProductAccessLevel;
  }): Promise<TAPApiProductDisplayList> {

    const funcName = 'listApApiProductDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const _connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId
    });
    const connectorApiProductList: Array<APIProduct> = this.filterConnectorApiProductList(_connectorApiProductList, includeAccessLevel);
    const list: TAPApiProductDisplayList = [];

    const apEnvDisplayList = await APEnvironmentsService.listApEnvironmentDisplay({
      organizationId: organizationId
    });
    for(const connectorApiProduct of connectorApiProductList) {
      if(!connectorApiProduct.environments) throw new Error(`${logName}: connectorApiProduct.environments is undefined`);
      const productApEnvDisplayList: TAPEnvironmentDisplayList = [];
      for(const envName of connectorApiProduct.environments) {
        const found = apEnvDisplayList.find( (apEnvDisplay: TAPEnvironmentDisplay) => {
          return envName === apEnvDisplay.apEntityId.id;
        });
        if(found === undefined) throw new Error(`${logName}: found is undefined`);        
        productApEnvDisplayList.push(found);
      }
      const productApApiDisplayList: TAPApiDisplayList = await APApisService.listApApiDisplayForApiIdList({
        organizationId: organizationId,
        apiIdList: connectorApiProduct.apis
      });
      list.push(this.create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct, productApEnvDisplayList, productApApiDisplayList));
    };
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPApiProductDisplay>(list);    
  }
  
  protected async getApApiProductDisplay({ organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPApiProductDisplay> {

    const funcName = 'getApApiProductDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const connectorApiProduct: APIProduct = await ApiProductsService.getApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId
    });

    if(!connectorApiProduct.environments) throw new Error(`${logName}: connectorApiProduct.environments is undefined`);
    const apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsService.listApEnvironmentDisplayForEnvIdList({
      organizationId: organizationId,
      envIdList: connectorApiProduct.environments
    });
    const apApiDisplayList: TAPApiDisplayList = await APApisService.listApApiDisplayForApiIdList({
      organizationId: organizationId,
      apiIdList: connectorApiProduct.apis
    });
    return this.create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct, apEnvironmentDisplayList, apApiDisplayList);
  }

  protected async createApApiProductDisplay({ organizationId, apApiProductDisplay}: {
    organizationId: string;
    apApiProductDisplay: TAPApiProductDisplay;
  }): Promise<void> {

    await ApiProductsService.createApiProduct({
      organizationName: organizationId,
      requestBody: apApiProductDisplay.connectorApiProduct
    });

  }

  protected async updateApApiProductDisplay({ organizationId, apApiProductDisplay }: {
    organizationId: string;
    apApiProductDisplay: TAPApiProductDisplay;
  }): Promise<void> {

    const apiProduct: APIProduct = apApiProductDisplay.connectorApiProduct;
    const patch: APIProductPatch = {
      displayName: apiProduct.displayName,
      description: apiProduct.description,
      approvalType: apiProduct.approvalType,
      attributes: apiProduct.attributes,
      clientOptions: apiProduct.clientOptions,
      environments: apiProduct.environments,
      protocols: apiProduct.protocols,
      pubResources: apiProduct.pubResources,
      subResources: apiProduct.subResources,
      apis: apiProduct.apis,
      accessLevel: apiProduct.accessLevel
    };
  
    await ApiProductsService.updateApiProduct({
      organizationName: organizationId,
      apiProductName: apApiProductDisplay.apEntityId.id,
      requestBody: patch
    });  
  }

  public async deleteApApiProductDisplay({ organizationId, apiProductId}: {
    organizationId: string;
    apiProductId: string;
  }): Promise<void> {
    await ApiProductsService.deleteApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId
    });
  }

  public async getApiSpec({ organizationId, apiProductId, apiEntityId }: {
    organizationId: string;
    apiProductId: string;
    apiEntityId: TAPEntityId;
  }): Promise<TAPApiSpecDisplay> {
    const spec: any = await ApiProductsService.getApiProductApiSpecification({
      organizationName: organizationId, 
      apiProductName: apiProductId,
      apiName: apiEntityId.id,
      format: EAPApiSpecFormat.JSON
    });
    return {
      apEntityId: apiEntityId,
      format: EAPApiSpecFormat.JSON,
      spec: spec
    };
  }
}