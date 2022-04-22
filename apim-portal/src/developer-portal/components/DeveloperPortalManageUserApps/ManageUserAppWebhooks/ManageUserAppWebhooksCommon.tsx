import { WebHookBasicAuth, WebHookHeaderAuth } from "@solace-iot-team/apim-connector-openapi-browser";

export enum E_CALL_STATE_ACTIONS {
  API_GET_USER_APP = "API_GET_USER_APP",
  API_GET_APP_WEBHOOK_LIST = "API_GET_APP_WEBHOOK_LIST",
  API_GET_EMPTY_WEBHOOK = "API_GET_EMPTY_WEBHOOK",
  API_GET_APP_WEBHOOK = "API_GET_APP_WEBHOOK",
  API_CREATE_APP_WEBHOOK = "API_CREATE_APP_WEBHOOK",
  API_UPDATE_APP_WEBHOOK = "API_UPDATE_APP_WEBHOOK",
  API_DELETE_APP_WEBHOOK = "API_DELETE_APP_WEBHOOK",
  API_CHECK_WEBHOOK_ID_EXISTS = "API_CHECK_WEBHOOK_ID_EXISTS",
  API_GET_APP_WEBHOOK_AVAILABLE_ENVIRONMENTS = "API_GET_APP_WEBHOOK_AVAILABLE_ENVIRONMENTS"
}

export enum E_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  LIST_VIEW = "LIST_VIEW",
  VIEW = "VIEW",
  NEW = "NEW",
  EDIT = "EDIT",
  DELETE = "DELETE"
}

export enum EWebhookAuthMethodSelectIdNone { 
  NONE = 'None'
}
export type TWebhookAuthMethodSelectId = 
  EWebhookAuthMethodSelectIdNone 
  | WebHookBasicAuth.authMethod.BASIC 
  | WebHookHeaderAuth.authMethod.HEADER;
export const EWebhookAuthMethodSelectId = { 
  ...EWebhookAuthMethodSelectIdNone, 
  ...WebHookBasicAuth.authMethod, 
  ...WebHookHeaderAuth.authMethod 
}
