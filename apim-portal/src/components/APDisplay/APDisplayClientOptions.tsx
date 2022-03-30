
import React from "react";

import { TAPClientOptionsDisplay } from "../../displayServices/APApiProductsDisplayService";

import "../APComponents.css";

export interface IAPDisplayClientOptionsProps {
  apClientOptionsDisplay: TAPClientOptionsDisplay;
  className?: string;
}

export const APDisplayClientOptions: React.FC<IAPDisplayClientOptionsProps> = (props: IAPDisplayClientOptionsProps) => {
  // const componentName='APDisplayClientOptions';

  const renderGuaranteedMessaging = (): JSX.Element => {
    const renderNotEnabled = (): JSX.Element => {
      return (<>'Not enabled.'</>);
    }
    const renderRow = (name: string, value: string | number): JSX.Element => {
      return (
        <div className="p-field p-grid p-ml-2 p-mb-1">
          <label className="p-col-fixed" style={{ width: "200px"}}>{name}:</label>
          <div className="p-col">{value}</div>
        </div>
      );      
    }
    const renderEnabled = (): JSX.Element => {
      return (
        <React.Fragment>
          {renderRow('Enabled', String(props.apClientOptionsDisplay.apGuaranteedMessaging.requireQueue))}
          {renderRow('AccessType', props.apClientOptionsDisplay.apGuaranteedMessaging.accessType)}
          {renderRow('Max Spool Usage', `${props.apClientOptionsDisplay.apGuaranteedMessaging.maxMsgSpoolUsage} MB`)}
          {renderRow('Max TTL', `${props.apClientOptionsDisplay.apGuaranteedMessaging.maxTtl} seconds`)}
        </React.Fragment>
      );
    }
    const isEnabled: boolean = props.apClientOptionsDisplay.apGuaranteedMessaging.requireQueue;
    return (
      <React.Fragment>
        <div className="p-text-bold p-mb-2">Guaranteed Messaging:</div>
        {!isEnabled &&
          renderNotEnabled()
        }
        {isEnabled && 
          renderEnabled()
        }
      </React.Fragment>
    );
  }

  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderGuaranteedMessaging()}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
