export const dummy = 'dummy';

// import { 
//   APIProduct,
//   APIProductAccessLevel,
//   ApiProductsService,
//   EnvironmentResponse,
//   EnvironmentsService,
//   Protocol,
// } from '@solace-iot-team/apim-connector-openapi-browser';
// import { TAPEntityId} from './APEntityId';
// import { Globals } from './Globals';
// import { APRenderUtils } from './APRenderUtils';
// import { APAttributesService } from './APAttribute';

// // export enum EAPPortalDisplay_Type {
// //   TAPDeveloperPortalDisplay = "TAPDeveloperPortalDisplay",
// //   TAPAdminPortalDisplay = "TAPAdminPortalDisplay"
// // }

// type TAPApiProductDisplay_Base = {
//   apEntityId: TAPEntityId;
//   connectorApiProduct: APIProduct;
//   connectorEnvironmentResponseList: Array<EnvironmentResponse>;
//   apAsyncApiDisplayNameListAsString: string;
//   apProtocolListAsString: string;
//   apAttributeListAsString: string;
//   apEnvironmentListAsStringList: Array<string>;
//   apApiProductCategory: string;
//   apApiProductImageUrl: string;
// }

// export type TAPDeveloperPortalApiProductDisplay = TAPApiProductDisplay_Base & {
//   // apPortalDisplayType: EAPPortalDisplay_Type;
// }; 
// export type TAPDeveloperPortalApiProductDisplayList = Array<TAPDeveloperPortalApiProductDisplay>;

// type TAPApiProductDisplay = TAPDeveloperPortalApiProductDisplay;

// export class APApiProductsService {
//   private static componentName = "APApiProductsService";

//   private static readonly CDefaultApiProductCategory = 'Solace AsyncAPI';
//   private static readonly CDefaultApiProductImageUrl = 'https://www.primefaces.org/primereact/showcase/showcase/demo/images/product/chakra-bracelet.jpg';


//   private static create_APApiProductDisplay_Base_From_ApiEntities = (connectorApiProduct: APIProduct, connectorEnvRespList: Array<EnvironmentResponse>): TAPApiProductDisplay_Base => {
//     const _base: TAPApiProductDisplay_Base = {
//       apEntityId: {
//         id: connectorApiProduct.name,
//         displayName: connectorApiProduct.displayName
//       },
//       connectorApiProduct: {
//         ...connectorApiProduct,
//         accessLevel: connectorApiProduct.accessLevel ? connectorApiProduct.accessLevel : APIProductAccessLevel.PRIVATE
//       },
//       connectorEnvironmentResponseList: connectorEnvRespList,
//       apAsyncApiDisplayNameListAsString: APApiProductsService.getApApiDisplayNameListAsString(connectorApiProduct.apis),
//       apProtocolListAsString: APApiProductsService.getApProtocolListAsString(connectorApiProduct.protocols),
//       apAttributeListAsString: APAttributesService.getApAttributeNameListAsString(connectorApiProduct.attributes),
//       apEnvironmentListAsStringList: APApiProductsService.getApEnvironmentsAsDisplayList(connectorEnvRespList),
//       apApiProductCategory: APApiProductsService.CDefaultApiProductCategory,
//       apApiProductImageUrl: APApiProductsService.CDefaultApiProductImageUrl,
//     }
//     return _base;
//   }

//   private static create_APDeveloperPortalApiProductDisplay_From_ApiEntities = (connectorApiProduct: APIProduct, connectorEnvRespList: Array<EnvironmentResponse>): TAPDeveloperPortalApiProductDisplay => {
//     const _base = APApiProductsService.create_APApiProductDisplay_Base_From_ApiEntities(connectorApiProduct, connectorEnvRespList);
//     return _base;
//     // return {
//     //   ..._base,
//     //   apPortalDisplayType: EAPPortalDisplay_Type.TAPDeveloperPortalDisplay,
//     // }
//   }

