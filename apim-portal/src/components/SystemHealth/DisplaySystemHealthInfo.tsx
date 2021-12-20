
import React from "react";

import { APHealthCheckContext } from "../APHealthCheckContextProvider";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { EAPHealthCheckSuccess, TAPHealthCheckSummary } from "../../utils/APHealthCheck";
import { SystemHealthCommon } from "./SystemHealthCommon";

import "../APComponents.css";

export interface IDisplaySystemHealthInfoProps {
  className?: string;
}

export const DisplaySystemHealthInfo: React.FC<IDisplaySystemHealthInfoProps> = (props: IDisplaySystemHealthInfoProps) => {
  // const componentName='APDisplaySystemHealthInfo';

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);

  const renderHealthInfo = (name: string, summary: TAPHealthCheckSummary | undefined, undefinedInfo?: string) => {
    if(!summary) return (<></>);
    let success: EAPHealthCheckSuccess = EAPHealthCheckSuccess.UNDEFINED;
    let timestampStr: string = 'n/a';
    if(summary.performed) {
      success = summary.success;
      timestampStr = new Date(summary.timestamp).toUTCString();
    }
    const info = `${name}: ${success} (${timestampStr})`;
    return (
      <React.Fragment>
        {success !== EAPHealthCheckSuccess.UNDEFINED && 
          <div style={{color: SystemHealthCommon.getColor(success) }}>
            {info}
          </div>
        }
        {success === EAPHealthCheckSuccess.UNDEFINED && undefinedInfo &&
          <div>
            {undefinedInfo}
          </div>
        }
      </React.Fragment>
    );
  }
  const renderServerHealthInfo = () => {
    return renderHealthInfo('Server', healthCheckContext.serverHealthCheckResult?.summary);
  }

  const renderConnectorHealthInfo = () => {
    const connectorName = configContext.connector ? configContext.connector.displayName : 'unknown';
    return renderHealthInfo(`Connector: ${connectorName}`, healthCheckContext.connectorHealthCheckResult?.summary, 'Connector: no active connector');
  }

  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderServerHealthInfo()}
        {renderConnectorHealthInfo()}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className={props.className ? props.className : 'card'}>
        {renderComponent()}
      </div>
    </React.Fragment>
  );
}
