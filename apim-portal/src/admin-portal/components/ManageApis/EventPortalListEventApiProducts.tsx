
import React, { isValidElement } from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { 
  EventAPIProduct, 
  EventAPIProductList, 
  EventPortalService, 
} from '@solace-iot-team/apim-connector-openapi-browser';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { Globals } from "../../../utils/Globals";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageApisCommon";
import { Config } from "../../../Config";
import { APConnectorFormValidationRules } from "../../../utils/APConnectorOpenApiFormValidationRules";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IEventPortalListEventApiProductsProps {
  organizationId: TAPOrganizationId;
  onError: (apiCallState: TApiCallState) => void;
  onLoadListSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onSelect: (connectorId: TManagedObjectId, eventPortalId: TManagedObjectId, displayName: string) => void;
  onViewEventApiProduct: (isImportable: boolean, connectorId: TManagedObjectId, eventPortalId: TManagedObjectId, displayName: string) => void; 
}
 
export const EventPortalListEventApiProducts: React.FC<IEventPortalListEventApiProductsProps> = (props: IEventPortalListEventApiProductsProps) => {
  const componentName = 'EventPortalListEventApiProducts';

  const MessageNoManagedObjectsFound = 'No Event API Products found';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = {
    apiObject: EventAPIProduct;
    isImportable: boolean | string;
    globalSearch: string;
  }
  type TManagedObjectList = Array<TManagedObject>;

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  // * Data Table *
  const [globalFilter, setGlobalFilter] = React.useState<string>('');
  const dt = React.useRef<any>(null);


  /**
   * Decided to use the 'name' and not the 'id' as the Connector 'name'.
   * Check if 'name' validates against Connector OpenAPI pattern.
   * @param eventApiProduct 
   */
  const validate_IsImportable = (eventApiProduct: EventAPIProduct): boolean | string => {
    const name: string = eventApiProduct.name;
    const rules: any = APConnectorFormValidationRules.CommonName();
    if(rules['minLength']) {
      if(name.length < rules.minLength['value']) return rules.minLength.message; 
    }
    if(rules['maxLength']) {
      if(name.length > rules.maxLength['value']) return rules.maxLength.message; 
    }
    if(rules['pattern']) {
      if(!rules.pattern.value.test(name)) return rules.pattern.message;
    }
    return true;
  }

  const transformEventApiProductToManagedObject = (eventApiProduct: EventAPIProduct): TManagedObject => {

    return {
      apiObject: eventApiProduct,
      globalSearch: Globals.generateDeepObjectValuesString(eventApiProduct),
      isImportable: validate_IsImportable(eventApiProduct),
    }
  }

  const transformEventApiProductListToManagedObjectList = (eventApiProductList: EventAPIProductList): TManagedObjectList => {
    let _managedObjectList: TManagedObjectList = [];
    eventApiProductList.forEach( (eventApiProduct: EventAPIProduct) => {
      _managedObjectList.push(transformEventApiProductToManagedObject(eventApiProduct));
    });
    return _managedObjectList;
  }
  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EVENT_API_PRODUCT_LIST, 'retrieve list of Event Api Products');
    try { 
      const eventApiProductList: EventAPIProductList = await EventPortalService.listEventApiProducts({
        organizationName: props.organizationId
      });
      setManagedObjectList(transformEventApiProductListToManagedObjectList(eventApiProductList));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    setIsGetManagedObjectListInProgress(false);
    return callState;
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
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_GET_EVENT_API_PRODUCT_LIST) {
        props.onLoadListSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *
  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }  

  const onImport = (managedObject: TManagedObject | undefined): void => {
    if(!managedObject) return;
    props.onSelect(managedObject.apiObject.name, managedObject.apiObject.id, managedObject.apiObject.name);
  }

  const onViewAsyncApi = (managedObject: TManagedObject | undefined): void => {
    if(!managedObject) return;
    props.onViewEventApiProduct(isValid(managedObject.isImportable), managedObject.apiObject.name, managedObject.apiObject.id, managedObject.apiObject.name);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    setSelectedManagedObject(undefined);
    setGlobalFilter(event.currentTarget.value);
  }

  const renderDataTableHeader = (): JSX.Element => {
    const isViewDisabled: boolean = !selectedManagedObject;
    const isImportDisabled: boolean = (selectedManagedObject ? !isValid(selectedManagedObject.isImportable) : true );
    return (
      <div className="table-header">
        <div className="table-header-container">
          <Button 
            label='Import Selected' 
            icon="pi pi-cloud-download" 
            className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
            onClick={() => onImport(selectedManagedObject)} 
            disabled={isImportDisabled} 
          />
          <Button 
            label='View Selected' 
            icon="pi pi-folder-open" 
            className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
            onClick={() => onViewAsyncApi(selectedManagedObject)} 
            disabled={isViewDisabled} 
          />
        </div>        
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}}/>
        </span>
      </div>
    );
  }

  const isValid = (isImportable: boolean | string): boolean => {
    if(typeof isImportable === 'boolean') return isImportable;
    return false;
  }

  const withStyle = (isImportable: boolean | string, value: string | undefined) => {
    if(isValid(isImportable)) return value;
    return (<span style={{ color: 'grey' }}>{value}</span>);
  }
  const nameBodyTemplate = (row: TManagedObject) => {
    return withStyle(row.isImportable, row.apiObject.name);
  }
  const summaryBodyTemplate = (row: TManagedObject) => {
    return withStyle(row.isImportable, row.apiObject.summary);
  }
  const descriptionBodyTemplate = (row: TManagedObject) => {
    return withStyle(row.isImportable, row.apiObject.description);
  }
  const versionBodyTemplate = (row: TManagedObject) => {
    return withStyle(row.isImportable, row.apiObject.version);
  }
  const valiationBodyTemplate = (row: TManagedObject) => {
    if(isValid(row.isImportable)) return withStyle(true, 'valid');
    if(typeof row.isImportable === 'string') return withStyle(false, row.isImportable);
  }

  const renderManagedObjectDataTable = () => {

    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            autoLayout={false}
            header={renderDataTableHeader()}
            value={managedObjectList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onViewAsyncApi(selectedManagedObject)}
            sortMode="single" sortField="displayName" sortOrder={1}
            scrollable 
            scrollHeight="1200px" 
            dataKey="apiObject.id"  
          >
            {/* <Column field="apiObject.id" header="Id" /> */}
            <Column field="apiObject.name" header="Name" sortable filterField="globalSearch" body={nameBodyTemplate}/>
            <Column field="apiObject.summary" header="Summary" body={summaryBodyTemplate}/>
            <Column field="apiObject.description" header="Description" body={descriptionBodyTemplate}/>            
            <Column field="apiObject.version" header="Version" headerStyle={{width: '10em', textAlign: 'center'}} bodyStyle={{textAlign: 'center'}} body={versionBodyTemplate}/>
            <Column field="isImportable" header="Validation" body={valiationBodyTemplate} />
        </DataTable>
      </div>
    );
  }

  const renderDebugSelectedManagedObject = () => {
    if(managedObjectList.length > 0 && selectedManagedObject) {
      const _d = {
        ...selectedManagedObject,
        globalSearch: 'not shown...'
      }
      return (
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(_d, null, 2)}
        </pre>
      );
    }
  }

  return (
    <div className="manage-apis">

      <APComponentHeader header='Event API Products:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success &&
        <h3>{MessageNoManagedObjectsFound}</h3>
      }

      {managedObjectList.length > 0 && 
        renderManagedObjectDataTable()
      }

      {/* DEBUG OUTPUT         */}
      {Config.getUseDevelTools() && renderDebugSelectedManagedObject()}

    </div>
  );
}
