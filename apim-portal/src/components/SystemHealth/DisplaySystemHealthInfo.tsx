
import React from "react";

import { TAPHealthCheckContext } from "../APHealthCheckContextProvider";
import { EAPHealthCheckSuccess, TAPHealthCheckSummary } from "../../utils/APHealthCheck";
import { SystemHealthCommon } from "./SystemHealthCommon";

import "../APComponents.css";

export enum EAPSystemHealthInfoPart {
  ALL = 'ALL',
  PORTAL_APP = 'PORTAL_APP',
  SERVER = 'SERVER',
  CONNECTOR = 'CONNECTOR'
}

export interface IDisplaySystemHealthInfoProps {
  className?: string;
  systemHealthInfoPart?: EAPSystemHealthInfoPart;
  healthCheckContext: TAPHealthCheckContext;
  connectorDisplayName: string
}

export const DisplaySystemHealthInfo: React.FC<IDisplaySystemHealthInfoProps> = (props: IDisplaySystemHealthInfoProps) => {
  // const componentName='DisplaySystemHealthInfo';

  const [systemHealthInfoPart, setSystemHealthInfoPart] = React.useState<EAPSystemHealthInfoPart>(EAPSystemHealthInfoPart.ALL);

  React.useEffect(() => {
    if(props.systemHealthInfoPart) setSystemHealthInfoPart(props.systemHealthInfoPart);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderHealthInfo = (name: string, summary: TAPHealthCheckSummary | undefined, undefinedInfo?: string, notPerformedInfo?: string) => {
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
        {summary.performed && success === EAPHealthCheckSuccess.UNDEFINED && undefinedInfo &&
          <div style={{color: SystemHealthCommon.getColor(EAPHealthCheckSuccess.UNDEFINED) }}>
            {undefinedInfo}
          </div>
        }
        {!summary.performed && notPerformedInfo &&
          <div style={{color: SystemHealthCommon.getColor(EAPHealthCheckSuccess.UNDEFINED) }}>
            {notPerformedInfo}
          </div>
        }
      </React.Fragment>
    );
  }

  const renderPortalAppHealthInfo = (): JSX.Element => {
    if(systemHealthInfoPart === EAPSystemHealthInfoPart.PORTAL_APP || systemHealthInfoPart === EAPSystemHealthInfoPart.ALL) {
      return renderHealthInfo('Portal App', props.healthCheckContext.portalAppHealthCheckResult?.summary);
    } else return (<></>);
  }

  const renderServerHealthInfo = (): JSX.Element => {
    if(systemHealthInfoPart === EAPSystemHealthInfoPart.SERVER || systemHealthInfoPart === EAPSystemHealthInfoPart.ALL) {
      return renderHealthInfo('Server', props.healthCheckContext.serverHealthCheckResult?.summary);
    } else return (<></>);
  }

  const renderConnectorHealthInfo = (): JSX.Element => {
    if(systemHealthInfoPart === EAPSystemHealthInfoPart.CONNECTOR || systemHealthInfoPart === EAPSystemHealthInfoPart.ALL) {
      return renderHealthInfo(`Connector: ${props.connectorDisplayName}`, props.healthCheckContext.connectorHealthCheckResult?.summary, 'Connector: no active connector', 'Connector: n/a');
    } else return (<></>);
  }

  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderPortalAppHealthInfo()}
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
