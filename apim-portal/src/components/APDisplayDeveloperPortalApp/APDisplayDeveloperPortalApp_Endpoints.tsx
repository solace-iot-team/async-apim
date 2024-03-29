
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  TAPEnvironmentEndpointDisplay, 
  TAPEnvironmentEndpointDisplayList 
} from "../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import { Protocol } from "@solace-iot-team/apim-connector-openapi-browser";
import APDisplayUtils from "../../displayServices/APDisplayUtils";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_EndpointsProps {
  apEnvironmentEndpointList: TAPEnvironmentEndpointDisplayList;
  className?: string;
  emptyMessage: string;
}

export const APDisplayDeveloperPortalAppEndpoints: React.FC<IAPDisplayDeveloperPortalApp_EndpointsProps> = (props: IAPDisplayDeveloperPortalApp_EndpointsProps) => {
  // const ComponentName='APDisplayDeveloperPortalAppEndpoints';


  const componentDataTableRef = React.useRef<any>(null);

  const protocolBodyTemplate = (row: TAPEnvironmentEndpointDisplay): JSX.Element => {
    return (
      <div>{`${row.protocol.name} (${row.protocol.version})`}</div>
    );
  }

  const propertiesBodyTemplate = (row: TAPEnvironmentEndpointDisplay): JSX.Element => {
    return (
      <div>{row.properties}</div>
    );
  }

  const endpointBodyTemplate = (row: TAPEnvironmentEndpointDisplay): JSX.Element => {
    return (
      <div>{row.uri}</div>
    );
  }

  const notesBodyTemplate = (row: TAPEnvironmentEndpointDisplay): JSX.Element => {
    if(row.protocol.name === Protocol.name.MQTT || row.protocol.name === Protocol.name.SECURE_MQTT) {
      return (
        <div>
          clientId: see Async API Spec (Servers section).
        </div>
      );
    }
    return (<></>);
  }

  const rowGroupHeaderTemplate = (row: TAPEnvironmentEndpointDisplay) => {
    // let header = row.apEntityId.displayName;
    // if(row.messageVpnName) header += ` - Message Vpn: ${row.messageVpnName}`;
    return(
      <div>
        <div className="p-text-bold">Environment: {row.apEntityId.displayName}</div>
        {row.messageVpnName &&
          <div className="p-ml-2">Message Vpn: {row.messageVpnName}</div>
        }
      </div>
    );
  }

  const rowGroupFooterTemplate = (row: TAPEnvironmentEndpointDisplay) => {
    return(<></>);
  }

  const renderComponentContent = (): JSX.Element => {
    // const funcName = 'renderComponentContent';
    // const logName = `${ComponentName}.${funcName}()`;
    const dataKey = APDisplayUtils.nameOf<TAPEnvironmentEndpointDisplay>('apEntityId.id');
    const nameField = APDisplayUtils.nameOf<TAPEnvironmentEndpointDisplay>('apEntityId.displayName');
    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={componentDataTableRef}
          dataKey={dataKey}
          value={props.apEnvironmentEndpointList}
          sortMode="single" 
          sortField={nameField} 
          sortOrder={1}
          scrollable 
          // scrollHeight="200px" 
          resizableColumns 
          columnResizeMode="fit"
          groupField={nameField}
          rowGroupMode="subheader"
          // groupRowsBy={sortField} <- the new version?
          rowGroupHeaderTemplate={rowGroupHeaderTemplate}
          rowGroupFooterTemplate={rowGroupFooterTemplate}
        >
          <Column header="Protocol" body={protocolBodyTemplate} style={{ width: '15%' }} />
          <Column header="Properties" body={propertiesBodyTemplate} style={{ width: '15%' }} />
          <Column header="Endpoint" body={endpointBodyTemplate}  />
          <Column header="Notes" body={notesBodyTemplate} />
        </DataTable>
      </div>    
    );
  }
  
  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderComponentContent()}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {props.apEnvironmentEndpointList.length > 0 &&
        renderComponent()
      }
      {(props.apEnvironmentEndpointList.length === 0) && 
        <span>{props.emptyMessage}</span>
      }
    </div>
  );
}


