import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import { TApiPagingInfo, TApiSearchInfo } from '../utils/ApiQueryHelper';
import { ServerUtils } from '../../common/ServerUtils';
import { 
  APSApiProductResponse,
  APSApiProductResponseList,
  ListAPSApiProductsResponse,
  APSApiProductSource,
  EAPSSortDirection,
  EAPSApiProductSortFieldName,
 } from '../../../src/@solace-iot-team/apim-server-openapi-node';
import { APIProduct, APIProductAccessLevel, ApiProductsService } from '@solace-iot-team/apim-connector-openapi-node';
import { APSSessionUser } from './APSSessionService';

type TApiProductAttribute = {
  name: string;
  value: string;
}

type TApiProductSearchableInfo = {
  displayName?: string;
  version?: string;
  source?: string;
  stage?: string;
  apis?: Array<string>;
  owningBusinessGroupDisplayName?: string;
  businessGroupSharingList?: string;
  publishDestination?: string;
}

// *******************************************************************************************
// TODO: into the API
// enum EAPSBusinessGroupSharing_AccessType {
//   READONLY = "readonly",
//   FULL_ACCESS = "full-access",
// }

interface IAPSEntityId {
  id: string;
  displayName: string;
}
// interface IAPSBusinessGroupSharing extends IAPSEntityId {
//   sharingAccessType: EAPSBusinessGroupSharing_AccessType;
//   externalReference?: any;
// }
interface IAPSBusinessGroupInfo {
  owningBusinessGroupEntityId?: IAPSEntityId;
  businessGroupSharingJsonString?: string;
}
interface IAPSPublishDestinationInfo {
  publishDestinationEntityIdList: Array<IAPSEntityId>;
}
interface IAPSManagedAsset extends IAPSEntityId {
  businessGroupInfo: IAPSBusinessGroupInfo;
  publishDestinationInfo: IAPSPublishDestinationInfo;
}
interface IAPSApiProduct extends IAPSManagedAsset {
  connectorApiProduct: APIProduct;
  source: string;
}
// *******************************************************************************************
// TODO: into the API

export class APSApiProductsService {
  // private static collectionName = "apsUsers";
  private static apiObjectName = "APSApiProduct";
  // private static collectionSchemaVersion = 4;
  // private persistenceService: MongoPersistenceService;

  private readonly ApiProductAttribute_OwningBusinessGroup_Id = "_AP_BUSINESS_GROUP_OWNING_ID_";
  private readonly ApiProductAttribute_OwningBusinessGroup_DisplayName = "_AP_BUSINESS_GROUP_OWNING_DISPLAY_NAME_";
  private readonly ApiProductAttribute_BusinessGroupSharingList = "_AP_BUSINESS_GROUP_SHARING_LIST_";
  private readonly ApiProductAttribute_PublishDestination = "_AP_PUBLISH_DESTINATION_";
  private readonly ApiProductAttribute_Source_Name: string = "_AC_IMP_SOURCE_";
  private readonly ApiProductAttribute_Source_Value_EventPortal_2 = "Solace Event Portal";

