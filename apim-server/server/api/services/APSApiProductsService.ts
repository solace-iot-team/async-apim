import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import { MongoPersistenceService, TMongoAllReturn, TMongoPagingInfo, TMongoSearchInfo, TMongoSortInfo } from '../../common/MongoPersistenceService';
import { TApiPagingInfo, TApiSearchInfo, TApiSortInfo } from '../utils/ApiQueryHelper';
import { ServerUtils } from '../../common/ServerUtils';
import { 
  APSApiProductResponse,
  APSApiProductResponseList,
  APSId,
  APSUserLoginCredentials,
  APSUserUpdate,
  ListApsUsersResponse,
  APSUserResponseList,
  APSUserResponse,
  APSOrganizationRolesList,
  APSOrganizationRoles,
  ListAPSOrganizationResponse,
  APSOrganizationList,
  APSOrganization,
  APSOrganizationRolesResponseList,
  APSUserCreate,
  EAPSSystemAuthRole,
  ListAPSApiProductsResponse,
  APSApiProductSource,
 } from '../../../src/@solace-iot-team/apim-server-openapi-node';
import { 
  ApiBadQueryParameterCombinationServerError, 
  ApiInternalServerError, 
  ApiInvalidObjectReferencesServerError, 
  ServerErrorFromError, 
  TApiInvalidObjectReferenceError
} from '../../common/ServerError';
import { APIProduct, APIProductAccessLevel, ApiProductsService, attributes } from '@solace-iot-team/apim-connector-openapi-node';
import { APSSessionUser } from './APSSessionService';

type TApiProductAttribute = {
  name: string;
  value: string;
}

export class APSApiProductsService {
  // private static collectionName = "apsUsers";
  private static apiObjectName = "APSApiProduct";
  // private static collectionSchemaVersion = 4;
  // private persistenceService: MongoPersistenceService;

  private readonly ApiProductAttribute_Source_Name: string = "_IMP_SOURCE_";
  private readonly ApiProductAttribute_Source_Value_EventPortal_2 = "Solace Event Portal";

