
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { APDisplayAppClientInformation } from "./deleteme.APDisplayAppClientInformation";
import { TAPAppClientInformationList } from "../deleteme.APComponentsCommon";

import "../APComponents.css";

export interface IAPDisplayAppClientInformationPanelProps {
  appClientInformationList: TAPAppClientInformationList;
  emptyMessage: string;
  className?: string;
  header?: string;
}

export const APDisplayClientInformationPanel: React.FC<IAPDisplayAppClientInformationPanelProps> = (props: IAPDisplayAppClientInformationPanelProps) => {
  // const componentName='APDisplayClientInformationPanel';

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
        <APDisplayAppClientInformation
          appClientInformationList={props.appClientInformationList}
          emptyMessage={props.emptyMessage}
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
