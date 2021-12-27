
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import { 
  APIInfo,
  APIInfoList,
  ApisService,
  CommonEntityNameList,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { Config } from '../../../Config';
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { Globals } from "../../../utils/Globals";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, TManagedObjectId, TViewApiObject, TViewManagedObject } from "./ManageApisCommon";
import { APRenderUtils } from "../../../utils/APRenderUtils";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IListApisProps {
  organizationId: TAPOrganizationId,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectDelete: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string) => void;
  onManagedObjectView: (managedObjectId: TManagedObjectId, managedObjectDisplayName: string, viewManagedObject: TViewManagedObject) => void;
}

export const ListApis: React.FC<IListApisProps> = (props: IListApisProps) => {
  const componentName = 'ListApis';

  const MessageNoManagedObjectsFoundCreateNew = 'No APIs found - create a new API.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = TViewManagedObject;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject;
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject, apiInfo: APIInfo, usedByApiProductEntityNameList: CommonEntityNameList): TViewManagedObject => {
    const globalSearch = {
      apiObject: viewApiObject,
      apiInfo: apiInfo,
      usedByApiProductEntityNameList: usedByApiProductEntityNameList
    }
    return {
      id: viewApiObject,
      displayName: viewApiObject,
      apiObject: viewApiObject,
      apiInfo: apiInfo,
      apiUsedBy_ApiProductEntityNameList: usedByApiProductEntityNameList,
      globalSearch: Globals.generateDeepObjectValuesString(globalSearch)
    }
  }

  const transformManagedObjectListToTableDataList = (managedObjectList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (managedObject: TManagedObject): TManagedObjectTableDataRow => {
      return {
        ...managedObject
      }
    }
    return managedObjectList.map( (managedObject: TManagedObject) => {
      return _transformManagedObjectToTableDataRow(managedObject);
    });
  }

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_NAME_LIST, 'retrieve list of APIs');
    try { 
      const apiResult = await ApisService.listApis({
        organizationName: props.organizationId,
        format: "extended"
      });
      const apiAPIInfoList: APIInfoList = apiResult as APIInfoList;      
      let _managedObjectList: TManagedObjectList = [];
      for(const apiInfo of apiAPIInfoList) {
        // console.log(`${logName}: apiInfo=${JSON.stringify(apiInfo, null, 2)}`);
        if(!apiInfo.name) throw new Error(`${logName}: apiInfo.name is undefined`);
        // get the api Products using the api
        const apiApiProductEntityNameList: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
          organizationName: props.organizationId,
          apiName: apiInfo.name
        });
        _managedObjectList.push(transformViewApiObjectToViewManagedObject(apiInfo.name, apiInfo, apiApiProductEntityNameList));
      }
      setManagedObjectList(_managedObjectList);
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
    // const funcName = 'useEffect([])';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) props.onSuccess(apiCallStatus);
      else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *
  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }  

  const onManagedObjectOpen = (event: any): void => {
    const mo: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(mo.id, mo.displayName, mo);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    setGlobalFilter(event.currentTarget.value);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    return (
      <div className="table-header">
        <div className="table-header-container" />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '500px'}}/>
        </span>
      </div>
    );
  }

  const usedByApiProductsBodyTemplate = (mo: TManagedObject): JSX.Element => {
    if(mo.apiUsedBy_ApiProductEntityNameList.length === 0) return (<>None</>);
    return APRenderUtils.renderStringListAsDivList(APRenderUtils.getCommonEntityNameListAsStringList(mo.apiUsedBy_ApiProductEntityNameList));
  }

  const actionBodyTemplate = (mo: TManagedObject) => {
    const showButtonsEditDelete: boolean = (mo.apiInfo.source !== APIInfo.source.EVENT_PORTAL_LINK);
    const isDeleteAllowed: boolean = mo.apiUsedBy_ApiProductEntityNameList.length === 0;
    return (
        <React.Fragment>
          { showButtonsEditDelete &&
            <>
              <Button tooltip="edit" icon="pi pi-pencil" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectEdit(mo.id, mo.displayName)}  />
              <Button tooltip="delete" icon="pi pi-trash" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" onClick={() => props.onManagedObjectDelete(mo.id, mo.displayName)} disabled={!isDeleteAllowed}/>
            </>
          }
        </React.Fragment>
    );
  }

  const renderManagedObjectDataTable = () => {
    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectListToTableDataList(managedObjectList);    
    return (
      <div className="card">
          <DataTable
            ref={dt}
            className="p-datatable-sm"
            autoLayout={true}
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            scrollable 
            // scrollHeight="800px" 
            dataKey="id"  
            // sorting
            sortMode='single'
            sortField="displayName"
            sortOrder={1}
          >
            {/* <Column field="id" header="Id" sortable /> */}
            <Column header="Name" field="displayName" bodyStyle={{verticalAlign: 'top'}} sortable filterField="globalSearch" />
            <Column header="Source" field="apiInfo.source" bodyStyle={{verticalAlign: 'top'}} sortable />
            <Column header="Used By API Products" body={usedByApiProductsBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column headerStyle={{width: '7em' }} body={actionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'right' }} />
        </DataTable>
      </div>
    );
  }

  const renderContent = () => {

    if(managedObjectList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success) {
      return (<h3>{MessageNoManagedObjectsFoundCreateNew}</h3>);
    }
    if(managedObjectList.length > 0 && !isGetManagedObjectListInProgress) {
      return renderManagedObjectDataTable();
    } 
  }

  const renderDebugSelectedManagedObject = (): JSX.Element => {
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
    } else return (<></>);
  }

  return (
    <div className="manage-apis">

      <APComponentHeader header='APIs:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderContent()}
      
      {/* DEBUG OUTPUT         */}
      {Config.getUseDevelTools() && renderDebugSelectedManagedObject()}

    </div>
  );
}
