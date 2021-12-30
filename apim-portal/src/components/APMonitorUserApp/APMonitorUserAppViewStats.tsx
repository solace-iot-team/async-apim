
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  AppConnection,
  AppEnvironmentStatus,
  QueueStatus,
  WebHookStatus,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  TAPManagedAppWebhooks, TAPWebhookStatus, 
} from "../APComponentsCommon";
import { APComponentHeader } from "../APComponentHeader/APComponentHeader";
import { APRenderUtils } from "../../utils/APRenderUtils";
import { APDisplayAppWebhookStatus, EAPDisplayAppWebhookStatus_Content } from "../APDisplayAppStatus/APDisplayAppWebhookStatus";

import '../APComponents.css';
// import "../DeveloperPortalManageUserApps.css";

export interface IAPMonitorUserAppViewStatsProps {
  managedAppWebhooks: TAPManagedAppWebhooks;
}

export const APMonitorUserAppViewStats: React.FC<IAPMonitorUserAppViewStatsProps> = (props: IAPMonitorUserAppViewStatsProps) => {
  const componentName = 'APMonitorUserAppViewStats';

  type TManagedObjectDisplay = TAPManagedAppWebhooks;

  const [managedObjectDisplay] = React.useState<TManagedObjectDisplay>(props.managedAppWebhooks);

  const renderSectionTitle = (text: string): JSX.Element => {
    return (<DataTable header={text} />);
  }
  const renderWebhookStatus = (appWebhookStatus: WebHookStatus): JSX.Element => {
    const apWebhookStatus: TAPWebhookStatus = {
      summaryStatus: appWebhookStatus.up ? appWebhookStatus.up : false,
      apiWebhookStatus: appWebhookStatus
    }
    return (
      <div className="p-ml-2">
        <APDisplayAppWebhookStatus
          apWebhookStatus={apWebhookStatus}
          displayContent={EAPDisplayAppWebhookStatus_Content.ALL}
        />
      </div>
    );
  }
  const renderWebhooks = (appWebhookStatusList: Array<WebHookStatus> | undefined): JSX.Element | Array<JSX.Element> => {
    if(!appWebhookStatusList) return renderSectionTitle('Webhooks: No Webhooks.');
    const renderedWebhookStats: Array<JSX.Element> = [
      renderSectionTitle('Webhooks')
    ];
    for(const appWebhookStatus of appWebhookStatusList) {
      renderedWebhookStats.push(renderWebhookStatus(appWebhookStatus))
    }
    return renderedWebhookStats;
  }

  const renderConnections = (appConnectionStatusList: Array<AppConnection> | undefined): JSX.Element => {

    const uptimeBodyTemplate = (appConnection: AppConnection) => {
      if(appConnection.uptime === undefined) return ('not available');
      // return new Date(appConnection.uptime * 1000).toISOString().substring(11, 8);
      return new Date(appConnection.uptime * 1000).toISOString().substring(11, 11+8);
    }
    const protocolBodyTemplate = (appConnection: AppConnection) => {
      if(appConnection.protocol === undefined) return ('not available');
      return APRenderUtils.getProtocolListAsString([appConnection.protocol]);
    }
  
    if(!appConnectionStatusList) return renderSectionTitle('Connections: No Connections.');
    return (
      <React.Fragment>
        {renderSectionTitle('Connections')}
        <div className="p-p-2">
          <DataTable
            className="p-datatable-sm"          
            dataKey="clientAddress"
            value={appConnectionStatusList}
            sortMode="single" 
            sortField="clientAddress" 
            sortOrder={1}
            scrollable 
          >
            <Column header="Client Address" field="clientAddress" />
            <Column header="Protocol" headerStyle={{width: '10em', textAlign: 'center'}} body={protocolBodyTemplate} bodyStyle={{ textAlign: 'center' }} />
            <Column header="State" headerStyle={{width: '10em', textAlign: 'center'}} field="state" bodyStyle={{ textAlign: 'center' }} />
            <Column header="Uptime (HH:MM:SS)" headerStyle={{width: '10em', textAlign: 'center'}} body={uptimeBodyTemplate} bodyStyle={{ textAlign: 'center' }} />
            <Column header="Roundtrip Time (ns)" headerStyle={{width: '10em', textAlign: 'center'}} field="roundtripTime" bodyStyle={{ textAlign: 'center' }} />
          </DataTable>
        </div>
      </React.Fragment>
    );
  }

  const renderQueues = (appQueueStatusList: Array<QueueStatus> | undefined): JSX.Element => {
    if(!appQueueStatusList) return renderSectionTitle('Queues: No Queues.');
    return (
      <React.Fragment>
        {/* {renderSectionTitle('Queues')} */}
        <div className="p-mt-2">
          <DataTable
            className="p-datatable-sm"          
            dataKey="name"
            value={appQueueStatusList}
            sortMode="single" 
            sortField="name" 
            sortOrder={1}
            scrollable 
          >
            <Column header="Queue" field="name" />
            <Column header="Msgs" headerStyle={{width: '10em', textAlign: 'center'}} field="messagesQueued" bodyStyle={{ textAlign: 'center' }} />
            <Column header="MBs" headerStyle={{width: '10em', textAlign: 'center'}} field="messagesQueuedMB" bodyStyle={{ textAlign: 'center' }} />
            <Column header="Consumers" headerStyle={{width: '10em', textAlign: 'center'}} field="consumerCount" bodyStyle={{ textAlign: 'center' }} />
          </DataTable>
          {/* DEBUG */}
          {/* <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(appQueueStatusList, null, 2)}
          </pre> */}
        </div>
      </React.Fragment>
    );
  }

  const renderEnvStats = (appEnvStatus: AppEnvironmentStatus): JSX.Element => {

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
            Environment: {appEnvStatus.name} (TODO: get the display name)
          </span>
        </div>
      );
    }
    
    return (
      <Panel 
        headerTemplate={panelHeaderTemplate} 
        toggleable
        collapsed={false}
        className="p-pt-2"
      >
        <div className="p-ml-2">
          {renderWebhooks(appEnvStatus.webHooks)}
          {renderConnections(appEnvStatus.connections)}
          {renderQueues(appEnvStatus.queues)}
          {/* DEBUG */}
          {/* <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(appEnvStatus, null, 2)}
          </pre> */}
        </div>
    </Panel>
    );
  }

  const renderAppStats = (managedAppWebhooks: TAPManagedAppWebhooks): JSX.Element | Array<JSX.Element> => {
    const funcName = 'renderAppStats';
    const logName = `${componentName}.${funcName}()`;

    if(!managedAppWebhooks.apiAppConnectionStatus) return (<></>);

    if(!managedAppWebhooks.apiAppConnectionStatus.environments) return (
      <p>No Environments found.</p>
    );
    const renderedEnvStats: Array<JSX.Element> = [];
    for(const appEnvStatus of managedAppWebhooks.apiAppConnectionStatus.environments) {
      renderedEnvStats.push(renderEnvStats(appEnvStatus))
    }
    return renderedEnvStats;
  }

  const renderManagedObjectDisplay = () => {
    const funcName = 'renderManagedObjectDisplay';
    const logName = `${componentName}.${funcName}()`;
    
    if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);
    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="apd-app-view">
            <div className="apd-app-view-detail-left">

              {renderAppStats(managedObjectDisplay)}  

            </div>
            <div className="apd-app-view-detail-right">
              {/* <div>App Status: {managedObjectDisplay.apiAppResponse.status}</div> */}
            </div>            
          </div>
        </div>  
      </React.Fragment>
    ); 
  }


  return (
    <React.Fragment>
      <div className="apd-manage-user-apps">

        <APComponentHeader header={`Stats for App: ${props.managedAppWebhooks.appDisplayName}`} />

        {managedObjectDisplay && renderManagedObjectDisplay() }
      
      </div>

      {/* DEBUG */}
      {managedObjectDisplay &&
        <div>
          <hr/> 
          <h1>{componentName}.managedObjectDisplay.apiAppConnectionStatus:</h1>
          <pre style={ { fontSize: '10px' }} >
              {JSON.stringify(managedObjectDisplay.apiAppConnectionStatus, null, 2)}
          </pre>
        </div>
      }
    </React.Fragment>
  );
}
