
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SelectButton } from 'primereact/selectbutton';
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';

import { 
  AppEnvironment, AppResponse, AppStatus
} from "@solace-iot-team/apim-connector-openapi-browser";
import { Globals } from "../../utils/Globals";
import { APDisplayEndpoints } from "./APDisplayEndpoints";
import { APDisplayAppPermissions } from "./APDisplayAppPermissions";
import { EApiTopicSyntax } from "../APApiObjectsCommon";

import "../APComponents.css";

export interface IAPDisplayAppEnvironmentsProps {
  appResponse_smf: AppResponse;
  appResponse_mqtt: AppResponse;
  className?: string;
}

export const APDisplayAppEnvironments: React.FC<IAPDisplayAppEnvironmentsProps> = (props: IAPDisplayAppEnvironmentsProps) => {
  const componentName='APDisplayAppEnvironments';

  const topicSyntaxOptions: Array<string> = Object.values(EApiTopicSyntax);
  const [selectedTopicSyntax, setSelectedTopicSyntax] = React.useState<EApiTopicSyntax>(EApiTopicSyntax.SMF);

  const appEnvironmentsEndpointsDataTableRef = React.useRef<any>(null);
  const [expandedAppEnvironmentsEndpointsDataTableRows, setExpandedAppEnvironmentsEndpointsDataTableRows] = React.useState<any>(null);
  const appEnvironmentsPermissionsDataTableRef = React.useRef<any>(null);
  const [expandedAppEnvironmentsPermissionsDataTableRows, setExpandedAppEnvironmentsPermissionsDataTableRows] = React.useState<any>(null);

  const renderAppEnvironmentsEndpoints = (appEnvironmentList: Array<AppEnvironment>): JSX.Element => {

    const rowExpansionTemplateAppEnvironmentEndpoint = (appEnvironmentRow: AppEnvironment) => {
      const funcName = 'rowExpansionTemplateAppEnvironmentEndpoint';
      const logName = `${componentName}.${funcName}()`;
      if(!appEnvironmentRow.messagingProtocols) throw new Error(`${logName}: appEnvironmentRow.messagingProtocols is undefined`);
      return (
        <APDisplayEndpoints 
          endpointList={appEnvironmentRow.messagingProtocols}
          emptyMessage='No Endpoints defined'
        />
      );
    }
  
    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={appEnvironmentsEndpointsDataTableRef}
          dataKey="name"
          value={appEnvironmentList}
          sortMode="single" 
          sortField="name" 
          sortOrder={1}
          scrollable 
          expandedRows={expandedAppEnvironmentsEndpointsDataTableRows}
          onRowToggle={(e) => setExpandedAppEnvironmentsEndpointsDataTableRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplateAppEnvironmentEndpoint}
        >
          <Column expander style={{ width: '3em' }} />  
          <Column field="name" header="Environment" bodyStyle={{ verticalAlign: 'top' }} />
      </DataTable>
      </div>
    );
  }

  const renderAppEnvironmentsPermissions = (appStatus: AppStatus, appEnvironmentList_smf: Array<AppEnvironment>, appEnvironmentList_mqtt: Array<AppEnvironment>): JSX.Element => {
    const funcName = 'renderAppEnvironmentsPermissions';
    const logName = `${componentName}.${funcName}()`;

    const getPermissionsNote = (appStatus: AppStatus): JSX.Element => {
      const funcName = 'getPermissionsNote';
      const logName = `${componentName}.${funcName}()`;
        switch(appStatus) {
        case AppStatus.PENDING:
          return (<p>Note: Permissions pending approval.</p>);
        case AppStatus.APPROVED:
          return (<></>);
        default:
          Globals.assertNever(logName, appStatus);
      }
      return (<></>);
    }
    const rowExpansionTemplateAppEnvironmentPermission = (appEnvironmentRow: AppEnvironment) => {
      const funcName = 'rowExpansionTemplateAppEnvironmentPermission';
      const logName = `${componentName}.${funcName}()`;
      if(!appEnvironmentRow.permissions) throw new Error(`${logName}: appEnvironmentRow.permissions is undefined`);
      return (
        <APDisplayAppPermissions 
          permissions={appEnvironmentRow.permissions}
          topicSyntax={selectedTopicSyntax}
          emptyMessage='No Permissions defined'
        />
      );
    }

    let appEnvironmentList: Array<AppEnvironment> = appEnvironmentList_smf;
    switch(selectedTopicSyntax) {
      case EApiTopicSyntax.SMF: {
        appEnvironmentList = appEnvironmentList_smf;
      }
      break;
      case EApiTopicSyntax.MQTT: {
        appEnvironmentList = appEnvironmentList_mqtt;
      }
      break;
      default:
        Globals.assertNever(logName, selectedTopicSyntax);
    }
  
    return (
      <div className="card">
        {getPermissionsNote(appStatus)}
        <SelectButton 
          value={selectedTopicSyntax} 
          options={topicSyntaxOptions} 
          onChange={(e) => { if(e.value !== null) setSelectedTopicSyntax(e.value); }} 
          style={{ textAlign: 'end' }}
        />
        <DataTable
          className="p-datatable-sm"
          ref={appEnvironmentsPermissionsDataTableRef}
          dataKey="name"
          value={appEnvironmentList}
          sortMode="single" 
          sortField="displayName"
          sortOrder={1}
          scrollable 
          expandedRows={expandedAppEnvironmentsPermissionsDataTableRows}
          onRowToggle={(e) => setExpandedAppEnvironmentsPermissionsDataTableRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplateAppEnvironmentPermission}
        >
          <Column expander style={{ width: '3em' }} />  
          {/* <Column field="name" header="Environment" bodyStyle={{ verticalAlign: 'top' }} /> */}
          <Column field="displayName" header="Environment" bodyStyle={{ verticalAlign: 'top' }} sortable />
      </DataTable>
      </div>
    );
  }

  const renderComponent = (appResponse_smf: AppResponse, appResponse_mqtt: AppResponse): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${componentName}.${funcName}()`;

    // const renderComponent = (appEnvironmentList_smf: Array<AppEnvironment>, appEnvironmentList_mqtt: Array<AppEnvironment>): JSX.Element => {
    const panelHeaderTemplateEndpoints = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            APP Endpoints
          </span>
        </div>
      );
    }
    const panelHeaderTemplatePermissions = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            APP Permissions
          </span>
        </div>
      );
    }

    if(!appResponse_smf.environments) throw new Error(`${logName}: appResponse_smf.environments is undefined`);
    if(!appResponse_smf.status) throw new Error(`${logName}: appResponse_smf.status is undefined`);
    if(!appResponse_mqtt.environments) throw new Error(`${logName}: appResponse_mqtt.environments is undefined`);

    return (
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplateEndpoints} 
          toggleable
          collapsed={true}
          className="p-pt-2"
        >
          <div className="p-ml-2">{renderAppEnvironmentsEndpoints(appResponse_smf.environments)}</div>
        </Panel>
        <Panel 
          headerTemplate={panelHeaderTemplatePermissions} 
          toggleable
          collapsed={true}
          className="p-pt-2"
        >
          <div className="p-ml-2">{renderAppEnvironmentsPermissions(appResponse_smf.status, appResponse_smf.environments, appResponse_mqtt.environments)}</div>
        </Panel>
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      { renderComponent(props.appResponse_smf, props.appResponse_mqtt) }
    </div>
  );
}
