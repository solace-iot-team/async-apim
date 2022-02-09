import { 
  APIProduct,
  APIProductAccessLevel,
  ApiProductsService,
  EnvironmentResponse,
  EnvironmentsService,
  Protocol,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPEntityId} from './APEntityId';
import { Globals } from './Globals';
import { APRenderUtils } from './APRenderUtils';
import { APAttributesService } from './APAttribute';

export type TAPApiProductDisplay = {
  apEntityId: TAPEntityId;
  connectorApiProduct: APIProduct;
  connectorEnvironmentResponseList: Array<EnvironmentResponse>;
  apAsyncApiDisplayNameListAsString: string;
  apProtocolListAsString: string;
  apAttributeListAsString: string;
  apEnvironmentListAsStringList: Array<string>;
  apApiProductCategory: string;
  apApiProductImageUrl: string;
}
export type TAPApiProductDisplayList = Array<TAPApiProductDisplay>;

export class APApiProductsService {
  private readonly BaseComponentName = "APApiProductsService";

  private readonly CDefaultApiProductCategory = 'Solace AsyncAPI';
  private readonly CDefaultApiProductImageUrl = 'https://www.primefaces.org/primereact/showcase/showcase/demo/images/product/chakra-bracelet.jpg';


  protected create_APApiProductDisplay_From_ApiEntities(connectorApiProduct: APIProduct, connectorEnvRespList: Array<EnvironmentResponse>): TAPApiProductDisplay {
    const _base: TAPApiProductDisplay = {
      apEntityId: {
        id: connectorApiProduct.name,
        displayName: connectorApiProduct.displayName
      },
      connectorApiProduct: {
        ...connectorApiProduct,
        accessLevel: connectorApiProduct.accessLevel ? connectorApiProduct.accessLevel : APIProductAccessLevel.PRIVATE
      },
      connectorEnvironmentResponseList: connectorEnvRespList,
      // TODO: this should be the displayNames of the APIs
      apAsyncApiDisplayNameListAsString: this.getApApiDisplayNameListAsString(connectorApiProduct.apis),
      apProtocolListAsString: this.getApProtocolListAsString(connectorApiProduct.protocols),
      apAttributeListAsString: APAttributesService.getApAttributeNameListAsString(connectorApiProduct.attributes),
      apEnvironmentListAsStringList: this.getApEnvironmentsAsDisplayList(connectorEnvRespList),
      apApiProductCategory: this.CDefaultApiProductCategory,
      apApiProductImageUrl: this.CDefaultApiProductImageUrl,
    };
    return _base;
  }

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

  public generateGlobalSearchContent(apProductDisplay: TAPApiProductDisplay): string {
    return Globals.generateDeepObjectValuesString(apProductDisplay).toLowerCase();
  }
  public getApApiDisplayNameListAsString(displayNameList: Array<string> ): string {
    if(displayNameList.length > 0) return displayNameList.join(', ');
    else return '';
  }
  public getApProtocolListAsString(apiProtocolList?: Array<Protocol> ): string {
    return APRenderUtils.getProtocolListAsString(apiProtocolList);
  }
  public getApEnvironmentsAsDisplayList(environmentResponseList: Array<EnvironmentResponse>): Array<string> {
    return environmentResponseList.map( (envResp: EnvironmentResponse) => {
      return `${envResp.displayName} (${envResp.datacenterProvider}:${envResp.datacenterId})`;
    });
  }

  protected async listApiProductDisplay({ organizationId, includeAccessLevel }: {
    organizationId: string;
    includeAccessLevel?: APIProductAccessLevel;
  }): Promise<TAPApiProductDisplayList> {

    const funcName = 'listApiProductDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const _connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId
    });
    const connectorApiProductList: Array<APIProduct> = this.filterConnectorApiProductList(_connectorApiProductList, includeAccessLevel);
    const _list: TAPApiProductDisplayList = [];

// TODO: use APEnvironmentsService for this

    // get all envs for all products
    const _connectorEnvListCache: Array<EnvironmentResponse> = [];
    for(const connectorApiProduct of connectorApiProductList) {
      if(!connectorApiProduct.environments) throw new Error(`${logName}: connectorApiProduct.environments is undefined`);
      const connectorEnvResponseList: Array<EnvironmentResponse> = [];
      for(const envName of connectorApiProduct.environments) {
        const found = _connectorEnvListCache.find( (envResponse: EnvironmentResponse) => {
          return envResponse.name === envName;
        });
        if(!found) {
          const _envResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({
            organizationName: organizationId,
            envName: envName
          });
          _connectorEnvListCache.push(_envResponse);
          connectorEnvResponseList.push(_envResponse);
        } else {
          connectorEnvResponseList.push(found);
        }
      }
      _list.push(this.create_APApiProductDisplay_From_ApiEntities(connectorApiProduct, connectorEnvResponseList));
    }
    return _list;
  }
  
  protected async getApiProductDisplay({ organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPApiProductDisplay> {

    const funcName = 'getApiProductDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const connectorApiProduct: APIProduct = await ApiProductsService.getApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId
    });
    // get all envs 
    if(!connectorApiProduct.environments) throw new Error(`${logName}: connectorApiProduct.environments is undefined`);
    const connectorEnvResponseList: Array<EnvironmentResponse> = [];
    for(const envName of connectorApiProduct.environments) {
      const _envResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({
        organizationName: organizationId,
        envName: envName
      });
      connectorEnvResponseList.push(_envResponse);
    }
    return this.create_APApiProductDisplay_From_ApiEntities(connectorApiProduct, connectorEnvResponseList);
  }


}