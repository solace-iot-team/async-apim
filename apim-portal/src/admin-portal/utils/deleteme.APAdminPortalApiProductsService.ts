import { 
  APIProduct,
  ApiProductsService, 
  CommonEntityNameList, 
  CommonEntityNames 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPApiProductDisplay, APApiProductsService, TAPApiProductDisplayList } from '../../utils/deleteme.APApiProductsService';
import { TAPApiDisplayList } from '../../utils/deleteme.APApisService';
import APEntityIdsService, { TAPEntityIdList } from '../../utils/APEntityIdsService';
import { TAPEnvironmentDisplayList } from '../../utils/APEnvironmentsService';

export type TAPAdminPortalApiProductDisplay = TAPApiProductDisplay & {
  apAppReferenceEntityIdList: TAPEntityIdList
}; 
export type TAPAdminPortalApiProductDisplayList = Array<TAPAdminPortalApiProductDisplay>;

class APAdminPortalApiProductsService extends APApiProductsService {
  private readonly ComponentName = "APAdminPortalApiProductsService";

  private listAppReferencesToApiProducts = async({organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPEntityIdList> => {
    const funcName = 'listAppReferencesToApiProducts';
    const logName = `${this.ComponentName}.${funcName}()`;

    const list: CommonEntityNameList = await ApiProductsService.listAppReferencesToApiProducts({
      organizationName: organizationId,
      apiProductName: apiProductId
    });
    const returnList: TAPEntityIdList = list.map( (x: CommonEntityNames) => {
      if(x.name === undefined) throw new Error(`${logName}: x.name is undefined`);
      if(x.displayName === undefined) throw new Error(`${logName}: x.displayName is undefined`);
      return {
        id: x.name,
        displayName: x.displayName 
      } 
    });
    return APEntityIdsService.sort_byDisplayName(returnList);
  }

  public create_EmptyObject(): TAPAdminPortalApiProductDisplay {
    const base = super.create_EmptyObject();
    return {
      ...base,
      apAppReferenceEntityIdList: []
    };
  }

  public create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct: APIProduct, apEnvironmentDisplayList: TAPEnvironmentDisplayList, apApiDisplayList: TAPApiDisplayList): TAPAdminPortalApiProductDisplay {
    const base = super.create_ApApiProductDisplay_From_ApiEntities(connectorApiProduct, apEnvironmentDisplayList, apApiDisplayList);
    return {
      ...base,
      apAppReferenceEntityIdList: []
    };
  }

  public listAdminPortalApApiProductDisplay = async({ organizationId }: {
    organizationId: string;
  }): Promise<TAPAdminPortalApiProductDisplayList> => {

    // const funcName = 'listAdminPortalApiProductDisplay';
    // const logName = `${this.APDeveloperPortalApiProductsService_ComponentName}.${funcName}()`;
    // console.log(`${logName}: starting ...`)

    const baseList: TAPApiProductDisplayList = await this.listApApiProductDisplay({
      organizationId: organizationId,
    }); 
    const adminPortalList: TAPAdminPortalApiProductDisplayList = [];
    // TODO: PARALLELIZE
    for(const base of baseList) {
      const adminPortalObject: TAPAdminPortalApiProductDisplay = {
        ...base,
        apAppReferenceEntityIdList: await this.listAppReferencesToApiProducts({
          organizationId: organizationId,
          apiProductId: base.apEntityId.id
        })
      }
      adminPortalList.push(adminPortalObject);
    }
    return adminPortalList;
  }

  public getAdminPortalApApiProductDisplay = async({ organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPAdminPortalApiProductDisplay> => {

    const base = await this.getApApiProductDisplay({
      organizationId: organizationId,
      apiProductId: apiProductId
    });

    const adminPortalObject: TAPAdminPortalApiProductDisplay = {
      ...base,
      apAppReferenceEntityIdList: await this.listAppReferencesToApiProducts({
        organizationId: organizationId,
        apiProductId: apiProductId
      })
    }
    return adminPortalObject;
  }

  public async createAdminPortalApApiProductDisplay({ organizationId, apAdminPortalApiProductDisplay }: {
    organizationId: string;
    apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  }): Promise<void> {

    // TODO: CUSTOM ATTRIBUTES into attributes
    await super.createApApiProductDisplay({
      organizationId: organizationId,
      apApiProductDisplay: apAdminPortalApiProductDisplay
    });

  }

  public async updateAdminPortalApApiProductDisplay({ organizationId, apAdminPortalApiProductDisplay }: {
    organizationId: string;
    apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  }): Promise<void> {
    // TODO: CUSTOM ATTRIBUTES into attributes
    await super.updateApApiProductDisplay({
      organizationId: organizationId,
      apApiProductDisplay: apAdminPortalApiProductDisplay
    });
  }
}

export default new APAdminPortalApiProductsService();
