import { 
  APIProduct,
  ApiProductsService, 
  CommonEntityNameList,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APApiProductsDisplayService, 
  IAPApiProductDisplay, 
} from '../../displayServices/APApiProductsDisplayService';
import APEnvironmentsDisplayService, { TAPEnvironmentDisplayList } from '../../displayServices/APEnvironmentsDisplayService';
import APVersioningDisplayService, { IAPVersionInfo } from '../../displayServices/APVersioningDisplayService';
import APEntityIdsService, { TAPEntityIdList } from '../../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../../utils/APSearchContentService';

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

  private async create_ApAdminPortalApiProductDisplay_From_ApiEntities({ organizationId, connectorApiProduct, connectorRevisions, completeApEnvironmentDisplayList, default_ownerId, currentVersion }:{
    organizationId: string;
    connectorApiProduct: APIProduct;
    connectorRevisions?: Array<string>;
    completeApEnvironmentDisplayList: TAPEnvironmentDisplayList;
    default_ownerId: string;
    currentVersion?: string;
  }): Promise<TAPAdminPortalApiProductDisplay> {
    
    const base: IAPApiProductDisplay = await this.create_ApApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      connectorRevisions: connectorRevisions, 
      completeApEnvironmentDisplayList: completeApEnvironmentDisplayList,
      default_ownerId: default_ownerId,
      currentVersion: currentVersion,
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

  public get_IsDeleteAllowed({ apApiProductDisplay }:{
    apApiProductDisplay: IAPApiProductDisplay;
  }): boolean {
    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = apApiProductDisplay as TAPAdminPortalApiProductDisplay;
    if(!super.get_IsDeleteAllowed({
      apApiProductDisplay: apApiProductDisplay
    })) return false;
    if(apAdminPortalApiProductDisplay.apAppReferenceEntityIdList.length > 0) return false;
    return true;
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

  private apiGetList_ConnectorApiProductList = async({ organizationId, businessGroupId }: {
    organizationId: string;
    businessGroupId?: string;
  }): Promise<Array<APIProduct>> => {
    // const funcName = 'apiGetList_ConnectorApiProductList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const connectorApiProductList: Array<APIProduct> = [];
    // get the business group Id first
    let filter: string | undefined = undefined;
    if(businessGroupId !== undefined) {
      filter = this.create_ConnectorFilter_For_Attribute({
        attributeName: this.get_AttributeName_OwningBusinessGroupId(),
        attributeValue: businessGroupId
      });
    }
    const businessGroupConnectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId,
      filter: filter
    });
    // console.log(`${logName}: filter = ${filter}`);
    // console.log(`${logName}: businessGroupConnectorApiProductList=${JSON.stringify(businessGroupConnectorApiProductList, null, 2)}`);

    // TODO: filter again, until connector search is fixed
    if(businessGroupId !== undefined) {
      const owningBusinessGroup_AttributeName: string = this.get_AttributeName_OwningBusinessGroupId();
      for(const connectorApiProduct of businessGroupConnectorApiProductList) {
        const attribute = connectorApiProduct.attributes.find( (x) => {
          return x.name === owningBusinessGroup_AttributeName;
        });
        if(attribute !== undefined && attribute.value.includes(businessGroupId)) {
          connectorApiProductList.push(connectorApiProduct);
        }
      }
    }
    // now get the sharing business group ids
    if(businessGroupId !== undefined) {
      filter = this.create_ConnectorFilter_For_Attribute({
        attributeName: this.get_AttributeName_SharingBusinessGroupId(),
        attributeValue: businessGroupId
      });
      const sharingConnectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
        organizationName: organizationId,
        filter: filter
      });
      // console.log(`${logName}: sharing filter = ${filter}`);
      // console.log(`${logName}: sharingConnectorApiProductList=${JSON.stringify(sharingConnectorApiProductList, null, 2)}`);
      // TODO: filter again, until connector search is fixed
      const sharingBusinessGroup_AttributeName: string = this.get_AttributeName_SharingBusinessGroupId();
      for(const connectorApiProduct of sharingConnectorApiProductList) {
        const attribute = connectorApiProduct.attributes.find( (x) => {
          return x.name === sharingBusinessGroup_AttributeName;
        });
        if(attribute !== undefined && attribute.value.includes(businessGroupId)) {
          connectorApiProductList.push(connectorApiProduct);
        }
      }
    }
    return connectorApiProductList;
  }

  public apiGetList_ApAdminPortalApiProductDisplayList = async({ organizationId, businessGroupId, default_ownerId }: {
    organizationId: string;
    businessGroupId: string;
    default_ownerId: string;
  }): Promise<TAPAdminPortalApiProductDisplayList> => {
    
    const connectorApiProductList: Array<APIProduct> = await this.apiGetList_ConnectorApiProductList({
      organizationId: organizationId,
      businessGroupId: businessGroupId
    })
    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });

    const apAdminPortalApiProductDisplayList: TAPAdminPortalApiProductDisplayList = [];
    for(const connectorApiProduct of connectorApiProductList) {
      const apVersionInfo: IAPVersionInfo = APVersioningDisplayService.create_ApVersionInfo_From_ApiEntities({ connectorMeta: connectorApiProduct.meta });
      const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
        organizationId: organizationId,
        connectorApiProduct: connectorApiProduct,
        completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
        default_ownerId: default_ownerId,
        currentVersion: apVersionInfo.apCurrentVersion,
      });
      apAdminPortalApiProductDisplayList.push(apAdminPortalApiProductDisplay);
    }
    return apAdminPortalApiProductDisplayList;
  }

  public apiGetList_ApiProductEntityIdList_By_BusinessGroupId = async({ organizationId, businessGroupId }: {
    organizationId: string;
    businessGroupId: string;
  }): Promise<TAPEntityIdList> => {
    
    const connectorApiProductList: Array<APIProduct> = await this.apiGetList_ConnectorApiProductList({
      organizationId: organizationId,
      businessGroupId: businessGroupId
    })

    const list: TAPEntityIdList = connectorApiProductList.map( (x) => {
      return {
        id: x.name,
        displayName: x.displayName
      };
    });

    return list;
  }

  public apiGet_AdminPortalApApiProductDisplay = async({ organizationId, apiProductId, default_ownerId, fetch_revision_list = false, revision }: {
    organizationId: string;
    apiProductId: string;
    default_ownerId: string;
    fetch_revision_list?: boolean;    
    revision?: string;
  }): Promise<TAPAdminPortalApiProductDisplay> => {

    let connectorApiProduct: APIProduct;
    if(revision === undefined) {
      connectorApiProduct = await ApiProductsService.getApiProduct({
        organizationName: organizationId,
        apiProductName: apiProductId
      });
    } else {
      connectorApiProduct = await ApiProductsService.getApiProductRevision({
        organizationName: organizationId,
        apiProductName: apiProductId,
        semver: revision
      });
    }
    // get the revision list
    let connectorRevisions: Array<string> | undefined = undefined;
    if(fetch_revision_list) {
      connectorRevisions = await ApiProductsService.listApiProductRevisions({
        organizationName: organizationId,
        apiProductName: apiProductId
      });
    }

    // get the complete env list for reference
    const complete_apEnvironmentDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsDisplayService.apiGetList_ApEnvironmentDisplay({
      organizationId: organizationId
    });
    
    const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await this.create_ApAdminPortalApiProductDisplay_From_ApiEntities({
      organizationId: organizationId,
      connectorApiProduct: connectorApiProduct,
      connectorRevisions: connectorRevisions,
      completeApEnvironmentDisplayList: complete_apEnvironmentDisplayList,
      default_ownerId: default_ownerId,
      currentVersion: revision,
    });
    return apAdminPortalApiProductDisplay;
  }

}

export default new APAdminPortalApiProductsDisplayService();
