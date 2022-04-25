
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";

import { TAPDeveloperPortalAppApiProductDisplayList } from "../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";

import "../APComponents.css";
import { APDisplayApApiProductListControlledChannelParameterList } from "./APDisplayApApiProductListApControlledChannelParameterList";

export interface IAPDisplayApApiProductListControlledChannelParameterListPanelProps {
  apAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  emptyApiProductDisplayListMessage: string;
  emptyControlledChannelParameterListMessage: string;
  className?: string;
}

export const APDisplayApApiProductListControlledChannelParameterListPanel: React.FC<IAPDisplayApApiProductListControlledChannelParameterListPanelProps> = (props: IAPDisplayApApiProductListControlledChannelParameterListPanelProps) => {
  // const ComponentName='APDisplayApApiProductListControlledChannelParameterListPanel';

  const renderComponent = (): JSX.Element => {
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
            Controlled Channel Parameter Details
          </span>
        </div>
      );
    }  
    return (
      <React.Fragment>
        <div className="p-ml-3"> 
          <Panel 
            headerTemplate={panelHeaderTemplate} 
            toggleable={true}
            collapsed={true}
          >
            <APDisplayApApiProductListControlledChannelParameterList
              apAppApiProductDisplayList={props.apAppApiProductDisplayList}
              emptyApiProductDisplayListMessage={props.emptyApiProductDisplayListMessage}
              emptyControlledChannelParameterListMessage={props.emptyControlledChannelParameterListMessage}
              className={props.className}
            />
        </Panel>
      </div> 
    </React.Fragment>
    )
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
