
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { TAPEnvironmentEndpointDisplayList } from "../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import { APDisplayDeveloperPortalAppEndpoints } from "./APDisplayDeveloperPortalApp_Endpoints";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_Endpoints_PanelProps {
  apEnvironmentEndpointList: TAPEnvironmentEndpointDisplayList;
  componentClassName?: string;
  contentClassName?: string;
  componentTitle?: string;
  collapsed: boolean;
  emptyMessage: string;
}

export const APDisplayDeveloperPortalAppEndpointsPanel: React.FC<IAPDisplayDeveloperPortalApp_Endpoints_PanelProps> = (props: IAPDisplayDeveloperPortalApp_Endpoints_PanelProps) => {
  // const ComponentName='APDisplayDeveloperPortalAppEndpointsPanel';

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
        <APDisplayDeveloperPortalAppEndpoints
          apEnvironmentEndpointList={props.apEnvironmentEndpointList}
          className={props.contentClassName}
          emptyMessage={props.emptyMessage}
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
