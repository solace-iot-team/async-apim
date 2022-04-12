
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  E_APChannelOperation, 
  E_APTopicSyntax,
  TAPChannelTopicDisplay,
  TAPChannelTopicDisplayList 
} from "../../displayServices/APAppsDisplayService/APAppEnvironmentsDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalApp_ChannelTopics_GroupedProps {
  apChannelTopicDisplayList: TAPChannelTopicDisplayList;
  apChannelOperation: E_APChannelOperation;
  apTopicSyntax: E_APTopicSyntax;
  className?: string;
}

export const APDisplayDeveloperPortalApp_ChannelTopics_Grouped: React.FC<IAPDisplayDeveloperPortalApp_ChannelTopics_GroupedProps> = (props: IAPDisplayDeveloperPortalApp_ChannelTopics_GroupedProps) => {
  // const ComponentName = 'APDisplayDeveloperPortalApp_ChannelTopics_Grouped';

  const emptySubscribeListMessage = 'No subscribe permissions defined.';
  const emptyPublishListMessage = 'No publish permissions defined.';
  const dataTableHeaderSubscribe = "Subscribe Permissions / Topics";
  const dataTableHeaderPublish = "Publish Permissions / Topics";
  
  const dataTableRef = React.useRef<any>(null);

  const rowGroupHeaderTemplate = (row: TAPChannelTopicDisplay) => {
    return(
      <span className="p-text-bold">Channel: {row.channel}</span>
    );
  }

  const rowGroupFooterTemplate = (row: TAPChannelTopicDisplay) => { return(<></>); }


  const renderTopicList = (): JSX.Element => {

    const dataKey = APDisplayUtils.nameOf<TAPChannelTopicDisplay>('channelId');
    const nameField = APDisplayUtils.nameOf<TAPChannelTopicDisplay>('channel');
    const topicField = APDisplayUtils.nameOf<TAPChannelTopicDisplay>('topic');
    const dataTableHeader = (props.apChannelOperation === E_APChannelOperation.SUBSCRIBE ? dataTableHeaderSubscribe : dataTableHeaderPublish);
    const empytyMessage = (props.apChannelOperation === E_APChannelOperation.SUBSCRIBE ? emptySubscribeListMessage : emptyPublishListMessage);
    return (
      <React.Fragment>
        <DataTable
          className="p-datatable-sm"
          ref={dataTableRef}
          value={props.apChannelTopicDisplayList}
          header={dataTableHeader}
          dataKey={dataKey}
          sortMode="single" 
          sortField={nameField}
          sortOrder={1}
          scrollable
          emptyMessage={empytyMessage}
          // scrollHeight="300px" 
          // resizableColumns 
          // columnResizeMode="fit"
          groupField={nameField}
          rowGroupMode="subheader"
          // groupRowsBy={sortField} <- the new version?
          rowGroupHeaderTemplate={rowGroupHeaderTemplate}
          rowGroupFooterTemplate={rowGroupFooterTemplate}
        >
          <Column 
            header={`Topic (${props.apTopicSyntax})`} 
            field={topicField}
            // sortable
            bodyStyle={{ textAlign: 'end' }}
            headerStyle={{ textAlign: 'end' }}
          />
        </DataTable>
        {/* <pre style={ { fontSize: '8px' }} >
          {JSON.stringify(dataTableList, null, 2)};
        </pre> */}
      </React.Fragment>
    );
  }

  const renderComponent = (): JSX.Element => {
    return renderTopicList();
  }


  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
