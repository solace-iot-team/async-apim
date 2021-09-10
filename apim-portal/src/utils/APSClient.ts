export type delete_me_t = boolean;

// import { delete_APSUser, delete_APSUserList, delete_APSApiResult, delete_APSLoginReturn } from "./APSClient.types";

// import { APSUser } from '@solace-iot-team/apim-server-openapi-browser';
// import { TAPSClientOpenApiConfig } from './APSClientOpenApi';
// import { TAPRbacRoleList } from "./APRbac";

// type APSLoginData = {
//   userId: string,
//   pwd: string
// }
// type APSLoginReturn = APSUser;

// export declare type delete_APSApiResult = {
//   readonly url: string;
//   readonly ok: boolean;
//   readonly status: number;
//   readonly statusText: string;
//   readonly body: any;
// };

// export class delete_APSApiError extends Error {
//   readonly url: string;
//   readonly status: number;
//   readonly statusText: string;
//   readonly body: any;
//   constructor(response: delete_APSApiResult, message: string) {
//     super(message);
//     this.url = response.url;
//     this.status = response.status;
//     this.statusText = response.statusText;
//     this.body = response.body;
//   }
// }

 

// export class APSClient {
//   private static config: TAPSClientOpenApiConfig;
//   private static baseUrl: string;
//   private static className = 'APSClient';
//   private static postOptions = {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   }
//   private static putOptions = {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   }
//   private static deleteOptions = {
//     method: 'DELETE'
//   }
//   public static getPutOptions = (body: any) => {
//     return {
//       ...APSClient.putOptions,
//       body: JSON.stringify(body)
//     }
//   }
//   public static getPostOptions = (body: any) => {
//     return {
//       ...APSClient.postOptions,
//       body: JSON.stringify(body)
//     }
//   }
//   public static getDeleteOptions = () => {
//     return APSClient.deleteOptions;
//   }
//   public static getResponseJson = async(response: any): Promise<any> => {
//     let responseText = await response.text();
//     let responseJson: any;
//     try {
//       responseJson = JSON.parse(responseText);
//     } catch(e) {
//       responseJson = {responseText: responseText}
//     }
//     return responseJson;
//   }

//   public static initialize = (config: TAPSClientOpenApiConfig) => {
//     APSClient.config = config;
//     APSClient.baseUrl = `${APSClient.config.protocol}://${APSClient.config.host}:${APSClient.config.port}/${APSClient.config.baseUrl}/${APSClient.config.apiVersion}`;
//   }
//   public static getUrl = (path: string): string => {
//     return `${APSClient.baseUrl}/${path}`;
//   }
//   public static isInstanceOfApiError(error: any): boolean {
//     // const logName = 'APSClient.isInstanceOfApiError()';
//     let apiError: APSApiError = error;
//     if(apiError.status === undefined) return false;
//     if(apiError.statusText === undefined) return false;
//     if(apiError.url === undefined) return false;
//     if(apiError.body === undefined) return false; 
//     return true;
//   }
//   public static getErrorAsString = (e: any) => {
//     let _e: string;
//     if(APSClient.isInstanceOfApiError(e)) _e = JSON.stringify(e, null, 2);
//     else _e = e;
//     return _e
//   }
//   // public static getErrorMessage = (e: any): string => {
//   //   if(APConnectorClient.isInstanceOfApiError(e)) {
//   //     let apiError: ApiError = e;
//   //     let _m: string;
//   //     _m = apiError.body.message
//   //     if(_m) return _m;
//   //     _m = apiError.body.errors[0].message;
//   //     if(_m) return _m;
//   //     return 'unknown api error';
//   //   }
//   //   else return e;
//   // }
//   public static logError = (e: any): void => {
//     console.log(`>>> ${APSClient.className}:ERROR: \n${APSClient.getErrorAsString(e)}`);
//     console.log(`>>> stack: \n${e.stack}`);
//   }
//   // public static logResponse = (logName: string, response: any): void => {
//   //   console.log(`>>>${APSClient.className}, from: ${logName}:api response:`);
//   //   let log = {
//   //     response: {
//   //       type: response.type,
//   //       status: response.status,
//   //       ok: response.ok,
//   //     }
//   //   }
//   //   console.log(`${JSON.stringify(log, null, 2)}`); 
//   // }
//   public static handleApiError = (logName: string, response: any, body: any) => {
//     // APSClient.logResponse(logName, response);
//     // let responseJson = await APSClient.getResponseJson(response);
//     let apiResult: delete_APSApiResult = {
//       url: response.url,
//       ok: response.ok,
//       status: response.status,
//       statusText: response.statusText,
//       body: body
//     }
//     throw new APSApiError(apiResult, `${logName}`);  
//   }

// }


// export class APSLogin {
//   private static className = 'APSLogin';
//   private static path = 'login';
//   public static doLogin = async (loginData: APSLoginData): Promise<delete_APSLoginReturn> => {
//     // const funcName: string = 'doLogin()';
//     // const logName: string = `${APSLogin.className}.${funcName}`;
//     let response, responseJson;
//     let apiResponse: delete_APSLoginReturn;
//     try {
//       response = await window.fetch(APSClient.getUrl(APSLogin.path), APSClient.getPostOptions(loginData));
//       responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok || responseJson.error) {
//         let apiResult: delete_APSApiResult = {
//           url: response.url,
//           ok: response.ok,
//           status: response.status,
//           statusText: response.statusText,
//           body: responseJson
//         }
//         throw new APSApiError(apiResult, 'login');
//       }
//       apiResponse = responseJson;
//       return apiResponse;
//     } catch (e) {
//       throw e;
//     }
//   }
// }

