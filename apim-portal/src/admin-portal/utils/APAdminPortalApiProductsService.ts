import { 
  ApiProductsService, 
  CommonEntityNameList, 
  CommonEntityNames 
} from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPApiProductDisplay, APApiProductsService, TAPApiProductDisplayList } from '../../utils/APApiProductsService';
import { TAPApiDisplayList } from '../../utils/APApisService';
import { TAPEntityIdList } from '../../utils/APEntityIdsService';
import APAdminPortalApisService from './APAdminPortalApisService';

export type TAPAdminPortalApiProductDisplay = TAPApiProductDisplay & {
  apApiDisplayList: TAPApiDisplayList;
  apAppReferenceEntityIdList: TAPEntityIdList
}; 
export type TAPAdminPortalApiProductDisplayList = Array<TAPAdminPortalApiProductDisplay>;

class APAdminPortalApiProductsService extends APApiProductsService {
  private readonly ComponentName = "APAdminPortalApiProductsService";

  // protected create_APApiProductDisplay_From_ApiEntities = (connectorApiProduct: APIProduct, connectorEnvRespList: Array<EnvironmentResponse>): TAPDeveloperPortalApiProductDisplay => {
  //   return super.create_APApiProductDisplay_From_ApiEntities(connectorApiProduct, connectorEnvRespList); 
  // }

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
    return list.map( (x: CommonEntityNames) => {
      if(x.name === undefined) throw new Error(`${logName}: x.name is undefined`);
      if(x.displayName === undefined) throw new Error(`${logName}: x.displayName is undefined`);
      return {
        id: x.name,
        displayName: x.displayName 
      } 
    });
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

      const apApiDisplayList: TAPApiDisplayList = await APAdminPortalApisService.listApApiDisplayForApiIdList({
        organizationId: organizationId,
        apiIdList: base.connectorApiProduct.apis
      });

      const adminPortalObject: TAPAdminPortalApiProductDisplay = {
        ...base,
        apApiDisplayList: apApiDisplayList,
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

    const apApiDisplayList: TAPApiDisplayList = await APAdminPortalApisService.listApApiDisplayForApiIdList({
      organizationId: organizationId,
      apiIdList: base.connectorApiProduct.apis
    });

    const adminPortalObject: TAPAdminPortalApiProductDisplay = {
      ...base,
      apApiDisplayList: apApiDisplayList,
      apAppReferenceEntityIdList: await this.listAppReferencesToApiProducts({
        organizationId: organizationId,
        apiProductId: apiProductId
      })
    }
    return adminPortalObject;
  }
}

export default new APAdminPortalApiProductsService();
