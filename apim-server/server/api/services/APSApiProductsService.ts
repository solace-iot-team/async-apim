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
 } from '../../../src/@solace-iot-team/apim-server-openapi-node';
import { 
  ApiBadQueryParameterCombinationServerError, 
  ApiInternalServerError, 
  ApiInvalidObjectReferencesServerError, 
  ServerErrorFromError, 
  TApiInvalidObjectReferenceError
} from '../../common/ServerError';
import { APIProduct, APIProductAccessLevel, ApiProductsService } from '@solace-iot-team/apim-connector-openapi-node';
import { APSSessionUser } from './APSSessionService';

export class APSApiProductsService {
  // private static collectionName = "apsUsers";
  private static apiObjectName = "APSApiProduct";
  // private static collectionSchemaVersion = 4;
  // private persistenceService: MongoPersistenceService;

  constructor() {
  }

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSApiProductsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    // placeholder
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  public all = async({ 
    apsSessionUser, 
    organizationId, 
    businessGroupIdList, 
    accessLevelList,
    excludeApiProductIdList,
    apiProductIdList,
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

    // TODO: guard against old versions of API Products which may have null values in attributes
    // const filteredAttributes: attributes = connectorApiProduct.attributes.filter( (x) => {
    //   return x !== null;
    // });
    // connectorApiProduct.attributes = filteredAttributes;
    // if(connectorApiProduct.meta !== undefined && connectorApiProduct.meta.attributes !== undefined) {
    //   const filteredMetaAttributes: attributes = connectorApiProduct.meta.attributes.filter( (x) => {
    //     return x !== null;
    //   });
    //   connectorApiProduct.meta.attributes = filteredMetaAttributes;
    // }
    // return connectorApiProduct;

    // TODO
    // let includeBasedOnSourceAndMode: boolean = true;
    // switch(apOperationsMode) {
    //   case E_AP_OPS_MODE.FULL_OPS_MODE:
    //     includeBasedOnSourceAndMode = true;
    //     break;
    //   case E_AP_OPS_MODE.EP2_OPS_MODE:
    //     if(apAdminPortalApiProductDisplay4List.apApiProductSource === E_ApApiProductSource.EP2) includeBasedOnSourceAndMode = true;
    //     else includeBasedOnSourceAndMode = false;
    //     break;
    //   default:
    //     Globals.assertNever(logName, apOperationsMode);
    // } 


    // TODO: 
    excludeApiProductIdList;
    apiProductIdList;


    const filteredConnectorApiProductList: Array<APIProduct> = _connectorApiProductList.filter( (apiProduct: APIProduct) => {
      let doInclude = false;
      if(businessGroupIdList && businessGroupIdList.length > 0) {
        // lazy, should really look at the specific attribute
        const attributesString: string = JSON.stringify(apiProduct.attributes);
        // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'attributesString', details: {
        //   attributesString: attributesString,
        //   businessGroupIdList: businessGroupIdList
        // }}));
        let idx = 0;
        while (!doInclude && idx < businessGroupIdList.length) {
          if(attributesString.includes(businessGroupIdList[idx])) doInclude = true;
          idx++;
        }
      }
      // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'doInclude', details: {
      //   doInclude: doInclude,
      //   accessLevel: apiProduct.accessLevel ? apiProduct.accessLevel : 'undefined',
      //   accessLevelList: accessLevelList
      // }}));

      // exclude if not correct access level, include if not set
      if(doInclude && accessLevelList && apiProduct.accessLevel) {
        doInclude = accessLevelList.includes(apiProduct.accessLevel);
      } 
      return doInclude;
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

    // const mongoPagingInfo: TMongoPagingInfo = { pageNumber: pagingInfo.pageNumber, pageSize: pagingInfo.pageSize };
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

  private createAPSApiProductResponseList = async({ connectorApiProductList }:{
    connectorApiProductList: Array<APIProduct>;
  }): Promise<APSApiProductResponseList> => {
    // // retrieve all orgs and add org displayName to membersOfOrganizations for each user
    // const mongoOrgResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
    // const apsOrganizationList: APSOrganizationList = mongoOrgResponse.list;

    const apsApiProductResponseList: APSApiProductResponseList = [];
    for(const connectorApiProduct of connectorApiProductList) {
      const apsApiProductResponse: APSApiProductResponse = this.createAPSApiProductResponse({ connectorApiProduct: connectorApiProduct });
      apsApiProductResponseList.push(apsApiProductResponse);
    }
    return apsApiProductResponseList;
  }

}

export default new APSApiProductsService();
