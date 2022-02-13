
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { TAPConnectorAttributeList } from "../../utils/APAttributes/APAttributesService";

import "../APComponents.css";

export interface IAPDisplayConnectorAttributesProps {
  attributeList?: TAPConnectorAttributeList;
  emptyMessage: string;
  className?: string;
}

export const APDisplayConnectorAttributes: React.FC<IAPDisplayConnectorAttributesProps> = (props: IAPDisplayConnectorAttributesProps) => {
  // const componentName='APDisplayAttributes';

  const dataTableRef = React.useRef<any>(null);

  const renderComponent = (attributeList: TAPConnectorAttributeList): JSX.Element => {
    return (
      <React.Fragment>
        <DataTable
          className="p-datatable-sm"
          ref={dataTableRef}
          value={attributeList}
          dataKey="name"
          sortMode="single" 
          sortField="name" 
          sortOrder={1}
          scrollable 
          // scrollHeight="200px" 
        >
          <Column 
            field="name" 
            header="Attribute Name" 
            bodyStyle={{ verticalAlign: 'top' }}
            style={{width: '20%'}}
            sortable    
          />
          <Column 
            field="value" 
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
    {props.attributeList && props.attributeList.length > 0 &&
      renderComponent(props.attributeList)
    }
    {(!props.attributeList || props.attributeList.length === 0) && 
      <span>{props.emptyMessage}</span>
    }
  </div>

  );
}
