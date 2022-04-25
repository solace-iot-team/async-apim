
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  E_APChannelOperation, 
  E_APTopicSyntax,
  TAPChannelPermissionDisplay,
  TAPChannelPermissionDisplayList,
} from "../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";
import APEntityIdsService, { TAPEntityIdList } from "../../utils/APEntityIdsService";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_ChannelTopics_ExpandProps {
  apChannelPermissionDisplayList: TAPChannelPermissionDisplayList;
  apChannelOperation: E_APChannelOperation;
  apTopicSyntax: E_APTopicSyntax;
  className?: string;
}

export const APDisplayDeveloperPortalAppChannelTopicsExpand: React.FC<IAPDisplayDeveloperPortalApp_ChannelTopics_ExpandProps> = (props: IAPDisplayDeveloperPortalApp_ChannelTopics_ExpandProps) => {
  // const ComponentName = 'APDisplayDeveloperPortalAppChannelTopicsExpand';

  const emptySubscribeListMessage = 'No subscribe permissions defined.';
  const emptyPublishListMessage = 'No publish permissions defined.';
  const dataTableHeaderSubscribe = "Subscribe Permissions / Topics";
  const dataTableHeaderPublish = "Publish Permissions / Topics";
  
  const channelDataTableRef = React.useRef<any>(null);
  const [channelExpandedRows, setChannelExpandedRows] = React.useState<Array<any>>([]);
 
  const channelRowExpansionTemplate = (row: TAPChannelPermissionDisplay) => {
    const transformRowDataToDataList = (row: TAPChannelPermissionDisplay): TAPEntityIdList => {
      return row.permittedTopicList.map( (topic: string, index: number) => {
        return {
          id: index.toString(),
          displayName: topic
        };
      });
    }
    const dataTableList: TAPEntityIdList = transformRowDataToDataList(row);
    const dataKey = APEntityIdsService.nameOf('id');
    const topicField = APEntityIdsService.nameOf('displayName');
    return (
      <div>
        <DataTable 
          className="p-datatable-sm"
          dataKey={dataKey}
          value={dataTableList}
          sortMode="single" 
          sortField={topicField} 
          sortOrder={1}
          scrollable  
        >
          <Column 
            header={`Topic (${props.apTopicSyntax})`} 
            field={topicField}
            sortable
            bodyStyle={{ textAlign: 'end' }}
            headerStyle={{ textAlign: 'end' }}
          />
        </DataTable>
      </div>
    );
  }

  const renderChannelList = (): JSX.Element => {

    const dataKey = APDisplayUtils.nameOf<TAPChannelPermissionDisplay>('channelId');
    const nameField = APDisplayUtils.nameOf<TAPChannelPermissionDisplay>('channel');
    const dataTableHeader = (props.apChannelOperation === E_APChannelOperation.SUBSCRIBE ? dataTableHeaderSubscribe : dataTableHeaderPublish);
    const empytyMessage = (props.apChannelOperation === E_APChannelOperation.SUBSCRIBE ? emptySubscribeListMessage : emptyPublishListMessage);
    return (
      <React.Fragment>
        <DataTable
          className="p-datatable-sm"
          ref={channelDataTableRef}
          value={props.apChannelPermissionDisplayList}
          header={dataTableHeader}
          dataKey={dataKey}
          sortMode="single" 
          sortField={nameField}
          sortOrder={1}
          scrollable
          emptyMessage={empytyMessage}
          // scrollHeight="300px" 
          expandedRows={channelExpandedRows}
          onRowToggle={(e) => setChannelExpandedRows(e.data)}
          rowExpansionTemplate={channelRowExpansionTemplate}
          resizableColumns 
          columnResizeMode="fit"
        >
          <Column expander style={{ width: '3em' }} />  
          <Column header="Channel"  field={nameField} sortable />
        </DataTable>
        {/* <pre style={ { fontSize: '8px' }} >
          {JSON.stringify(dataTableList, null, 2)};
        </pre> */}
      </React.Fragment>
    );
  }

  const renderComponent = (): JSX.Element => {
    return renderChannelList();
  }


  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
