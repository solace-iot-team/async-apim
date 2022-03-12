
export enum E_CALL_STATE_ACTIONS {
  API_GET_USER_LIST = "API_GET_USER_LIST",
  API_GET_USER = "API_GET_USER",
  API_GET_EMPTY_USER = "API_GET_EMPTY_USER",
  API_CREATE_USER = "API_CREATE_USER",
  API_UPDATE_USER = "API_UPDATE_USER",
  API_DELETE_USER = "API_DELETE_USER",
  API_CHECK_USER_EXISTS = "API_CHECK_USER_EXISTS",
  // API_REMOVE_ORG = "API_REMOVE_ORG",
  // API_GET_AVAILABE_ORGANIZATIONS = "API_GET_AVAILABE_ORGANIZATIONS",
  // API_GET_ORGANIZATION = "API_GET_ORGANIZATION",
  // API_ADD_USER_TO_ORG = "API_ADD_USER_TO_ORG",
}

export enum E_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
  MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
  MANAGED_OBJECT_EDIT = "MANAGED_OBJECT_EDIT",
  MANAGED_OBJECT_DELETE = "MANAGED_OBJECT_DELETE",
  MANAGED_OBJECT_NEW = "MANAGED_OBJECT_NEW",
}

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}

export enum E_COMPONENT_STATE_NEW_USER {
  UNDEFINED = "UNDEFINED",
  PROFILE = "PROFILE",
  AUTHENTICATION = "AUTHENTICATION",
  SYSTEM_ROLES = "SYSTEM_ROLES",
  ACTIVATION = "ACTIVATION",
  REVIEW = "REVIEW"
}
