import { 
  APIProduct,
  APIProductPatch,
  ApiProductsService, 
  CommonEntityNameList,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APApiProductsDisplayService, IAPApiProductDisplay, TAPApiProductDisplay_General } from '../../displayServices/APApiProductsDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../../displayServices/APEnvironmentsDisplayService';
import APEntityIdsService, { TAPEntityIdList } from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';

export type TAPAdminPortalApiProductDisplay_General = TAPApiProductDisplay_General;

export type TAPAdminPortalApiProductDisplay = IAPApiProductDisplay & IAPSearchContent & {
  apAppReferenceEntityIdList: TAPEntityIdList;
}; 
export type TAPAdminPortalApiProductDisplayList = Array<TAPAdminPortalApiProductDisplay>;

class APAdminPortalApiProductsDisplayService extends APApiProductsDisplayService {
  private readonly ComponentName = "APAdminPortalApiProductsDisplayService";

  public create_Empty_ApAdminPortalApiProductDisplay(): TAPAdminPortalApiProductDisplay {
    return {
      ...this.create_Empty_ApApiProductDisplay(),
      apAppReferenceEntityIdList: [],
      apSearchContent: '',
    };
  }

  private async create_ApAdminPortalApiProductDisplay_From_ApiEntities({ organizationId, connectorApiProduct, completeApEnvironmentDisplayList }:{
    organizationId: string;
    connectorApiProduct: APIProduct;
    completeApEnvironmentDisplayList: TAPEnvironmentDisplayList;
  }): Promise<TAPAdminPortalApiProductDisplay> {
    
    const base: IAPApiProductDisplay = await this.create_ApApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      completeApEnvironmentDisplayList: completeApEnvironmentDisplayList,
    });

    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = {
      ...base,
      apAppReferenceEntityIdList: await this.apiGetList_AppReferenceEntityIdList({ 
        organizationId: organizationId,
        apiProductId: connectorApiProduct.name
      }),
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<TAPAdminPortalApiProductDisplay>(apAdminPortalApiProductDisplay);
  }

  public get_ApAdminPortalApiProductDisplay_General({ apAdminPortalApiProductDisplay }:{
    apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  }): TAPAdminPortalApiProductDisplay_General {
    const apAdminPortalApiProductDisplay_General: TAPAdminPortalApiProductDisplay_General = {
      apEntityId: apAdminPortalApiProductDisplay.apEntityId,
      description: apAdminPortalApiProductDisplay.apDescription
    };
    return apAdminPortalApiProductDisplay_General;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  private apiGetList_AppReferenceEntityIdList = async({organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPEntityIdList> => {
    // const funcName = 'apiGetList_AppReferenceEntityIdList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    const list: CommonEntityNameList = await ApiProductsService.listAppReferencesToApiProducts({
      organizationName: organizationId,
      apiProductName: apiProductId
    });
    return APEntityIdsService.create_SortedApEntityIdList_From_CommonEntityNamesList(list);
  }

  public apiGetList_ApAdminPortalApiProductDisplayList = async({ organizationId }: {
    organizationId: string;
  }): Promise<TAPAdminPortalApiProductDisplayList> => {

    const connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId
    });

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });

    const apAdminPortalApiProductDisplayList: TAPAdminPortalApiProductDisplayList = [];
    for(const connectorApiProduct of connectorApiProductList) {
      const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
        organizationId: organizationId,
        connectorApiProduct: connectorApiProduct,
        completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
      });
      apAdminPortalApiProductDisplayList.push(apAdminPortalApiProductDisplay);
    }
    return apAdminPortalApiProductDisplayList;
  }

  public apiGet_AdminPortalApApiProductDisplay = async({ organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPAdminPortalApiProductDisplay> => {

    const connectorApiProduct: APIProduct = await ApiProductsService.getApiProduct({
      organizationName: organizationId,
      apiProductName: apiProductId
    });

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });
    
    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
    });
    return apAdminPortalApiProductDisplay;
  }

  public async apiUpdate_ApAdminPortalApiProductDisplay_General({ organizationId, apAdminPortalApiProductDisplay_General }:{
    organizationId: string;
    apAdminPortalApiProductDisplay_General: TAPAdminPortalApiProductDisplay_General;
  }): Promise<void> {
    
    const update: APIProductPatch = {
      displayName: apAdminPortalApiProductDisplay_General.apEntityId.displayName,
      description: apAdminPortalApiProductDisplay_General.description
    };

    await this.apiUpdate({
      organizationId: organizationId,
      apiProductId: apAdminPortalApiProductDisplay_General.apEntityId.id,
      apiProductUpdate: update
    });

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

  // await ApiProductsService.updateApiProduct({
  //   organizationName: organizationId,
  //   apiProductName: apApiProductDisplay.apEntityId.id,
  //   requestBody: patch
  // });  


  // public async createAdminPortalApApiProductDisplay({ organizationId, apAdminPortalApiProductDisplay }: {
  //   organizationId: string;
  //   apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  // }): Promise<void> {

  //   // TODO: CUSTOM ATTRIBUTES into attributes
  //   await super.createApApiProductDisplay({
  //     organizationId: organizationId,
  //     apApiProductDisplay: apAdminPortalApiProductDisplay
  //   });

  // }

  // public async updateAdminPortalApApiProductDisplay({ organizationId, apAdminPortalApiProductDisplay }: {
  //   organizationId: string;
  //   apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  // }): Promise<void> {
  //   // TODO: CUSTOM ATTRIBUTES into attributes
  //   await super.updateApApiProductDisplay({
  //     organizationId: organizationId,
  //     apApiProductDisplay: apAdminPortalApiProductDisplay
  //   });
  // }
}

export default new APAdminPortalApiProductsDisplayService();
