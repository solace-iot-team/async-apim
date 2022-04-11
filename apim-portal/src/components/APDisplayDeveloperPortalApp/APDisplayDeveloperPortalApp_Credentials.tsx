
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APAppsDisplayService, { TAPAppCredentialsDisplay } from "../../displayServices/APAppsDisplayService/APAppsDisplayService";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_CredentialsProps {
  appCredentials: TAPAppCredentialsDisplay;
  className?: string;
}

export const APDisplayDeveloperPortalApp_Credentials: React.FC<IAPDisplayDeveloperPortalApp_CredentialsProps> = (props: IAPDisplayDeveloperPortalApp_CredentialsProps) => {
  // const ComponentName='APDisplayDeveloperPortalApp_Credentials';

  const componentDataTableRef = React.useRef<any>(null);

  const renderComponentContent = (): JSX.Element => {
    const consumerKeyField = APAppsDisplayService.nameOf_ApAppCredentialsDisplay_Secret('consumerKey');
    const consumerSecretField = APAppsDisplayService.nameOf_ApAppCredentialsDisplay_Secret('consumerSecret');
    const expiresAtField = APAppsDisplayService.nameOf_ApAppCredentialsDisplay('expiresAt');
    return (
      <div className="p-ml-2">
        <DataTable
          className="p-datatable-sm"
          ref={componentDataTableRef}
          value={[props.appCredentials]}
        >
          <Column header="Username" field={consumerKeyField} />
          <Column header="Password" field={consumerSecretField}  />
          <Column header="Expires At" field={expiresAtField}  />
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
      {
        renderComponent()
      }
    </div>
  );
}
