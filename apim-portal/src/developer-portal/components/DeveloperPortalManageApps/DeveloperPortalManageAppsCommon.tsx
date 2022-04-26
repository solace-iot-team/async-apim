export enum EAppType {
  TEAM = 'TEAM',
  USER = 'USER'
}

export enum E_CALL_STATE_ACTIONS {
  API_GET_APP_LIST = "API_GET_APP_LIST",
  API_DELETE_APP = "API_DELETE_APP",
  API_CREATE_APP = "API_CREATE_APP",
  API_GET_APP = "API_GET_APP",
  API_GET_EMPTY_APP = "API_GET_EMPTY_APP",
  API_UPDATE_APP = "API_UPDATE_APP",
  API_CHECK_APP_ID_EXISTS = "API_CHECK_APP_ID_EXISTS",
  API_UPDATE_APP_API_PRODUCTS = "API_UPDATE_APP_API_PRODUCTS",
  API_ADD_API_PRODUCT_TO_APP = "API_ADD_API_PRODUCT_TO_APP"
}

export enum E_MANAGE_APP_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
  MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
  MANAGED_OBJECT_EDIT = "MANAGED_OBJECT_EDIT",
  MANAGED_OBJECT_MANAGE_API_PRODUCTS = "MANAGED_OBJECT_MANAGE_API_PRODUCTS", 
  MANAGED_OBJECT_MANAGE_WEBHOOKS = "MANAGED_OBJECT_MANAGE_WEBHOOKS",
  MANAGED_OBJECT_DELETE = "MANAGED_OBJECT_DELETE",
  MANAGED_OBJECT_NEW = "MANAGED_OBJECT_NEW",
  MANAGED_OBJECT_MONITOR = "MANAGED_OBJECT_MONITOR"
}

export enum E_MONITOR_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
}

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}

export enum E_COMPONENT_STATE_EDIT_NEW {
  UNDEFINED = "UNDEFINED",
  GENERAL = "GENERAL",
  // CREDENTIALS = "CREDENTIALS",
  REVIEW = "REVIEW"
}
