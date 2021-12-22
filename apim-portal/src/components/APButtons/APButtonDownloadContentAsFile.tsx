
import React from "react";

import { Button } from "primereact/button";

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { EFileDownloadType } from "../APComponentsCommon";
import { Globals } from "../../utils/Globals";

import "../APComponents.css";

export interface IAPButtonDownloadContentAsFileProps {
  buttonLabel: string,
  buttonClassName: string,
  jsonContentObject: any,
  fileName: string,
  fileContentType: EFileDownloadType
  initialCallState: TApiCallState,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
}

export const APButtonDownloadContentAsFile: React.FC<IAPButtonDownloadContentAsFileProps> = (props: IAPButtonDownloadContentAsFileProps) => {
  const componentName = 'APButtonDownloadContentAsFile';

  const saveToFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    if(typeof(link.download) === 'string') {
      document.body.appendChild(link);
      link.download = fileName;
      link.href = url;
      link.click();
      document.body.removeChild(link);
    } else {
      window.location.replace(url);
    }
    props.onSuccess(props.initialCallState);
  }

  const getFormattedContent = (jsonObject: any, downloadType: EFileDownloadType): string => {
    const funcName = 'getFormattedContent';
    const logName = `${componentName}.${funcName}()`;
    switch(downloadType) {
      case EFileDownloadType.JSON:
        return JSON.stringify(jsonObject, null, 2);
      case EFileDownloadType.YAML:
        return Globals.getObjectAsDisplayYamlString(jsonObject);
      default:
        return Globals.assertNever(logName, downloadType);
    }
  }

  const createBlobUrl = (): string | undefined => {
    // const funcName = 'createBlobUrl';
    // const logName = `${componentName}.${funcName}()`;
    try {
      const blob: Blob = new Blob([getFormattedContent(props.jsonContentObject, props.fileContentType)], {type: props.fileContentType});
      const url: string = URL.createObjectURL(blob);
      // throw new Error(`${logName}: testing error handler`);
      return url;
    } catch(e: any) {
      const callState: TApiCallState = ApiCallState.addErrorToApiCallState(e, props.initialCallState);
      props.onError(callState);
      return undefined;
    }
  }
  
  const onDownload = () => {
    const blobUrl = createBlobUrl();
    if(blobUrl) saveToFile(blobUrl, props.fileName);
  }

  const renderContent = () => {

    return (
      <Button 
        type="button" 
        label={props.buttonLabel} 
        className={props.buttonClassName} 
        onClick={() => onDownload()} 
      />
    );

  }


  return (
    <div className='ap-button'>
      
      { renderContent() }

    </div>
  );
}
