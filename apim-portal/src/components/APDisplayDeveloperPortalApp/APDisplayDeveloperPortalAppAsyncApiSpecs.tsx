
import React from "react";

import { Divider } from "primereact/divider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { APDisplayAsyncApiSpec } from "../APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import APEntityIdsService, { TAPEntityId } from "../../utils/APEntityIdsService";
import { TAPAppApiDisplay, TAPAppApiDisplayList } from "../../displayServices/APAppsDisplayService/APAppApisDisplayService";
import APDisplayUtils from "../../displayServices/APDisplayUtils";
import APApiSpecsDisplayService, { TAPApiSpecDisplay } from "../../displayServices/APApiSpecsDisplayService";

import "../APComponents.css";

export interface IAPDisplayDeveloperPortalAppAsyncApiSpecsProps {
  organizationId: string;
  appId: string;
  apAppApiDisplayList: TAPAppApiDisplayList;
  tableHeader?: string;
  noApisMessage?: string;
  className?: string;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const APDisplayDeveloperPortalAppAsyncApiSpecs: React.FC<IAPDisplayDeveloperPortalAppAsyncApiSpecsProps> = (props: IAPDisplayDeveloperPortalAppAsyncApiSpecsProps) => {
  const ComponentName = 'APDisplayDeveloperPortalAppAsyncApiSpecs';

  enum E_CALL_STATE_ACTIONS {
    API_GET_APP_API = 'API_GET_APP_API'
  }
  
  const DefaultTableHeader = "Double Click to view API";
  const TableHeader = props.tableHeader ? props.tableHeader : DefaultTableHeader;
  const DefaultNoApisMessage = "No Async APIs available.";
  const NoApisMessage = props.noApisMessage ? props.noApisMessage : DefaultNoApisMessage;

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

  const apiBodyTemplate = (row: TAPAppApiDisplay) => {
    return (<div className="p-ml-2">Async API: {row.apEntityId.displayName}</div>)
  }
  const stateTemplate = (row: TAPAppApiDisplay): string => {
    return row.apLifecycleStageInfo.stage;
  }
  const notesTemplate = (row: TAPAppApiDisplay): JSX.Element => {
    if(row.apLifecycleStageInfo.notes) {
      return (
        <div>
          { row.apLifecycleStageInfo.notes }
        </div>
      );
    }
    return (<>-</>);
  }
  const renderComponent = (): JSX.Element => {
    const rowGroupHeaderTemplate = (row: TAPAppApiDisplay) => {
      return(<span className="p-text-bold">API Product: {row.apApiProductEntityId.displayName}</span>);
    }  
    const rowGroupFooterTemplate = (row: TAPAppApiDisplay) => { return(<></>); }
  
    const dataKey = `${APDisplayUtils.nameOf<TAPAppApiDisplay>('apEntityId')}.${APEntityIdsService.nameOf('id')}`;
    const groupField = `${APDisplayUtils.nameOf<TAPAppApiDisplay>('apApiProductEntityId')}.${APEntityIdsService.nameOf('id')}`;
    const apiField = `${APDisplayUtils.nameOf<TAPAppApiDisplay>('apEntityId')}.${APEntityIdsService.nameOf('displayName')}`;
    const versionField = APDisplayUtils.nameOf<TAPAppApiDisplay>('apVersion');

    return (
      <DataTable
        className="p-datatable-sm"
        ref={dataTableRef}
        header={TableHeader}
        value={props.apAppApiDisplayList}
        dataKey={dataKey}
        sortMode="single" 
        sortField={apiField} 
        sortOrder={1}
        scrollable 
        // scrollHeight="200px" 
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
        <Column header="API" body={apiBodyTemplate} field={apiField} sortable />
        <Column header="Version" field={versionField} style={{width: '10em', textAlign: 'center'}} />
        <Column header="State" body={stateTemplate} style={{width: '10em', textAlign: 'left'}}  />
        <Column header="Notes" body={notesTemplate} />
      </DataTable>
    );
  }

  return (
    <React.Fragment>
      <div className={props.className ? props.className : 'card'}>
        { props.apAppApiDisplayList.length > 0 &&
          renderComponent()
        }
        { props.apAppApiDisplayList.length === 0 &&
          <div>{NoApisMessage}</div>
        }
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

    </React.Fragment> 
  );
}
