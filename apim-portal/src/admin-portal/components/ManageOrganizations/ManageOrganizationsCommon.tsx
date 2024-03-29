import { TAPEntityId } from "../../../utils/APEntityIdsService";

export const DisplaySectionHeader_ServiceRegistry = "Service Registry";
export const DisplaySectionHeader_AssetManagement = "Asset Management";
export const DisplaySectionHeader_ApiProducts = "API Products";
export const DisplaySectionHeader_Apps = "Apps";
export const DisplaySectionHeader_SolaceCloudServices = "Solace Cloud Services";
export const DisplaySectionHeader_EventPortalServices = "Event Portal Services";
export const DisplaySectionHeader_SempV2Auth = "Broker SempV2 Auth";
export const DisplaySectionHeader_NotificationHub = "Notification Hub";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}

export enum E_ManageOrganizations_Scope {
  SYSTEM_ORGS = "SYSTEM_ORGS",
  ORG_SETTINGS = "ORG_SETTINGS",
  ORG_STATUS = "ORG_STATUS",
  IMPORT_ORGANIZATION = "IMPORT_ORGANIZATION"
}
export type TManageOrganizationSettingsScope = {
  type: E_ManageOrganizations_Scope.ORG_SETTINGS;
  organizationEntityId: TAPEntityId;
};
export type TMonitorOrganizationStatusScope = {
  type: E_ManageOrganizations_Scope.ORG_STATUS;
  organizationEntityId: TAPEntityId;
};
export type TManageSystemOrganizationsScope = {
  type: E_ManageOrganizations_Scope.SYSTEM_ORGS;
}
export type TManageImportOrganizationsScope = {
  type: E_ManageOrganizations_Scope.IMPORT_ORGANIZATION;
}
export type TManageOrganizationsScope = 
  TManageOrganizationSettingsScope
  | TManageSystemOrganizationsScope
  | TMonitorOrganizationStatusScope
  | TManageImportOrganizationsScope;

export enum E_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
  MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
  MANAGED_OBJECT_EDIT = "MANAGED_OBJECT_EDIT",
  MANAGED_OBJECT_DELETE = "MANAGED_OBJECT_DELETE",
  MANAGED_OBJECT_NEW = "MANAGED_OBJECT_NEW",
  MONITOR_OBJECT = "MONITOR_OBJECT",
  MANAGE_ORGANIZATION_USERS = "MANAGE_ORGANIZATION_USERS",
  MONITOR_ORGANIZATION_JOBS = "MONITOR_ORGANIZATION_JOBS",
  MANAGE_IMPORT_ORGANIZATIONS = "MANAGE_IMPORT_ORGANIZATIONS",
  MANAGED_OBJECT_IMPORT_EDIT = "MANAGED_OBJECT_IMPORT_EDIT"
}

export enum E_CALL_STATE_ACTIONS {
  API_CHECK_ORGANIZATION_ID_EXISTS = "API_CHECK_ORGANIZATION_ID_EXISTS",
  API_DELETE_ORGANIZATION = "API_DELETE_ORGANIZATION",
  API_GET_ORGANIZATION_LIST = "API_GET_ORGANIZATION_LIST",
  API_CREATE_ORGANIZATION = "API_CREATE_ORGANIZATION",
  API_GET_ORGANIZATION = "API_GET_ORGANIZATION",
  API_UPDATE_ORGANIZATION = "API_UPDATE_ORGANIZATION",
  API_GET_ORGANIZATION_ASSETS = "API_GET_ORGANIZATION_ASSETS",
  API_LOGOUT_ORGANIZATION_ALL = "API_LOGOUT_ORGANIZATION_ALL",
  API_GET_EMPTY_ORGANIZATION = "API_GET_EMPTY_ORGANIZATION"
}

export enum E_COMPONENT_STATE_USERS {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
  MANAGED_OBJECT_EDIT_ROLES = "MANAGED_OBJECT_EDIT_ROLES",
  MANAGED_OBJECT_ADD = "MANAGED_OBJECT_ADD",
}

export enum E_COMPONENT_STATE_ADD_USER {
  UNDEFINED = "UNDEFINED",
  SYSTEM_USER_LIST_VIEW = "SYSTEM_USER_LIST_VIEW",
  EDIT_USER_ROLES = "EDIT_USER_ROLES",
}

export enum E_CALL_STATE_ACTIONS_USERS {
  API_GET_USER_LIST = "API_GET_USER_LIST",
  API_GET_USER = "API_GET_USER",
  API_UPDATE_USER_ROLES = "API_UPDATE_USER_ROLES",
  API_ADD_USER = "API_ADD_USER",
  API_CREATE_ORGANIZATION_USER_FROM_SYSTEM_USER = "API_CREATE_ORGANIZATION_USER_FROM_SYSTEM_USER",
  API_ADD_USER_TO_ORG = "API_ADD_USER_TO_ORG",
  API_USER_LOGOUT = "API_USER_LOGOUT"
}

export enum E_COMPONENT_STATE_NEW {
  UNDEFINED = "UNDEFINED",
  GENERAL = "GENERAL",
  CONNECTIVITY = "CONNECTIVITY",
  REVIEW = "REVIEW"
}

export enum E_DISPLAY_ORGANIZATION_SCOPE {
  REVIEW_AND_CREATE = "REVIEW_AND_CREATE",
  VIEW_SYSTEM_ORG = "VIEW_SYSTEM_ORG",
  VIEW_ORG_SETTINGS = "VIEW_ORG_SETTINGS"
}
