
import React from "react";

import { Panel } from "primereact/panel";

import { APHealthCheckContext } from "../APHealthCheckContextProvider";
import { 
  TAPPortalAppHealthCheckLogEntry,
  TAPPortalAppHealthCheckLogEntryList,
} from "../../utils/APHealthCheck";
import { SystemHealthCommon } from "./SystemHealthCommon";

import "../APComponents.css";

export interface IDisplayPortalAppHealthCheckLogProps {
  className?: string;
}

export const DisplayPortalAppHealthCheckLog: React.FC<IDisplayPortalAppHealthCheckLogProps> = (props: IDisplayPortalAppHealthCheckLogProps) => {
  // const componentName='DisplayPortalAppHealthCheckLog';

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [healthCheckContext, dispatchHealthCheckContextAction] = React.useContext(APHealthCheckContext);

  const renderLogEntry = (logEntry: TAPPortalAppHealthCheckLogEntry): JSX.Element => {
    const getHeader = (): JSX.Element => {
      return (
        <div style={{color: SystemHealthCommon.getColor(logEntry.success) }}>
          {logEntry.callState.context.userDetail}: {logEntry.success}
        </div>
      );
    }
    return (
      <Panel 
        id={logEntry.entryType}
        header={getHeader()}
        collapsed={false}
        className="p-pt-2"
      >
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(logEntry, null, 2)}
        </pre>
      </Panel>
    );
  }

  const renderPortalAppHealthCheckLog = (): Array<JSX.Element> => {
    if(!healthCheckContext.portalAppHealthCheckResult) return ([<></>]);
    const log: TAPPortalAppHealthCheckLogEntryList = healthCheckContext.portalAppHealthCheckResult.healthCheckLog;
    const displayList: Array<JSX.Element> = [];
    for(const logEntry of log) {
      displayList.push(renderLogEntry(logEntry));
    }
    return displayList;
  }

  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderPortalAppHealthCheckLog()}
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
