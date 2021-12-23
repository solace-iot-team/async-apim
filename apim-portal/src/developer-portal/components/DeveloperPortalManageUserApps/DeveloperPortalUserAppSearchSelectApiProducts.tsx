
import React from "react";

import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from 'primereact/button';
import { InputTextarea } from "primereact/inputtextarea";

import { 
  APSUserId 
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { CommonName } from "@solace-iot-team/apim-connector-openapi-browser";

import { Globals } from "../../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { 
  TApiEntitySelectItem,
  TApiEntitySelectItemList, 
  TAPOrganizationId 
} from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageUserAppsCommon";
import { 
  APApiObjectsApiCalls, 
  TApiGetApiProductListResult, 
  TViewManagedApiProduct
} from "../../../components/APApiObjectsCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalUserAppSearchSelectApiProductsProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  currentSelectedApiProductItemList: TApiEntitySelectItemList,
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, selectedApiProductItemList: TApiEntitySelectItemList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalUserAppSearchSelectApiProducts: React.FC<IDeveloperPortalUserAppSearchSelectApiProductsProps> = (props: IDeveloperPortalUserAppSearchSelectApiProductsProps) => {
  const componentName = 'DeveloperPortalUserAppSearchSelectApiProducts';

  const MessageNoManagedObjectsFound = "No API Products found."
  const MessageNoManagedObjectsFoundWithFilter = 'No API Products found for filter';
  // const GlobalSearchPlaceholder = 'Enter search word list separated by <space> ...';
  const GlobalSearchPlaceholder = 'search...';

  type TManagedObject = TViewManagedApiProduct;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    apiInfoListAsDisplayStringList: Array<string>,
    protocolListAsString: string,
    globalSearch: string
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;
 
  const transformManagedObjectListToTableDataList = (managedObjectList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (managedObject: TManagedObject): TManagedObjectTableDataRow => {
      const managedObjectTableDataRow: TManagedObjectTableDataRow = {
        ...managedObject,
        // apiInfoListAsDisplayStringList: APRenderUtils.getApiInfoListAsDisplayStringList(managedObject.apiInfoList),
        apiInfoListAsDisplayStringList: managedObject.apiProduct.apis,
        protocolListAsString: APRenderUtils.getProtocolListAsString(managedObject.apiProduct.protocols),
        globalSearch: ''
      };
      const _globalSearch = Globals.generateDeepObjectValuesString(managedObjectTableDataRow);
      return {
        ...managedObjectTableDataRow,
        globalSearch: _globalSearch
      }
    }
    return managedObjectList.map( (managedObject: TManagedObject) => {
      return _transformManagedObjectToTableDataRow(managedObject);
    });
  }
  const transformManagedObjectTableDataListToManagedObjectItemList = (moTableDataList: TManagedObjectTableDataList): TApiEntitySelectItemList => {
    const _transformRowData = (rowData: TManagedObjectTableDataRow): TApiEntitySelectItem => {
      return {
        id: rowData.id,
        displayName: rowData.displayName
      };
    }
    return moTableDataList.map( (rowData: TManagedObjectTableDataRow) => {
      return _transformRowData(rowData);
    });
  }
  const createSelectedManagedObjectTableDataList = (motdList: TManagedObjectTableDataList, selectedMOItemList: TApiEntitySelectItemList): TManagedObjectTableDataList => {
    let result: TManagedObjectTableDataList = [];
    selectedMOItemList.forEach( (item: TApiEntitySelectItem) => {
      const found: TManagedObjectTableDataRow | undefined = motdList.find( (row: TManagedObjectTableDataRow) => {
        return row.id === item.id;
      });
      if(found) result.push(found);
    });
    return result;
  }
  const doValidateSelectedApiProducts = () => {
    const getDupes = (input: Array<CommonName>): Array<CommonName> => {
      return input.reduce( (acc: Array<string>, currentValue: string, currentIndex: number, arr: Array<CommonName>) => {
        if(arr.indexOf(currentValue) !== currentIndex && acc.indexOf(currentValue) < 0) acc.push(currentValue); 
        return acc;
      }, []);
    }
    let apiNameList: Array<CommonName> = [];
    selectedManagedObjectTableDataList.forEach( (row: TManagedObjectTableDataRow) => {
      apiNameList.push(...row.apiProduct.apis);
    });
    let m: string | undefined = undefined;
    const _dupes: Array<CommonName> = getDupes(apiNameList);
    if(_dupes.length > 0) {
      m = `Cannot select API Products that contain the same APIs. Duplicate APIs: ${_dupes.join(', ')}.`;
    }
    setSelectionErrorMessage(m);

  }

  const [managedObjectTableDataList, setManagedObjectTableDataList] = React.useState<TManagedObjectTableDataList>([]);
  // const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObjectTableDataList, setSelectedManagedObjectTableDataList] = React.useState<TManagedObjectTableDataList>([]);
  const [selectionErrorMessage, setSelectionErrorMessage] = React.useState<string>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    // const funcName = 'apiGetManagedObjectList';
    // const logName = `${componentName}.${funcName}()`;
    const initialCallState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT_LIST, 'retrieve list of api products');
    const result: TApiGetApiProductListResult = await APApiObjectsApiCalls.apiGetApiProductList(props.organizationId, initialCallState);
    setManagedObjectTableDataList(transformManagedObjectListToTableDataList(result.viewManagedApiProductList));
    setApiCallStatus(result.apiCallState);
    return result.apiCallState;
  }

  // * useEffect Hooks *
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
    setSelectedManagedObjectTableDataList(createSelectedManagedObjectTableDataList(managedObjectTableDataList, props.currentSelectedApiProductItemList));
    // does not work for primereact/DataTable native filter
    // setGlobalFilter(APApiObjectsCommon.transformSelectItemListToTableGlobalFilter(props.currentSelectedApiItemList));
  }, [managedObjectTableDataList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // if(selectedManagedObjectTableDataList.length > 0) {
      doValidateSelectedApiProducts();
    // }
  }, [selectedManagedObjectTableDataList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *
  const onSaveSelectedApiProducts = () => {
    props.onSave(ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.SELECT_API_PRODUCTS, `select api products`), transformManagedObjectTableDataListToManagedObjectItemList(selectedManagedObjectTableDataList));
  }

  // * Data Table *
  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const onSelectionChange = (event: any): void => {
    setSelectedManagedObjectTableDataList(event.value);
  }

  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div style={{ whiteSpace: "nowrap"}}>
          <Button 
            type="button" label="Save" className="p-button-text p-button-plain p-button-outlined p-mr-2" 
            onClick={onSaveSelectedApiProducts} 
            disabled={(selectedManagedObjectTableDataList.length === 0 || selectionErrorMessage !== undefined)} 
          />
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

  const attributesBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(APRenderUtils.getAttributeNameList(rowData.apiProduct.attributes));
  }

  const environmentsBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(rowData.apiProduct.environments ? rowData.apiProduct.environments : []);
    // return APRenderUtils.renderStringListAsDivList(rowData.environmentListAsStringList);
  }
  const apisBodyTemplate = (rowData: TManagedObjectTableDataRow): JSX.Element => {
    return APRenderUtils.renderStringListAsDivList(rowData.apiInfoListAsDisplayStringList);
  }

  const renderManagedObjectTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedObjectsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedObjectsFound;
  }

  const renderManagedObjectDataTable = () => {
    return (
      <DataTable
        ref={dt}
        className="p-datatable-sm"
        autoLayout={true}
        resizableColumns 
        columnResizeMode="expand"
        showGridlines={false}
        header={renderDataTableHeader()}
        value={managedObjectTableDataList}
        globalFilter={globalFilter}
        scrollable 
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
        <Column selectionMode="multiple" style={{width:'3em'}} bodyStyle={{ verticalAlign: 'top' }} />
        <Column field="displayName" header="Name" sortable filterField="globalSearch" bodyStyle={{ verticalAlign: 'top' }} />
        <Column field="apiProduct.description" header="Description" bodyStyle={{ verticalAlign: 'top' }}/>
        <Column field="apiProduct.approvalType" header="Approval" headerStyle={{width: '8em'}} sortable bodyStyle={{ verticalAlign: 'top' }} />
        <Column body={apisBodyTemplate} header="APIs" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
        <Column body={attributesBodyTemplate} header="Attributes" bodyStyle={{ verticalAlign: 'top' }} />
        <Column body={environmentsBodyTemplate} header="Environments" bodyStyle={{textAlign: 'left', overflow: 'visible', verticalAlign: 'top' }}/>
        <Column field="protocolListAsString" header="Protocols" bodyStyle={{ verticalAlign: 'top' }} />
      </DataTable>
    );
  }

  const renderHelp = () => {
    return(
      <div className="p-mb-2">
        <small id={componentName+'help'} >
          Select 1 or multiple API Products. Note: They must not contain the same APIs.
        </small>              
    </div>
    )
  }

  const renderErrorMessage = (): JSX.Element => {
    if(selectionErrorMessage) {
      return (
        <div className="card p-fluid">
          <div className="p-field">
            <InputTextarea 
              id="apiError" 
              value={selectionErrorMessage} 
              className='p-invalid'
              style={{color: 'red', resize: 'none'}}
              rows={1}
              contentEditable={false}
            />
          </div>
        </div>  
      );
    } else return (<React.Fragment></React.Fragment>);
  }

  const renderContent = () => {
    if(managedObjectTableDataList.length > 0 ) {
      return (
        <React.Fragment>
          { renderHelp() }
          { renderErrorMessage() }
          { renderManagedObjectDataTable() }
        </React.Fragment>
      )
    } 
  }

  return (
    <div className="apd-manage-user-apps">

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderContent()}

      {/* DEBUG selected managedObject */}
      {/* {managedProductList.length > 0 && tableSelectedApiProductList && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(tableSelectedApiProductList, null, 2)}
        </pre>
      } */}

    </div>
  );
}
