import { AppResponse, CommonDisplayName, CommonName, EnvironmentResponse, WebHook } from "@solace-iot-team/apim-connector-openapi-browser";

export type TManagedObjectId = CommonName;
export type TManagedObjectDisplayName = CommonDisplayName;
  
export type TViewManagedWebhook = {
  apSynthId: string;
  apiWebHook: WebHook;
  webhookApiEnvironmentResponseList: Array<EnvironmentResponse>;
}
// export type TListViewManagedAppWebhook = {
//   appId: CommonName;
//   appDisplayName: CommonDisplayName;
//   apiAppResponse: AppResponse;
//   apiAppEnvironmentResponseList: Array<EnvironmentResponse>;
//   managedWebhook: TViewManagedWebhook;
// }
// export type TListViewManagedAppWebhookList = Array<TListViewManagedAppWebhook>;

export type TViewManagedAppWebhookList = {
  appId: CommonName;
  appDisplayName: CommonDisplayName;
  apiAppResponse: AppResponse;
  apiAppEnvironmentResponseList: Array<EnvironmentResponse>;
  managedWebhookList: Array<TViewManagedWebhook>;
}

export enum E_CALL_STATE_ACTIONS {
  API_GET_USER_APP = "API_GET_USER_APP",
  API_UPDATE_USER_APP = "API_UPDATE_USER_APP",
}
