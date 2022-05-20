import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";

import { TAPApiDisplayList } from "../../displayServices/deleteme.APApisDisplayService";
import { APDisplayApApiListChannelParameterList } from "./APDisplayApApiListApChannelParameterList";

import "../APComponents.css";

export interface IAPDisplayApisDetailsProps {
  apApiDisplayList: TAPApiDisplayList;
  className?: string;
}

export const APDisplayApisDetails: React.FC<IAPDisplayApisDetailsProps> = (props: IAPDisplayApisDetailsProps) => {
  const ComponentName='APDisplayApisDetails';

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
            Channel Parameter Details
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
            <APDisplayApApiListChannelParameterList
              key={`${ComponentName}_APDisplayApApiListChannelParameterList`}
              apApiDisplayList={props.apApiDisplayList}
              emptyApiDisplayListMessage="No API(s) selected"
              emptyChannelParameterListMessage="No Channel Parameters defined"
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
