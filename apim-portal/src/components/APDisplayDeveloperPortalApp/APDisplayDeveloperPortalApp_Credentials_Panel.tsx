
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { TAPAppCredentialsDisplay } from "../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { APDisplayDeveloperPortalAppCredentials } from "./APDisplayDeveloperPortalApp_Credentials";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_Credentials_PanelProps {
  appCredentials: TAPAppCredentialsDisplay;
  componentClassName?: string;
  contentClassName?: string;
  componentTitle?: string;
  collapsed: boolean;
}

export const APDisplayDeveloperPortalAppCredentialsPanel: React.FC<IAPDisplayDeveloperPortalApp_Credentials_PanelProps> = (props: IAPDisplayDeveloperPortalApp_Credentials_PanelProps) => {
  // const ComponentName='APDisplayDeveloperPortalAppCredentialsPanel';

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
          {props.componentTitle}
        </span>
      </div>
    );
  }

  const renderComponent = (): JSX.Element => {
    return (
      <Panel 
        headerTemplate={panelHeaderTemplate} 
        toggleable
        collapsed={props.collapsed}
        className="p-pt-2"
      >
        <APDisplayDeveloperPortalAppCredentials
          appCredentials={props.appCredentials}
          className={props.contentClassName}
        />
      </Panel>
    );
  }

  return (
    <div className={props.componentClassName ? props.componentClassName : 'card'}>
      {renderComponent()}
    </div>
  );
}
