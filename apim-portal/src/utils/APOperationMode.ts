
// ************************************************************************************************************
// Config of operations mode
// ************************************************************************************************************

import { About } from "@solace-iot-team/apim-connector-openapi-browser";
import { Globals } from "./Globals";

export enum E_AP_OPS_MODE {
  FULL_OPS_MODE = "FULL_OPS_MODE", // allows managing APIs & API Products as normal, EP2 Assets controlled in AssetDisplayServices
  EP2_OPS_MODE = "EP2_OPS_MODE" // no APIs, API Products view & edit parts only
}
// ************************************************************************************************************

export class APOperationMode {
  private static readonly ComponentName = "APOperationMode";

  // private static DEFAULT_AP_EP2_OPERATIONS_MODE: E_AP_OPS_MODE = E_AP_OPS_MODE.FULL_OPS_MODE;
  private static DEFAULT_AP_EP2_OPERATIONS_MODE: E_AP_OPS_MODE = E_AP_OPS_MODE.EP2_OPS_MODE;

  // the actual mode
  public static AP_OPERATIONS_MODE: E_AP_OPS_MODE = E_AP_OPS_MODE.FULL_OPS_MODE;

  public static initialize(eventPortalVersion: About.EVENT_PORTAL_VERSION) {
    const funcName = 'get_AllowedActions';
    const logName = `${APOperationMode.ComponentName}.${funcName}()`;
    switch(eventPortalVersion) {
      case About.EVENT_PORTAL_VERSION._1:
        APOperationMode.AP_OPERATIONS_MODE = E_AP_OPS_MODE.FULL_OPS_MODE;
        break;
      case About.EVENT_PORTAL_VERSION._2:
        APOperationMode.AP_OPERATIONS_MODE = APOperationMode.DEFAULT_AP_EP2_OPERATIONS_MODE;
        break;
      default:
        Globals.assertNever(logName, eventPortalVersion);
    }
      
  }

}
