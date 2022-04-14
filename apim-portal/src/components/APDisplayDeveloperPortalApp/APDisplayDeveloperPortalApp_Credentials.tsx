
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APAppsDisplayService, { TAPAppCredentialsDisplay } from "../../displayServices/APAppsDisplayService/APAppsDisplayService";

import "../APComponents.css";
import APDisplayUtils from "../../displayServices/APDisplayUtils";

export interface IAPDisplayDeveloperPortalApp_CredentialsProps {
  appCredentials: TAPAppCredentialsDisplay;
  className?: string;
}

export const APDisplayDeveloperPortalAppCredentials: React.FC<IAPDisplayDeveloperPortalApp_CredentialsProps> = (props: IAPDisplayDeveloperPortalApp_CredentialsProps) => {
  // const ComponentName='APDisplayDeveloperPortalAppCredentials';

  const componentDataTableRef = React.useRef<any>(null);

  const expiresAtBodyTemplate = (row: TAPAppCredentialsDisplay): JSX.Element => {
    if(row.expiresAt !== -1) {
      const d = new Date(row.issuedAt);
      return (<>{d.toUTCString()}</>);
    } else {
      return (<div style={{ color: 'red'}}>-</div>);
    }
  }

  const issuedAtBodyTemplate = (row: TAPAppCredentialsDisplay): JSX.Element => {
    if(row.issuedAt !== -1) {
      const d = new Date(row.issuedAt);
      return (<>{d.toUTCString()}</>);
    } else {
      return (<div style={{ color: 'red'}}>-</div>);
    }
  }

  const expiresInBodyTemplate = (row: TAPAppCredentialsDisplay): JSX.Element => {
    return (<div>{APDisplayUtils.convertMilliseconds(row.apConsumerKeyExiresIn)}</div>);
  }

  const renderComponentContent = (): JSX.Element => {
    const consumerKeyField = APAppsDisplayService.nameOf_ApAppCredentialsDisplay_Secret('consumerKey');
    const consumerSecretField = APAppsDisplayService.nameOf_ApAppCredentialsDisplay_Secret('consumerSecret');
    const expiresAtField = APAppsDisplayService.nameOf_ApAppCredentialsDisplay('expiresAt');
    const issuedAtField = APAppsDisplayService.nameOf_ApAppCredentialsDisplay('issuedAt');
    const expiresInField = APAppsDisplayService.nameOf_ApAppCredentialsDisplay('apConsumerKeyExiresIn');
    return (
      <div className="p-ml-2">
        <DataTable
          className="p-datatable-sm"
          ref={componentDataTableRef}
          value={[props.appCredentials]}
          autoLayout={true}
          resizableColumns={true}
          columnResizeMode="fit"
        >
          <Column header="Consumer Key" field={consumerKeyField} />
          <Column header="Consumer Secret" field={consumerSecretField} />
          <Column header="Issued At" body={issuedAtBodyTemplate} field={issuedAtField} style={{ textAlign: 'center'}}/>
          <Column header="Expires At" body={expiresAtBodyTemplate} field={expiresAtField} style={{ textAlign: 'center'}}/>
          <Column header="TEST: Expires In" body={expiresInBodyTemplate} field={expiresInField} style={{ textAlign: 'center'}}/>
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
