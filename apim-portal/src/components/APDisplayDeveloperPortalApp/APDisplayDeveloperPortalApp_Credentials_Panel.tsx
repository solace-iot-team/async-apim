
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { APDisplayDeveloperPortalApp_ApiProducts } from "./APDisplayDeveloperPortalApp_ApiProducts";
import { TAPAppCredentialsDisplay } from "../../displayServices/APAppsDisplayService/APAppsDisplayService";

import "../APComponents.css";
import { APDisplayDeveloperPortalApp_Credentials } from "./APDisplayDeveloperPortalApp_Credentials";

export interface IAPDisplayDeveloperPortalApp_Credentials_PanelProps {
  appCredentials: TAPAppCredentialsDisplay;
  componentClassName?: string;
  contentClassName?: string;
  componentTitle?: string;
  collapsed: boolean;
}

export const APDisplayDeveloperPortalApp_Credentials_Panel: React.FC<IAPDisplayDeveloperPortalApp_Credentials_PanelProps> = (props: IAPDisplayDeveloperPortalApp_Credentials_PanelProps) => {
  // const ComponentName='APDisplayDeveloperPortalApp_Credentials_Panel';

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
        <APDisplayDeveloperPortalApp_Credentials
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
