
import React from "react";

import { Dialog } from "primereact/dialog";

import { APSAbout, ApsConfigService } from "@solace-iot-team/apim-server-openapi-browser";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { About, AdministrationService } from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { APFetch, APFetchResult, EAPFetchResultBodyType } from "../../utils/APFetch";
import { APFetchError, APTimeoutError } from "../../utils/APError";
import { APLogger } from "../../utils/APLogger";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { EAppState, Globals, TAPPortalAbout } from "../../utils/Globals";
import { UserContext } from '../UserContextProvider/UserContextProvider';

import "../APComponents.css";

export interface IAPDisplayAboutProps {
  className?: string;
  onClose: () => void;
}

export const APDisplayAbout: React.FC<IAPDisplayAboutProps> = (props: IAPDisplayAboutProps) => {
  const componentName='APDisplayAbout';

  const DialogHeader='About ...';
  const AdminPortalAboutUrl = process.env.PUBLIC_URL + '/admin-portal/about.json';
  const DeveloperPortalAboutUrl = process.env.PUBLIC_URL + '/developer-portal/about.json';

  enum E_CALL_STATE_ACTIONS {
    API_GET_ADMIN_PORTAL_ABOUT = "API_GET_ADMIN_PORTAL_ABOUT",
    API_GET_DEVELOPER_PORTAL_ABOUT = "API_GET_DEVELOPER_PORTAL_ABOUT",
    API_GET_APIM_SERVER_ABOUT = "API_GET_APIM_SERVER_ABOUT",
    API_GET_APIM_CONNECTOR_ABOUT = "API_GET_APIM_CONNECTOR_ABOUT"
  }
  
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [adminPortalAbout, setAdminPortalAbout] = React.useState<TAPPortalAbout>();
  const [developerPortalAbout, setDeveloperPortalAbout] = React.useState<TAPPortalAbout>();
  const [apimServerAbout, setApimServerAbout] = React.useState<APSAbout>();
  const [apimConnectorAbout, setApimConnectorAbout] = React.useState<About>();

  const apiGetPortalAbout = async(action: E_CALL_STATE_ACTIONS): Promise<TApiCallState> => {
    const funcName = 'apiGetPortalAbout';
    const logName = `${componentName}.${funcName}()`;
    const timeout_ms: number = 2000;
    let aboutUrl: string = '';
    let callStateUserMessage: string = '';
    let setPortalAboutFunc: React.Dispatch<any> = setAdminPortalAbout;
    switch(action) {
      case E_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_ABOUT:
        callStateUserMessage = 'get admin portal about info';
        aboutUrl = AdminPortalAboutUrl;
        setPortalAboutFunc = setAdminPortalAbout;
        break;
      case E_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_ABOUT:
        callStateUserMessage = 'get developer portal about info';
        aboutUrl = DeveloperPortalAboutUrl;
        setPortalAboutFunc = setDeveloperPortalAbout;
        break;
      case E_CALL_STATE_ACTIONS.API_GET_APIM_SERVER_ABOUT:
      case E_CALL_STATE_ACTIONS.API_GET_APIM_CONNECTOR_ABOUT:
        break;
      default: 
        Globals.assertNever(logName, action);
    }
    let callState: TApiCallState = ApiCallState.getInitialCallState(action, callStateUserMessage);
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
      setPortalAboutFunc(result.body);
    } catch (e: any) {
      APLogger.error(APLogger.createLogEntry(logName, e));
      callState = ApiCallState.addErrorToApiCallState(e, callState);
      console.log(`${logName}: callState = ${JSON.stringify(callState, null, 2)}`);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetApimServerAbout = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetApimServerAbout';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APIM_SERVER_ABOUT, `get apim server about info`);
    try { 
      const apsAbout: APSAbout = await ApsConfigService.getApsAbout();
      setApimServerAbout(apsAbout);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetApimConnectorAbout = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetApimConnectorAbout';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APIM_CONNECTOR_ABOUT, `get apim connector about info`);
    try { 
      const connectorAbout: About = await AdministrationService.about();
      setApimConnectorAbout(connectorAbout);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;  
    setIsLoading(true);
    switch(userContext.currentAppState) {
      case EAppState.ADMIN_PORTAL:
        await apiGetPortalAbout(E_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_ABOUT);
        break;
      case EAppState.DEVELOPER_PORTAL:
        await apiGetPortalAbout(E_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_ABOUT);
        break;
      case EAppState.UNDEFINED:
        await apiGetPortalAbout(E_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_ABOUT);
        await apiGetPortalAbout(E_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_ABOUT);
        break;
      default:
        Globals.assertNever(logName, userContext.currentAppState);
    }
    await apiGetApimServerAbout();
    await apiGetApimConnectorAbout();
    setIsLoading(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  const onDialogClose = () => {
    props.onClose();
  }

  const renderAdminPortalAbout = () => {
    if(adminPortalAbout) return (
      <React.Fragment>
        <div><b>Admin Portal:</b></div>
        <pre style={ { fontSize: '8px' }} > {JSON.stringify(adminPortalAbout, null, 2)};</pre>
      </React.Fragment>
    );
  }

  const renderDeveloperPortalAbout = () => {
    if(developerPortalAbout) return (
      <React.Fragment>
        <div><b>Developer Portal:</b></div>
        <pre style={ { fontSize: '8px' }} > {JSON.stringify(developerPortalAbout, null, 2)};</pre>
      </React.Fragment>
    );
  }

  const renderApimServerAbout = () => {
    if(apimServerAbout) return (
      <React.Fragment>
        <div><b>APIM Server:</b></div>
        <pre style={ { fontSize: '8px' }} > {JSON.stringify(apimServerAbout, null, 2)};</pre>
      </React.Fragment>
    );
  }

  const renderApimConnectorAbout = () => {
    if(apimConnectorAbout) return (
      <React.Fragment>
        <div><b>APIM Connector:</b></div>
        <pre style={ { fontSize: '8px' }} > {JSON.stringify(apimConnectorAbout, null, 2)};</pre>
      </React.Fragment>
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
          {renderAdminPortalAbout()}
          {renderDeveloperPortalAbout()}
          {renderApimServerAbout()}
          {renderApimConnectorAbout()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
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
