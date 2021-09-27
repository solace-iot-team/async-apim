
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

import { EnvironmentsService } from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEnvironmentName, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ManageEnvironmentsCommon, E_CALL_STATE_ACTIONS, TViewApiObject, TViewManagedObject } from "./ManageEnvironmentsCommon";

import '../../../components/APComponents.css';
import "./ManageEnvironments.css";

export interface IViewEnvironmentProps {
  organizationName: TAPOrganizationId;
  environmentName: TAPEnvironmentName;
  environmentDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewEnvironment: React.FC<IViewEnvironmentProps> = (props: IViewEnvironmentProps) => {
  const componentName = 'ViewEnvironment';

  type TApiObject = TViewApiObject;
  type TManagedObject = TViewManagedObject;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ENVIRONMENT, `retrieve details for environment: ${props.environmentDisplayName}`);
    try { 
      const apiObject: TApiObject = await EnvironmentsService.getEnvironment({
        organizationName: props.organizationName, 
        envName: props.environmentName
      });      
      // throw new Error(`${logName}: testing error`);
      setManagedObject(ManageEnvironmentsCommon.transformViewApiObjectToViewManagedObject(apiObject));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
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
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    const dataTableList = [managedObject];
    let expandedRows: any = {};
    expandedRows[`${dataTableList[0].id}`] = true;

    const rowExpansionTemplate = (managedObject: TManagedObject) => {
      return (
        <div>
          {/* <h5>Endpoints</h5> */}
          <DataTable 
            className="p-datatable-sm"
            value={managedObject.exposedViewServiceEndpointList}
            autoLayout={true}
          >
            <Column field="protocol.name" header="Protocol" />
            <Column field="protocol.version" header="Version" />
            <Column field="secure" header='Secure?' />
            <Column field="compressed" header='Compressed?' />
            <Column field="uri" header="Endpoint" />
          </DataTable>
        </div>
      );
    }

    return (
      <div className="card">
        {/* {Common.renderSubComponentHeader(`Environment: ${managedObject.displayName} (${managedObject.id})`)} */}
        <DataTable header={'Description: ' + managedObject.apiObject.description} />
        <h4>PubSub+ Service:</h4>
        <DataTable
          ref={dt}
          // header="PubSub+ Service:"
          value={dataTableList}
          expandedRows={expandedRows}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="id"
          >
            <Column field="apiObject.serviceName" header="Service Name" />
            <Column field="apiObject.serviceId" header="Service Id" />
            <Column field="apiObject.msgVpnName" header="Msg Vpn" />
            <Column field="apiObject.datacenterProvider" header="Datacenter Provider" />
            <Column field="apiObject.datacenterId" header="Datacenter Id" />
            <Column field="apiObject.serviceTypeId" header="Service Type" />
            <Column field="transformedServiceClassDisplayedAttributes.highAvailability" header="Availability" />
        </DataTable>
      </div>
    )
  }

  return (
    <div className="ap-environments">

      <APComponentHeader header={`Environment: ${props.environmentDisplayName} (${props.environmentName})`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
