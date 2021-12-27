
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
import { APLogger } from "../../utils/APLogger";
import { EAppState, Globals, TAPPortalAppAbout } from "../../utils/Globals";
import { UserContext } from '../UserContextProvider/UserContextProvider';
import { APHealthCheckContext } from '../../components/APHealthCheckContextProvider';
import { EAPHealthCheckSuccess } from "../../utils/APHealthCheck";
import { APortalAppApiCalls, E_APORTAL_APP_CALL_STATE_ACTIONS } from "../../utils/APortalApiCalls";

import "../APComponents.css";

export interface IAPDisplayAboutProps {
  className?: string;
  onClose: () => void;
}

export const APDisplayAbout: React.FC<IAPDisplayAboutProps> = (props: IAPDisplayAboutProps) => {
  const componentName='APDisplayAbout';

  const DialogHeader='About ...';

  type TPortalAppAboutResult = {
    apPortalAppAbout?: TAPPortalAppAbout;
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
    API_GET_ADMIN_PORTAL_APP_ABOUT = "API_GET_ADMIN_PORTAL_APP_ABOUT",
    API_GET_DEVELOPER_PORTAL_APP_ABOUT = "API_GET_DEVELOPER_PORTAL_APP_ABOUT",
    API_GET_APIM_SERVER_ABOUT = "API_GET_APIM_SERVER_ABOUT",
    API_GET_APIM_CONNECTOR_ABOUT = "API_GET_APIM_CONNECTOR_ABOUT"
  }
  
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [adminPortalAppAboutResult, setAdminPortalAppAboutResult] = React.useState<TPortalAppAboutResult>();
  const [developerPortalAppAboutResult, setDeveloperPortalAppAboutResult] = React.useState<TPortalAppAboutResult>();
  const [apimServerAboutResult, setApimServerAboutResult] = React.useState<TAPSAboutResult>();
  const [apimConnectorAboutResult, setApimConnectorAboutResult] = React.useState<TConnectorAboutResult>();

  const apiGetPortalAppAbout = async(action: E_CALL_STATE_ACTIONS): Promise<TPortalAppAboutResult> => {
    const funcName = 'apiGetPortalAppAbout';
    const logName = `${componentName}.${funcName}()`;
    let getAction: E_APORTAL_APP_CALL_STATE_ACTIONS = E_APORTAL_APP_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_APP_ABOUT;
    switch(action) {
      case E_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_APP_ABOUT:
        getAction = E_APORTAL_APP_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_APP_ABOUT;
        break;
      case E_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_APP_ABOUT:
        getAction = E_APORTAL_APP_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_APP_ABOUT;
        break;
      case E_CALL_STATE_ACTIONS.API_GET_APIM_SERVER_ABOUT:
      case E_CALL_STATE_ACTIONS.API_GET_APIM_CONNECTOR_ABOUT:
        throw new Error(`${logName}: invalid action=${action}`);
      default: 
        Globals.assertNever(logName, action);
    }
    let callState: TApiCallState = ApiCallState.getInitialCallState(action, 'get portal app about');
    let apPortalAppAbout: TAPPortalAppAbout | undefined = undefined;
    try {
      const result = await APortalAppApiCalls.apiGetPortalAppAbout(getAction);
      apPortalAppAbout = result.apPortalAppAbout;
      callState = result.callState;

    } catch (e: any) {
      APLogger.error(APLogger.createLogEntry(logName, e));
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    return {
      callState: callState,
      apPortalAppAbout: apPortalAppAbout
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
        setAdminPortalAppAboutResult(await apiGetPortalAppAbout(E_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_APP_ABOUT));
        break;
      case EAppState.DEVELOPER_PORTAL:
        setDeveloperPortalAppAboutResult(await apiGetPortalAppAbout(E_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_APP_ABOUT));
        break;
      case EAppState.UNDEFINED:
        setAdminPortalAppAboutResult(await apiGetPortalAppAbout(E_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_APP_ABOUT));
        setDeveloperPortalAppAboutResult(await apiGetPortalAppAbout(E_CALL_STATE_ACTIONS.API_GET_DEVELOPER_PORTAL_APP_ABOUT));
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

  const renderAdminPortalAppAbout = () => {
    if(adminPortalAppAboutResult) return (
      <React.Fragment>
        <div><b>Admin Portal App:</b></div>
        {renderAboutContent(adminPortalAppAboutResult.apPortalAppAbout)}
      </React.Fragment>
    );
  }

  const renderDeveloperPortalAppAbout = () => {
    if(developerPortalAppAboutResult) return (
      <React.Fragment>
        <div><b>Developer Portal App:</b></div>
        {renderAboutContent(developerPortalAppAboutResult.apPortalAppAbout)}
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
          {renderAdminPortalAppAbout()}
          {renderDeveloperPortalAppAbout()}
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
