
import React from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { SelectButton, SelectButtonChangeParams } from "primereact/selectbutton";
import { MenuItem } from "primereact/api";

import { 
  ApiProductsService,
  App,
  AppResponse,
  AppsService,
  CommonDisplayName,
  CommonName,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { 
  APSUserId 
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { 
  TApiProduct,
  TApiProductList,
} from "../../../components/APApiObjectsCommon";
import { APRenderUtils } from "../../../utils/APRenderUtils";
import { Globals } from "../../../utils/Globals";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { 
  APManagedUserAppDisplay, 
  TAPDeveloperPortalUserAppDisplay, 
  TApiEntitySelectItemList, 
  TAPManagedWebhook,
  TAPManagedWebhookList 
} from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageUserAppsCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalListUserAppsProps {
  organizationId: CommonName,
  userId: APSUserId,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectEdit: (managedObjectId: CommonName, managedObjectDisplayName: CommonDisplayName) => void;
  onManagedObjectDelete: (managedObjectId: CommonName, managedObjectDisplayName: CommonDisplayName) => void;
  onManagedObjectView: (managedObjectId: CommonName, managedObjectDisplayName: CommonDisplayName) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const DeveloperPortalListUserApps: React.FC<IDeveloperPortalListUserAppsProps> = (props: IDeveloperPortalListUserAppsProps) => {
  const componentName = 'DeveloperPortalListUserApps';

  const MessageNoManagedObjectsFoundCreateNew = 'No Apps found - create a new App.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = TAPDeveloperPortalUserAppDisplay;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    productDisplayNameList: Array<CommonDisplayName>,
    environmentDisplayNameList: Array<CommonDisplayName>;
    environmentWithWebhookDefinedDisplayNameList: Array<CommonDisplayName>;
    globalSearch: string
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformManagedObjectListToTableDataList = (moList: TManagedObjectList): TManagedObjectTableDataList => {
    const _createApiProductDisplayNameList = (apiProductList: TApiProductList): Array<CommonDisplayName> => {
      return apiProductList.map( (apiProduct: TApiProduct) => {
        return apiProduct.displayName
      });
    }
    const _createEnvWithWebhookDefinedList = (mwhList: TAPManagedWebhookList): Array<CommonDisplayName> => {
      let l: Array<CommonDisplayName> = [];
      mwhList.forEach( (mwh: TAPManagedWebhook) => {
        if(mwh.webhookWithoutEnvs) l.push(mwh.webhookEnvironmentReference.entityRef.displayName);
      });
      return l;
    }
    const _transformManagedObjectToTableDataRow = (mo: TManagedObject): TManagedObjectTableDataRow => {
      const funcName = '_transformManagedObjectToTableDataRow';
      const logName = `${componentName}.${funcName}()`;
      if(!mo.apiAppResponse_smf.environments) throw new Error(`${logName}: mo.apiAppResponse_smf.environments is undefined`);
      const managedObjectTableDataRow: TManagedObjectTableDataRow = {
        ...mo,
        productDisplayNameList:_createApiProductDisplayNameList(mo.apiProductList),
        environmentDisplayNameList: mo.apiAppResponse_smf.environments.map( (x) => { return APManagedUserAppDisplay.getAppEnvironmentDisplayName(x) }),
        environmentWithWebhookDefinedDisplayNameList: _createEnvWithWebhookDefinedList(mo.apManagedWebhookList),
        globalSearch: ''
      };
      const globalSearch = Globals.generateDeepObjectValuesString(managedObjectTableDataRow);
      return {
        ...managedObjectTableDataRow,
        globalSearch: globalSearch
      }
    }
    return moList.map( (mo: TManagedObject) => {
      return _transformManagedObjectToTableDataRow(mo);
    });
  }

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>();
  const selectGlobalFilterOptions: TApiEntitySelectItemList = [
    { id: 'pending', displayName: 'pending' },
    { id: 'approved', displayName: 'approved' },
    { id: '', displayName: 'all'}
  ]
  const [selectedGlobalFilter, setSelectedGlobalFilter] = React.useState<string>('');
  const managedObjectListDataTableRef = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP_LIST, `retrieve list of apps for ${props.userId}`);
    try { 
      const apiAppList: Array<App> = await AppsService.listDeveloperApps({
        organizationName: props.organizationId, 
        developerUsername: props.userId
      });
      // get details for each App
      let _appDisplayList: Array<TAPDeveloperPortalUserAppDisplay> = [];
      for(const apiApp of apiAppList) {
        const _apiAppResponse_smf: AppResponse = await AppsService.getDeveloperApp({
          organizationName: props.organizationId,
          developerUsername: props.userId,
          appName: apiApp.name,
          topicSyntax: 'smf'
        });
        let _apiAppProductList: TApiProductList = [];
        for(const apiAppProductId of _apiAppResponse_smf.apiProducts) {
          const apiApiProduct = await ApiProductsService.getApiProduct({
            organizationName: props.organizationId,
            apiProductName: apiAppProductId
          });
          _apiAppProductList.push(apiApiProduct);
        }
        _appDisplayList.push(APManagedUserAppDisplay.createAPDeveloperPortalAppDisplayFromApiEntities(_apiAppResponse_smf, _apiAppProductList, undefined))
      }
      setManagedObjectList(_appDisplayList);
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
    props.setBreadCrumbItemList([]);
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
    const managedObject: TManagedObject = event.data as TManagedObject;
    props.onManagedObjectView(managedObject.appName, managedObject.appDisplayName);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const _globalFilter: string | undefined = event.currentTarget.value !== '' ? event.currentTarget.value : undefined;
    setGlobalFilter(_globalFilter);
  }
 
  const renderDataTableHeader = (): JSX.Element => {
    const onSelectedGlobalFilterChange = (params: SelectButtonChangeParams) => {
      if(params.value !== null) {
        setSelectedGlobalFilter(params.value);
        setGlobalFilter(params.value);
      }
    }
    return (
      <div className="table-header">
        <div className="table-header-container">
          <SelectButton 
            value={selectedGlobalFilter} 
            options={selectGlobalFilterOptions} 
            optionLabel="displayName"
            optionValue="id"
            onChange={onSelectedGlobalFilterChange} 
            style={{ textAlign: 'end' }}
          />
        </div>        
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText 
            type="search" 
            placeholder={GlobalSearchPlaceholder} 
            onInput={onInputGlobalFilter} 
            style={{width: '500px'}}
            value={globalFilter}
          />
        </span>
      </div>
    );
  }

  const apiProductsBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    return APRenderUtils.renderStringListAsDivList(rowData.productDisplayNameList);
  }
  const environmentsBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    return APRenderUtils.renderStringListAsDivList(rowData.environmentDisplayNameList);
  }
  const webhooksBodyTemplate = (rowData: TManagedObjectTableDataRow) => {
    if(!rowData.isAppWebhookCapable) return ('N/A');
    if(rowData.environmentWithWebhookDefinedDisplayNameList.length === 0) return ('None defined.');
    return APRenderUtils.renderStringListAsDivList(rowData.environmentWithWebhookDefinedDisplayNameList);
  }
  const renderManagedObjectDataTable = () => {
    let managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectListToTableDataList(managedObjectList);    
    return (
      <div className="card">
          <DataTable
            ref={managedObjectListDataTableRef}
            className="p-datatable-sm"
            // autoLayout={true}
            resizableColumns 
            columnResizeMode="fit"
            showGridlines={false}
            header={renderDataTableHeader()}
            value={managedObjectTableDataList}
            globalFilter={globalFilter}
            selectionMode="single"
            selection={selectedManagedObject}
            onRowClick={onManagedObjectSelect}
            onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            scrollable 
            scrollHeight="800px" 
            dataKey="appName"  
            // sorting
            sortMode='single'
            sortField="appDisplayName"
            sortOrder={1}
          >
            <Column header="Name" field="appDisplayName" bodyStyle={{ verticalAlign: 'top' }} sortable filterField="globalSearch" />
            <Column header="State" headerStyle={{width: '7em'}} field="apiAppResponse_smf.status" bodyStyle={{ textAlign: 'left', verticalAlign: 'top' }} sortable />
            <Column header="API Products" body={apiProductsBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column header="Environment(s)" body={environmentsBodyTemplate}  bodyStyle={{textAlign: 'left'}}/>
            <Column header="Webhook(s)" body={webhooksBodyTemplate}  bodyStyle={{ verticalAlign: 'top' }}/>
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

  const renderDebug = (): JSX.Element => {
    return (<></>);
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
    <div className="apd-manage-user-apps">

      <APComponentHeader header='My Apps:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderContent()}
      
      {/* DEBUG */}
      {renderDebug()}

    </div>
  );
}
