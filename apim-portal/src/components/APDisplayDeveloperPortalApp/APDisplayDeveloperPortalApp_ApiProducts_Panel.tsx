
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { TAPDeveloperPortalAppApiProductDisplayList } from "../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import { APDisplayDeveloperPortalApp_ApiProducts } from "./APDisplayDeveloperPortalApp_ApiProducts";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_ApiProducts_PanelProps {
  apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  componentClassName?: string;
  contentClassName?: string;
  emptyMessage: string;
  componentTitle?: string;
  collapsed: boolean;
}

export const APDisplayDeveloperPortalApp_ApiProducts_Panel: React.FC<IAPDisplayDeveloperPortalApp_ApiProducts_PanelProps> = (props: IAPDisplayDeveloperPortalApp_ApiProducts_PanelProps) => {
  // const ComponentName='APDisplayDeveloperPortalApp_ApiProducts_Panel';

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
        <APDisplayDeveloperPortalApp_ApiProducts
          apDeveloperPortalApp_ApiProductDisplayList={props.apDeveloperPortalApp_ApiProductDisplayList}
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
