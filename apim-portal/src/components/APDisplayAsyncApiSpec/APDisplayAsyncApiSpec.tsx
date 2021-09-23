
import React from "react";

import AsyncApiComponent, { ConfigInterface } from "@asyncapi/react-component";

// import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { APButtonDownloadContentAsFile } from "../APButtons/APButtonDownloadContentAsFile";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { EFileDownloadType, EFileExtension } from "../APComponentsCommon";

import "@asyncapi/react-component/styles/default.css";
// or minified version
// import "@asyncapi/react-component/styles/default.min.css";
import "../APComponents.css";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { Globals } from "../../utils/Globals";

export interface IAPDisplayAsyncApiSpecProps {
  schemaId: string,
  schema: any,
  onDownloadError: (apiCallState: TApiCallState) => void;
  onDownloadSuccess: (apiCallState: TApiCallState) => void;
}

export const APDisplayAsyncApiSpec: React.FC<IAPDisplayAsyncApiSpecProps> = (props: IAPDisplayAsyncApiSpecProps) => {
  const componentName='APDisplayAsyncApiSpec';

  const ToolbarButtonLabel_DownloadJson = 'Download JSON';
  const ToolbarButtonLabel_DownloadYaml = 'Download YAML';
  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const config: ConfigInterface = {
    schemaID: props.schemaId,
    show: {
      sidebar: false,
      info: true,
      servers: true,
      operations: true,
      messages: false,
      schemas: true,
      errors: false,
    },
    sidebar: {
      showOperations: 'byOperationsTags'
    }
  };

  const onDownloadError = (callState: TApiCallState) => {
    const funcName = 'onDownloadError';
    const logName = `${componentName}.${funcName}()`;
    Globals.logError(logName, callState);
    setApiCallStatus(callState);
    props.onDownloadError(callState);
  }

  const getFileName = (name: string, fileExtension: EFileExtension): string => {
    return `${name}.${fileExtension}`;
  }

  const renderToolbar = () => {
    const jsonFileName: string = getFileName(props.schemaId, EFileExtension.JSON);
    const yamlFileName: string = getFileName(props.schemaId, EFileExtension.YAML);
    const buttonClassName: string = "p-button-text p-button-plain p-button-outlined";
    let jsxButtonList: Array<JSX.Element> = [
      <APButtonDownloadContentAsFile 
        buttonLabel={ToolbarButtonLabel_DownloadJson}
        buttonClassName={buttonClassName}
        jsonContentObject={props.schema}
        fileName={jsonFileName}
        fileContentType={EFileDownloadType.JSON}
        initialCallState={ApiCallState.getInitialCallState('ASYNC_API_SPEC_DOWNLOAD', `download async api spec to ${jsonFileName}`)}
        onSuccess={props.onDownloadSuccess}
        onError={onDownloadError}
      />,
      <APButtonDownloadContentAsFile 
        buttonLabel={ToolbarButtonLabel_DownloadYaml}
        buttonClassName={buttonClassName}
        jsonContentObject={props.schema}
        fileName={yamlFileName}
        fileContentType={EFileDownloadType.YAML}
        initialCallState={ApiCallState.getInitialCallState('ASYNC_API_SPEC_DOWNLOAD', `download async api spec to ${yamlFileName}`)}
        onSuccess={props.onDownloadSuccess}
        onError={onDownloadError}
      />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none', 'paddingTop': '1rem', 'paddingBottom': '0rem', 'marginBottom': '0rem !important' } } right={jsxButtonList} />      
    );
  }


  return (
    <div className='ap-display-asyncapispec'>
      
      { renderToolbar() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <AsyncApiComponent schema={props.schema} config={config} />    
      
      {/* <hr/>        
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(props.schema, null, 2)}
      </pre> */}

    </div>
  );
}
