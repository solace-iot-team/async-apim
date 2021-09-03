
export type deleteMe = boolean;

// import { delete_APSConnectorInstanceList, delete_APSConnectorInstance } from "./APSClient.types";
// import { APSClient } from "./APSClient";

// export class APSClientConnectorInstances {
//   private static className = 'APSClientConnectorInstances';
//   private static path = 'system/connectorInstances';
  
//   public static getList = async (): Promise<delete_APSConnectorInstanceList> => {    
//     const funcName = 'getList';
//     const logName= `${APSClientConnectorInstances.className}.${funcName}()`;
//     let apiObjectList: delete_APSConnectorInstanceList = [];
//     try {
//       const response = await window.fetch(APSClient.getUrl(APSClientConnectorInstances.path));
//       const responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok) APSClient.handleApiError(logName, response, responseJson);
//       apiObjectList = responseJson;  
//       return apiObjectList;
//     } catch (e) {
//       throw e;
//     }
//   }
//   public static upsert = async (connectorInstance: delete_APSConnectorInstance): Promise<delete_APSConnectorInstance> => {    
//     const funcName = 'upsert';
//     const logName= `${APSClientConnectorInstances.className}.${funcName}()`;
//     let apiObject: delete_APSConnectorInstance;
//     try {
//       const response = await window.fetch(APSClient.getUrl(APSClientConnectorInstances.path) + '/' + connectorInstance.name, APSClient.getPostOptions(connectorInstance));
//       const responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok) APSClient.handleApiError(logName, response, responseJson);
//       apiObject = responseJson;  
//       return apiObject;
//     } catch (e) {
//       throw e;
//     }
//   }
//   public static delete = async (connectorInstance: delete_APSConnectorInstance) => {
//     const funcName = 'delete';
//     const logName= `${APSClientConnectorInstances.className}.${funcName}()`;
//     try {
//       const response = await window.fetch(APSClient.getUrl(APSClientConnectorInstances.path) + '/' + connectorInstance.name, APSClient.getDeleteOptions());
//       const responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok) APSClient.handleApiError(logName, response, responseJson);
//     } catch (e) {
//       throw e;
//     }
//   }
//   public static setActive = async (connectorInstance: delete_APSConnectorInstance): Promise<delete_APSConnectorInstance> => {
//     const funcName = 'setActive';
//     const logName= `${APSClientConnectorInstances.className}.${funcName}()`;
//     try {
//       const response = await window.fetch(APSClient.getUrl(APSClientConnectorInstances.path) + '/' + connectorInstance.name + '/setActive', APSClient.getPutOptions(connectorInstance));
//       const responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok) APSClient.handleApiError(logName, response, responseJson);
//       const apiObject: delete_APSConnectorInstance = responseJson;
//       return apiObject;
//     } catch (e) {
//       throw e;
//     }
//   }
//   public static getActive = async (): Promise<delete_APSConnectorInstance> => {
//     const funcName = 'getActive';
//     const logName= `${APSClientConnectorInstances.className}.${funcName}()`;
//     try {
//       const response = await window.fetch(APSClient.getUrl(APSClientConnectorInstances.path) + '/active');
//       const responseJson = await APSClient.getResponseJson(response);
//       if(!response.ok) APSClient.handleApiError(logName, response, responseJson);
//       const apiObject: delete_APSConnectorInstance = responseJson;
//       return apiObject;
//     } catch (e) {
//       throw e;
//     }
//   }
// }
