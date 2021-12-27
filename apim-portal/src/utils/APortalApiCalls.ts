import { ApiCallState, TApiCallState } from './ApiCallState';
import { 
  APFetch, 
  APFetchResult, 
  EAPFetchResultBodyType 
} from "./APFetch";
import { 
  APFetchError, 
  APTimeoutError 
} from './APError';
import { APLogger } from './APLogger';
import { 
  Globals, 
  TAPPortalAppAbout 
} from "./Globals";

export enum E_APORTAL_APP_CALL_STATE_ACTIONS {
  API_GET_ADMIN_PORTAL_APP_ABOUT = "API_GET_ADMIN_PORTAL_APP_ABOUT",
  API_GET_DEVELOPER_PORTAL_APP_ABOUT = "API_GET_DEVELOPER_PORTAL_APP_ABOUT",
}
export type TPortalAppAboutResult = {
  apPortalAppAbout?: TAPPortalAppAbout;
  callState: TApiCallState;
}

export class APortalAppApiCalls {
  private static componentName = 'APortalAppApiCalls';
  private static AdminPortalAppAboutUrl = process.env.PUBLIC_URL + '/admin-portal/about.json';
  private static DeveloperPortalAppAboutUrl = process.env.PUBLIC_URL + '/developer-portal/about.json';

  public static apiGetPortalAppAbout = async(action: E_APORTAL_APP_CALL_STATE_ACTIONS): Promise<TPortalAppAboutResult> => {
    const funcName = 'apiGetPortalAppAbout';
    const logName = `${APortalAppApiCalls.componentName}.${funcName}()`;
    const timeout_ms: number = 500;
    let aboutUrl: string = '';
    let callStateUserMessage: string = '';
    switch(action) {
      case E_APORTAL_APP_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_APP_ABOUT:
        callStateUserMessage = 'get admin portal app about info';
        aboutUrl = APortalAppApiCalls.AdminPortalAppAboutUrl;
        break;
      case E_APORTAL_APP_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_APP_ABOUT:
        callStateUserMessage = 'get developer portal app about info';
        aboutUrl = APortalAppApiCalls.DeveloperPortalAppAboutUrl;
        break;
      default: 
        Globals.assertNever(logName, action);
    }
    let callState: TApiCallState = ApiCallState.getInitialCallState(action, callStateUserMessage);
    let apPortalAppAbout: TAPPortalAppAbout | undefined = undefined;
    let response: Response;
    try {
      try {
        response = await APFetch.fetchWithTimeout(aboutUrl, timeout_ms);
      } catch (e: any) {
        if(e.name === 'AbortError') {
          throw new APTimeoutError(logName, "fetch timeout", { url: aboutUrl, timeout_ms: timeout_ms});
        } else throw e;
      }
      const result: APFetchResult = await APFetch.getFetchResult(response);
      if(!result.ok || result.bodyType !== EAPFetchResultBodyType.JSON) throw new APFetchError(logName, callStateUserMessage, result);
      apPortalAppAbout = result.body;
    } catch (e: any) {
      APLogger.error(APLogger.createLogEntry(logName, e));
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    return {
      callState: callState,
      apPortalAppAbout: apPortalAppAbout
    }
  }
  
  
}


