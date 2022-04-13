
import React from "react";

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Divider } from "primereact/divider";

import { AppsService } from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { TAPOrganizationId } from "../APComponentsCommon";
import { APDisplayAsyncApiSpec } from "../APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";

import "../APComponents.css";

export interface IAPDisplayAppAsyncApisProps {
  organizationId: TAPOrganizationId,
  appId: string;
  appDisplayName: string;
  label: string;
  className?: string;
  buttonStyle?: React.CSSProperties;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const APDisplayAppAsyncApis: React.FC<IAPDisplayAppAsyncApisProps> = (props: IAPDisplayAppAsyncApisProps) => {
  const componentName='APDisplayAppAsyncApis';

  const defaultButtonStyle: React.CSSProperties = {
    whiteSpace: 'nowrap', 
    // padding: 'unset', 
    // width: 'unset' 
  }

  enum E_CALL_STATE_ACTIONS {
    API_GET_APP_API_LIST = "API_GET_APP_API_LIST",
    API_GET_APP_API = 'API_GET_APP_API'
  }
  
  type TManagedObjectDisplay = {
    appApiNameList: Array<string>
  }

  const [managedObjectDisplay, setManagedObjectDisplay] = React.useState<TManagedObjectDisplay>();  
  const [selectedApiId, setSelectedApiId] = React.useState<string>();
  const [selectedApiSpec, setSelectedApiSpec] = React.useState<any>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const apiGetManagedObjectDisplay = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectDisplay';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_API_LIST, `retrieve api list for app: ${props.appDisplayName}`);
    try { 
      const apiAppApiNameList: Array<string> = await AppsService.listAppApiSpecifications({
        organizationName: props.organizationId,
        appName: props.appId
      });
      const _mod: TManagedObjectDisplay = {
        appApiNameList: apiAppApiNameList
      }
      setManagedObjectDisplay(_mod);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetAppApi = async(apiId: string, apiDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetAppApi';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP_API, `retrieve api spec: ${apiDisplayName}`);
    try { 
      const apiSpec: any = await AppsService.getAppApiSpecification({
        organizationName: props.organizationId,
        appName: props.appId,
        apiName: apiId,
        format: "application/json"
      });
      setSelectedApiSpec(apiSpec);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectDisplay();
    props.onLoadingChange(false);
  }

  const doFetchAppApi = async (apiId: string) => {
    props.onLoadingChange(true);
    await apiGetAppApi(apiId, apiId);
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(selectedApiId) doFetchAppApi(selectedApiId);
  }, [selectedApiId]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onDownloadSuccess = (apiCallStatus: ApiCallState) => {
    // placeholder
  }

  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${componentName}.${funcName}()`;

    const onClick = (event: any): void => {
      setSelectedApiId(event.currentTarget.dataset.id);
    }
    const renderButtons = () => {
      return (
        <div className="p-grid">
          {jsxButtonList}
        </div>
      );
    }

    if(!managedObjectDisplay) throw new Error(`${logName}: managedObjectDisplay is undefined`);

    let buttonStyle: React.CSSProperties;
    if(props.buttonStyle) buttonStyle = props.buttonStyle;
    else buttonStyle = defaultButtonStyle;
    let jsxButtonList: Array<JSX.Element> = [];
    for (const apiId of managedObjectDisplay.appApiNameList) {
      jsxButtonList.push(
        <Button 
          label={apiId} 
          key={componentName + apiId} 
          data-id={apiId} 
          // icon="pi pi-folder-open" 
          // className="p-button-text p-button-plain p-button-outlined p-button-rounded" 
          className="p-button-text p-button-plain p-button-outlined" 
          style={buttonStyle}          
          onClick={onClick}
        />        
      );
    }
    return (
      <Toolbar         
        style={{ 
          background: 'none',
          border: 'none'
        }} 
        left={renderButtons()}
      />
    );
  }

  return (
    <React.Fragment>
      <div className={props.className ? props.className : 'card'}>
        <b>{props.label}</b>:&nbsp;
        {managedObjectDisplay && renderComponent()}
      </div>

      {selectedApiSpec && selectedApiId &&
        <React.Fragment>
          <Divider/>        
          <APDisplayAsyncApiSpec 
            schema={selectedApiSpec} 
            schemaId={selectedApiId} 
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
