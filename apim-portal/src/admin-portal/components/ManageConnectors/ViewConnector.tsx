
import React from "react";

import { TabPanel, TabView } from "primereact/tabview";

import { 
  ApsConfigService, 
  APSConnector,
  APSId
} from '@solace-iot-team/apim-server-openapi-browser';

import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APConnectorHealthCheck } from "../../../utils/APConnectorHealthCheck";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageConnectorsCommon, TViewManagedObject } from "./ManageConnectorsCommon";
import { APConnectorApiCalls, TAPConnectorInfo } from "../../../utils/APConnectorApiCalls";
import { THealthCheckResult } from "../../../utils/Globals";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";

export interface IViewConnectorProps {
  connectorId: APSId;
  connectorDisplayName: string;
  reInitializeTrigger: number,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewConnector: React.FC<IViewConnectorProps> = (props: IViewConnectorProps) => {
  const componentName = 'ViewConnector';

  type TManagedObject = TViewManagedObject;

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */  
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);


  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_CONNECTOR, `retrieve details for connector: ${props.connectorDisplayName}`);
    try { 
      const apsConnector: APSConnector = await ApsConfigService.getApsConnector({
        connectorId: props.connectorId
      });
      const apConnectorInfo: TAPConnectorInfo | undefined = await APConnectorApiCalls.getConnectorInfo(apsConnector.connectorClientConfig);
      const healthCheckResult: THealthCheckResult = await APConnectorHealthCheck.doHealthCheck(configContext, apsConnector.connectorClientConfig);    
      setManagedObject(ManageConnectorsCommon.createViewManagedObject(apsConnector, apConnectorInfo, healthCheckResult));
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    doInitialize();
  }, [props.reInitializeTrigger]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderHealthCheckInfo = (mo: TManagedObject) => {
    return(
      <>
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(mo.healthCheckResult, null, 2)};
        </pre>
      </>
    );
  }

  const renderHealthCheckDetails = (mo: TManagedObject) => {
    return (
      <React.Fragment>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">
          Summary: {mo.healthCheckPassed}
        </div>
        <div className="p-ml-4">
          {renderHealthCheckInfo(mo)}
        </div>
      </React.Fragment>
    )
  }

  const renderInfo = (mo: TManagedObject) => {
    let eventPortalIsProxyMode: string = '?';
    let connectorVersion: string = '?';
    let connectorOpenApiVersion: string = '?';
    if(mo.apConnectorInfo) {
      const portalAbout = mo.apConnectorInfo.connectorAbout.portalAbout;
      eventPortalIsProxyMode = portalAbout.isEventPortalApisProxyMode ? 'ON' : 'OFF';
      if(portalAbout.connectorServerVersionStr) connectorVersion = portalAbout.connectorServerVersionStr; 
      if(portalAbout.connectorOpenApiVersionStr) connectorOpenApiVersion = portalAbout.connectorOpenApiVersionStr; 
    }
    return (
      <React.Fragment>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">
          Info:
        </div>
        <div className="p-ml-4">
          <div><b>EventPortal</b>: Event API Products proxy: {eventPortalIsProxyMode}</div>
          <div><b>Connector Version</b>: {connectorVersion}</div>
          <div><b>API Version</b>: {connectorOpenApiVersion}</div>
        </div>
      </React.Fragment>
    );
  }

  const renderConnectionDetails = (mo: TManagedObject) => {
    return (
      <React.Fragment>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">
          Connection Details:
        </div>
        <div className="p-ml-4">
          <div><b>Type</b>: {mo.apsConnector.connectorClientConfig.locationConfig.configType}</div>
          <div><b>Url</b>: {mo.composedConnectorUrl}</div>
          <div><b>Service User</b>: {mo.apsConnector.connectorClientConfig.serviceUser}</div>
          <div><b>Service Pwd </b>: {mo.apsConnector.connectorClientConfig.serviceUserPwd}</div>
        </div>
      </React.Fragment>
    );
  }

  const getActiveStr = (mo: TManagedObject): string => {
    if(mo.apsConnector.isActive) return 'active';
    else return 'not active';
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;

    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);

    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="connector-view">
            <div className="detail-left">
              
              <div className="p-text-bold">Description:</div>
              <div className="p-ml-2">{managedObject.apsConnector.description}</div>
              
              <div><b>Status</b>: {getActiveStr(managedObject)}.</div>
              <div><b>Health check</b>: {managedObject.healthCheckPassed}.</div>

              <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
                <TabPanel header='General'>

                  {renderInfo(managedObject)}

                  {renderConnectionDetails(managedObject)}

                </TabPanel>
                <TabPanel header='Health Check Details'>
  
                  {renderHealthCheckDetails(managedObject)}

                </TabPanel>
              </TabView>
            </div>
            <div className="detail-right">
              <div>Id: {managedObject.id}</div>
            </div>            
          </div>
        </div>    
      </React.Fragment>
    );
  }

  return (
    <div className="manage-connectors">

      <APComponentHeader header={`Connector: ${props.connectorDisplayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

      {/* ** DEBUG ** */}
      {/* {managedObject && 
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(managedObject, null, 2)}
        </pre>
      } */}

    </div>
  );
}
