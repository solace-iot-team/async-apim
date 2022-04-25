
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { TAPAppEnvironmentDisplayList } from "../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import { APDisplayDeveloperPortalAppEnvironmentChannelPermissions } from "./APDisplayDeveloperPortalApp_EnvironmentChannelPermissions";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_EnvironmentChannelPermissions_PanelProps {
  apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  componentClassName?: string;
  contentClassName?: string;
  componentTitle?: string;
  collapsed: boolean;
  emptyMessage: string;
}

export const APDisplayDeveloperPortalAppEnvironmentChannelPermissionsPanel: React.FC<IAPDisplayDeveloperPortalApp_EnvironmentChannelPermissions_PanelProps> = (props: IAPDisplayDeveloperPortalApp_EnvironmentChannelPermissions_PanelProps) => {
  // const ComponentName='APDisplayDeveloperPortalAppEnvironmentChannelPermissionsPanel';

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
        <APDisplayDeveloperPortalAppEnvironmentChannelPermissions
          apAppEnvironmentDisplayList={props.apAppEnvironmentDisplayList}
          className={props.componentClassName}
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
