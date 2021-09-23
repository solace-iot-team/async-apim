import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FileUpload, FileUploadBeforeUploadParams, FileUploadErrorParams, FileUploadHandlerParam } from 'primereact/fileupload';

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { EAPAsyncApiSpecFormat, TAPAsyncApiSpec } from "../../../components/APComponentsCommon";

import '../../../components/APComponents.css';
import "./ManageApis.css";
import { E_CALL_STATE_ACTIONS } from "./ManageApisCommon";

export interface IUploadApiSpecFromFileProps {
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, apiSpec: TAPAsyncApiSpec) => void;
  onCancel: () => void;
}

export const UploadApiSpecFromFile: React.FC<IUploadApiSpecFromFileProps> = (props: IUploadApiSpecFromFileProps) => {
  const componentName = 'UploadApiSpecFromFile';

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const fileUploadRef = React.useRef(null);
  // const [showSelectDialog, setShowSelectDialog] = React.useState<boolean>(true);
  // const [selectedApiProductItemList, setSelectedApiProductItemList] = React.useState<TApiProductSelectItemList>([]);

  // * useEffect Hooks *
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onSaveUploadedFile = () => {
    const fileName = 'fake.filename.yml';
    const spec: TAPAsyncApiSpec = {
      format: EAPAsyncApiSpecFormat.JSON,
      spec: '{"hello":"world"}'
    }
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.FILE_UPLOAD_API, `upload file: ${fileName}`);
    props.onSave(callState, spec);
  }


  
  const handleFileUpload = (event: FileUploadHandlerParam) => {
    const funcName = 'handleFileUpload';
    const logName = `${componentName}.${funcName}()`;
    alert(`${logName}: event.files=${JSON.stringify(event.files, null, 2)}`);
  }

  const onBeforeFileUpload = (event: FileUploadBeforeUploadParams) => {
    const funcName = 'onBeforeFileUpload';
    const logName = `${componentName}.${funcName}()`;
    alert(`${logName}: event.formData=${JSON.stringify(event.formData, null, 2)}`);
  }

  const onFileUploadError = (event: FileUploadErrorParams) => {
    alert(`error: ${JSON.stringify(event.files)}`)
  }
  const renderSelectDialogContent = (): JSX.Element => {
    // const funcName = 'renderDeleteManagedObjectDialogContent';
    // const logName = `${componentName}.${funcName}()`;
    return (
      <React.Fragment>
        {/* https://www.pluralsight.com/guides/uploading-files-with-reactjs */}
        <p>implement me...</p>
        {/* <FileUpload
          ref={fileUploadRef}
          name={componentName}
          mode='basic'
          url={`./${componentName}`}
          accept='.yaml,.yml,.json'
          customUpload={false}
          uploadHandler={handleFileUpload}
          onBeforeUpload={onBeforeFileUpload}
          onError={onFileUploadError}
        /> */}
        {/* DEBUG  */}
        {/* <pre style={ { fontSize: '10px' }} >props: {JSON.stringify(props)}</pre> */}
        {/* <DeveloperPortalUserAppSearchSelectApiProducts 
          organizationId={props.organizationId}
          userId={props.userId}
          currentSelectedApiProductItemList={props.currentSelectedApiProductItemList}
          onError={props.onError}
          onSave={props.onSave}
          onCancel={props.onCancel}
          onLoadingChange={props.onLoadingChange}
        /> */}
      </React.Fragment>  
    );
  }

  const renderSelectDialogFooter = (): JSX.Element =>{
    return (
      <React.Fragment>
          <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
          <Button type="button" label="Save" className="p-button-text p-button-plain p-button-outlined" onClick={onSaveUploadedFile} />
      </React.Fragment>
    );
  } 

  const renderSelectDialog = (): JSX.Element => {
    return (
      <Dialog
        className="p-fluid"
        visible={true} 
        style={{ width: '80%', height: '50rem' }} 
        modal
        closable={false}
        onHide={()=> {}}
        footer={renderSelectDialogFooter()}
        >
        <div className="manage-apis upload-from-file-dialog-content">
            {renderSelectDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-apis">
      {renderSelectDialog()}
    </div>
  );
}
