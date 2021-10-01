
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';

import { 
  APIInfo, 
  APIInfoList, 
  ApisService, 
  EnvironmentListItem, 
  EnvironmentResponse,
  EnvironmentsService
} from "@solace-iot-team/apim-connector-openapi-browser";

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { Globals } from "../../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { TApiEntitySelectItem, TApiEntitySelectItemList, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { 
  APApiObjectsCommon, 
  APEnvironmentObjectsCommon, 
  TAPEnvironmentViewManagedObject, 
  TAPEnvironmentViewManagedOjbectList
} from "../../../components/APApiObjectsCommon";
import { E_CALL_STATE_ACTIONS } from "./ManageApiProductsCommon";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";
import { env } from "shelljs";


export interface ISearchSelectEnvironmentsProps {
  organizationId: TAPOrganizationId,
  currentSelectedEnvironmetItemList: TApiEntitySelectItemList,
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, selectedApis: TApiEntitySelectItemList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SearchSelectEnvironments: React.FC<ISearchSelectEnvironmentsProps> = (props: ISearchSelectEnvironmentsProps) => {
  const componentName = 'SearchSelectEnvironments';

  const DialogHeader = 'Search & Select Environment(s):';
  const MessageNoManagedObjectsFound = "No Environments found."
  const MessageNoManagedObjectsFoundWithFilter = 'No Environments found for filter';
  const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';

  type TManagedObjectTableDataRow = TAPEnvironmentViewManagedObject;
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const createSelectedManagedObjectTableDataList = (dataTableList: TManagedObjectTableDataList, selectedItemList: TApiEntitySelectItemList): TManagedObjectTableDataList => {
    let result: TManagedObjectTableDataList = [];
    selectedItemList.forEach( (selectedItem: TApiEntitySelectItem) => {
      const found: TManagedObjectTableDataRow | undefined = dataTableList.find( (row: TManagedObjectTableDataRow) => {
        return row.id === selectedItem.id;
      });
      if(found) result.push(found); 
    });
    return result;
  }

  // const transformApiEnvironmentListToDataTableList =(apiEnvironmentList: Array<EnvironmentListItem>): TManagedObjectTableDataList => {
  //   const transformApiEnvironmentToDataTableRow = (environment: EnvironmentListItem): TManagedObjectTableDataRow => {
  //     const funcName = 'transformApiEnvironmentToDataTableRow';
  //     const logName = `${componentName}.${funcName}()`;
  //     return {
  //       id: environment.name,
  //       displayName: environment.displayName ? environment.displayName : environment.name,
  //       apiEnvironment: environment,
  //       globalSearch: 
  //     }


  //     if(!apiInfo.name) throw new Error(`${logName}: apiInfo.name is undefined`);
  //     const globalSearch = apiInfo;
  //     return {
  //       id: apiInfo.name,
  //       displayName: apiInfo.name,
  //       apiInfo: apiInfo,
  //       globalSearch: Globals.generateDeepObjectValuesString(globalSearch)
  //     };
  //   }
  //   return apiEnvironmentList.map( (environment: EnvironmentListItem) => {
  //     return transformApiInfoToDataTableRow(environment);
  //   });
  // }

  const transformTableDataListToSelectItemList = (tableDataList: TManagedObjectTableDataList): TApiEntitySelectItemList => {
    return tableDataList.map( (row: TManagedObjectTableDataRow) => {
      return {
        id: row.id,
        displayName: row.displayName
      }
    });
  }


  const [managedObjectTableDataList, setManagedObjectTableDataList] = React.useState<TManagedObjectTableDataList>([]);
  const [selectedManagedObjectTableDataList, setSelectedManagedObjectTableDataList] = React.useState<TManagedObjectTableDataList>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();  // * Data Table *
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ENVIRONMENT_LIST, 'retrieve list of environments');
    try { 
      const apiEnvironmentList: Array<EnvironmentListItem> = await EnvironmentsService.listEnvironments({
        organizationName: props.organizationId
      });
      let viewManagedObjectList: TAPEnvironmentViewManagedOjbectList = [];
      for(const apiEnvironment of apiEnvironmentList) {
        const apiEnvironmentResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({
          organizationName: props.organizationId,
          envName: apiEnvironment.name
        });
        viewManagedObjectList.push(APEnvironmentObjectsCommon.transformEnvironmentResponseToEnvironmentViewManagedObject(apiEnvironmentResponse));
      }
      setManagedObjectTableDataList(viewManagedObjectList);
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
    if(!managedObjectTableDataList) return;
    setSelectedManagedObjectTableDataList(createSelectedManagedObjectTableDataList(managedObjectTableDataList, props.currentSelectedEnvironmetItemList));
    // does not work for primereact/DataTable native filter
    // setGlobalFilter(APApiObjectsCommon.transformSelectItemListToTableGlobalFilter(props.currentSelectedApiItemList));
  }, [managedObjectTableDataList]); 
  
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  // * UI Controls *

  const onSaveSelectedEnvironments = () => {
    // const funcName = ' onSaveSelectedApis';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: selectedManagedObjectTableDataList=${JSON.stringify(selectedManagedObjectTableDataList, null, 2)}`);
    props.onSave(ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.SELECT_ENVIRONMENTS, `select environments`), transformTableDataListToSelectItemList(selectedManagedObjectTableDataList));
  }

  // const onCancel = () => {
  //   props.onCancel();
  // }

  // * Data Table *
  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button type="button" label="Save" className="p-button-text p-button-plain p-button-outlined p-mr-2" onClick={onSaveSelectedEnvironments} disabled={selectedManagedObjectTableDataList.length === 0} />
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

  // const apiGatewaysBodyTemplate = (row: TManagedProductTableDataRow): JSX.Element => {
  //   return APRenderUtils.renderStringListAsDivList(row.environmentListAsStringList);
  // }

  const onSelectionChange = (event: any): void => {
    setSelectedManagedObjectTableDataList(event.value);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFound;
  }

  const renderManagedObjectDataTable = (): JSX.Element => {
    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            autoLayout={true}
            resizableColumns 
            columnResizeMode="expand"
            showGridlines
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
            scrollable 
            scrollHeight="800px" 
            dataKey="id"  
            emptyMessage={renderManagedObjectTableEmptyMessage()}
            // selection
            selection={selectedManagedObjectTableDataList}
            onSelectionChange={onSelectionChange}
            // sorting
            sortMode='single'
            sortField="displayName"
            sortOrder={1}
          >
            <Column selectionMode="multiple" style={{width:'3em'}}/>
            <Column field="displayName" header="Name" sortable filterField="globalSearch" />
            <Column field="apiEnvironment.serviceName" header="Service Name" sortable />
            <Column field="apiEnvironment.msgVpnName" header="Msg Vpn Name" sortable />
            <Column field="apiEnvironment.datacenterProvider" header="Datacenter Provider" sortable />
            <Column field="apiEnvironment.description" header="Description" />
            {/* <Column body={apiGatewaysBodyTemplate} header="API Gateway(s)" bodyStyle={{textAlign: 'left', overflow: 'visible'}}/> */}
            {/* <Column body={actionBodyTemplate} headerStyle={{width: '20em', textAlign: 'center'}} bodyStyle={{textAlign: 'left', overflow: 'visible'}}/> */}
        </DataTable>
      </div>
    );
  }

  return (
    <div className="manage-api-products">

      <APComponentHeader header={DialogHeader} />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {/* {managedProductList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success &&
        <h3>{MessageNoManagedObjectsFound}</h3>
      } */}

      {/* {(managedProductList.length > 0 || (managedProductList.length === 0 && globalFilter && globalFilter !== '')) && 
        renderManagedObjectDataTable()
      } */}

      {/* { managedObjectTableDataList.length > 0 && globalFilter && selectedManagedObjectTableDataList && */}
      { renderManagedObjectDataTable() }

      {/* DEBUG selected managedObjects */}
      {managedObjectTableDataList.length > 0 && selectedManagedObjectTableDataList && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(selectedManagedObjectTableDataList, null, 2)}
        </pre>
      }

    </div>
  );
}
