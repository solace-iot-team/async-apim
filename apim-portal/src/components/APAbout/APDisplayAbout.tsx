
import React from "react";

import { Dialog } from "primereact/dialog";

import { 
  APSAbout, 
  ApsConfigService 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { About, AdministrationService } from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { APFetch, APFetchResult, EAPFetchResultBodyType } from "../../utils/APFetch";
import { APFetchError, APTimeoutError } from "../../utils/APError";
import { APLogger } from "../../utils/APLogger";
// import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { EAppState, Globals, TAPPortalAbout } from "../../utils/Globals";
import { UserContext } from '../UserContextProvider/UserContextProvider';
import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';

import "../APComponents.css";
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";

export interface IAPDisplayAboutProps {
  className?: string;
  onClose: () => void;
}

export const APDisplayAbout: React.FC<IAPDisplayAboutProps> = (props: IAPDisplayAboutProps) => {
  const componentName='APDisplayAbout';

  const DialogHeader='About ...';
  const AdminPortalAboutUrl = process.env.PUBLIC_URL + '/admin-portal/about.json';
  const DeveloperPortalAboutUrl = process.env.PUBLIC_URL + '/developer-portal/about.json';

  type TPortalAboutResult = {
    apPortalAbout?: TAPPortalAbout;
    callState: TApiCallState;
  }
  type TAPSAboutResult = {
    apsAbout?: APSAbout;
    callState: TApiCallState;
  }
  type TConnectorAboutResult = {
    connectorAbout?: About;
    callState: TApiCallState;
  }
  enum E_CALL_STATE_ACTIONS {
    API_GET_ADMIN_PORTAL_ABOUT = "API_GET_ADMIN_PORTAL_ABOUT",
    API_GET_DEVELOPER_PORTAL_ABOUT = "API_GET_DEVELOPER_PORTAL_ABOUT",
    API_GET_APIM_SERVER_ABOUT = "API_GET_APIM_SERVER_ABOUT",
    API_GET_APIM_CONNECTOR_ABOUT = "API_GET_APIM_CONNECTOR_ABOUT"
  }
  
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [adminPortalAboutResult, setAdminPortalAboutResult] = React.useState<TPortalAboutResult>();
  const [developerPortalAboutResult, setDeveloperPortalAboutResult] = React.useState<TPortalAboutResult>();
  const [apimServerAboutResult, setApimServerAboutResult] = React.useState<TAPSAboutResult>();
  const [apimConnectorAboutResult, setApimConnectorAboutResult] = React.useState<TConnectorAboutResult>();

  const apiGetPortalAbout = async(action: E_CALL_STATE_ACTIONS): Promise<TPortalAboutResult> => {
    const funcName = 'apiGetPortalAbout';
    const logName = `${componentName}.${funcName}()`;
    const timeout_ms: number = 2000;
    let aboutUrl: string = '';
    let callStateUserMessage: string = '';
    switch(action) {
      case E_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_ABOUT:
        callStateUserMessage = 'get admin portal about info';
        aboutUrl = AdminPortalAboutUrl;
        break;
      case E_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_ABOUT:
        callStateUserMessage = 'get developer portal about info';
        aboutUrl = DeveloperPortalAboutUrl;
        break;
      case E_CALL_STATE_ACTIONS.API_GET_APIM_SERVER_ABOUT:
      case E_CALL_STATE_ACTIONS.API_GET_APIM_CONNECTOR_ABOUT:
        throw new Error(`${logName}: cannot get action=${action}`);
      default: 
        Globals.assertNever(logName, action);
    }
    let callState: TApiCallState = ApiCallState.getInitialCallState(action, callStateUserMessage);
    let apPortalAbout: TAPPortalAbout | undefined = undefined;
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
      apPortalAbout = result.body;
    } catch (e: any) {
      APLogger.error(APLogger.createLogEntry(logName, e));
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    return {
      callState: callState,
      apPortalAbout: apPortalAbout
    }
  }

  const apiGetApimServerAbout = async(): Promise<TAPSAboutResult> => {
    const funcName = 'apiGetApimServerAbout';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APIM_SERVER_ABOUT, `get apim server about info`);
    let apsAbout: APSAbout | undefined = undefined;
    try { 
      apsAbout = await ApsConfigService.getApsAbout();
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    return {
      callState: callState,
      apsAbout: apsAbout
    }
  }

  const apiGetApimConnectorAbout = async(): Promise<TConnectorAboutResult> => {
    const funcName = 'apiGetApimConnectorAbout';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APIM_CONNECTOR_ABOUT, `get apim connector about info`);
    let connectorAbout: About | undefined = undefined;
    if(healthCheckContext.connectorHealthCheckResult && healthCheckContext.connectorHealthCheckResult.summary.success === EAPHealthCheckSuccess.FAIL) {
      callState.success = false;
      return {
        callState: callState
      }
    }
    try { 
      connectorAbout = await AdministrationService.about();
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    return {
      callState: callState,
      connectorAbout: connectorAbout
    }
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;  
    setIsLoading(true);
    switch(userContext.currentAppState) {
      case EAppState.ADMIN_PORTAL:
        setAdminPortalAboutResult(await apiGetPortalAbout(E_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_ABOUT));
        break;
      case EAppState.DEVELOPER_PORTAL:
        setDeveloperPortalAboutResult(await apiGetPortalAbout(E_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_ABOUT));
        break;
      case EAppState.UNDEFINED:
        setAdminPortalAboutResult(await apiGetPortalAbout(E_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_ABOUT));
        setDeveloperPortalAboutResult(await apiGetPortalAbout(E_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_ABOUT));
        break;
      default:
        Globals.assertNever(logName, userContext.currentAppState);
    }
    setApimServerAboutResult(await apiGetApimServerAbout());
    setApimConnectorAboutResult(await apiGetApimConnectorAbout());
    setIsLoading(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  const onDialogClose = () => {
    props.onClose();
  }

  const renderAboutContent = (about: any) => {
    if(about) return (<pre style={ { fontSize: '8px' }} > {JSON.stringify(about, null, 2)};</pre>);
    else return (<pre style={ { fontSize: '8px' }}>Not Available.</pre>);
  }

  const renderAdminPortalAbout = () => {
    if(adminPortalAboutResult) return (
      <React.Fragment>
        <div><b>Admin Portal:</b></div>
        {renderAboutContent(adminPortalAboutResult.apPortalAbout)}
      </React.Fragment>
    );
  }

  const renderDeveloperPortalAbout = () => {
    if(developerPortalAboutResult) return (
      <React.Fragment>
        <div><b>Developer Portal:</b></div>
        {renderAboutContent(developerPortalAboutResult.apPortalAbout)}
      </React.Fragment>
    );
  }

  const renderApimServerAbout = () => {
    if(apimServerAboutResult) return (
      <React.Fragment>
        <div><b>APIM Server:</b></div>
        {renderAboutContent(apimServerAboutResult.apsAbout)}
      </React.Fragment>
    );
  }

  const renderApimConnectorAbout = () => {
    if(apimConnectorAboutResult) return (
      <React.Fragment>
        <div><b>APIM Connector:</b></div>
        {renderAboutContent(apimConnectorAboutResult.connectorAbout)}
      </React.Fragment>
    );
  }

  const renderDescription = () => {
    return (
      <div className="p-mb-4">
        Concept Portal for Solace Async API Management.
      </div>
    );
  }
  const renderComponent = (): JSX.Element => {
    return(
      <Dialog 
        header={DialogHeader} 
        visible={true} 
        position='top' 
        modal={true}
        style={{ width: '50vw' }} 
        onHide={()=> onDialogClose()}
        // draggable={true} 
        // resizable={true}
      >
        <div className="p-m-0">
          {renderDescription()}
          {renderAdminPortalAbout()}
          {renderDeveloperPortalAbout()}
          {renderApimServerAbout()}
          {renderApimConnectorAbout()}
        </div>
        {/* <ApiCallStatusError apiCallStatus={apiCallStatus} /> */}
      </Dialog>
    );
  }

  return (
    <React.Fragment>
      <div className={props.className ? props.className : 'card'}>
        {!isLoading && renderComponent()}
      </div>
    </React.Fragment>
  );
}
