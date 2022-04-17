
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { TAPApp_ApiProduct_ClientInformationDisplayList } from "../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import { APDisplayDeveloperPortalAppApiProductsClientInformation } from "./APDisplayDeveloperPortalApp_ApiProducts_ClientInformation";
import { EAPApp_Status } from "../../displayServices/APAppsDisplayService/APAppsDisplayService";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_ApiProducts_ClientInformation_PanelProps {
  apAppStatus: EAPApp_Status;
  apApp_ApiProduct_ClientInformationDisplayList: TAPApp_ApiProduct_ClientInformationDisplayList;
  componentClassName?: string;
  contentClassName?: string;
  emptyMessage: string;
  notProvisionedMessage: string;
  componentTitle?: string;
  collapsed: boolean;
}

export const APDisplayDeveloperPortalAppApiProductsClientInformationPanel: React.FC<IAPDisplayDeveloperPortalApp_ApiProducts_ClientInformation_PanelProps> = (props: IAPDisplayDeveloperPortalApp_ApiProducts_ClientInformation_PanelProps) => {
  // const ComponentName='APDisplayDeveloperPortalAppApiProductsClientInformationPanel';

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
        <APDisplayDeveloperPortalAppApiProductsClientInformation
          apAppStatus={props.apAppStatus}
          apApp_ApiProduct_ClientInformationDisplayList={props.apApp_ApiProduct_ClientInformationDisplayList}
          className={props.contentClassName}
          emptyMessage={props.emptyMessage}
          notProvisionedMessage={props.notProvisionedMessage}
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
