import { 
  APIProduct,
  ApiProductsService, 
  CommonEntityNameList, 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APApiProductsDisplayService, IAPApiProductDisplay } from '../../displayServices/APApiProductsDisplayService';
import APEntityIdsService, { TAPEntityIdList } from '../../utils/APEntityIdsService';
import APSearchContentService from '../../utils/APSearchContentService';

export type TAPAdminPortalApiProductDisplay = IAPApiProductDisplay & {
  apAppReferenceEntityIdList: TAPEntityIdList;
}; 
export type TAPAdminPortalApiProductDisplayList = Array<TAPAdminPortalApiProductDisplay>;

class APAdminPortalApiProductsDisplayService extends APApiProductsDisplayService {
  private readonly ComponentName = "APAdminPortalApiProductsDisplayService";


  // public create_EmptyObject(): TAPAdminPortalApiProductDisplay {
  //   const base = super.create_EmptyObject();
  //   return {
  //     ...base,
  //     apAppReferenceEntityIdList: []
  //   };
  // }

  // public create_ApAdminPortalApiProductDisplay_From_ApiEntities(connectorApiProduct: APIProduct, apEnvironmentDisplayList: TAPEnvironmentDisplayList, apApiDisplayList: TAPApiDisplayList): TAPAdminPortalApiProductDisplay {
  //   const base = super.create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct, apEnvironmentDisplayList, apApiDisplayList);
  //   return {
  //     ...base,
  //     apAppReferenceEntityIdList: []
  //   };
  // }

  private async create_ApAdminPortalApiProductDisplay_From_ApiEntities({ organizationId, connectorApiProduct }:{
    organizationId: string;
    connectorApiProduct: APIProduct;
  }): Promise<TAPAdminPortalApiProductDisplay> {
    const base: IAPApiProductDisplay = await super.create_ApApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct
    });
    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = {
      ...base,
      apAppReferenceEntityIdList: await this.apiGetList_AppReferenceEntityIdList({ 
        organizationId: organizationId,
        apiProductId: connectorApiProduct.name
      }),
    };
    return APSearchContentService.add_SearchContent<TAPAdminPortalApiProductDisplay>(apAdminPortalApiProductDisplay);
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

    // const funcName = 'listAdminPortalApiProductDisplay';
    // const logName = `${this.APDeveloperPortalApiProductsService_ComponentName}.${funcName}()`;
    // console.log(`${logName}: starting ...`)

    const connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId
    });

    const apAdminPortalApiProductDisplayList: TAPAdminPortalApiProductDisplayList = [];
    for(const connectorApiProduct of connectorApiProductList) {
      const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
        organizationId: organizationId,
        connectorApiProduct: connectorApiProduct,
      });
      apAdminPortalApiProductDisplayList.push(apAdminPortalApiProductDisplay);
    }
    return apAdminPortalApiProductDisplayList;
  }

  // public getAdminPortalApApiProductDisplay = async({ organizationId, apiProductId }: {
  //   organizationId: string;
  //   apiProductId: string;
  // }): Promise<TAPAdminPortalApiProductDisplay> => {

  //   const base = await this.getApApiProductDisplay({
  //     organizationId: organizationId,
  //     apiProductId: apiProductId
  //   });

  //   const adminPortalObject: TAPAdminPortalApiProductDisplay = {
  //     ...base,
  //     apAppReferenceEntityIdList: await this.listAppReferencesToApiProducts({
  //       organizationId: organizationId,
  //       apiProductId: apiProductId
  //     })
  //   }
  //   return adminPortalObject;
  // }

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
