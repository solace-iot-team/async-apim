
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  ClientInformationGuaranteedMessaging,
} from "@solace-iot-team/apim-connector-openapi-browser";
import { 
  TAPAppClientInformation, 
  TAPAppClientInformationList 
} from "../deleteme.APComponentsCommon";

import "../APComponents.css";

export interface IAPDisplayAppClientInformationProps {
  appClientInformationList: TAPAppClientInformationList;
  emptyMessage: string;
  className?: string;
}

export const APDisplayAppClientInformation: React.FC<IAPDisplayAppClientInformationProps> = (props: IAPDisplayAppClientInformationProps) => {
  // const componentName='APDisplayAppClientInformation';

  const componentDataTableRef = React.useRef<any>(null);
  const [componentExpandedDataTableRows, setComponentExpandedDataTableRows] = React.useState<any>(null);
  const componentExpansionDataTableRef = React.useRef<any>(null);
  
  const renderGuaranteedMessaging = (rowData: TAPAppClientInformation): JSX.Element => {
    const dataTableList: Array<ClientInformationGuaranteedMessaging> = [rowData.guaranteedMessaging];
    return (
      <DataTable
        ref={componentExpansionDataTableRef}
        dataKey="name"
        header="Guaranteed Messaging"
        value={dataTableList}
      >
        <Column header="Queue Name" field="name"  />
        <Column header="Access Type" headerStyle={{ width: '8em' }} field="accessType"  />
        <Column header="Max TTL (secs)" headerStyle={{ width: '10em' }} field="maxTtl" />
        <Column header="Max Spool (MB)" headerStyle={{ width: '10em' }} field="maxMsgSpoolUsage" />
      </DataTable>
    );
  }

  const renderComponent = (appClientInformationList: TAPAppClientInformationList): JSX.Element => {
    return (
      <DataTable
        className="p-datatable-sm"
        ref={componentDataTableRef}
        dataKey="apiProductName"
        value={appClientInformationList}
        sortMode="single" 
        sortField="apiProductDisplayName" 
        sortOrder={1}
        scrollable 
        expandedRows={componentExpandedDataTableRows}
        onRowToggle={(e) => setComponentExpandedDataTableRows(e.data)}
        rowExpansionTemplate={renderGuaranteedMessaging}
      >
        <Column expander style={{ width: '3em' }} />  
        <Column field="apiProductDisplayName" header="API Product" />
      </DataTable>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {props.appClientInformationList.length > 0 &&
        renderComponent(props.appClientInformationList)
      }
      {props.appClientInformationList.length === 0 && 
        <span>{props.emptyMessage}</span>
      }
    </div>
  );
}
