
import React from "react";

import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  AppConnection,
  QueueStatus,
  WebHookStatus,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APRenderUtils } from "../../utils/APRenderUtils";
import { IAPAppStatusDisplay, TAPAppEnvironmentStatusDisplay } from "../../displayServices/APAppsDisplayService/APAppStatusDisplayService";
import { EAPApp_Status } from "../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { APDisplayAppWebhookStatus, EAPDisplayAppWebhookStatus_Content } from "./APDisplayAppWebhookStatus";

import '../APComponents.css';

export interface IAPMonitorAppViewStatsProps {
  apAppStatusDisplay: IAPAppStatusDisplay;
}

export const APMonitorAppViewStats: React.FC<IAPMonitorAppViewStatsProps> = (props: IAPMonitorAppViewStatsProps) => {
  const componentName = 'APMonitorAppViewStats';

  const renderSectionTitle = (text: string): JSX.Element => {
    return (<DataTable header={text} />);
  }
  const renderWebhookStatus = (appWebhookStatus: WebHookStatus): JSX.Element => {
    return (
      <div className="p-ml-2">
        <APDisplayAppWebhookStatus
          appWebhookStatus={appWebhookStatus}
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

    const roundTripTimeBodyTemplate = (appConnection: AppConnection) => {
      if(appConnection.roundtripTime === undefined) return ('not available');
      return ( Math.round((appConnection.roundtripTime/1000000 + Number.EPSILON) * 1000) / 1000 );
    }
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
            <Column header="Roundtrip Time (ms)" headerStyle={{width: '10em', textAlign: 'center'}} body={roundTripTimeBodyTemplate} bodyStyle={{ textAlign: 'center' }} />
          </DataTable>
        </div>
      </React.Fragment>
    );
  }

  const renderQueues = (appQueueStatusList: Array<QueueStatus> | undefined): JSX.Element => {

    const messagesQueuedMBBodyTemplate = (queueStatus: QueueStatus) => {
      return APRenderUtils.getFormattedMessagesQueuedMBs(queueStatus.messagesQueuedMB);
    }

    if(appQueueStatusList === undefined || appQueueStatusList.length === 0) return renderSectionTitle('Queues: No Queues.');

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
            <Column header="MBs" headerStyle={{width: '10em', textAlign: 'center'}} body={messagesQueuedMBBodyTemplate} field="messagesQueuedMB" bodyStyle={{ textAlign: 'center' }} />
            <Column header="Consumers" headerStyle={{width: '10em', textAlign: 'center'}} field="consumerCount" bodyStyle={{ textAlign: 'center' }} />
          </DataTable>
        </div>
      </React.Fragment>
    );
  }

  
  const renderEnvStats = (apAppEnvironmentStatusDisplay: TAPAppEnvironmentStatusDisplay): JSX.Element => {
    const funcName = 'renderEnvStats';
    const logName = `${componentName}.${funcName}()`;

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
            Environment: {apAppEnvironmentStatusDisplay.apEntityId.displayName}
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
          {renderWebhooks(apAppEnvironmentStatusDisplay.connectorAppEnvironmentStatus.webHooks)}
          {renderConnections(apAppEnvironmentStatusDisplay.connectorAppEnvironmentStatus.connections)}
          {renderQueues(apAppEnvironmentStatusDisplay.connectorAppEnvironmentStatus.queues)}
        </div>
      </Panel>
    );
  }

  // const renderEnvStats = (appEnvStatus: AppEnvironmentStatus): JSX.Element => {
  //   const funcName = 'renderEnvStats';
  //   const logName = `${componentName}.${funcName}()`;

  //   const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
  //     const onTogglerClick = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
  //       const funcName = 'onTogglerClick';
  //       const logName = `${componentName}.${funcName}()`;
  //       if(appEnvStatus.name === undefined) throw new Error(`${logName}: appEnvStatus.name === undefined`);
  //       const isCollapsed = options.collapsed ? false : true;
  //       const clone = new Map(externalState);
  //       clone.set(appEnvStatus.name, { isCollapsed: isCollapsed });
  //       setExternalState(clone);
  //       options.onTogglerClick(event);
  //     }
  //     const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
  //     const className = `${options.className} p-jc-start`;
  //     const titleClassName = `${options.titleClassName} p-pl-1`;
  //     return (
  //       <div className={className} style={{ justifyContent: 'left'}} >
  //         {/* <button className={options.togglerClassName} onClick={options.onTogglerClick}> */}
  //         <button className={options.togglerClassName} onClick={onTogglerClick}>
  //           <span className={toggleIcon}></span>
  //         </button>
  //         <span className={titleClassName}>
  //           Environment: {appEnvStatus.displayName}
  //         </span>
  //       </div>
  //     );
  //   }
    
  //   if(appEnvStatus.name === undefined) throw new Error(`${logName}: appEnvStatus.name === undefined`);

  //   return (
  //     <Panel 
  //       headerTemplate={panelHeaderTemplate} 
  //       toggleable
  //       collapsed={externalState.get(appEnvStatus.name)?.isCollapsed}
  //       className="p-pt-2"
  //     >
  //       <div className="p-ml-2">
  //         {renderWebhooks(appEnvStatus.webHooks)}
  //         {renderConnections(appEnvStatus.connections)}
  //         {renderQueues(appEnvStatus.queues)}
  //         {/* DEBUG */}
  //         {/* <pre style={ { fontSize: '10px' }} >
  //           {JSON.stringify(appEnvStatus, null, 2)}
  //         </pre> */}
  //       </div>
  //     </Panel>
  //   );
  // }

  const renderAppStats = (): JSX.Element | Array<JSX.Element> => {
    const renderedEnvStats: Array<JSX.Element> = [];
    for(const apAppEnvironmentStatusDisplay of props.apAppStatusDisplay.apAppEnvironmentStatusDisplayList) {
      renderedEnvStats.push(renderEnvStats(apAppEnvironmentStatusDisplay));
    }
    return renderedEnvStats;
  }

  const renderComponent = () => {
    if(props.apAppStatusDisplay.apAppStatus !== EAPApp_Status.LIVE &&  props.apAppStatusDisplay.apAppStatus !== EAPApp_Status.PARTIALLY_LIVE) {
      return (
        <div>
          App is not live.  
        </div>
      );
    }
    if(props.apAppStatusDisplay.apAppEnvironmentStatusDisplayList.length === 0) {
      return (
        <div>
          No provisioned environments.
        </div>
      );
    }
    return (
      <div>
        
        {renderAppStats()}  

      </div>  
    ); 
  }


  return (
    <React.Fragment>

      { renderComponent() }

    </React.Fragment>
  );
}