//   private static filterConnectorApiProductList = (connectorApiProductList: Array<APIProduct>, includeAccessLevel?: APIProductAccessLevel): Array<APIProduct> => {
//     if(includeAccessLevel === undefined) return connectorApiProductList;
//     const indicesToDelete: Array<number> = connectorApiProductList.map( (connectorApiProduct: APIProduct, idx: number) => {
//       // return -1 if not found, otherwise the actual index
//       if(connectorApiProduct.accessLevel?.includes(includeAccessLevel)) return -1;
//       else return idx;
//     }).filter(idx => idx !== -1); // filter all indeces === -1 out
//     for(let idx = indicesToDelete.length -1; idx >= 0; idx--) {
//       connectorApiProductList.splice(indicesToDelete[idx], 1);
//     }
//     return connectorApiProductList;
//   }

//   public static generateGlobalSearchContent = (apProductDisplay: TAPApiProductDisplay): string => {
//     return Globals.generateDeepObjectValuesString(apProductDisplay).toLowerCase();
//   }
//   public static getApApiDisplayNameListAsString = (displayNameList: Array<string> ): string => {
//     if(displayNameList.length > 0) return displayNameList.join(', ');
//     else return '';
//   }
//   public static getApProtocolListAsString = (apiProtocolList?: Array<Protocol> ): string => {
//     return APRenderUtils.getProtocolListAsString(apiProtocolList);
//   }
//   public static getApEnvironmentsAsDisplayList = (environmentResponseList: Array<EnvironmentResponse>): Array<string> => {
//     return environmentResponseList.map( (envResp: EnvironmentResponse) => {
//       return `${envResp.displayName} (${envResp.datacenterProvider}:${envResp.datacenterId})`;
//     });
//   }

//   public static listDeveloperPortalApiProductDisplay = async({ organizationId, includeAccessLevel }: {
//     organizationId: string;
//     includeAccessLevel?: APIProductAccessLevel;
//   }): Promise<TAPDeveloperPortalApiProductDisplayList> => {

//     const funcName = 'listDeveloperPortalApiProductDisplay';
//     const logName = `${APApiProductsService.componentName}.${funcName}()`;

//     const _connectorApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
//       organizationName: organizationId
//     });
//     const connectorApiProductList: Array<APIProduct> = APApiProductsService.filterConnectorApiProductList(_connectorApiProductList, includeAccessLevel);
//     const _list: TAPDeveloperPortalApiProductDisplayList = [];

//     // get all envs for all products
//     const _connectorEnvListCache: Array<EnvironmentResponse> = [];
//     for(const connectorApiProduct of connectorApiProductList) {
//       if(!connectorApiProduct.environments) throw new Error(`${logName}: connectorApiProduct.environments is undefined`);
//       const connectorEnvResponseList: Array<EnvironmentResponse> = [];
//       for(const envName of connectorApiProduct.environments) {
//         const found = _connectorEnvListCache.find( (envResponse: EnvironmentResponse) => {
//           return envResponse.name === envName;
//         });
//         if(!found) {
//           const _envResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({
//             organizationName: organizationId,
//             envName: envName
//           });
//           _connectorEnvListCache.push(_envResponse);
//           connectorEnvResponseList.push(_envResponse);
//         } else {
//           connectorEnvResponseList.push(found);
//         }
//       }
//       _list.push(APApiProductsService.create_APDeveloperPortalApiProductDisplay_From_ApiEntities(connectorApiProduct, connectorEnvResponseList));
//     }
//     return _list;
//   }
//   public static getDeveloperPortalApiProductDisplay = async({ organizationId, apiProductId }: {
//     organizationId: string;
//     apiProductId: string;
//   }): Promise<TAPDeveloperPortalApiProductDisplay> => {

//     const funcName = 'getDeveloperPortalApiProductDisplay';
//     const logName = `${APApiProductsService.componentName}.${funcName}()`;

//     const connectorApiProduct: APIProduct = await ApiProductsService.getApiProduct({
//       organizationName: organizationId,
//       apiProductName: apiProductId
//     });
//     // get all envs 
//     if(!connectorApiProduct.environments) throw new Error(`${logName}: connectorApiProduct.environments is undefined`);
//     const connectorEnvResponseList: Array<EnvironmentResponse> = [];
//     for(const envName of connectorApiProduct.environments) {
//       const _envResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({
//         organizationName: organizationId,
//         envName: envName
//       });
//       connectorEnvResponseList.push(_envResponse);
//     }
//     return APApiProductsService.create_APDeveloperPortalApiProductDisplay_From_ApiEntities(connectorApiProduct, connectorEnvResponseList);
//   }


// }