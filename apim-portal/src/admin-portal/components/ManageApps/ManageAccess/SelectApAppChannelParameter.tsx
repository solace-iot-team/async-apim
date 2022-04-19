
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { TAPAppChannelParameter } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { TAPControlledChannelParameterList } from "../../../../displayServices/APApiProductsDisplayService";
import APAttributesDisplayService from "../../../../displayServices/APAttributesDisplayService/APAttributesDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface ISelectApAppChannelParameterProps {
  combined_ApControlledChannelParamterList: TAPControlledChannelParameterList;
  onSelect: (apAppChannelParameter : TAPAppChannelParameter) => void;
}

export const SelectApAppChannelParameter: React.FC<ISelectApAppChannelParameterProps> = (props: ISelectApAppChannelParameterProps) => {
  // const ComponentName = 'SelectApAppChannelParameter';

  type TManagedObject = TAPAppChannelParameter;
  type TManagedObjectList = Array<TManagedObject>;

  const MessageNoManagedObjectsFound = "No Controlled Channel Parameters available."
  const MessageNoManagedObjectsFoundWithFilter = 'No Controlled Channel Parameters available for filter';
  const GlobalSearchPlaceholder = 'search...';
  const TableTitle = "Controlled Channel Parameter(s)";
  const TableRowParameterName = "Controlled Channel Parameter";
  const TableRowParameterValue = "Value(s)";


  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [isInitialialized, setIsInitialized] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();  // * Data Table *
  const dt = React.useRef<any>(null);

  const doInitialize = async () => {
    setManagedObjectList(props.combined_ApControlledChannelParamterList);    
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    setIsInitialized(true);
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(selectedManagedObject === undefined) return;
    props.onSelect(selectedManagedObject);
  }, [selectedManagedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  // * UI Controls *
 
  const renderDataTableHeader = (): JSX.Element => {
    const onInputFilter = (event: React.FormEvent<HTMLInputElement>) => {
      setGlobalFilter(event.currentTarget.value);
    }
    return (
      <div className="table-header">
        <div>{TableTitle}</div>
        <div>
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputFilter} style={{width: '500px'}}/>
          </span>
        </div>  
      </div>
    );
  }  

  const onSelectionChange = (event: any): void => {
    setSelectedManagedObject(event.value);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFound;
  }

  const valueBodyTemplate = (row: TAPAppChannelParameter): JSX.Element => {
    return (
      <div>
        {row.value.length > 0 ? row.value : 'No value(s) defined.'}
      </div>
    );
  }

  const renderManagedObjectDataTable = (): JSX.Element => {
    const dataKey = APAttributesDisplayService.nameOf_ApEntityId('id');
    const sortField = dataKey;
    const valueField = APAttributesDisplayService.nameOf('value');
    return (
      <div className="card">
          <DataTable
            ref={dt}
            style={{borderWidth: 'thin'}}
            className="p-datatable-sm"
            header={renderDataTableHeader()}

            autoLayout={true}

            resizableColumns 
            columnResizeMode="fit"
            showGridlines={false}

            value={managedObjectList}
            dataKey={dataKey}

            globalFilter={globalFilter}
            scrollable 
            scrollHeight="200px" 
            emptyMessage={renderManagedObjectTableEmptyMessage()}
            // selection
            selectionMode="single"
            selection={selectedManagedObject}
            onSelectionChange={onSelectionChange}
            // sorting
            sortMode='single'
            sortField={sortField}
            sortOrder={1}
          >
            <Column header={TableRowParameterName} field={sortField} style={{width: '20em'}} sortable />
            <Column 
              header={TableRowParameterValue} 
              field={valueField}
              body={valueBodyTemplate}
              // bodyStyle={{
              //   overflowWrap: 'break-word',
              //   wordWrap: 'break-word'
              // }} 
            />
        </DataTable>
      </div>
    );
  }

  return (
    <div className="ap-manage-apps">

      { isInitialialized && renderManagedObjectDataTable() }

    </div>
  );
}