// export class APSClientConfig {
//   private static className = 'APSClientConfig';
//   private static configPath = 'config';
//   private static rbacRolesPath = 'rbacRoles';
//   private static connectorInstanceListPath = 'connectorInstances';

//   public static getConfigRbacRoles = async (): Promise<TAPRbacRoleList> => {
//     const funcName = 'getConfigRbacRoles';
//     const logName= `${APSClientConfig.className}.${funcName}()`;
//     let response, responseJson;
//     let apiObjectList: TAPRbacRoleList = [];
//     try {
//       response = await window.fetch(APSClient.getUrl(APSClientConfig.configPath + '/' + APSClientConfig.rbacRolesPath));
//       responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok || responseJson.error) {
//         let apiResult: delete_APSApiResult = {
//           url: response.url,
//           ok: response.ok,
//           status: response.status,
//           statusText: response.statusText,
//           body: responseJson
//         }
//         throw new APSApiError(apiResult, `${logName}`);
//       }
//       apiObjectList = responseJson;  
//       return apiObjectList;
//     } catch (e) {
//       throw e;
//     }
//   }

  // public static getConfigConnectorInstanceList = async (): Promise<APSConfigConnectorInstanceList> => {
  //   const funcName = 'getConfigConnectorInstanceList';
  //   const logName= `${APSClientConfig.className}.${funcName}()`;
  //   let response, responseJson;
  //   let apiObjectList: APSConfigConnectorInstanceList = [];
  //   try {
  //     response = await window.fetch(APSClient.getUrl(APSClientConfig.configPath + '/' + APSClientConfig.connectorInstanceListPath));
  //     responseJson = await APSClient.getResponseJson(response);
  //     if(!response.ok || responseJson.error) {
  //       let apiResult: APSApiResult = {
  //         url: response.url,
  //         ok: response.ok,
  //         status: response.status,
  //         statusText: response.statusText,
  //         body: responseJson
  //       }
  //       throw new APSApiError(apiResult, `${logName}`);
  //     }
  //     apiObjectList = responseJson;  
  //     return apiObjectList;
  //   } catch (e) {
  //     throw e;
  //   }
  // }

// }

// export class APSClientUsers {
//   private static className = 'APSClientUsers';
//   private static path = 'users';
  
//   public static getUsers = async (): Promise<delete_APSUserList> => {    
//     const funcName = 'getUsers';
//     const logName= `${APSClientUsers.className}.${funcName}()`;
//     let response, responseJson;
//     let apiObjectList: delete_APSUserList = [];
//     try {
//       response = await window.fetch(APSClient.getUrl(APSClientUsers.path));
//       responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok || responseJson.error) {
//         let apiResult: delete_APSApiResult = {
//           url: response.url,
//           ok: response.ok,
//           status: response.status,
//           statusText: response.statusText,
//           body: responseJson
//         }
//         throw new APSApiError(apiResult, `${logName}`);
//       }
//       apiObjectList = responseJson;  
//       return apiObjectList;
//     } catch (e) {
//       throw e;
//     }
//   }
//   public static upsertUser = async (user: delete_APSUser): Promise<delete_APSUser> => {    
//     const funcName = 'upsertUser';
//     const logName= `${APSClientUsers.className}.${funcName}()`;
//     let response, responseJson;
//     let apiObject: delete_APSUser;
//     try {
//       response = await window.fetch(APSClient.getUrl(APSClientUsers.path) + '/' + user.userId, APSClient.getPostOptions(user));
//       responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok || responseJson.error) {
//         let apiResult: delete_APSApiResult = {
//           url: response.url,
//           ok: response.ok,
//           status: response.status,
//           statusText: response.statusText,
//           body: responseJson
//         }
//         throw new APSApiError(apiResult, `${logName}`);
//       }
//       apiObject = responseJson;  
//       return apiObject;
//     } catch (e) {
//       throw e;
//     }
//   }
//   public static createOrReplaceUser = async (user: delete_APSUser): Promise<delete_APSUser> => {    
//     const funcName = 'createOrReplaceUser';
//     const logName= `${APSClientUsers.className}.${funcName}()`;
//     let response, responseJson;
//     let apiObject: delete_APSUser;
//     try {
//       response = await window.fetch(APSClient.getUrl(APSClientUsers.path) + '/' + user.userId, APSClient.getPutOptions(user));
//       responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok || responseJson.error) {
//         let apiResult: delete_APSApiResult = {
//           url: response.url,
//           ok: response.ok,
//           status: response.status,
//           statusText: response.statusText,
//           body: responseJson
//         }
//         throw new APSApiError(apiResult, `${logName}`);
//       }
//       apiObject = responseJson;  
//       return apiObject;
//     } catch (e) {
//       throw e;
//     }
//   }
//   public static deleteUser = async (user: delete_APSUser) => {    
//     const funcName = 'deleteUser';
//     const logName= `${APSClientUsers.className}.${funcName}()`;
//     let response, responseJson;
//     try {
//       response = await window.fetch(APSClient.getUrl(APSClientUsers.path) + '/' + user.userId, APSClient.getDeleteOptions());
//       if(!response.ok) {
//         responseJson = await APSClient.getResponseJson(response);
//         if(responseJson.error) {
//           let apiResult: delete_APSApiResult = {
//             url: response.url,
//             ok: response.ok,
//             status: response.status,
//             statusText: response.statusText,
//             body: responseJson
//           }
//           throw new APSApiError(apiResult, `${logName}`);
//         }
//       }  
//     } catch (e) {
//       throw e;
//     }
//   }
// }
