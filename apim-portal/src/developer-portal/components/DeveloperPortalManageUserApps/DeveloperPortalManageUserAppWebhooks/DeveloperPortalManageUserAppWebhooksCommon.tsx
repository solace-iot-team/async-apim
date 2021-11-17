import { 
  CommonDisplayName, 
  CommonName, 
} from "@solace-iot-team/apim-connector-openapi-browser";

export type TManagedObjectId = CommonName;
export type TManagedObjectDisplayName = CommonDisplayName;

export enum EWebhookAuthMethodSelectIdNone { 
  NONE = 'None'
}

export enum E_CALL_STATE_ACTIONS {
  API_GET_USER_APP = "API_GET_USER_APP",
  API_UPDATE_USER_APP = "API_UPDATE_USER_APP",
}

