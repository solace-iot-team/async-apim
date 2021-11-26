
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { 
  APIProduct, 
  ApiProductsService, 
  CommonDisplayName, 
  CommonName, 
  EnvironmentResponse, 
  EnvironmentsService 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";

import { APRenderUtils } from "../../../utils/APRenderUtils";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APManagedApiProductDisplay, TAPDeveloperPortalApiProductDisplay } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "././DeveloperPortalProductCatalogCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";

export interface IDeveloperPortalListApiProductsProps {
  organizationId: CommonName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectOpen: (name: CommonName, displayName: CommonDisplayName) => void;
}

export const DeveloperPortalListApiProducts: React.FC<IDeveloperPortalListApiProductsProps> = (props: IDeveloperPortalListApiProductsProps) => {
  const componentName = 'DeveloperPortalListApiProducts';

  const MessageNoManagedProductsFound = "No API Products found."
  const MessageNoManagedProductsFoundWithFilter = 'No API Products found for filter';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = TAPDeveloperPortalApiProductDisplay;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    apApiDisplayNameListAsString: string;
    apProtocolListAsString: string;
    apAttributeListAsString: string;
    apEnvironmentListAsStringList: Array<string>;
    globalSearch: string;
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformManagedObjectListToTableDataList = (moList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (mo: TManagedObject): TManagedObjectTableDataRow => {
      const moTdRow: TManagedObjectTableDataRow = {
        ...mo,
        apApiDisplayNameListAsString: APManagedApiProductDisplay.getApApiDisplayNameListAsString(mo.apiApiProduct.apis),
        apProtocolListAsString: APManagedApiProductDisplay.getApProtocolListAsString(mo.apiApiProduct.protocols),
        apAttributeListAsString: APManagedApiProductDisplay.getApAttributeNamesAsString(mo.apiApiProduct.attributes),
        apEnvironmentListAsStringList: APManagedApiProductDisplay.getApEnvironmentsAsDisplayList(mo.apiEnvironmentList),
        // apEnvironmentListAsStringList: APManagedApiProductDisplay.getApEnvironmentsAsDisplayList(mo.apiEnvironmentList, mo.apiApiProduct.environments),
        globalSearch: ''
      };
      const globalSearch = APManagedApiProductDisplay.generateGlobalSearchContent(moTdRow);
      return {
        ...moTdRow,
        globalSearch: globalSearch
      }
    }
    return moList.map( (mo: TManagedObject) => {
      return _transformManagedObjectToTableDataRow(mo);
    });
  }

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  // const [managedObjectDisplayList, setManagedObjectDisplayList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const managedObjectListDataTableRef = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    console.log(`${logName}: starting: managedObjectList.length=${managedObjectList.length}`);

    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT_LIST, 'retrieve list of api products');
    try { 
      const apiApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
        organizationName: props.organizationId
      });
      let _moList: TManagedObjectList = [];
      // get all envs for all products
      let _apiEnvListCache: Array<EnvironmentResponse> = [];
      for(const apiApiProduct of apiApiProductList) {
        if(!apiApiProduct.environments) throw new Error(`${logName}: apiApiProduct.environments is undefined`);
        let _apiEnvList: Array<EnvironmentResponse> = [];
        for(const envName of apiApiProduct.environments) {
          const found = _apiEnvListCache.find( (apiEnv: EnvironmentResponse) => {
            return apiEnv.name === envName;
          });
          if(!found) {
            const _apiEnvResp: EnvironmentResponse = await EnvironmentsService.getEnvironment({
              organizationName: props.organizationId,
              envName: envName
            });
            _apiEnvListCache.push(_apiEnvResp);
            _apiEnvList.push(_apiEnvResp);
          } else {
            _apiEnvList.push(found);
          }
        }
        _moList.push(APManagedApiProductDisplay.createAPDeveloperPortalApiProductDisplayFromApiEntities(apiApiProduct, _apiEnvList));
      }
      setManagedObjectList(_moList);
      // setManagedObjectDisplayList(_moList);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    setIsGetManagedObjectListInProgress(false);
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
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) props.onSuccess(apiCallStatus);
      else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *
  // * Data Table *
  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }  

  const onManagedObjectOpen = (event: any): void => {
    const managedObject: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectOpen(managedObject.apApiProductName, managedObject.apApiProductDisplayName);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }

  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div className="table-header-container" />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}} value={globalFilter} />
        </span>
      </div>
    );
  }

  const environmentsBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    return APRenderUtils.renderStringListAsDivList(rowData.apEnvironmentListAsStringList);
  }

  const renderManagedProductTableEmptyMessage = () => {
    if(globalFilter && globalFilter !== '') return `${MessageNoManagedProductsFoundWithFilter}: ${globalFilter}.`;
    else return MessageNoManagedProductsFound;
  }

  const renderManagedObjectDataTable = () => {
    const managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectListToTableDataList(managedObjectList);    
    return (
      <div className="card">
          <DataTable
            ref={managedObjectListDataTableRef}
            className="p-datatable-sm"
            showGridlines={false}
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            scrollable 
            dataKey="apApiProductName"  
            emptyMessage={renderManagedProductTableEmptyMessage()}
            // sorting
            sortMode='single'
            sortField="apApiProductDisplayName"
            sortOrder={1}
          >
            <Column header="Name" field="apApiProductDisplayName" bodyStyle={{verticalAlign: 'top'}} sortable filterField="globalSearch" />
            {/* <Column header="Description" field="apiObject.description" bodyStyle={{verticalAlign: 'top'}} /> */}
            <Column header="API(s)" field="apApiDisplayNameListAsString" bodyStyle={{verticalAlign: 'top'}} />
            <Column header="Controlled Attributes" field="apAttributeListAsString" bodyStyle={{verticalAlign: 'top'}} />
            <Column header="Approval" headerStyle={{width: '8em'}} field="apiApiProduct.approvalType" bodyStyle={{verticalAlign: 'top'}} sortable/>
            <Column header="API Gateway(s)" body={environmentsBodyTemplate} bodyStyle={{textAlign: 'left', verticalAlign: 'top'}} />
            <Column header="Exposed Protocols" field="apProtocolListAsString" bodyStyle={{verticalAlign: 'top'}} />
        </DataTable>
      </div>
    );
  }

  const renderContent = () => {
    if(managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success) {
      return (<h3>{MessageNoManagedProductsFound}</h3>);
    }
    if(managedObjectList.length > 0 && !isGetManagedObjectListInProgress) {
      return renderManagedObjectDataTable();
    } 
  }

  
  return (
    <div className="adp-productcatalog">

      <APComponentHeader header='API Products:' />  

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderContent()}
      
      {/* DEBUG selected managedProduct */}
      {/* {managedProductList.length > 0 && selectedManagedProduct && 
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(selectedManagedProduct, null, 2)}
        </pre>
      } */}

    </div>
  );
}
