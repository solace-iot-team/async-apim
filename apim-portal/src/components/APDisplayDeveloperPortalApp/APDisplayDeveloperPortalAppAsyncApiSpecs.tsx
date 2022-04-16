
import React from "react";

import { Divider } from "primereact/divider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { APDisplayAsyncApiSpec } from "../APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import APEntityIdsService, { TAPEntityId } from "../../utils/APEntityIdsService";
import APApiSpecsDisplayService, { TAPApiSpecDisplay } from "../../displayServices/APApiSpecsDisplayService";
import { TAPAppApiDisplay, TAPAppApiDisplayList } from "../../displayServices/APAppsDisplayService/APAppApisDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalAppAsyncApiSpecsProps {
  organizationId: string;
  appId: string;
  apAppApiDisplayList: TAPAppApiDisplayList;
  label: string;
  className?: string;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const APDisplayDeveloperPortalAppAsyncApiSpecs: React.FC<IAPDisplayDeveloperPortalAppAsyncApiSpecsProps> = (props: IAPDisplayDeveloperPortalAppAsyncApiSpecsProps) => {
  const ComponentName = 'APDisplayDeveloperPortalAppAsyncApiSpecs';

  enum E_CALL_STATE_ACTIONS {
    API_GET_APP_API = 'API_GET_APP_API'
  }
  
  const [selectedApAppApiDisplay, setSelectedApAppApiDisplay] = React.useState<TAPAppApiDisplay>();
  const [showApiEntityId, setShowApiEntityId] = React.useState<TAPEntityId>();
  const [showApiSpec, setShowApiSpec] = React.useState<TAPApiSpecDisplay>();
  const [showApiSpecRefreshCounter, setShowApiSpecRefreshCounter] = React.useState<number>(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dataTableRef = React.useRef<any>(null);

  const apiGetAppApi = async(apiEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiGetAppApi';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_API, `retrieve api spec: ${apiEntityId.displayName}`);
    try { 
      const apiSpec: TAPApiSpecDisplay = await APApiSpecsDisplayService.apiGet_App_ApiSpec({
        organizationId: props.organizationId,
        appId: props.appId,
        apiEntityId: apiEntityId,
      });
      setShowApiSpec(apiSpec);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doFetchAppApi = async (apiEntityId: TAPEntityId) => {
    props.onLoadingChange(true);
    await apiGetAppApi(apiEntityId);
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(showApiEntityId === undefined) return;
    doFetchAppApi(showApiEntityId);
  }, [showApiEntityId]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(showApiSpec === undefined) return;
    setShowApiSpecRefreshCounter(showApiSpecRefreshCounter + 1);
  }, [showApiSpec]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onDownloadSuccess = (apiCallStatus: ApiCallState) => {
    // placeholder
  }

  const onApAppApiDisplaySelect = (event: any): void => {
    setSelectedApAppApiDisplay(event.data);
  }  

  const onApAppApiDisplayOpen = (event: any): void => {
    const apAppApiDisplay: TAPAppApiDisplay = event.data as TAPAppApiDisplay;
    setShowApiEntityId(apAppApiDisplay.apEntityId);
  }

  const renderComponent = (): JSX.Element => {
    const rowGroupHeaderTemplate = (row: TAPAppApiDisplay) => {
      return(<span className="p-text-bold">API Product: {row.apApiProductEntityId.displayName}</span>);
    }  
    const rowGroupFooterTemplate = (row: TAPAppApiDisplay) => { return(<></>); }
  
    const dataKey = `${APDisplayUtils.nameOf<TAPAppApiDisplay>('apEntityId')}.${APEntityIdsService.nameOf('id')}`;
    const sortField = `${APDisplayUtils.nameOf<TAPAppApiDisplay>('apEntityId')}.${APEntityIdsService.nameOf('displayName')}`;
    const groupField = `${APDisplayUtils.nameOf<TAPAppApiDisplay>('apApiProductEntityId')}.${APEntityIdsService.nameOf('displayName')}`;
    const apiField = `${APDisplayUtils.nameOf<TAPAppApiDisplay>('apEntityId')}.${APEntityIdsService.nameOf('displayName')}`;
    const versionField = APDisplayUtils.nameOf<TAPAppApiDisplay>('apVersion');

    return (
      <DataTable
        className="p-datatable-sm"
        ref={dataTableRef}
        header={props.label}
        value={props.apAppApiDisplayList}
        dataKey={dataKey}
        sortMode="single" 
        sortField={sortField} 
        sortOrder={1}
        scrollable 
        scrollHeight="200px" 
        resizableColumns 
        columnResizeMode="fit"
        groupField={groupField}
        rowGroupMode="subheader"
        // groupRowsBy={sortField} <- the new version?
        rowGroupHeaderTemplate={rowGroupHeaderTemplate}
        rowGroupFooterTemplate={rowGroupFooterTemplate}

        selectionMode="single"
        selection={selectedApAppApiDisplay}
        onRowClick={onApAppApiDisplaySelect}
        onRowDoubleClick={(e) => onApAppApiDisplayOpen(e)}
      >
        <Column header="API" field={apiField} sortable />
        <Column header="Version" field={versionField} style={{width: '10em', textAlign: 'center'}} />
      </DataTable>
    );
  }

  return (
    <React.Fragment>
      <div className={props.className ? props.className : 'card'}>
        {/* <div className="p-mt-4 p-mb-4"><b>{props.label}</b></div> */}
        {renderComponent()}
      </div>

      {showApiSpec && showApiEntityId &&
        <React.Fragment>
          <Divider/>        
          <APDisplayAsyncApiSpec 
            key={`${ComponentName}_APDisplayAsyncApiSpec_${showApiSpecRefreshCounter}`}
            schema={showApiSpec.spec} 
            schemaId={showApiEntityId.id} 
            onDownloadSuccess={onDownloadSuccess}
            onDownloadError={props.onError}
          />
        </React.Fragment> 
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {/* DEBUG */}
      {/* <pre style={ { fontSize: '8px' }} >
        {JSON.stringify(managedObjectDisplay, null, 2)}
      </pre> */}

    </React.Fragment> 
  );
}