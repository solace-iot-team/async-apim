
import React from "react";

import { Button } from "primereact/button";

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { Globals } from "../../utils/Globals";
import { EApFileDownloadType } from "../../displayServices/APApiSpecsDisplayService";

import "../APComponents.css";

export enum EApFileExtension {
  JSON='json',
  YAML='yaml',
  ZIP='zip'
}

export interface IAPButtonDownloadContentAsFileProps {
  buttonLabel: string;
  buttonClassName: string;
  jsonContentObject: any;
  fetchZipContentsFunc?: () => Promise<Blob | undefined>;
  fileName: string;
  fileContentType: EApFileDownloadType;
  initialCallState: TApiCallState;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
}

export const APButtonDownloadContentAsFile: React.FC<IAPButtonDownloadContentAsFileProps> = (props: IAPButtonDownloadContentAsFileProps) => {
  const ComponentName = 'APButtonDownloadContentAsFile';

  const validateProps = () => {
    const funcName = 'validateProps';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.jsonContentObject === undefined && props.fetchZipContentsFunc === undefined) throw new Error(`${logName}: props.jsonContentObject === undefined && props.fetchZipContentsFunc === undefined`);
  }

  React.useEffect(() => {
    validateProps();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const str2bytes = (str: string): Uint8Array => {
    var bytes = new Uint8Array(str.length);
    for (var i=0; i<str.length; i++) {
       bytes[i] = str.charCodeAt(i);
     }
     return bytes;
  }

  const getFormattedContent = (content: any, downloadType: EApFileDownloadType): string | Uint8Array => {
    const funcName = 'getFormattedContent';
    const logName = `${ComponentName}.${funcName}()`;
    switch(downloadType) {
      case EApFileDownloadType.JSON:
        return JSON.stringify(content, null, 2);
      case EApFileDownloadType.YAML:
        return Globals.getObjectAsDisplayYamlString(content);
      case EApFileDownloadType.ZIP:
        // return str2bytes(content);
        return content;
      default:
        return Globals.assertNever(logName, downloadType);
    }
  }

  const createBlobUrl = (content: any): string | undefined => {
    // const funcName = 'createBlobUrl';
    // const logName = `${componentName}.${funcName}()`;
    try {
      const blob: Blob = new Blob([getFormattedContent(content, props.fileContentType)], {type: props.fileContentType});
      const url: string = URL.createObjectURL(blob);
      // throw new Error(`${logName}: testing error handler`);
      return url;
    } catch(e: any) {
      const callState: TApiCallState = ApiCallState.addErrorToApiCallState(e, props.initialCallState);
      props.onError(callState);
      return undefined;
    }
  }
  
  const doDownload = async() => {
    const funcName = 'doDownload';
    const logName = `${ComponentName}.${funcName}()`;
    let content: any = props.jsonContentObject;
    if(props.jsonContentObject === undefined) {
      if(props.fetchZipContentsFunc === undefined) throw new Error(`${logName}: props.fetchZipContentsFunc === undefined`);
      const blob: Blob | undefined = await props.fetchZipContentsFunc();
      if(blob === undefined) return;
      content = blob;
    } 
    const blobUrl = createBlobUrl(content);
    if(blobUrl) saveToFile(blobUrl, props.fileName);  
  }

  const onDownload = () => {
    doDownload();
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
