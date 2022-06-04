
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APEntityIdsService from "../../utils/APEntityIdsService";
import { TAPApiChannelParameter, TAPApiChannelParameterList } from "../../displayServices/APApisDisplayService";

import "../APComponents.css";

export interface IAPDisplayApiChannelParameterListProps {
  apApiChannelParameterList: TAPApiChannelParameterList;
  emptyChannelParameterListMessage: string;
  className?: string;
}

export const APDisplayApiChannelParameterList: React.FC<IAPDisplayApiChannelParameterListProps> = (props: IAPDisplayApiChannelParameterListProps) => {
  const ComponentName='APDisplayApiChannelParameterList';

  type TManagedObject = TAPApiChannelParameter;
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList] = React.useState<TManagedObjectList>(props.apApiChannelParameterList);
  const dataTableRef = React.useRef<any>(null);

  const apiParameterValueBodyTemplate = (mo: TManagedObject): JSX.Element => {
    return (
      <div>
        {mo.valueList.length > 0 ? mo.valueList.join(',') : 'No values defined.'}
      </div>
    );
  }

  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);
    const dataKey = APEntityIdsService.nameOf_ApEntityIdDisplay('id');
    const sortField = APEntityIdsService.nameOf_ApEntityIdDisplay('displayName');
    const parameterNameField = sortField;

    return (
      <React.Fragment>
        <DataTable
          className="p-datatable-sm"
          ref={dataTableRef}
          value={managedObjectList}
          dataKey={dataKey}
          sortMode="single" 
          sortField={sortField} 
          sortOrder={1}
          scrollable 
          scrollHeight="200px" 
          resizableColumns 
          columnResizeMode="fit"
        >
          <Column 
            header="Channel Parameter"
            field={parameterNameField} 
            style={{width: '20em'}} 
            // bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} 
          />
          <Column 
            header="Values"
            body={apiParameterValueBodyTemplate}
            // bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} 
          />
        </DataTable>
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
    
    {managedObjectList && managedObjectList.length > 0 &&
      renderComponent()
    }
    
    {(managedObjectList && managedObjectList.length === 0) && 
      <span>{props.emptyChannelParameterListMessage}</span>
    }

  </div>

  );
}
