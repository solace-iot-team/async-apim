
import React from "react";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageConnectorsCommon, TManagedObjectId, TViewManagedObject } from "./ManageConnectorsCommon";
import { APConnectorHealthCheck, THealthCheckResult } from "../../utils/APConnectorHealthCheck";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { 
  ApsConfigService, 
  APSConnector
} from '@solace-iot-team/apim-server-openapi-browser';

import "../APComponents.css";
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

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_CONNECTOR, `retrieve details for connector: ${props.connectorDisplayName}`);
    try { 
      const apsConnector: APSConnector = await ApsConfigService.getApsConnector(props.connectorId);
      const healthCheckResult: THealthCheckResult = await APConnectorHealthCheck.doHealthCheck(apsConnector.connectorClientConfig);    
      setManagedObject(ManageConnectorsCommon.transformViewApiObjectToViewManagedObject(apsConnector, healthCheckResult));
    } catch(e) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    let apiCallState: TApiCallState = await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []);

  React.useEffect(() => {
    doInitialize();
  }, [props.reInitializeTrigger]);

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]);

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
            <Column field="adminUser" header="Admin User" />
            <Column field="adminUserPwd" header="Admin User Password" />
            <Column field="apiUser" header="API User" />
            <Column field="apiUserPwd" header="API User Password" />
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
      </div>
    )
  }

  return (
    <div className="manage-connectors">

      {ManageConnectorsCommon.renderSubComponentHeader(`Connector: ${props.connectorDisplayName} (${props.connectorId})`)}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
