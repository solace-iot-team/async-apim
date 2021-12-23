
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
  header?: string;
  headerClassName?: string;
}

export const APDisplayAppCredentials: React.FC<IAPDisplayAppCredentialsProps> = (props: IAPDisplayAppCredentialsProps) => {
  // const componentName='APDisplayAppCredentials';

  const componentDataTableRef = React.useRef<any>(null);

  const renderComponentHeader = (): JSX.Element => {
    if(!props.header) return (<React.Fragment></React.Fragment>);
    const className: string = props.headerClassName ? props.headerClassName : "ap-display-component-header";
    return (
        <div className={className}>Credentials</div>
    );
  }
  const renderComponentContent = (): JSX.Element => {
    const dataTableList = [
      {
        consumerKey: props.appCredentials.secret?.consumerKey,
        consumerSecret: props.appCredentials.secret?.consumerSecret,
        expiresAt: props.appCredentials.expiresAt
      }
    ];
    return (
      <div className="p-ml-2">
        <DataTable
          className="p-datatable-sm"
          ref={componentDataTableRef}
          value={dataTableList}
          // header={props.header}
        >
          <Column field="consumerKey" header="Username" />
          <Column field="consumerSecret" header="Password" />
          <Column field="expiresAt" header="Expires At" />
        </DataTable>
      </div>
    );
  }
  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderComponentHeader()}
        {renderComponentContent()}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {
        renderComponent()
      }
    </div>
  );
}
