
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APAttributesDisplayService from "../../displayServices/APAttributesDisplayService/APAttributesDisplayService";
import { TAPControlledChannelParameterList } from "../../displayServices/APApiProductsDisplayService";

import "../APComponents.css";

export interface IAPDisplayApControlledChannelParametersProps {
  apControlledChannelParameterList: TAPControlledChannelParameterList;
  emptyMessage: string;
  className?: string;
}

export const APDisplayApControlledChannelParameters: React.FC<IAPDisplayApControlledChannelParametersProps> = (props: IAPDisplayApControlledChannelParametersProps) => {
  // const componentName='APDisplayApControlledChannelParameters';

  const dataTableRef = React.useRef<any>(null);

  const renderComponent = (apControlledChannelParameterList: TAPControlledChannelParameterList): JSX.Element => {
    const dataKey = APAttributesDisplayService.nameOf_ApEntityId('id');
    const sortField = APAttributesDisplayService.nameOf_ApEntityId('displayName');
    const valueField = APAttributesDisplayService.nameOf('value');

    return (
      <React.Fragment>
        <DataTable
          className="p-datatable-sm"
          ref={dataTableRef}
          value={apControlledChannelParameterList}
          dataKey={dataKey}
          sortMode="single" 
          sortField={sortField} 
          sortOrder={1}
          scrollable 
          // scrollHeight="200px" 
        >
          <Column 
            field={sortField}
            header="Controlled Channel Parameter" 
            bodyStyle={{ verticalAlign: 'top' }}
            style={{width: '25%'}}
            sortable    
          />
          <Column 
            field={valueField} 
            header="Available Values"
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
    {props.apControlledChannelParameterList.length > 0 &&
      renderComponent(props.apControlledChannelParameterList)
    }
    {(props.apControlledChannelParameterList.length === 0) && 
      <span>{props.emptyMessage}</span>
    }
  </div>

  );
}
