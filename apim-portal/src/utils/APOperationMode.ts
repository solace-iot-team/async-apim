
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

  private static DEFAULT_AP_EP2_OPERATIONS_MODE: E_AP_OPS_MODE = E_AP_OPS_MODE.FULL_OPS_MODE;
  // private static DEFAULT_AP_EP2_OPERATIONS_MODE: E_AP_OPS_MODE = E_AP_OPS_MODE.EP2_OPS_MODE;

  // the actual mode
  public static AP_OPERATIONS_MODE: E_AP_OPS_MODE = E_AP_OPS_MODE.FULL_OPS_MODE;

  // mode of import / connector
  public static IS_EVENT_PORTAL_2_0: boolean = false;

  public static initialize(eventPortalVersion: About.EVENT_PORTAL_VERSION) {
    const funcName = 'get_AllowedActions';
    const logName = `${APOperationMode.ComponentName}.${funcName}()`;
    APOperationMode.IS_EVENT_PORTAL_2_0 = eventPortalVersion === About.EVENT_PORTAL_VERSION._2;
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

  public static isEditAllowed_For_EpApiProduct = (): boolean => {
    return true;
  }
  public static showApiProductsMenuItem = (): boolean => {
    const funcName = 'showApiProductsMenuItem';
    const logName = `${APOperationMode.ComponentName}.${funcName}()`;

    switch(APOperationMode.AP_OPERATIONS_MODE) {
      case E_AP_OPS_MODE.FULL_OPS_MODE:
        return true;
      case E_AP_OPS_MODE.EP2_OPS_MODE:
        // if(APOperationMode.IS_EVENT_PORTAL_2_0) return false;
        return true;
      default:
        Globals.assertNever(logName, APOperationMode.AP_OPERATIONS_MODE);
    }
    return false;
  }

  public static showApisMenuItem = (): boolean => {
    const funcName = 'showApisMenuItem';
    const logName = `${APOperationMode.ComponentName}.${funcName}()`;

    switch(APOperationMode.AP_OPERATIONS_MODE) {
      case E_AP_OPS_MODE.FULL_OPS_MODE:
        return true;
      case E_AP_OPS_MODE.EP2_OPS_MODE:
        // if(APOperationMode.IS_EVENT_PORTAL_2_0) return false;
        return true;
      default:
        Globals.assertNever(logName, APOperationMode.AP_OPERATIONS_MODE);
    }
    return false;
  }


}
