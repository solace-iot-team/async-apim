
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  ChannelPermission,
  CommonTopic,
  Permissions
} from "@solace-iot-team/apim-connector-openapi-browser";
import { EApiTopicSyntax } from "../APApiObjectsCommon";
import { Globals } from "../../utils/Globals";

import "../APComponents.css";

export interface IAPDisplayAppPermissionsProps {
  permissions: Permissions;
  topicSyntax: EApiTopicSyntax;
  emptyMessage: string;
  className?: string;
}

export const APDisplayAppPermissions: React.FC<IAPDisplayAppPermissionsProps> = (props: IAPDisplayAppPermissionsProps) => {
  const componentName='APDisplayAppPermissions';

  type TAPChannelPermissions = {
    channel: string;
    topicList: Array<CommonTopic>
  }
  type TAPChannelPermissionsList = Array<TAPChannelPermissions>;

  enum EPermissionType {
    SUBSCRIBE = "SUBSCRIBE",
    PUBLISH = "PUBLISH"
  }

  const emptySubscribePermissionListMessage = 'No subscribe permissions defined.';
  const emptyPublishPermissionListMessage = 'No publish permissions defined.';
  const dataTableHeaderSubscribePermissions = "Subscribe Permissions";
  const dataTableHeaderPublishPermissions = "Publish Permissions";
  const subscribePermissionsDataTableRef = React.useRef<any>(null);
  const [subscribePermissionsExpandedRows, setSubscribePermissionsExpandedRows] = React.useState<Array<any>>([]);
  const publishPermissionsDataTableRef = React.useRef<any>(null);

  const transformApiPermissionListToAPChannelPermissionList = (apiPermissionList: Array<Record<string, ChannelPermission>>): TAPChannelPermissionsList => {
    return apiPermissionList.map( (elem: Record<string, ChannelPermission>) => {
      const apiChannel: string = Object.keys(elem)[0];
      const apiChannelPermission: ChannelPermission = Object.values(elem)[0];      
      return {
        channel: apiChannel,
        topicList: apiChannelPermission.permissions
      }
    });
  }

  const permissionsRowExpansionTemplate = (rowData: TAPChannelPermissions) => {
    type _TAPTableTopic = {
      id: number;
      topic: CommonTopic
    }
    type _TAPTableTopicList = Array<_TAPTableTopic>;
    const transformRowDataToDataList = (rowData: TAPChannelPermissions): _TAPTableTopicList => {
      return rowData.topicList.map( (topic: CommonTopic, index: number) => {
        return {
          id: index,
          topic: topic
        }
      });
    }
    const dataTableList: _TAPTableTopicList = transformRowDataToDataList(rowData);
    return (
      <div>
        <DataTable 
          className="p-datatable-sm"
          // ref={subscribePermissionsExpandedDataTableRef}
          value={dataTableList}
          sortMode="single" 
          sortField="topic" 
          sortOrder={1}
          scrollable  
        >
          <Column 
            header={`Topic (${props.topicSyntax})`} 
            field="topic"
            sortable
            bodyStyle={{ textAlign: 'end' }}
            headerStyle={{ textAlign: 'end' }}
          />
        </DataTable>
      </div>
    );
  }

  const getEmptyPermissionMessage = (permissionType: EPermissionType): string => {
    const funcName = 'getEmptyPermissionMessage';
    const logName = `${componentName}.${funcName}()`;
    switch (permissionType) {
      case EPermissionType.SUBSCRIBE:
        return emptySubscribePermissionListMessage;
      case EPermissionType.PUBLISH:
        return emptyPublishPermissionListMessage;
      default:
        return Globals.assertNever(logName, permissionType);  
    }
  }
  const renderPermissions = (permissionType: EPermissionType, permissionList?: Array<Record<string, ChannelPermission>>) => {
    // const funcName = 'renderPermissions';
    // const logName = `${componentName}.${funcName}()`;

    if(!permissionList) return (
      <span>{getEmptyPermissionMessage(permissionType)}</span>
    );
    
    const dataTableList: TAPChannelPermissionsList = transformApiPermissionListToAPChannelPermissionList(permissionList);  
    const dataTableRef = permissionType === EPermissionType.SUBSCRIBE ? subscribePermissionsDataTableRef : publishPermissionsDataTableRef;
    const dataTableHeader = (permissionType === EPermissionType.SUBSCRIBE ? dataTableHeaderSubscribePermissions : dataTableHeaderPublishPermissions);
    return (
      <React.Fragment>
      <DataTable
        className="p-datatable-sm"
        ref={dataTableRef}
        value={dataTableList}
        header={dataTableHeader}
        dataKey="channel"
        sortMode="single" 
        sortField="channel" 
        sortOrder={1}
        scrollable 
        // scrollHeight="300px" 
        expandedRows={subscribePermissionsExpandedRows}
        onRowToggle={(e) => setSubscribePermissionsExpandedRows(e.data)}
        rowExpansionTemplate={permissionsRowExpansionTemplate}
      >
        <Column expander style={{ width: '3em' }} />  
        <Column field="channel" header="Channel" sortable />
      </DataTable>
      <pre style={ { fontSize: '8px' }} >
        {JSON.stringify(dataTableList, null, 2)};
      </pre>
      </React.Fragment>
    );
  }

  const renderComponent = (permissions: Permissions): JSX.Element => {
    // const funcName = 'renderComponent';
    // const logName = `${componentName}.${funcName}()`;

    return (
      <React.Fragment>
        {renderPermissions(EPermissionType.SUBSCRIBE, permissions.subscribe)}
        {renderPermissions(EPermissionType.PUBLISH, permissions.publish)}
      </React.Fragment>
    )
  }


  return (
    <div className={props.className ? props.className : 'card'}>
      {!props.permissions.publish && props.permissions.subscribe &&
        <span>{props.emptyMessage}</span>
      }
      { (props.permissions.publish || props.permissions.subscribe) &&
        renderComponent(props.permissions)
      }
    </div>
  );
}
