
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { TAPEntityId } from "../../utils/APEntityIdsService";
import { TAPApiChannelParameter, TAPApiChannelParameterList } from "../../displayServices/APApisDisplayService";

import "../APComponents.css";

export interface IAPDisplayApApiChannelParameterListProps {
  apApiChannelParameterList: TAPApiChannelParameterList;
  emptyChannelParameterListMessage: string;
  className?: string;
}

export const APDisplayApApiChannelParameterList: React.FC<IAPDisplayApApiChannelParameterListProps> = (props: IAPDisplayApApiChannelParameterListProps) => {
  const ComponentName='APDisplayApApiChannelParameterList';


  type TManagedObject = TAPApiChannelParameter;
  type TManagedObjectList = Array<TManagedObject>;

  const nameOf_ManagedObject = (name: keyof TManagedObject) => {
    return name;
  }
  const nameOf_ManagedObject_ApEntityId = (name: keyof TAPEntityId) => {
    return `${nameOf_ManagedObject('apEntityId')}.${name}`;
  }
  // const nameOf_ApiChannelParameter_ApEntityId = (name: keyof TAPEntityId) => {
  //   return `${nameOf_ManagedObject('apApiChannelParameter')}.${nameOf_ManagedObject('apEntityId')}.${name}`;
  // }
  // const nameOf_ApiChannelParameter = (name: keyof TAPApiChannelParameter) => {
  //   return `${nameOf_ManagedObject('apApiChannelParameter')}.${name}`;
  // }
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();
  const dataTableRef = React.useRef<any>(null);

  const doInitialize = () => {
    setManagedObjectList(props.apApiChannelParameterList);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

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

    
    const dataKey = nameOf_ManagedObject_ApEntityId('id');
    const sortField = nameOf_ManagedObject_ApEntityId('displayName');
    const parameterNameField = dataKey;

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
            header="Parameter"
            field={parameterNameField} 
            style={{width: '20em'}} 
            // bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} 
          />
          <Column 
            header="Value(s)"
            body={apiParameterValueBodyTemplate}
            // field={parameterValueField} 
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

      {managedObjectList && managedObjectList.length === 0 && 
        <span>{props.emptyChannelParameterListMessage}</span>
      }

  </div>

  );
}
