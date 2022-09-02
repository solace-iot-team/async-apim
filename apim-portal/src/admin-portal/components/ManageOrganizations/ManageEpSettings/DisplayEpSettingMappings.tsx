
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { IApEpSettings_Mapping, TApEpSettings_MappingList } from "../../../../displayServices/APEpSettingsDisplayService";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IDisplayEpSettingMappingsProps {
  apEpSettings_MappingList: TApEpSettings_MappingList;
}

export const DisplayEpSettingMappings: React.FC<IDisplayEpSettingMappingsProps> = (props: IDisplayEpSettingMappingsProps) => {
  // const componentName='APDisplayApAttributeDisplayList';

  const EmptyMessage = "No Mappings defined."
  const dataTableRef = React.useRef<any>(null);

  const applicationDomainNameBodyTemplate = (row: IApEpSettings_Mapping): JSX.Element => {
    if(row.isValid) return (<span>{row.apEntityId.displayName}</span>);
    return <span style={{ color: 'red' }}>{row.apEntityId.displayName}</span>
  }

  const renderComponent = (): JSX.Element => {
    const dataKey = APDisplayUtils.nameOf<IApEpSettings_Mapping>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<IApEpSettings_Mapping>('apEntityId.displayName');
    const applicationDomainNameField = APDisplayUtils.nameOf<IApEpSettings_Mapping>('apEntityId.displayName');
    const businessGroupNameField = APDisplayUtils.nameOf<IApEpSettings_Mapping>('businessGroupEntityId.displayName');

    return (
      <React.Fragment>
        <DataTable
          className="p-datatable-sm"
          ref={dataTableRef}
          value={props.apEpSettings_MappingList}
          dataKey={dataKey}
          sortMode="single" 
          sortField={sortField} 
          sortOrder={1}
          scrollable 
          // scrollHeight="200px" 
          resizableColumns 
          columnResizeMode="fit"
        >
          <Column 
            field={applicationDomainNameField}
            header="Application Domain"
            bodyStyle={{ verticalAlign: 'top' }}
            body={applicationDomainNameBodyTemplate}
            style={{width: '20%'}}
            sortable    
          />
          <Column 
            field={businessGroupNameField} 
            header="Business Group"
            bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
            sortable
          />
        </DataTable>
        {/* DEBUG */}
        {/* <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(attributeList, null, 2)}
        </pre> */}
      </React.Fragment>
    );
  }

  return (
    <div>
      {props.apEpSettings_MappingList.length > 0 &&
        renderComponent()
      }
      {(props.apEpSettings_MappingList.length === 0) && 
        <span>{EmptyMessage}</span>
      }
  </div>

  );
}