  // constructor() {
  // }

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${APSApiProductsService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING }));
    // placeholder
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED }));
  }

  /**
   * 
   * @param source - must be an object or string to start with, cannot start with array 
   * @param result 
   * @returns result
   */
  private generateSearchContentString = (source: any, result = ''): string => {
    // const funcName = 'generateSearchContentString';
    // const logName = `${APSApiProductsService.name}.${funcName}()`;
    const isObject = (obj:any ) => obj && typeof obj === 'object' && !Array.isArray(obj);
    const isArray = (obj:any) => obj && Array.isArray(obj) && typeof obj !== 'string';
    const isString = (obj:any) => obj && typeof obj === 'string';
    if(source === undefined || source === null) return result;
    if(isString(source)) return result += source.toLowerCase() + ',';
    if(!isObject(source)) return result;
    for(const key of Object.keys(source)) {
      const value = source[key];
      // // DEBUG
      // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'key', details: {
      //   key: key,
      //   value: value,
      //   isObject: isObject(value),
      //   isArray: isArray(value)
      // }}));
      if (isArray(value) && value.length > 0) {
        // // DEBUG
        // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'isArray', details: {
        //   key: key,
        //   value: value,
        // }}));
        for(const elem of value) {
          result += this.generateSearchContentString(elem);
        }
      }
      else result += this.generateSearchContentString(value);
      // else if (isObject(value)) result += this.generateSearchContentString(value);
      // else if(typeof value === 'string') result += value !== undefined ? value + ',' + value.toLowerCase() + ',' : '';
      // else if(typeof value === 'string') result += value + ',' + value.toLowerCase() + ',';
      // else if(typeof value === 'string') result += value.toLowerCase() + ',';
    }
    // Object.keys(source).forEach( key => {
    //   const value = source[key];
    //   if (Array.isArray(value) && value.length > 0) {

    //     // DEBUG
    //     ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'isArray', details: {
    //       key: key,
    //       value: value,
    //     }}));
        
    //     for(const elem of value) {
    //       result += this.generateSearchContentString(elem);
    //     }
    //   }
    //   else if (isObject(value)) result += this.generateSearchContentString(value);
    //   // else if(typeof value === 'string') result += value !== undefined ? value + ',' + value.toLowerCase() + ',' : '';
    //   // else if(typeof value === 'string') result += value + ',' + value.toLowerCase() + ',';
    //   else if(typeof value === 'string') result += value.toLowerCase() + ',';
    // });
    return result;
  }

  private create_SearcheableString({ apiProduct, combined_ApiProductAttributes }:{
    apiProduct: APIProduct;
    combined_ApiProductAttributes: Array<TApiProductAttribute>;
  }): string {

    const sourceAttribute: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_Source_Name;
    });
    const owningBusinessGroupAttribute: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_OwningBusinessGroup_DisplayName;
    });
    const businessGroupSharingListAttribute: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_BusinessGroupSharingList;
    });
    const publishDestinationAttribute: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_PublishDestination;
    });
    
    const searchableInfo: TApiProductSearchableInfo = {
      displayName: apiProduct.displayName,
      version: apiProduct.meta?.version,
      source: sourceAttribute?.value,
      stage: apiProduct.meta?.stage,
      apis: apiProduct.apis,
      owningBusinessGroupDisplayName: owningBusinessGroupAttribute?.value,
      businessGroupSharingList: businessGroupSharingListAttribute?.value,
      publishDestination: publishDestinationAttribute?.value,
    };
    return this.generateSearchContentString(searchableInfo).toLowerCase();
  }

  private create_IAPSApiProduct_SearcheableString({ apsApiProduct }:{
    apsApiProduct: IAPSApiProduct;
  }): string {
    const searchableInfo: TApiProductSearchableInfo = {
      displayName: apsApiProduct.displayName,
      version: apsApiProduct.connectorApiProduct.meta?.version,
      source: apsApiProduct.source,
      stage: apsApiProduct.connectorApiProduct.meta?.stage,
      apis: apsApiProduct.connectorApiProduct.apis,
      owningBusinessGroupDisplayName: apsApiProduct.businessGroupInfo.owningBusinessGroupEntityId?.displayName,
      businessGroupSharingList: apsApiProduct.businessGroupInfo.businessGroupSharingJsonString,
      publishDestination: JSON.stringify(apsApiProduct.publishDestinationInfo.publishDestinationEntityIdList)
    };
    return this.generateSearchContentString(searchableInfo).toLowerCase();
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
  private sortConnectorApiProductList({ connectorApiProductList, sortFieldName, sortDirection }:{
    connectorApiProductList: Array<APIProduct>;
    sortFieldName?: EAPSApiProductSortFieldName;
    sortDirection?: EAPSSortDirection;
  }): Array<APIProduct> {
    const funcName = 'sortConnectorApiProductList';
    const logName = `${APSApiProductsService.name}.${funcName}()`;  
    const getValueByFieldName = (apiProduct: APIProduct, sortFieldName: EAPSApiProductSortFieldName): string => {
      const funcName = 'sortConnectorApiProductList().getValueByFieldName';
      const logName = `${APSApiProductsService.name}.${funcName}()`;  
      switch(sortFieldName) {
        case EAPSApiProductSortFieldName.DISPLAY_NAME:
          return apiProduct.displayName;
        case EAPSApiProductSortFieldName.STAGE:
          return apiProduct.meta && apiProduct.meta.stage ? apiProduct.meta.stage : '';
        case EAPSApiProductSortFieldName.SOURCE:
          return 'TODO';
        case EAPSApiProductSortFieldName.OWNING_BUSINESS_GROUP_DISPLAY_NAME:
          return 'TODO'
        default:
          ServerUtils.assertNever(logName, sortFieldName);
      }
      return '';
    }
    if(sortFieldName === undefined || sortDirection === undefined) return connectorApiProductList;
    return connectorApiProductList.sort((one: APIProduct, two: APIProduct) => {
      const _oneSortValue: string = getValueByFieldName(one, sortFieldName).toLowerCase();
      const _twoSortValue: string = getValueByFieldName(two, sortFieldName).toLowerCase();
      // DEBUG
      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'sorting', details: {
        sortFieldName: sortFieldName,
        _oneSortValue: _oneSortValue,
        _twoSortValue: _twoSortValue
      }}));

      switch(sortDirection) {
        case EAPSSortDirection.DESC:
          return _oneSortValue.localeCompare(_twoSortValue);
        case EAPSSortDirection.ASC:
        default:  
          return _twoSortValue.localeCompare(_oneSortValue);
      }
    });
  }
  private sort_ApsApiProductListList({ apsApiProductList, sortFieldName, sortDirection }:{
    apsApiProductList: Array<IAPSApiProduct>;
    sortFieldName?: EAPSApiProductSortFieldName;
    sortDirection?: EAPSSortDirection;
  }): Array<IAPSApiProduct> {
    // const funcName = 'sort_ApsApiProductListList';
    // const logName = `${APSApiProductsService.name}.${funcName}()`;  
    const getValueByFieldName = (apsApiProduct: IAPSApiProduct, sortFieldName: EAPSApiProductSortFieldName): string => {
      const funcName = 'sort_ApsApiProductListList().getValueByFieldName';
      const logName = `${APSApiProductsService.name}.${funcName}()`;  
      switch(sortFieldName) {
        case EAPSApiProductSortFieldName.DISPLAY_NAME:
          return apsApiProduct.displayName;
        case EAPSApiProductSortFieldName.STAGE:
          return apsApiProduct.connectorApiProduct.meta && apsApiProduct.connectorApiProduct.meta.stage ? apsApiProduct.connectorApiProduct.meta.stage : '';
        case EAPSApiProductSortFieldName.SOURCE:
          return apsApiProduct.source;
        case EAPSApiProductSortFieldName.OWNING_BUSINESS_GROUP_DISPLAY_NAME:
          return apsApiProduct.businessGroupInfo.owningBusinessGroupEntityId ? apsApiProduct.businessGroupInfo.owningBusinessGroupEntityId.displayName : '';
        default:
          ServerUtils.assertNever(logName, sortFieldName);
      }
      return '';
    }
    if(sortFieldName === undefined || sortDirection === undefined) return apsApiProductList;
    return apsApiProductList.sort((one: IAPSApiProduct, two: IAPSApiProduct) => {
      const _oneSortValue: string = getValueByFieldName(one, sortFieldName).toLowerCase();
      const _twoSortValue: string = getValueByFieldName(two, sortFieldName).toLowerCase();
      // // DEBUG
      // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'sorting', details: {
      //   sortFieldName: sortFieldName,
      //   _oneSortValue: _oneSortValue,
      //   _twoSortValue: _twoSortValue
      // }}));
      switch(sortDirection) {
        case EAPSSortDirection.DESC:
          return _oneSortValue.localeCompare(_twoSortValue);
        case EAPSSortDirection.ASC:
        default:  
          return _twoSortValue.localeCompare(_oneSortValue);
      }
    });
  }

  // /**
  //  * Determines the source of the api product based on attribute.
  //  */
  // private doInclude_ApApiProductSource({ source, combined_ApiProductAttributes }:{
  //   source?: APSApiProductSource;
  //   combined_ApiProductAttributes: Array<TApiProductAttribute>;
  // }): boolean {
  //   const funcName = 'doInclude_ApApiProductSource';
  //   const logName = `${APSApiProductsService.name}.${funcName}()`;

  //   if(source === undefined) return true;
  //   const sourceAttribute: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
  //     return  x.name === this.ApiProductAttribute_Source_Name;
  //   });
  //   if(sourceAttribute === undefined) return false;
  //   switch(source) {
  //     case APSApiProductSource.EVENT_PORTAL_2:
  //       return sourceAttribute.value.includes(this.ApiProductAttribute_Source_Value_EventPortal_2);
  //     case APSApiProductSource.UNKNOWN:
  //       return true;
  //     default:
  //       ServerUtils.assertNever(logName, source);
  //   }
  //   return false;
  // }

  private create_Source({ combined_ApiProductAttributes }:{
    combined_ApiProductAttributes: Array<TApiProductAttribute>;
  }): APSApiProductSource {
    const sourceAttribute: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_Source_Name;
    });
    if(sourceAttribute === undefined) return APSApiProductSource.UNKNOWN;
    if(sourceAttribute.value.includes(this.ApiProductAttribute_Source_Value_EventPortal_2)) return APSApiProductSource.EVENT_PORTAL_2;
    return APSApiProductSource.UNKNOWN;
  }
  private async create_IAPSPublishDestinationInfo({ combined_ApiProductAttributes }:{
    combined_ApiProductAttributes: Array<TApiProductAttribute>;
  }): Promise<IAPSPublishDestinationInfo> {
    const funcName = 'create_IAPSPublishDestinationInfo';
    const logName = `${APSApiProductsService.name}.${funcName}()`;

    const publishDestinationAttribute: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_PublishDestination;
    });
    const publisDestinationIdList: Array<string> = [];
    if(publishDestinationAttribute !== undefined) {
      try {
        publisDestinationIdList.push(...publishDestinationAttribute.value.split(','));
      } catch(e: any) {
        // DEBUG
        ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'publishDestinationAttribute', details: {
          publishDestinationAttribute: publishDestinationAttribute,
          error: e
        }}));
      }
    }
    const publisDestinationEntityIdList: Array<IAPSEntityId> = publisDestinationIdList.map( (id) => {
      return {
        id: id,
        displayName: id
      }
    });
    return {
      publishDestinationEntityIdList: publisDestinationEntityIdList
    }
  }
  private async create_IAPSBusinessGroupInfo({ combined_ApiProductAttributes }:{
    combined_ApiProductAttributes: Array<TApiProductAttribute>
  }): Promise<IAPSBusinessGroupInfo> {
    // owning
    const attribute_owningBusinessGroupId: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_OwningBusinessGroup_Id;
    });
    const attribute_owningBusinessGroupDisplayName: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_OwningBusinessGroup_DisplayName;
    });
    let owningBusinessGroupEntityId: IAPSEntityId | undefined = undefined;
    if(attribute_owningBusinessGroupId !== undefined) {
      owningBusinessGroupEntityId = {
        id: attribute_owningBusinessGroupId.value,
        displayName: attribute_owningBusinessGroupId.value,
      };
    }
    if(owningBusinessGroupEntityId !== undefined && attribute_owningBusinessGroupDisplayName !== undefined) {
      owningBusinessGroupEntityId.displayName = attribute_owningBusinessGroupDisplayName.value;
    }
    // sharing list
    const attribute_businessGroupSharingList: TApiProductAttribute | undefined = combined_ApiProductAttributes.find( (x) => {
      return  x.name === this.ApiProductAttribute_BusinessGroupSharingList;
    });
    let businessGroupSharingJsonString: string | undefined = undefined;
    if(attribute_businessGroupSharingList !== undefined) {
      businessGroupSharingJsonString = attribute_businessGroupSharingList.value;
    }
    return {
      owningBusinessGroupEntityId: owningBusinessGroupEntityId,
      businessGroupSharingJsonString: businessGroupSharingJsonString, 
    }
  }
  private async create_IAPSApiProduct({ connectorApiProduct }:{
    connectorApiProduct: APIProduct;
  }): Promise<IAPSApiProduct> {

    // create clean & combined attributes from version & meta
    const combined_ApiProductAttributes: Array<TApiProductAttribute> = this.create_combinedApiProductAttributes({
      versionAttributes: connectorApiProduct.attributes,
      metaAttributes: connectorApiProduct.meta?.attributes
    });
    
    // get all apis api info

    const apsApiProduct: IAPSApiProduct = {
      connectorApiProduct: connectorApiProduct,
      id: connectorApiProduct.name,
      displayName: connectorApiProduct.displayName,
      businessGroupInfo: await this.create_IAPSBusinessGroupInfo({combined_ApiProductAttributes: combined_ApiProductAttributes }),
      publishDestinationInfo: await this.create_IAPSPublishDestinationInfo({ combined_ApiProductAttributes: combined_ApiProductAttributes }),
      source: this.create_Source({ combined_ApiProductAttributes: combined_ApiProductAttributes })
    };
    return apsApiProduct;
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
    searchInfo,
    sortDirection,
    sortFieldName
  }:{
    apsSessionUser: APSSessionUser;
    organizationId: string;
    businessGroupIdList?: Array<string>;
    accessLevelList?: Array<APIProductAccessLevel>;
    excludeApiProductIdList?: Array<string>;
    apiProductIdList?: Array<string>;
    source?: APSApiProductSource;
    pagingInfo: TApiPagingInfo;
    searchInfo: TApiSearchInfo;
    sortDirection?: EAPSSortDirection;
    sortFieldName?: EAPSApiProductSortFieldName;
  }): Promise<ListAPSApiProductsResponse> => {
    const funcName = 'all';
    const logName = `${APSApiProductsService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'ListApsUsersResponse', details: {
      apsSessionUser: apsSessionUser,
      organizationId: organizationId,
      businessGroupIdList: businessGroupIdList,
      accessLevelList: accessLevelList,
      pagingInfo: pagingInfo,
      sortDirection: sortDirection ? sortDirection : 'undefined',
      sortFieldName: sortFieldName ? sortFieldName: 'undefined',
      searchInfo: searchInfo
    }}));

    const _connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
      organizationName: organizationId,
    });
    const apsApiProductList: Array<IAPSApiProduct> = [];
    for(const connectorApiProduct of _connectorApiProductList) {
      const apsApiProduct: IAPSApiProduct = await this.create_IAPSApiProduct({ 
        connectorApiProduct: connectorApiProduct,
      });
      apsApiProductList.push(apsApiProduct);
    }
    // TODO: now filter over this one instead, should be a lot easier
    // TODO: return this list in API

    const filtered_ApsApiProductList: Array<IAPSApiProduct> = apsApiProductList.filter( (apsApiProduct: IAPSApiProduct) => {
      let doInclude = true;

      // exclude api products
      if(excludeApiProductIdList !== undefined) {
        doInclude = !excludeApiProductIdList.includes(apsApiProduct.id);
      }
      if(!doInclude) return false;
      // include api products
      if(apiProductIdList !== undefined) {
        doInclude = apiProductIdList.includes(apsApiProduct.id);
      }
      if(!doInclude) return false;
      // source
      if(source !== undefined) {
        doInclude = source === apsApiProduct.source;
      }
      if(!doInclude) return false;
      // exclude if not correct access level, include if not set
      if(accessLevelList && apsApiProduct.connectorApiProduct.accessLevel) {
        doInclude = accessLevelList.includes(apsApiProduct.connectorApiProduct.accessLevel);
      } 
      if(!doInclude) return false;
      // business groups
      if(businessGroupIdList && businessGroupIdList.length > 0) {
        let _doInclude = false;
        let idx = 0;
        while (!_doInclude && idx < businessGroupIdList.length) {
          if(apsApiProduct.businessGroupInfo.owningBusinessGroupEntityId) {
            _doInclude = apsApiProduct.businessGroupInfo.owningBusinessGroupEntityId.id === businessGroupIdList[idx];
          }
          if(!_doInclude && apsApiProduct.businessGroupInfo.businessGroupSharingJsonString) {
            if(apsApiProduct.businessGroupInfo.businessGroupSharingJsonString.includes(businessGroupIdList[idx])) _doInclude = true;
          }
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
      // filter by searchInfo.searchWordList
      if(searchInfo.searchWordList !== undefined) {
        // const searchWordArray: Array<string> = searchInfo.searchWordList.split(/(\s+)/);
        // split on whitespace, only take words greater or equal 3 chars
        const searchWordArray: Array<string> = searchInfo.searchWordList.split(/(\s+)/).filter( e => e.length > 2);
        // skip search if empty
        if(searchWordArray.length > 0) {
          const searchableString = this.create_IAPSApiProduct_SearcheableString({
            apsApiProduct: apsApiProduct
          });
          // do the search, each word in searchWordArray toLowercase, searchableString already in lowercase
          let _doInclude = false;
          let idx = 0;
          while (!_doInclude && idx < searchWordArray.length) {
            if(searchableString.includes(searchWordArray[idx].toLowerCase())) _doInclude = true;
            idx++;
          }
          doInclude = _doInclude;
          // // DEBUG
          // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'search', details: {
          //   searchInfo_searchWordList: searchInfo.searchWordList,
          //   searchWordArray: searchWordArray,
          //   searchableString: searchableString,
          //   doInclude: doInclude,
          // }}));
        }
      }
      if(!doInclude) return false;
      return true;
    });

    // const filteredConnectorApiProductList: Array<APIProduct> = _connectorApiProductList.filter( (apiProduct: APIProduct) => {
    //   let doInclude = true;

    //   // create clean & combined attributes from version & meta
    //   const combined_ApiProductAttributes: Array<TApiProductAttribute> = this.create_combinedApiProductAttributes({
    //     versionAttributes: apiProduct.attributes,
    //     metaAttributes: apiProduct.meta?.attributes
    //   });
    //   // exclude api products
    //   if(excludeApiProductIdList !== undefined) {
    //     doInclude = !excludeApiProductIdList.includes(apiProduct.name);
    //   }
    //   if(!doInclude) return false;
    //   // include api products
    //   if(apiProductIdList !== undefined) {
    //     doInclude = apiProductIdList.includes(apiProduct.name);
    //   }
    //   if(!doInclude) return false;
    //   // source
    //   doInclude = this.doInclude_ApApiProductSource({ source: source, combined_ApiProductAttributes: combined_ApiProductAttributes });
    //   // // DEBUG
    //   // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'after source filtering', details: {
    //   //   doInclude: doInclude,
    //   //   source: source ? source : 'undefined',
    //   //   apiProduct: apiProduct,
    //   // }}));
    //   if(!doInclude) return false;
    //   // exclude if not correct access level, include if not set
    //   if(accessLevelList && apiProduct.accessLevel) {
    //     doInclude = accessLevelList.includes(apiProduct.accessLevel);
    //   } 
    //   if(!doInclude) return false;
    //   // business groups
    //   if(businessGroupIdList && businessGroupIdList.length > 0) {
    //     let _doInclude = false;
    //     // lazy, should really look at the specific attribute
    //     const attributesString: string = JSON.stringify(combined_ApiProductAttributes);
    //     // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'attributesString', details: {
    //     //   attributesString: attributesString,
    //     //   businessGroupIdList: businessGroupIdList
    //     // }}));
    //     let idx = 0;
    //     while (!_doInclude && idx < businessGroupIdList.length) {
    //       if(attributesString.includes(businessGroupIdList[idx])) _doInclude = true;
    //       idx++;
    //     }
    //     doInclude = _doInclude;
    //   }
    //   // // DEBUG
    //   // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'after business group filtering', details: {
    //   //   doInclude: doInclude,
    //   //   businessGroupIdList: businessGroupIdList,
    //   //   apiProduct: apiProduct,
    //   // }}));
    //   if(!doInclude) return false;
    //   // filter by searchInfo.searchWordList
    //   if(searchInfo.searchWordList !== undefined) {
    //     // const searchWordArray: Array<string> = searchInfo.searchWordList.split(/(\s+)/);
    //     // split on whitespace, only take words greater or equal 3 chars
    //     const searchWordArray: Array<string> = searchInfo.searchWordList.split(/(\s+)/).filter( e => e.length > 2);
    //     // skip search if empty
    //     if(searchWordArray.length > 0) {
    //       const searchableString = this.create_SearcheableString({
    //         apiProduct: apiProduct,
    //         combined_ApiProductAttributes: combined_ApiProductAttributes
    //       });
    //       // do the search, each word in searchWordArray toLowercase, searchableString already in lowercase
    //       let _doInclude = false;
    //       let idx = 0;
    //       while (!_doInclude && idx < searchWordArray.length) {
    //         if(searchableString.includes(searchWordArray[idx].toLowerCase())) _doInclude = true;
    //         idx++;
    //       }
    //       doInclude = _doInclude;
    //       // // DEBUG
    //       // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'search', details: {
    //       //   searchInfo_searchWordList: searchInfo.searchWordList,
    //       //   searchWordArray: searchWordArray,
    //       //   searchableString: searchableString,
    //       //   doInclude: doInclude,
    //       // }}));
    //     }
    //   }
    //   if(!doInclude) return false;
    //   return true;
    // });
  
    // // sort the filteredConnectorApiProductList
    // const sortedAndFilteredConnectorApiProductList: Array<APIProduct> = this.sortConnectorApiProductList({
    //   connectorApiProductList: filteredConnectorApiProductList,
    //   sortDirection: sortDirection,
    //   sortFieldName: sortFieldName
    // });  
    // // create the response
    // const apsApiProductResponseList: APSApiProductResponseList = await this.createAPSApiProductResponseList({
    //   connectorApiProductList: sortedAndFilteredConnectorApiProductList,
    //   pagingInfo: pagingInfo,
    // });
    // const listAPSApiProductsResponse: ListAPSApiProductsResponse = {
    //   list: apsApiProductResponseList,
    //   meta: {
    //     totalCount: sortedAndFilteredConnectorApiProductList.length
    //   }
    // }
    // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'ListAPSApiProductsResponse', details: {
    //   listAPSApiProductsResponse: listAPSApiProductsResponse
    // }}));

    // sort the filtered_ApsApiProductList
    const sortedAndFiltered_ApsApiProductList: Array<IAPSApiProduct> = this.sort_ApsApiProductListList({
      apsApiProductList: filtered_ApsApiProductList,
      sortDirection: sortDirection,
      sortFieldName: sortFieldName
    });  
    // create the response
    const apsApiProductResponseList: APSApiProductResponseList = await this.create_APSApiProductResponseList({
      apsApiProductList: sortedAndFiltered_ApsApiProductList,
      pagingInfo: pagingInfo,
    });
    const listAPSApiProductsResponse: ListAPSApiProductsResponse = {
      list: apsApiProductResponseList,
      meta: {
        totalCount: sortedAndFiltered_ApsApiProductList.length
      }
    }
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, message: 'ListAPSApiProductsResponse', details: {
      listAPSApiProductsResponse: listAPSApiProductsResponse
    }}));
    return listAPSApiProductsResponse;
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


  // public createAPSApiProductResponse = ({ connectorApiProduct }:{
  //   connectorApiProduct: APIProduct;
  // }): APSApiProductResponse => {

  //   const apsApiProductResponse: APSApiProductResponse = {
  //     connectorApiProduct: connectorApiProduct
  //   };

  //   return apsApiProductResponse;  
  // }

  // private createAPSApiProductResponseList = async({ connectorApiProductList, pagingInfo }:{
  //   connectorApiProductList: Array<APIProduct>;
  //   pagingInfo: TApiPagingInfo;
  // }): Promise<APSApiProductResponseList> => {
  //   // const funcName = 'createAPSApiProductResponseList';
  //   // const logName = `${APSApiProductsService.name}.${funcName}()`;

  //   const startIdx = (pagingInfo.pageSize * (pagingInfo.pageNumber-1));
  //   const endIdx = (startIdx + pagingInfo.pageSize);
  //   const page_connectorApiProductList: Array<APIProduct> = connectorApiProductList.slice(startIdx, endIdx);
  //   // // DEBUG
  //   // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'after paging', details: {
  //   //   pagingInfo: pagingInfo,
  //   //   startIdx: startIdx,
  //   //   endIdx: endIdx,
  //   //   page_connectorApiProductListLength: page_connectorApiProductList.length
  //   // }}));
  //   const apsApiProductResponseList: APSApiProductResponseList = [];
  //   for(const connectorApiProduct of page_connectorApiProductList) {
  //     const apsApiProductResponse: APSApiProductResponse = this.createAPSApiProductResponse({ connectorApiProduct: connectorApiProduct });
  //     apsApiProductResponseList.push(apsApiProductResponse);
  //   }
  //   return apsApiProductResponseList;
  // }

  public create_APSApiProductResponse = ({ apsApiProduct }:{
    apsApiProduct: IAPSApiProduct;
  }): APSApiProductResponse => {

    const apsApiProductResponse: APSApiProductResponse = {
      connectorApiProduct: apsApiProduct.connectorApiProduct
    };

    return apsApiProductResponse;  
  }

  private create_APSApiProductResponseList = async({ apsApiProductList, pagingInfo }:{
    apsApiProductList: Array<IAPSApiProduct>;
    pagingInfo: TApiPagingInfo;
  }): Promise<APSApiProductResponseList> => {
    // const funcName = 'createAPSApiProductResponseList';
    // const logName = `${APSApiProductsService.name}.${funcName}()`;

    const startIdx = (pagingInfo.pageSize * (pagingInfo.pageNumber-1));
    const endIdx = (startIdx + pagingInfo.pageSize);
    const apsApiProductList_Page: Array<IAPSApiProduct> = apsApiProductList.slice(startIdx, endIdx);
    // // DEBUG
    // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, message: 'after paging', details: {
    //   pagingInfo: pagingInfo,
    //   startIdx: startIdx,
    //   endIdx: endIdx,
    //   page_connectorApiProductListLength: page_connectorApiProductList.length
    // }}));
    const apsApiProductResponseList: APSApiProductResponseList = [];
    for(const apsApiProduct of apsApiProductList_Page) {
      const apsApiProductResponse: APSApiProductResponse = this.create_APSApiProductResponse({ apsApiProduct: apsApiProduct });
      apsApiProductResponseList.push(apsApiProductResponse);
    }
    return apsApiProductResponseList;
  }

}

export default new APSApiProductsService();
