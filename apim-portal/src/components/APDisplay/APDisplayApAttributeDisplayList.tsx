
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { TAPAttributeDisplayList } from "../../utils/APAttributes/APAttributesService";

import "../APComponents.css";

export interface IAPDisplayApAttributeDisplayListProps {
  apAttributeDisplayList: TAPAttributeDisplayList;
  emptyMessage: string;
  className?: string;
}

export const APDisplayApAttributeDisplayList: React.FC<IAPDisplayApAttributeDisplayListProps> = (props: IAPDisplayApAttributeDisplayListProps) => {
  // const componentName='APDisplayApAttributeDisplayList';

  const dataTableRef = React.useRef<any>(null);

  const renderComponent = (apAttributeDisplayList: TAPAttributeDisplayList): JSX.Element => {
    return (
      <React.Fragment>
        <DataTable
          className="p-datatable-sm"
          ref={dataTableRef}
          value={apAttributeDisplayList}
          dataKey="apEntityId.id"
          sortMode="single" 
          sortField="apEntityId.displayName" 
          sortOrder={1}
          scrollable 
          // scrollHeight="200px" 
        >
          <Column 
            field="apEntityId.displayName" 
            header="Attribute Name" 
            bodyStyle={{ verticalAlign: 'top' }}
            style={{width: '20%'}}
            sortable    
          />
          <Column 
            field="connectorAttribute.value" 
            header="Attribute Values"
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