  constructor() {
  }

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSApiProductsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    // placeholder
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }
  /**
   * Create combined, non-duplicate attribute list.
   * - get rid of null values 
   * - meta attributes override version attributes
   */
  private create_combinedApiProductAttributes({ versionAttributes, metaAttributes }:{
    versionAttributes: Array<TApiProductAttribute>;
    metaAttributes?: Array<TApiProductAttribute>;
  }): Array<TApiProductAttribute> {

    const _metaAttributes: Array<TApiProductAttribute> = metaAttributes !== undefined ? metaAttributes : [];
    const _combinedAttributes: Array<TApiProductAttribute> = _metaAttributes.filter( (x) => {
      return x !== null;
    });
    for(const nameValuePair of versionAttributes) {
      if(nameValuePair !== null) {
        const exists: TApiProductAttribute | undefined = _combinedAttributes.find( (x) => {
          return x.name === nameValuePair.name;
        });
        if(exists === undefined) _combinedAttributes.push(nameValuePair);

      }
    }
    return _combinedAttributes;
  }
  /**
   * Determines the source of the api product based on attribute.
   */
  private doInclude_ApApiProductSource({ source, combined_ApiProductAttributes }:{
    source?: APSApiProductSource;
    combined_ApiProductAttributes: Array<TApiProductAttribute>;
  }): boolean {
    const funcName = 'doInclude_ApApiProductSource';
    const logName = `${APSApiProductsService.name}.${funcName}()`;

    if(source === undefined) return true;
    const sourceAttribute: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_Source_Name;
    });
    if(sourceAttribute === undefined) return false;
    switch(source) {
      case APSApiProductSource.EVENT_PORTAL_2:
        return sourceAttribute.value.includes(this.ApiProductAttribute_Source_Value_EventPortal_2);
      default:
        ServerUtils.assertNever(logName, source);
    }
    return false;
  }

  public all = async({ 
    apsSessionUser, 
    organizationId, 
    businessGroupIdList, 
    accessLevelList,
    excludeApiProductIdList,
    apiProductIdList,
    source,
    pagingInfo, 
    sortInfo, 
    searchInfo 
  }:{
    apsSessionUser: APSSessionUser;
    organizationId: string;
    businessGroupIdList?: Array<string>;
    accessLevelList?: Array<APIProductAccessLevel>;
    excludeApiProductIdList?: Array<string>;
    apiProductIdList?: Array<string>;
    source?: APSApiProductSource;
    pagingInfo: TApiPagingInfo;
    sortInfo: TApiSortInfo;
    searchInfo: TApiSearchInfo;
  }): Promise<ListAPSApiProductsResponse> => {
    const funcName = 'all';
    const logName = `${APSApiProductsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'ListApsUsersResponse', details: {
      apsSessionUser: apsSessionUser,
      organizationId: organizationId,
      businessGroupIdList: businessGroupIdList,
      accessLevelList: accessLevelList,
      pagingInfo: pagingInfo,
      sortInfo: sortInfo,
      searchInfo: searchInfo
    }}));

    const _connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId,
    });

    const filteredConnectorApiProductList: Array<APIProduct> = _connectorApiProductList.filter( (apiProduct: APIProduct) => {
      let doInclude = true;
      // exclude api products
      if(excludeApiProductIdList !== undefined) {
        doInclude = !excludeApiProductIdList.includes(apiProduct.name);
      }
      if(!doInclude) return false;
      // include api products
      if(apiProductIdList !== undefined) {
        doInclude = apiProductIdList.includes(apiProduct.name);
      }
      if(!doInclude) return false;
      // create clean & combined attributes from version & meta
      const combined_ApiProductAttributes: Array<TApiProductAttribute> = this.create_combinedApiProductAttributes({
        versionAttributes: apiProduct.attributes,
        metaAttributes: apiProduct.meta?.attributes
      });
      // source
      doInclude = this.doInclude_ApApiProductSource({ source: source, combined_ApiProductAttributes: combined_ApiProductAttributes });
      // // DEBUG
      // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'after source filtering', details: {
      //   doInclude: doInclude,
      //   source: source ? source : 'undefined',
      //   apiProduct: apiProduct,
      // }}));
      if(!doInclude) return false;
      // exclude if not correct access level, include if not set
      if(accessLevelList && apiProduct.accessLevel) {
        doInclude = accessLevelList.includes(apiProduct.accessLevel);
      } 
      if(!doInclude) return false;
      // business groups
      if(businessGroupIdList && businessGroupIdList.length > 0) {
        let _doInclude = false;
        // lazy, should really look at the specific attribute
        const attributesString: string = JSON.stringify(combined_ApiProductAttributes);
        // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'attributesString', details: {
        //   attributesString: attributesString,
        //   businessGroupIdList: businessGroupIdList
        // }}));
        let idx = 0;
        while (!_doInclude && idx < businessGroupIdList.length) {
          if(attributesString.includes(businessGroupIdList[idx])) _doInclude = true;
          idx++;
        }
        doInclude = _doInclude;
      }
      // // DEBUG
      // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'after business group filtering', details: {
      //   doInclude: doInclude,
      //   businessGroupIdList: businessGroupIdList,
      //   apiProduct: apiProduct,
      // }}));
      if(!doInclude) return false;
      return true;
    });
  
    // const apsUserSortFieldNameValidationSchema: Partial<APSUserInternal> = {
    //   isActivated: false,
    //   userId: 'string',
    //   profile: {
    //     email: 'string',
    //     first: 'string',
    //     last: 'string'
    //   },
    //   systemRoles: [],
    //   memberOfOrganizations: [],
    //   memberOfOrganizationGroups: []
    // };

    // const mongoSortInfo: TMongoSortInfo = { sortFieldName: sortInfo.sortFieldName, sortDirection: sortInfo.sortDirection, apsObjectSortFieldNameValidationSchema: apsUserSortFieldNameValidationSchema, apsObjectName: APSUsersService.apiObjectName };
    // const mongoSearchInfo: TMongoSearchInfo = { 
    //   searchWordList: searchInfo.searchWordList
    // };
    // mongoSearchInfo.filter = {};
    // // cannot use both together, etiher or
    // if(searchInfo.searchOrganizationId !== undefined && searchInfo.excludeSearchOrganizationId !== undefined) {
    //   throw new ApiBadQueryParameterCombinationServerError(logName, undefined, {
    //     apsObjectName: APSUsersService.apiObjectName,
    //     invalidQueryParameterCombinationList: [
    //       ServerUtils.getPropertyNameString(searchInfo, (x) => x.searchOrganizationId),
    //       ServerUtils.getPropertyNameString(searchInfo, (x) => x.excludeSearchOrganizationId),
    //     ]
    //   });
    // }
    // if(searchInfo.searchOrganizationId !== undefined) {
    //   mongoSearchInfo.filter.memberOfOrganizations = {
    //     $elemMatch: { organizationId: searchInfo.searchOrganizationId }
    //   }
    // } else if(searchInfo.excludeSearchOrganizationId !== undefined) {
    //   mongoSearchInfo.filter.memberOfOrganizations = {
    //     $not: {
    //       $elemMatch: { organizationId: searchInfo.excludeSearchOrganizationId }
    //     }
    //   }
    // }
    // if(searchInfo.searchIsActivated !== undefined) {
    //   // mongoSearchInfo.filter.isActivated = { $eq: searchInfo.searchIsActivated };
    //   mongoSearchInfo.filter.isActivated = searchInfo.searchIsActivated;
    // }
    // // userId
    // if(searchInfo.searchUserId !== undefined) {
    //   mongoSearchInfo.filter.userId = new RegExp('.*' + searchInfo.searchUserId + '.*');
    // }

    // const mongoAllReturn: TMongoAllReturn = await this.persistenceService.all({
    //   pagingInfo: mongoPagingInfo,
    //   sortInfo: mongoSortInfo,
    //   searchInfo: mongoSearchInfo
    // });
    // const apsUserInternalList: APSUserInternalList = mongoAllReturn.documentList;
    // const apsUserResponseList: APSUserResponseList = await this.createAPSUserResponseList({
    //   apsUserInternalList: apsUserInternalList
    // });

    const filteredTotalCount = filteredConnectorApiProductList.length;
    const apsApiProductResponseList: APSApiProductResponseList = await this.createAPSApiProductResponseList({
      connectorApiProductList: filteredConnectorApiProductList,
      pagingInfo: pagingInfo,
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSApiProductResponseList', details: apsApiProductResponseList }));
    // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSApiProductResponseList', details: apsApiProductResponseList }));

    return {
      list: apsApiProductResponseList,
      meta: {
        totalCount: filteredTotalCount
      }
    }
  }

  // public byId = async({ userId }: {
  //   userId: string;
  // }): Promise<APSUserResponse> => {
  //   const funcName = 'byId';
  //   const logName = `${APSUsersService.name}.${funcName}()`;

  //   await this.wait4CollectionUnlock();

  //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'APSUserResponse', details: { userId: userId } }));

  //   let apsUserResponse: APSUserResponse;
  //   if(userId === APSUsersService.rootApsUser.userId) {
  //     apsUserResponse = await this.getRootApsUserResponse();
  //   } else {
  //     const apsUserInternal: APSUserInternal = await this.persistenceService.byId({
  //       documentId: userId
  //     });
  //     const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
  //     const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;
  //     apsUserResponse = this.createAPSUserResponse({
  //       apsUserInternal: apsUserInternal, 
  //       apsOrganizationList: apsOrganizationList
  //     });  
  //   }

  //   ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'APSUserResponse', details: apsUserResponse }));

  //   return apsUserResponse;
  // }


  public createAPSApiProductResponse = ({ connectorApiProduct }:{
    connectorApiProduct: APIProduct;
  }): APSApiProductResponse => {

    const apsApiProductResponse: APSApiProductResponse = {
      connectorApiProduct: connectorApiProduct
    };

    return apsApiProductResponse;  
  }

  private createAPSApiProductResponseList = async({ connectorApiProductList, pagingInfo }:{
    connectorApiProductList: Array<APIProduct>;
    pagingInfo: TApiPagingInfo;
  }): Promise<APSApiProductResponseList> => {
    // const funcName = 'createAPSApiProductResponseList';
    // const logName = `${APSApiProductsService.name}.${funcName}()`;

    const startIdx = (pagingInfo.pageSize * (pagingInfo.pageNumber-1));
    const endIdx = (startIdx + pagingInfo.pageSize);
    const page_connectorApiProductList: Array<APIProduct> = connectorApiProductList.slice(startIdx, endIdx);
    // // DEBUG
    // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'after paging', details: {
    //   pagingInfo: pagingInfo,
    //   startIdx: startIdx,
    //   endIdx: endIdx,
    //   page_connectorApiProductListLength: page_connectorApiProductList.length
    // }}));
    const apsApiProductResponseList: APSApiProductResponseList = [];
    for(const connectorApiProduct of page_connectorApiProductList) {
      const apsApiProductResponse: APSApiProductResponse = this.createAPSApiProductResponse({ connectorApiProduct: connectorApiProduct });
      apsApiProductResponseList.push(apsApiProductResponse);
    }
    return apsApiProductResponseList;
  }

}

export default new APSApiProductsService();
