
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

import { 
  ApsConfigService, 
  APSConnector
} from '@solace-iot-team/apim-server-openapi-browser';

import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APConnectorHealthCheck } from "../../../utils/APConnectorHealthCheck";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageConnectorsCommon, TManagedObjectId, TViewManagedObject } from "./ManageConnectorsCommon";
import { APConnectorApiCalls, TAPConnectorInfo } from "../../../utils/APConnectorApiCalls";
import { THealthCheckResult } from "../../../utils/Globals";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";

export interface IViewConnectorProps {
  connectorId: TManagedObjectId;
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
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dt = React.useRef<any>(null);

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
      setManagedObject(ManageConnectorsCommon.transformViewApiObjectToViewManagedObject(apsConnector, apConnectorInfo, healthCheckResult));
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

  const renderHealthCheckInfo = () => {
    return(
      <>
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(managedObject?.healthCheckResult, null, 2)};
        </pre>
      </>
    );
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    const dataTableList = [managedObject];
    let expandedRows: any = {};
    expandedRows[`${dataTableList[0].id}`] = true;

    const rowExpansionTemplate = (managedObject: TManagedObject) => {
      const dataTableList = [managedObject.apiObject.connectorClientConfig];
      return (
        <div>
          {/* <h5>Endpoints</h5> */}
          <DataTable 
            className="p-datatable-sm"
            value={dataTableList}
            autoLayout={true}
          >
            <Column field="protocol" header="Protocol" />
            <Column field="host" header="Host" />
            <Column field="port" header='Port' />
            <Column field="apiVersion" header='API Version' />
            <Column field="serviceUser" header="Service User" />
            <Column field="serviceUserPwd" header="Service User Password" />
          </DataTable>
        </div>
      );
    }

    return (
      <div className="card">
        {/* {Common.renderSubComponentHeader(`Environment: ${managedObject.displayName} (${managedObject.id})`)} */}
        <DataTable header={'Description: ' + managedObject.apiObject.description} />
        <h4>Connector Client Config:</h4>
        <DataTable
          ref={dt}
          // header="PubSub+ Service:"
          value={dataTableList}
          expandedRows={expandedRows}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="id"
          >
            <Column field="isActive" header="Active?" body={ManageConnectorsCommon.isActiveBodyTemplate} />
            <Column field="healthCheckPassed" header="Health Check" />
            <Column field="displayName" header="Name" />
            <Column field="id" header="Id" />
        </DataTable>
        { renderHealthCheckInfo() }
      </div>
    )
  }

  return (
    <div className="manage-connectors">

      <APComponentHeader header={`Connector: ${props.connectorDisplayName} (${props.connectorId})`} />

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
