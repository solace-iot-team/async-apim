
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  Credentials,
} from "@solace-iot-team/apim-connector-openapi-browser";

import "../APComponents.css";

export interface IAPDisplayAppCredentialsProps {
  appCredentials: Credentials;
  className?: string;
}

export const APDisplayAppCredentials: React.FC<IAPDisplayAppCredentialsProps> = (props: IAPDisplayAppCredentialsProps) => {
  const componentName='APDisplayAppCredentials';

  // const componentDataTableRef = React.useRef<any>(null);
  // const [componentExpandedDataTableRows, setComponentExpandedDataTableRows] = React.useState<any>(null);
  // const componentExpansionDataTableRef = React.useRef<any>(null);
  
  // const renderGuaranteedMessaging = (rowData: TAPAppClientInformation): JSX.Element => {
  //   const dataTableList: Array<ClientInformationGuaranteedMessaging> = [rowData.guaranteedMessaging];
  //   return (
  //     <DataTable
  //       ref={componentExpansionDataTableRef}
  //       dataKey="name"
  //       header="Guaranteed Messaging"
  //       value={dataTableList}
  //     >
  //       <Column field="name" header="Queue Name" />
  //       <Column field="accessType" header="Access Type" />
  //     </DataTable>
  //   );
  // }

  const renderComponent = (appCredentials: Credentials): JSX.Element => {

    return (
      <React.Fragment>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(appCredentials, null, 2)}
        </pre>
      </React.Fragment>
    );

    // return (
    //   <DataTable
    //     className="p-datatable-sm"
    //     ref={componentDataTableRef}
    //     dataKey="apiProductName"
    //     value={appClientInformationList}
    //     sortMode="single" 
    //     sortField="apiProductDisplayName" 
    //     sortOrder={1}
    //     scrollable 
    //     expandedRows={componentExpandedDataTableRows}
    //     onRowToggle={(e) => setComponentExpandedDataTableRows(e.data)}
    //     rowExpansionTemplate={renderGuaranteedMessaging}
    //   >
    //     <Column expander style={{ width: '3em' }} />  
    //     <Column field="apiProductDisplayName" header="API Product" />
    //   </DataTable>
    // );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {
        renderComponent(props.appCredentials)
      }
    </div>
  );
}
