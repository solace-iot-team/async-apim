
import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { 
  TAPApiChannelParameter, 
  TAPApiDisplayList 
} from "../../displayServices/APApisDisplayService";
import { IAPEntityIdDisplay, TAPEntityId } from "../../utils/APEntityIdsService";

import "../APComponents.css";

export interface IAPDisplayApApiListChannelParameterListProps {
  apApiDisplayList: TAPApiDisplayList;
  emptyApiDisplayListMessage: string;
  emptyChannelParameterListMessage: string;
  className?: string;
}

export const APDisplayApApiListChannelParameterList: React.FC<IAPDisplayApApiListChannelParameterListProps> = (props: IAPDisplayApApiListChannelParameterListProps) => {
  const ComponentName='APDisplayApAttributeDisplayList';


  type TManagedObject = IAPEntityIdDisplay & {
    apApiChannelParameter: TAPApiChannelParameter;
    // numChannelPa
  }
  type TManagedObjectList = Array<TManagedObject>;

  const nameOf_ManagedObject = (name: keyof TManagedObject) => {
    return name;
  }
  const nameOf_ManagedObject_ApEntityId = (name: keyof TAPEntityId) => {
    return `${nameOf_ManagedObject('apEntityId')}.${name}`;
  }
  const nameOf_ApiChannelParameter_ApEntityId = (name: keyof TAPEntityId) => {
    return `${nameOf_ManagedObject('apApiChannelParameter')}.${nameOf_ManagedObject('apEntityId')}.${name}`;
  }
  // const nameOf_ApiChannelParameter = (name: keyof TAPApiChannelParameter) => {
  //   return `${nameOf_ManagedObject('apApiChannelParameter')}.${name}`;
  // }
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();
  const dataTableRef = React.useRef<any>(null);

  const doInitialize = () => {
    const moList: TManagedObjectList = [];
    for(const apApiDisplay of props.apApiDisplayList) {
      for(const apApiChannelParameter of apApiDisplay.apApiChannelParameterList) {
        const mo: TManagedObject = {
          apEntityId: apApiDisplay.apEntityId,
          apApiChannelParameter: apApiChannelParameter
        };  
        moList.push(mo);
      }
    }
    setManagedObjectList(moList);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const rowGroupHeaderTemplate = (row: TManagedObject) => {
    return(
      <span className="p-text-bold">API: {row.apEntityId.displayName}</span>
    );
  }

  const rowGroupFooterTemplate = (row: TManagedObject) => {
    return(<></>);
  }
  const apiParameterValueBodyTemplate = (row: TManagedObject): JSX.Element => {
    return (
      <div>
        {row.apApiChannelParameter.valueList.length > 0 ? row.apApiChannelParameter.valueList.join(',') : 'No values defined.'}
      </div>
    );
  }

  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);

    const dataKey = nameOf_ManagedObject_ApEntityId('id');
    const sortField = nameOf_ManagedObject_ApEntityId('displayName');
    const parameterNameField = nameOf_ApiChannelParameter_ApEntityId('id');

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
          groupField={sortField}
          rowGroupMode="subheader"
          // groupRowsBy={sortField} <- the new version?
          rowGroupHeaderTemplate={rowGroupHeaderTemplate}
          rowGroupFooterTemplate={rowGroupFooterTemplate}
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
            // field={parameterValueField} 
            // bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} 
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
    {managedObjectList && managedObjectList.length > 0 &&
      renderComponent()
    }
    {(props.apApiDisplayList.length === 0) && 
      <span>{props.emptyApiDisplayListMessage}</span>
    }
  </div>

  );
}
