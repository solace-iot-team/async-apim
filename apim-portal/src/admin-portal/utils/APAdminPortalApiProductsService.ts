import { APIInfo, APIInfoList, ApiProductsService, ApisService, CommonEntityNameList, CommonEntityNames } from '@solace-iot-team/apim-connector-openapi-browser';
import { TAPApiProductDisplay, APApiProductsService, TAPApiProductDisplayList } from '../../utils/APApiProductsService';
import { TAPEntityIdList } from '../../utils/APEntityId';

export type TAPAdminPortalApiProductDisplay = TAPApiProductDisplay & {
  connectorApiInfoList: APIInfoList,
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

  public listAdminPortalApiProductDisplay = async({ organizationId }: {
    organizationId: string;
  }): Promise<TAPAdminPortalApiProductDisplayList> => {

    // const funcName = 'listAdminPortalApiProductDisplay';
    // const logName = `${this.APDeveloperPortalApiProductsService_ComponentName}.${funcName}()`;
    // console.log(`${logName}: starting ...`)

    const baseList: TAPApiProductDisplayList = await this.listApiProductDisplay({
      organizationId: organizationId,
    }); 
    const adminPortalList: TAPAdminPortalApiProductDisplayList = [];
    // fetch APIInfo for each api
    for(const base of baseList) {

// TODO: use APApisService for this

      const connectorApiInfoList: APIInfoList = [];
      for(const connectorApiName of base.connectorApiProduct.apis) {
        const connectorApiInfo: APIInfo = await ApisService.getApiInfo({
          organizationName: organizationId,
          apiName: connectorApiName
        });
        connectorApiInfoList.push(connectorApiInfo);
      }

      const adminPortalObject: TAPAdminPortalApiProductDisplay = {
        ...base,
        connectorApiInfoList: connectorApiInfoList,
        apAppReferenceEntityIdList: await this.listAppReferencesToApiProducts({
          organizationId: organizationId,
          apiProductId: base.apEntityId.id
        })
      }
      adminPortalList.push(adminPortalObject);
    }
    return adminPortalList;
  }

  public getAdminPortalApiProductDisplay = async({ organizationId, apiProductId }: {
    organizationId: string;
    apiProductId: string;
  }): Promise<TAPAdminPortalApiProductDisplay> => {

    const base = await this.getApiProductDisplay({
      organizationId: organizationId,
      apiProductId: apiProductId
    });


    // TODO: use APApisService for this

    const connectorApiInfoList: APIInfoList = [];
    for(const connectorApiName of base.connectorApiProduct.apis) {
      const connectorApiInfo: APIInfo = await ApisService.getApiInfo({
        organizationName: organizationId,
        apiName: connectorApiName
      });
      connectorApiInfoList.push(connectorApiInfo);
    }
    const adminPortalObject: TAPAdminPortalApiProductDisplay = {
      ...base,
      connectorApiInfoList: connectorApiInfoList,
      apAppReferenceEntityIdList: await this.listAppReferencesToApiProducts({
        organizationId: organizationId,
        apiProductId: apiProductId
      })
    }
    return adminPortalObject;
  }
}

export default new APAdminPortalApiProductsService();
