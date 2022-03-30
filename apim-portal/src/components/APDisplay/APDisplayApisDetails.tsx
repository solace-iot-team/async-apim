import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";

import { TAPApiDisplayList } from "../../displayServices/APApisDisplayService";
import { APDisplayApApiListChannelParameterList } from "./APDisplayApApiListApChannelParameterList";

import "../APComponents.css";

export interface IAPDisplayApisDetailsProps {
  apApiDisplayList: TAPApiDisplayList;
  className?: string;
}

export const APDisplayApisDetails: React.FC<IAPDisplayApisDetailsProps> = (props: IAPDisplayApisDetailsProps) => {
  const ComponentName='APDisplayApisDetails';

  // const renderGuaranteedMessaging = (): JSX.Element => {
  //   const renderNotEnabled = (): JSX.Element => {
  //     return (<>'Not enabled.'</>);
  //   }
  //   const renderRow = (name: string, value: string | number): JSX.Element => {
  //     return (
  //       <div className="p-field p-grid p-ml-2 p-mb-1">
  //         <label className="p-col-fixed" style={{ width: "200px"}}>{name}:</label>
  //         <div className="p-col">{value}</div>
  //       </div>
  //     );      
  //   }
  //   const renderEnabled = (): JSX.Element => {
  //     return (
  //       <React.Fragment>
  //         {renderRow('Enabled', String(props.apClientOptionsDisplay.apGuaranteedMessaging.requireQueue))}
  //         {renderRow('AccessType', props.apClientOptionsDisplay.apGuaranteedMessaging.accessType)}
  //         {renderRow('Max Spool Usage', `${props.apClientOptionsDisplay.apGuaranteedMessaging.maxMsgSpoolUsage} MB`)}
  //         {renderRow('Max TTL', `${props.apClientOptionsDisplay.apGuaranteedMessaging.maxTtl} seconds`)}
  //       </React.Fragment>
  //     );
  //   }
  //   const isEnabled: boolean = props.apClientOptionsDisplay.apGuaranteedMessaging.requireQueue;
  //   return (
  //     <React.Fragment>
  //       <div className="p-text-bold p-mb-2">Guaranteed Messaging:</div>
  //       {!isEnabled &&
  //         renderNotEnabled()
  //       }
  //       {isEnabled && 
  //         renderEnabled()
  //       }
  //     </React.Fragment>
  //   );
  // }

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
