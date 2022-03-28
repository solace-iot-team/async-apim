
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { E_CALL_STATE_ACTIONS } from "./deleteme.ManageApiProductsCommon";
import APEntityIdsService, { TAPEntityIdList } from "../../../utils/APEntityIdsService";
import APApisService, { TAPApiDisplay, TAPApiDisplayList } from "../../../utils/deleteme.APApisService";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import APAdminPortalApisService from "../../utils/deleteme.APAdminPortalApisService";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface ISearchSelectApisProps {
  organizationId: string,
  currentSelectedApiItemList: TAPEntityIdList,
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, selectedApis: TAPEntityIdList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SearchSelectApis: React.FC<ISearchSelectApisProps> = (props: ISearchSelectApisProps) => {
  const componentName = 'SearchSelectApis';

  const DialogHeader = 'Search & Select API(s):';
  const MessageNoManagedObjectsFound = "No APIs found."
  const MessageNoManagedObjectsFoundWithFilter = 'No APIs found for filter';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search...';

  const [isInitialialized, setIsInitialized] = React.useState<boolean>(false);
  const [managedObjectTableDataList, setManagedObjectTableDataList] = React.useState<TAPApiDisplayList>();
  const [selectedManagedObjectTableDataList, setSelectedManagedObjectTableDataList] = React.useState<TAPApiDisplayList>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();  // * Data Table *
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_INFO_LIST, 'retrieve list of apis');
    try { 
      const list: TAPApiDisplayList = await APAdminPortalApisService.listApApiDisplay({
        organizationId: props.organizationId
      });
      setManagedObjectTableDataList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectTableDataList === undefined) return;
    setSelectedManagedObjectTableDataList(
      APEntityIdsService.create_ApDisplayObjectList_FilteredBy_EntityIdList<TAPApiDisplay>({
        apDisplayObjectList: managedObjectTableDataList,
        filterByEntityIdList: props.currentSelectedApiItemList
      })
    );
  }, [managedObjectTableDataList]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if(selectedManagedObjectTableDataList === undefined) return;
    setIsInitialized(true);
  }, [selectedManagedObjectTableDataList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  // * UI Controls *

  const onSaveSelectedApis = () => {
    const funcName = 'onSaveSelectedApis';
    const logName = `${componentName}.${funcName}()`;
    if(selectedManagedObjectTableDataList === undefined) throw new Error(`${logName}: selectedManagedObjectTableDataList === undefined`);
    // console.log(`${logName}: selectedManagedObjectTableDataList=${JSON.stringify(selectedManagedObjectTableDataList, null, 2)}`);
    props.onSave(ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.SELECT_APIS, `select apis`), APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList<TAPApiDisplay>(selectedManagedObjectTableDataList));
  }

  // * Data Table *
  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    const funcName = 'renderDataTableHeader';
    const logName = `${componentName}.${funcName}()`;
    if(selectedManagedObjectTableDataList === undefined) throw new Error(`${logName}: selectedManagedObjectTableDataList === undefined`);
    const isSaveDisabled: boolean = selectedManagedObjectTableDataList.length === 0;
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button type="button" label="Save" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onSaveSelectedApis} disabled={isSaveDisabled} />
          <Button type="button" label="Cancel" className="p-button-text p-button-plain p-mr-2" onClick={props.onCancel} />
        </div>        
        <div style={{ alignContent: "right"}}>
          <span className="p-input-icon-left" >
            <i className="pi pi-search" />
            <InputText 
              type="search" placeholder={GlobalSearchPlaceholder} style={{width: '500px'}} 
              disabled={false} 
              onInput={onInputGlobalFilter}  
              value={globalFilter}
            />
          </span>
        </div>
      </div>
    );
  }

  const onSelectionChange = (event: any): void => {
    setSelectedManagedObjectTableDataList(event.value);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFound;
  }

  const usedByApiProductsBodyTemplate = (mo: TAPApiDisplay): JSX.Element => {
    if(mo.apApiProductReferenceEntityIdList.length === 0) return (<>-</>);
    return APRenderUtils.renderStringListAsDivList(APEntityIdsService.create_DisplayNameList(mo.apApiProductReferenceEntityIdList));
  }

  // const develSearchContentTemplate = (mo: TAPApiDisplay): JSX.Element => {
  //   return (
  //     <pre style={ { fontSize: '10px' }} >
  //       {JSON.stringify(mo.apSearchContent.split(','), null, 2)}
  //     </pre>
  //   );
  // }
  const renderManagedObjectDataTable = (): JSX.Element => {
    const dataKey = APApisService.nameOf_Entity('id');
    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
            scrollable 
            scrollHeight="800px" 
            dataKey={dataKey}
            emptyMessage={renderManagedObjectTableEmptyMessage()}
            // selection
            selection={selectedManagedObjectTableDataList}
            onSelectionChange={onSelectionChange}
            // sorting
            sortMode='single'
            sortField="apEntityId.displayName"
            sortOrder={1}
          >
            <Column selectionMode="multiple" style={{width:'3em'}}/>
            <Column header="Name" field="apEntityId.displayName" filterField="apSearchContent" sortable />
            <Column header="Source" headerStyle={{width: '12em'}} field="connectorApiInfo.source" bodyStyle={{verticalAlign: 'top'}} sortable />
            <Column header="Used By API Products" body={usedByApiProductsBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />

            {/* <Column header="devel:apSearchContent" body={develSearchContentTemplate} bodyStyle={{verticalAlign: 'top'}} /> */}

            {/* <Column header="Description" field="connectorApiInfo.description"  /> */}
        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-api-products">

      <APComponentHeader header={DialogHeader} />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { isInitialialized && renderManagedObjectDataTable() }

      {/* DEBUG selected managedObjects */}
      {/* {managedProductList.length > 0 && tableSelectedApiProductList && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(tableSelectedApiProductList, null, 2)}
        </pre>
      } */}

    </div>
  );
}
