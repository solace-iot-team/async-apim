
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APAttributesDisplayService, { TAPAttributeDisplayList } from "../../displayServices/APAttributesDisplayService/APAttributesDisplayService";

import "../APComponents.css";

export interface IAPDisplayApAttributeDisplayListProps {
  apAttributeDisplayList: TAPAttributeDisplayList;
  emptyMessage: string;
  className?: string;
  tableRowHeader_AttributeName: string;
  tableRowHeader_AttributeValue: string;
}

export const APDisplayApAttributeDisplayList: React.FC<IAPDisplayApAttributeDisplayListProps> = (props: IAPDisplayApAttributeDisplayListProps) => {
  // const componentName='APDisplayApAttributeDisplayList';

  const dataTableRef = React.useRef<any>(null);

  const renderComponent = (apAttributeDisplayList: TAPAttributeDisplayList): JSX.Element => {
    const dataKey = APAttributesDisplayService.nameOf_ApEntityId('id');
    const sortField = APAttributesDisplayService.nameOf_ApEntityId('displayName');
    const valueField = APAttributesDisplayService.nameOf('value');

    return (
      <React.Fragment>
        <DataTable
          className="p-datatable-sm"
          ref={dataTableRef}
          value={apAttributeDisplayList}
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
            field={sortField}
            header={props.tableRowHeader_AttributeName} 
            bodyStyle={{ verticalAlign: 'top' }}
            style={{width: '20%'}}
            sortable    
          />
          <Column 
            field={valueField} 
            header={props.tableRowHeader_AttributeValue}
            bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} 
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
    <div className={props.className ? props.className : 'card'}>
    {props.apAttributeDisplayList.length > 0 &&
      renderComponent(props.apAttributeDisplayList)
    }
    {(props.apAttributeDisplayList.length === 0) && 
      <span>{props.emptyMessage}</span>
    }
  </div>

  );
}
