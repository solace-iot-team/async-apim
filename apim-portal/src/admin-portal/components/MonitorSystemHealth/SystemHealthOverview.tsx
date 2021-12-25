
import React from "react";

import { TabView, TabPanel } from 'primereact/tabview';

import { APHealthCheckContext } from '../../../components/APHealthCheckContextProvider';
import { TAPHealthCheckSummary } from "../../../utils/APHealthCheck";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { Config } from '../../../Config';

import '../../../components/APComponents.css';
import "./MonitorSystemHealth.css";

export interface ISystemHealthOverviewProps {
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SystemHealthOverview: React.FC<ISystemHealthOverviewProps> = (props: ISystemHealthOverviewProps) => {
  // const componentName = 'SystemHealthOverview';

  const [healthCheckContext] = React.useContext(APHealthCheckContext);

  const [apiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */


  const renderSummary = (healthCheckSummary?: TAPHealthCheckSummary) => {
    if(healthCheckSummary && healthCheckSummary.performed) {
      const timestampStr = (new Date(healthCheckSummary.timestamp)).toUTCString();
      const successStr = String(healthCheckSummary.success);
      return (
        <React.Fragment>
          <div><b>Status</b>: {successStr}</div>
          <div><b>Last performed</b>: {timestampStr}</div>
        </React.Fragment>     
      );
    }
    return (
      <React.Fragment>
        <div><b>Status</b>: Not performed.</div>
      </React.Fragment>     
    );
  }

  const renderDetailTabs = () => {
    if(!healthCheckContext.systemHealthCheckSummary || !healthCheckContext.systemHealthCheckSummary.performed) return (<></>);
    return (
      <React.Fragment>
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          {/* <TabPanel header='APIM Portal'>
            <p>implement me</p>
          </TabPanel> */}
          <TabPanel header='APIM Server'>
            {renderSummary(healthCheckContext.serverHealthCheckResult?.summary)}
            <pre style={ { fontSize: '12px' }} >
              {JSON.stringify(healthCheckContext.serverHealthCheckResult?.healthCheckLog, null, 2)}
            </pre>
          </TabPanel>
          <TabPanel header='APIM Connector'>
            {renderSummary(healthCheckContext.connectorHealthCheckResult?.summary)}
            <pre style={ { fontSize: '12px' }} >
              {JSON.stringify(healthCheckContext.connectorHealthCheckResult?.healthCheckLog, null, 2)}
            </pre>
          </TabPanel>
          {Config.getUseDevelTools() &&
            <TabPanel header='All'>
              <pre style={ { fontSize: '12px' }} >
                {JSON.stringify(healthCheckContext, null, 2)}
              </pre>
            </TabPanel>
          }
        </TabView>
      </React.Fragment>     
    );

  }

  const renderSystemHealthOverview = () => {
    // const funcName = 'renderSystemHealthOverview';
    // const logName = `${componentName}.${funcName}()`;
    
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="ap-system-health-view">
            <div className="ap-system-health-view-detail-left">
              {renderSummary(healthCheckContext.systemHealthCheckSummary)}
              {renderDetailTabs()}
            </div>
            <div className="ap-system-health-view-detail-right">
              <div></div>
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="ap-monitor-system-health">

        <APComponentHeader header={'System Health Overview'} />

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {renderSystemHealthOverview() }
      
      </div>
    </React.Fragment>
  );
}
