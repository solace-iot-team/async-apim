import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APApisDisplayService, { IAPApiDisplay, TAPApiDisplayList } from "../../displayServices/APApisDisplayService";
import { APDisplayApiChannelParameterList } from "./APDisplayApiChannelParameterList";

import "../APComponents.css";

export interface IAPDisplayApiProductApisProps {
  apApiDisplayList: TAPApiDisplayList;
  onDisplayApiSpec: (apApiDisplay: IAPApiDisplay) => void;
  className?: string;
}

export const APDisplayApiProductApis: React.FC<IAPDisplayApiProductApisProps> = (props: IAPDisplayApiProductApisProps) => {
  const ComponentName='APDisplayApiProductApis';

  type TManagedObject = IAPApiDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList] = React.useState<TManagedObjectList>(props.apApiDisplayList);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [expandedManagedObjectDataTableRows, setExpandedManagedObjectDataTableRows] = React.useState<any>(null);

  const dt = React.useRef<any>(null);

  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }
  const onManagedObjectOpen = (event: any): void => {
    const mo: TManagedObject = event.data as TManagedObject;
    props.onDisplayApiSpec(mo);
  }
  const nameBodyTemplate = (mo: TManagedObject): string => {
    return mo.apEntityId.displayName;
  }
  const versionBodyTemplate = (mo: TManagedObject): JSX.Element => {
    return (<div>{mo.apVersionInfo.apLastVersion}</div>);
  }
  const stateTemplate = (mo: TManagedObject): string => {
    return mo.apLifecycleStageInfo.stage;
  }
  const notesTemplate = (mo: TManagedObject): JSX.Element => {
    if(mo.apLifecycleStageInfo.notes) {
      return (
        <div>
          { mo.apLifecycleStageInfo.notes }
        </div>
      );
    }
    return (<>-</>);
  }

  const rowExpansionTemplateApiChannelParameters = (mo: TManagedObject) => {
    return(
      <APDisplayApiChannelParameterList
        key={`${ComponentName}_APDisplayApiChannelParameterList`}
        apApiChannelParameterList={mo.apApiChannelParameterList}
        emptyChannelParameterListMessage="No Channel Parameters defined"
      />
    );
  }

  const renderComponent = (): JSX.Element => {
    const dataKey = APApisDisplayService.nameOf_ApEntityId('id');
    const sortField = APApisDisplayService.nameOf_ApEntityId('displayName');
    return (
      <div className="card p-mt-4">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            autoLayout={true}

            dataKey={dataKey}

            resizableColumns 
            columnResizeMode="fit"
            showGridlines={false}
  
            header='API(s):'
            value={managedObjectList}
            // globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            scrollable 
            // scrollHeight="800px" 
            // sorting
            sortMode='single'
            sortField={sortField}
            sortOrder={1}
            expandedRows={expandedManagedObjectDataTableRows}
            onRowToggle={(e) => setExpandedManagedObjectDataTableRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplateApiChannelParameters}
          >
            <Column expander style={{ width: '3em' }} />  
            <Column header="Name" body={nameBodyTemplate} sortField={sortField} sortable />
            <Column header="Version" body={versionBodyTemplate} style={{width: '10em', textAlign: 'center'}} />
            {/* <Column header="Version" body={versionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'center'}} /> */}
            <Column header="State" body={stateTemplate} style={{width: '10em', textAlign: 'left'}}  />
            <Column header="Notes" body={notesTemplate} />
            {/* <Column header="State" headerStyle={{width: '7em'}} body={stateTemplate} bodyStyle={{ verticalAlign: 'top' }} /> */}
        </DataTable>
      </div>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
