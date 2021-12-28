
import React from "react";

import { TabView, TabPanel } from 'primereact/tabview';

import { APHealthCheckContext } from '../../../components/APHealthCheckContextProvider';
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { DisplaySystemHealthInfo, EAPSystemHealthInfoPart } from "../../../components/SystemHealth/DisplaySystemHealthInfo";
import { DisplayServerHealthCheckLog } from "../../../components/SystemHealth/DisplayServerHealthCheckLog";
import { DisplayConnectorHealthCheckLog } from "../../../components/SystemHealth/DisplayConnectorHealthCheckLog";
import { DisplayPortalAppHealthCheckLog } from "../../../components/SystemHealth/DisplayPortalAppHealthCheckLog";

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

  const renderDetailTabs = () => {
    if(!healthCheckContext.systemHealthCheckSummary || !healthCheckContext.systemHealthCheckSummary.performed) return (<></>);
    return (
      <React.Fragment>
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Portal App'>
            <DisplaySystemHealthInfo
                systemHealthInfoPart={EAPSystemHealthInfoPart.PORTAL_APP}
              />
              <DisplayPortalAppHealthCheckLog />
          </TabPanel>
          <TabPanel header='APIM Server'>
            <DisplaySystemHealthInfo
              systemHealthInfoPart={EAPSystemHealthInfoPart.SERVER}
            />
            <DisplayServerHealthCheckLog />
          </TabPanel>
          <TabPanel header='APIM Connector'>
            <DisplaySystemHealthInfo
              systemHealthInfoPart={EAPSystemHealthInfoPart.CONNECTOR}
            />
            <DisplayConnectorHealthCheckLog />
          </TabPanel>
          {/* <TabPanel header='Devel'>
            <pre style={ { fontSize: '12px' }} >
              {JSON.stringify(healthCheckContext, null, 2)}
            </pre>
          </TabPanel> */}
        </TabView>
      </React.Fragment>     
    );

  }

  const renderSystemHealthOverview = () => {
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="ap-system-health-view">
            <div className="ap-system-health-view-detail-left">
              <DisplaySystemHealthInfo
                systemHealthInfoPart={EAPSystemHealthInfoPart.ALL}
              />
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
