
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APAppEnvironmentsDisplayService, { 
  E_APChannelOperation,
  E_APTopicSyntax,
  IAPAppEnvironmentDisplay,
  TAPAppEnvironmentDisplayList,
  TAPChannelPermissionsDisplay,
} from "../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import APEntityIdsService from "../../utils/APEntityIdsService";
import { SelectButton } from "primereact/selectbutton";
import { Globals } from "../../utils/Globals";
// import { APDisplayDeveloperPortalApp_ChannelTopics_Grouped } from "./APDisplayDeveloperPortalApp_ChannelTopics_Grouped";
import { APDisplayDeveloperPortalAppChannelTopicsExpand } from "./APDisplayDeveloperPortalApp_ChannelTopics_Expand";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_EnvironmentChannelPermissionsProps {
  apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  className?: string;
  emptyMessage: string;
}

export const APDisplayDeveloperPortalAppEnvironmentChannelPermissions: React.FC<IAPDisplayDeveloperPortalApp_EnvironmentChannelPermissionsProps> = (props: IAPDisplayDeveloperPortalApp_EnvironmentChannelPermissionsProps) => {
  const ComponentName='APDisplayDeveloperPortalAppEnvironmentChannelPermissions';

  const topicSyntaxOptions: Array<string> = Object.values(E_APTopicSyntax);
  const [selectedTopicSyntax, setSelectedTopicSyntax] = React.useState<E_APTopicSyntax>(E_APTopicSyntax.SMF);

  const environmentsDataTableRef = React.useRef<any>(null);
  const [expandedEnvironmentRows, setExpandedEnvironmentRows] = React.useState<any>(null);

  const renderEnvironments = (): JSX.Element => {

    const environmentBodyTemplate = (row: IAPAppEnvironmentDisplay): JSX.Element => {
      return (<div>{`${row.apEntityId.displayName}`}</div>);
    }
  
    const rowExpansionTemplate = (row: IAPAppEnvironmentDisplay) => {
      const funcName = 'rowExpansionTemplate';
      const logName = `${ComponentName}.${funcName}()`;
      // if(!appEnvironmentRow.permissions) throw new Error(`${logName}: appEnvironmentRow.permissions is undefined`);
      let apChannelPermissionsDisplay: TAPChannelPermissionsDisplay = row.apChannelPermissions_smf;
      switch(selectedTopicSyntax) {
        case E_APTopicSyntax.SMF:
        break;
        case E_APTopicSyntax.MQTT:
          if(row.apChannelPermissions_mqtt) apChannelPermissionsDisplay = row.apChannelPermissions_mqtt;
        break;
        default:
          Globals.assertNever(logName, selectedTopicSyntax);
      }
  
      return (
        <React.Fragment>
          <APDisplayDeveloperPortalAppChannelTopicsExpand
            apChannelPermissionDisplayList={apChannelPermissionsDisplay.apPublishPermissionList}
            apChannelOperation={E_APChannelOperation.PUBLISH}
            apTopicSyntax={selectedTopicSyntax}
          />
          <APDisplayDeveloperPortalAppChannelTopicsExpand
            apChannelPermissionDisplayList={apChannelPermissionsDisplay.apSubscribePermissionList}
            apChannelOperation={E_APChannelOperation.SUBSCRIBE}
            apTopicSyntax={selectedTopicSyntax}
          />
          {/* <APDisplayDeveloperPortalApp_ChannelTopics_Grouped
            apChannelTopicDisplayList={APAppEnvironmentsDisplayService.get_ApChannelTopicDisplayList({ apChannelPermissionDisplayList: apChannelPermissionsDisplay.apPublishPermissionList })}
            apChannelOperation={E_APChannelOperation.PUBLISH}
            apTopicSyntax={selectedTopicSyntax}
          />
          <APDisplayDeveloperPortalApp_ChannelTopics_Grouped
            apChannelTopicDisplayList={APAppEnvironmentsDisplayService.get_ApChannelTopicDisplayList({ apChannelPermissionDisplayList: apChannelPermissionsDisplay.apSubscribePermissionList })}
            apChannelOperation={E_APChannelOperation.SUBSCRIBE}
            apTopicSyntax={selectedTopicSyntax}
          /> */}
        </React.Fragment>
      );
    }

    const environmentDataKey = `${APAppEnvironmentsDisplayService.nameOf('apEntityId')}.${APEntityIdsService.nameOf('id')}`;
    const environmentNameField = `${APAppEnvironmentsDisplayService.nameOf('apEntityId')}.${APEntityIdsService.nameOf('displayName')}`;

    return (
      <div className="card">
        <DataTable
          className="p-datatable-sm"
          ref={environmentsDataTableRef}
          dataKey={environmentDataKey}
          value={props.apAppEnvironmentDisplayList}
          sortMode="single" 
          sortField={environmentNameField} 
          sortOrder={1}
          scrollable 
          expandedRows={expandedEnvironmentRows}
          onRowToggle={(e) => setExpandedEnvironmentRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column expander style={{ width: '3em' }} />  
          <Column header="Environment" body={environmentBodyTemplate} field={environmentNameField} sortable />
        </DataTable>
      </div>    
    );
  }

  const renderComponentContent = (): JSX.Element => {

    return (
      <div className="card">
        <SelectButton 
          value={selectedTopicSyntax} 
          options={topicSyntaxOptions} 
          onChange={(e) => { if(e.value !== null) setSelectedTopicSyntax(e.value); }} 
          style={{ textAlign: 'end' }}
        />        
        {renderEnvironments()}
      </div>    
    );
  }
  
  const renderHeader = (): JSX.Element => {
    return(
      <div>
        {/* <p>TODO: note if they are pending approval?</p> */}
      </div>
    );
  }
  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderHeader()}
        {renderComponentContent()}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {props.apAppEnvironmentDisplayList.length > 0 &&
        renderComponent()
      }
      {(props.apAppEnvironmentDisplayList.length === 0) && 
        <span>{props.emptyMessage}</span>
      }
    </div>
  );
}


