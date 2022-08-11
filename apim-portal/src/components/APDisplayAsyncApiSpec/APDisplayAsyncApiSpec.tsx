
import React from "react";

import AsyncApiComponent, { ConfigInterface } from "@asyncapi/react-component";

import { Toolbar } from "primereact/toolbar";
import { APButtonDownloadContentAsFile, EApFileExtension } from "../APButtons/APButtonDownloadContentAsFile";
import { EApFileDownloadType } from "../../displayServices/APApiSpecsDisplayService";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { Globals } from "../../utils/Globals";

import "./APDisplayAsyncApiSpec.css"
// import "@asyncapi/react-component/styles/default.css";
// or minified version
import "@asyncapi/react-component/styles/default.min.css";
import "../APComponents.css";

export interface IAPDisplayAsyncApiSpecProps {
  schemaId: string;
  schema: any;
  renderDownloadButtons?: boolean;
  onDownloadError: (apiCallState: TApiCallState) => void;
  onDownloadSuccess: (apiCallState: TApiCallState) => void;
  fetchZipContentsFunc: () => Promise<Blob | undefined>;
}

export const APDisplayAsyncApiSpec: React.FC<IAPDisplayAsyncApiSpecProps> = (props: IAPDisplayAsyncApiSpecProps) => {
  const componentName='APDisplayAsyncApiSpec';

  const ToolbarButtonLabel_DownloadJson = 'Download JSON';
  const ToolbarButtonLabel_DownloadYaml = 'Download YAML';
  const ToolbarButtonLabel_DownloadZip = 'Download Assets(zip)';
  const renderDownloadButtons: boolean = props.renderDownloadButtons !== undefined ? props.renderDownloadButtons : true;
  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // create a copy of the schema to pass to the react render component, it modifies it
  const [schemaCopy] = React.useState<any>(JSON.parse(JSON.stringify(props.schema)));

  const config: ConfigInterface = {
    schemaID: props.schemaId,
    show: {
      // sidebar: true,
      info: true,
      servers: true,
      operations: true,
      // messages: false,
      messages: true,
      schemas: true,
      errors: true,
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

  const getFileName = (name: string, fileExtension: EApFileExtension): string => {
    return `${name}.${fileExtension}`;
  }

  const renderToolbar = () => {
    if(!renderDownloadButtons) return (<></>);
    const jsonFileName: string = getFileName(props.schemaId, EApFileExtension.JSON);
    const yamlFileName: string = getFileName(props.schemaId, EApFileExtension.YAML);
    const zipFileName: string = getFileName(props.schemaId, EApFileExtension.ZIP);
    const buttonClassName: string = "p-button-text p-button-plain p-button-outlined";
    let jsxButtonList: Array<JSX.Element> = [
      <APButtonDownloadContentAsFile 
        key={`${componentName}_json`}
        buttonLabel={ToolbarButtonLabel_DownloadJson}
        buttonClassName={buttonClassName}
        jsonContentObject={props.schema}
        fileName={jsonFileName}
        fileContentType={EApFileDownloadType.JSON}
        initialCallState={ApiCallState.getInitialCallState('ASYNC_API_SPEC_DOWNLOAD', `download async api spec to ${jsonFileName}`)}
        onSuccess={props.onDownloadSuccess}
        onError={onDownloadError}
      />,
      <APButtonDownloadContentAsFile 
        key={`${componentName}_yaml`}
        buttonLabel={ToolbarButtonLabel_DownloadYaml}
        buttonClassName={buttonClassName}
        jsonContentObject={props.schema}
        fileName={yamlFileName}
        fileContentType={EApFileDownloadType.YAML}
        initialCallState={ApiCallState.getInitialCallState('ASYNC_API_SPEC_DOWNLOAD', `download async api spec to ${yamlFileName}`)}
        onSuccess={props.onDownloadSuccess}
        onError={onDownloadError}
      />,
    ];
    if(props.fetchZipContentsFunc !== undefined) {
      jsxButtonList.push(
        <APButtonDownloadContentAsFile 
          key={`${componentName}_zip`}
          buttonLabel={ToolbarButtonLabel_DownloadZip}
          buttonClassName={buttonClassName}
          jsonContentObject={undefined}
          fetchZipContentsFunc={props.fetchZipContentsFunc}
          fileName={zipFileName}
          fileContentType={EApFileDownloadType.ZIP}
          initialCallState={ApiCallState.getInitialCallState('ASYNC_API_SPEC_DOWNLOAD', `download async api spec assets to ${zipFileName}`)}
          onSuccess={props.onDownloadSuccess}
          onError={onDownloadError}
        />,
      );
    }
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none', 'paddingTop': '1rem', 'paddingBottom': '0rem', 'marginBottom': '0rem !important' } } right={jsxButtonList} />      
    );
  }


  return (
    <div className='ap-display-asyncapispec'>
      
      { renderToolbar() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="ap-async-api-component" >
        <AsyncApiComponent 
          schema={schemaCopy} 
          config={config} 
        />    
      </div>
      
      {/* <hr/>        
      <pre style={ { fontSize: '12px' }} >
        {JSON.stringify(props.schema, null, 2)}
      </pre> */}

    </div>
  );
}
