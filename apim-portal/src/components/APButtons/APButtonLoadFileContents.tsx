
import React from "react";

import { FileUpload, FileUploadBeforeSendParams, FileUploadErrorParams, FileUploadOptionsType } from "primereact/fileupload";
import { TApiCallState } from "../../utils/ApiCallState";

import "../APComponents.css";

export interface IAPButtonLoadFileContentsProps {
  buttonLabel: string,
  buttonIcon: string,
  buttonClassName: string,
  acceptFileExtensionList: Array<string>
  maxFileSize?: number,
  initialCallState: TApiCallState,
  onSuccess: (apiCallState: TApiCallState, fileContents: any) => void;
  onError: (apiCallState: TApiCallState) => void;
}

export const APButtonLoadFileContents: React.FC<IAPButtonLoadFileContentsProps> = (props: IAPButtonLoadFileContentsProps) => {
  const componentName = 'APButtonLoadFileContents';

  const defaultMaxFileSize: number = 100000;
  const [maxFileSize, setMaxFileSize] = React.useState<number>(defaultMaxFileSize);
  const [fileContents, setFileContents] = React.useState<any>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  React.useEffect(() => {
    if(props.maxFileSize) setMaxFileSize(props.maxFileSize);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(fileContents === undefined) return;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) return props.onError(apiCallStatus);
      return props.onSuccess(apiCallStatus, fileContents);
    }
  }, [apiCallStatus, fileContents]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onBeforeSend = async (event: FileUploadBeforeSendParams) => {
    // const funcName = 'onBeforeSend';
    // const logName = `${componentName}.${funcName}()`;
    for(const key of event.formData.keys()) {
      const file = event.formData.get(key) as File;
      const fileContents: string = await file.text();
      setFileContents(fileContents);
    }    
    // this will cause the onError handler to fire
    event.xhr.abort();
  }
  
  // called onError
  const onFinished = (_event: FileUploadErrorParams) => {
    setApiCallStatus(props.initialCallState);
  }

  const createAcceptFileExtensionsStr = (): string => {
    return props.acceptFileExtensionList.join(',');
  }

  const createChooseOptions = (): FileUploadOptionsType => {
    return {
      label: props.buttonLabel,
      icon: props.buttonIcon,
      className: props.buttonClassName,
    }
  }

  return (
    <div className='ap-button'>      
      <FileUpload 
        mode="basic" 
        name={componentName} 
        accept={createAcceptFileExtensionsStr()}
        maxFileSize={maxFileSize} 
        onBeforeSend={onBeforeSend}
        onError={onFinished}
        auto 
        chooseOptions={createChooseOptions()}
      />
    </div>
  );
}
