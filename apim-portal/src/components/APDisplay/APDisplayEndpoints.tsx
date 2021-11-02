
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  Endpoint
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APRenderUtils } from "../../utils/APRenderUtils";

import "../APComponents.css";

export interface IAPDisplayEndpointsProps {
  endpointList: Array<Endpoint>;
  emptyMessage: string;
  className?: string;
}

export const APDisplayEndpoints: React.FC<IAPDisplayEndpointsProps> = (props: IAPDisplayEndpointsProps) => {
  const componentName='APDisplayEndpoints';

  const dataTableRef = React.useRef<any>(null);

  const attributesBodyTemplate = (endpointRow: Endpoint): JSX.Element => {
    return (
      <React.Fragment>
        {APRenderUtils.getEndpointAttributesAsString(endpointRow)}
      </React.Fragment>
    );
  }

  const renderComponent = (endpointList: Array<Endpoint>): JSX.Element => {
    // const funcName = 'renderComponent';
    // const logName = `${componentName}.${funcName}()`;

    return (
      <DataTable
        ref={dataTableRef}
        dataKey="protocol.name"
        value={endpointList}
        sortMode="single" 
        sortField="protocol.name" 
        sortOrder={1}
        scrollable 
        // scrollHeight="200px" 
      >
        <Column field="protocol.name" header="Protocol" style={{ width: '15%' }} />
        <Column field="protocol.version" header="Version" style={{ width: '10%' }}/>
        <Column body={attributesBodyTemplate} header="Attributes" style={{ width: '20%' }} />
        <Column field="uri" header="Endpoint" />
      </DataTable>
    );
  }


  return (
    <div className={props.className ? props.className : 'card'}>
      {props.endpointList.length > 0 &&
        renderComponent(props.endpointList)
      }
      {props.endpointList.length === 0 && 
        <span>{props.emptyMessage}</span>
      }
    </div>
  );
}
