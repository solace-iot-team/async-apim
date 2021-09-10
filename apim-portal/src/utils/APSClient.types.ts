export type dummy = boolean;

// // * APS config
// export declare type delete_APSApiResult = {
//   readonly url: string;
//   readonly ok: boolean;
//   readonly status: number;
//   readonly statusText: string;
//   readonly body: any;
// };
// export type delete_TAPSClientProtocol = "http" | "https";
// export enum delete_EAPSClientProtocol {
//   HTTP = 'http',
//   HTTPS = 'https'
// }
// export interface delete_IAPSClientConfig {
//   protocol: delete_TAPSClientProtocol,
//   host: string,
//   port: number,
//   baseUrl: string,
//   apiVersion: string,
//   user: string,
//   pwd: string
// }

// export enum EAPSNamePattern {
//   None = '__none__',
//   All = '__all__',
// }
// export enum delete_EAPSAuthRole {
//   None = '__none__',
//   // All = '__all__',
//   // Root = 'root',
//   LoginAs = 'loginAs',
//   SystemAdmin = 'systemAdmin',
//   OrganizationAdmin = 'organizationAdmin',
//   ApiTeam = 'apiTeam',
//   ApiConsumer = 'apiConsumer' 
// }
// export type delete_APSAuthRoleList = Array<delete_EAPSAuthRole>;
// export type delete_APSAuthObjectAccess = {
//   connectorInstanceNameList: Array<string>,
//   organizationNameList: Array<string>
// }
// // export type APSUiResourcePath = string;
// // export type APSConfigRbacRole = {
// //   name: string,
// //   displayName: string,
// //   description: string,
// //   uiResourcePaths: Array<APSUiResourcePath>,
// // }
// // export type APSConfigRbacRoleList = Array<APSConfigRbacRole>;

// // * ConnectorClient
// export enum delete_EAPSConnectorClientProtocol {
//   HTTP = 'http',
//   HTTPS = 'https'
// }
// export type delete_APSConnectorClientConfig = {
//   protocol: delete_EAPSConnectorClientProtocol,
//   host: string,
//   port: number, 
//   // baseUrl: string,
//   apiVersion: string,
//   adminUser: string,
//   adminUserPwd: string,
//   apiUser: string,
//   apiUserPwd: string
// }
// export type delete_APSConnectorInstance = {
//   isActive: boolean,
//   name: string,
//   displayName: string,
//   description: string,
//   connectorClientConfig: delete_APSConnectorClientConfig
// }
// export type delete_APSConnectorInstanceList = Array<delete_APSConnectorInstance>;

// // * Organization *
// export type APSOrganizationName = string;
// export type APSOrganizationNameList = Array<APSOrganizationName>;
// // * User *
// // TODO: required?
// // export type APSUserSettings = {
// //   connectorInstanceId?: string
// //   organizationId?: string
// // }
// export type delete_APSUserProfile = {
//   first: string,
//   last: string,
//   email: string
// }
// export type delete_APSUser = {
//   isActivated: boolean,
//   userId: string,
//   password: string,
//   profile?: delete_APSUserProfile
//   roles?: delete_APSAuthRoleList,
//   memberOfOrganizations?: APSOrganizationNameList
//   objectAccess?: delete_APSAuthObjectAccess
//   // settings?: APSUserSettings
// }
// export type delete_APSUserList = Array<delete_APSUser>;

// export type delete_APSLoginData = {
//   userId: string,
//   pwd: string
// }
// export type delete_APSLoginReturn = delete_APSUser;

