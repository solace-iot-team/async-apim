import { CommonDisplayName, CommonName } from "@solace-iot-team/apim-connector-openapi-browser";

export enum E_COMPONENT_STATE {
  UNDEFINED = "UNDEFINED",
  MANAGED_OBJECT_LIST_LIST_VIEW = "MANAGED_OBJECT_LIST_LIST_VIEW",
  MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW"
}

export enum E_CALL_STATE_ACTIONS {
  API_GET_PRODUCT_LIST = 'API_GET_PRODUCT_LIST',
  API_GET_PRODUCT = "API_GET_PRODUCT",
  API_GET_API = "API_GET_API"
}

export type TAPDeveloperPortalApiProductCatalogCompositeId = {
  apiProductId: CommonName;
  apiProductDisplayName: CommonDisplayName
}

