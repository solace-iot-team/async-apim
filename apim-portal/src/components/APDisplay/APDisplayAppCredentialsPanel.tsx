
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { Credentials } from "@solace-iot-team/apim-connector-openapi-browser";
import { APDisplayAppCredentials } from "./APDisplayAppCredentials";

import "../APComponents.css";

export interface IAPDisplayAppCredentialsPanelProps {
  appCredentials: Credentials;
  className?: string;
  header?: string;
}

export const APDisplayCredentialsPanel: React.FC<IAPDisplayAppCredentialsPanelProps> = (props: IAPDisplayAppCredentialsPanelProps) => {
  // const componentName='APDisplayCredentialsPanel';

  const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
    const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
    const className = `${options.className} p-jc-start`;
    const titleClassName = `${options.titleClassName} p-pl-1`;
    return (
      <div className={className} style={{ justifyContent: 'left'}} >
        <button className={options.togglerClassName} onClick={options.onTogglerClick}>
          <span className={toggleIcon}></span>
        </button>
        <span className={titleClassName}>
          {props.header}
        </span>
      </div>
    );
  }

  const renderComponent = (): JSX.Element => {
    return (
      <Panel 
        headerTemplate={panelHeaderTemplate} 
        toggleable
        collapsed={true}
        className="p-pt-2"
      >
        <APDisplayAppCredentials
          appCredentials={props.appCredentials} 
        />
      </Panel>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
