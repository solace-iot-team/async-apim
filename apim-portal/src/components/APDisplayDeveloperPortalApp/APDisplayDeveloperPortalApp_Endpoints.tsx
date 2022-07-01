
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APAppEnvironmentsDisplayService, { 
  TAPEnvironmentEndpointDisplay, 
  TAPEnvironmentEndpointDisplayList 
} from "../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";

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
    // console.log(`${logName}: props.apEnvironmentEndpointList=${JSON.stringify(props.apEnvironmentEndpointList, null, 2)}`);
    // alert(`${logName}: check console for log`);
    const dataKey = APAppEnvironmentsDisplayService.nameOf_TAPEnvironmentEndpointDisplay_ApEntityId('id');
    const nameField = APAppEnvironmentsDisplayService.nameOf_TAPEnvironmentEndpointDisplay_ApEntityId('displayName');
    // alert(`${logName}: nameField=${nameField}`)
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
          <Column header="Properties" body={propertiesBodyTemplate} style={{ width: '20%' }} />
          <Column header="Endpoint" body={endpointBodyTemplate}  />
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


