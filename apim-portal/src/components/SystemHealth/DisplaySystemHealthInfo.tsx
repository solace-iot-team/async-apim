
import React from "react";

import { APHealthCheckContext } from "../APHealthCheckContextProvider";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
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
}

export const DisplaySystemHealthInfo: React.FC<IDisplaySystemHealthInfoProps> = (props: IDisplaySystemHealthInfoProps) => {
  // const componentName='DisplaySystemHealthInfo';

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);
  const [systemHealthInfoPart, setSystemHealthInfoPart] = React.useState<EAPSystemHealthInfoPart>(EAPSystemHealthInfoPart.ALL);

  React.useEffect(() => {
    if(props.systemHealthInfoPart) setSystemHealthInfoPart(props.systemHealthInfoPart);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const renderPortalAppHealthInfo = (): JSX.Element => {
    if(systemHealthInfoPart === EAPSystemHealthInfoPart.PORTAL_APP || systemHealthInfoPart === EAPSystemHealthInfoPart.ALL) {
      return renderHealthInfo('Portal App', healthCheckContext.portalAppHealthCheckResult?.summary);
    } else return (<></>);
  }

  const renderServerHealthInfo = (): JSX.Element => {
    if(systemHealthInfoPart === EAPSystemHealthInfoPart.SERVER || systemHealthInfoPart === EAPSystemHealthInfoPart.ALL) {
      return renderHealthInfo('Server', healthCheckContext.serverHealthCheckResult?.summary);
    } else return (<></>);
  }

  const renderConnectorHealthInfo = (): JSX.Element => {
    if(systemHealthInfoPart === EAPSystemHealthInfoPart.CONNECTOR || systemHealthInfoPart === EAPSystemHealthInfoPart.ALL) {
      const connectorName = configContext.connector ? configContext.connector.displayName : 'unknown';
      return renderHealthInfo(`Connector: ${connectorName}`, healthCheckContext.connectorHealthCheckResult?.summary, 'Connector: no active connector');
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
