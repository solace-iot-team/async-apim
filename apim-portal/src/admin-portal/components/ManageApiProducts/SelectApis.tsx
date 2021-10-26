
import React from "react";

import { Dialog } from 'primereact/dialog';
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TApiCallState } from "../../../utils/ApiCallState";
import { TApiEntitySelectItemList, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { SearchSelectApis } from "./SearchSelectApis";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface ISelectApisProps {
  organizationId: TAPOrganizationId,
  currentSelectedApiItemList: TApiEntitySelectItemList,
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, modifiedSelectedApiItemList: TApiEntitySelectItemList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SelectApis: React.FC<ISelectApisProps> = (props: ISelectApisProps) => {
  const componentName = 'SelectApis';

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * useEffect Hooks *
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderSelectDialogContent = (): JSX.Element => {
    // const funcName = 'renderDeleteManagedObjectDialogContent';
    // const logName = `${componentName}.${funcName}()`;
    return (
      <React.Fragment>
        {/* <p>currentSelectedApiItemList={JSON.stringify(props.currentSelectedApiItemList, null, 2)}</p> */}
        <SearchSelectApis 
          organizationId={props.organizationId}
          currentSelectedApiItemList={props.currentSelectedApiItemList}
          onError={props.onError}
          onSave={props.onSave}
          onCancel={props.onCancel}
          onLoadingChange={props.onLoadingChange}
        />
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
      >
        <div className="manage-api-products select-apis-dialog-content">
            {renderSelectDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-api-products">
      {renderSelectDialog()}
    </div>
  );
}
