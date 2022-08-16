
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import APApisDisplayService, { 
  TAPApiChannelParameter, 
  TAPApiChannelParameterList, 
  TAPApiDisplayList 
} from "../../../../displayServices/APApisDisplayService";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface ISelectApiChannelParameterProps {
  apApiDisplayList: TAPApiDisplayList;
  onSelect: (apApiChannelParameter: TAPApiChannelParameter) => void;
}

export const SelectApiChannelParameter: React.FC<ISelectApiChannelParameterProps> = (props: ISelectApiChannelParameterProps) => {
  // const ComponentName = 'SelectApiChannelParameter';

  type TManagedObject = TAPApiChannelParameter;
  type TManagedObjectList = Array<TManagedObject>;

  const MessageNoManagedObjectsFound = "No API Parameters available."
  const MessageNoManagedObjectsFoundWithFilter = 'No API Parameters available for filter';
  const GlobalSearchPlaceholder = 'search...';
  const APIParametersTableTitle = "API Channel Parameter(s)";
  const APIChannelParameterName = "API Channel Parameter";


  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [isInitialialized, setIsInitialized] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();  // * Data Table *
  const dt = React.useRef<any>(null);

  const doInitialize = async () => {
    const combined_ApApiChannelParameterList: TAPApiChannelParameterList = APApisDisplayService.create_Combined_ApiChannelParameterList({
      apApiDisplayList: props.apApiDisplayList,
    });
    setManagedObjectList(combined_ApApiChannelParameterList);    
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
        <div>{APIParametersTableTitle}</div>
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

  const apiParameterValueBodyTemplate = (row: TAPApiChannelParameter): JSX.Element => {
    return (
      <div>
        {row.valueList.length > 0 ? row.valueList.join(',') : 'No values defined.'}
      </div>
    );
  }

  const renderManagedObjectDataTable = (): JSX.Element => {
    // const dataKey = APApisDisplayService.nameOf_ApEntityId('id');
    // const sortField = APApisDisplayService.nameOf_ApEntityId('displayName');
    // const valueField = APApisDisplayService.nameOf_ApiChannelParameter('valueList');

    const dataKey = APDisplayUtils.nameOf<TAPApiChannelParameter>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<TAPApiChannelParameter>('apEntityId.displayName');
    // const valueField = APDisplayUtils.nameOf<TAPApiChannelParameter>('valueList');

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
            <Column header={APIChannelParameterName} field={sortField} style={{width: '20em'}} sortable />
            <Column 
              header="API Value(s)" 
              // field={valueField}
              body={apiParameterValueBodyTemplate}
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
    <div className="manage-api-products">

      {/* <APComponentHeader header={DialogHeader} />   */}

      {/* <ApiCallStatusError apiCallStatus={apiCallStatus} /> */}

      { isInitialialized && renderManagedObjectDataTable() }

      {/* DEBUG */}
      {/* {managedObjectTableDataList.length > 0 && selectedManagedObjectTableDataList && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(selectedManagedObjectTableDataList, null, 2)}
        </pre>
      } */}

    </div>
  );
}

