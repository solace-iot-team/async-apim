
import React from "react";

import { Dialog } from 'primereact/dialog';
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TApiCallState } from "../../../utils/ApiCallState";
import { TApiEntitySelectItemList, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { SearchSelectApis } from "./SearchSelectApis";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";
import { SearchSelectEnvironments } from "./SearchSelectEnvironments";

export interface ISelectEnvironmentsProps {
  organizationId: TAPOrganizationId,  
  currentSelectedEnvironmentItemList: TApiEntitySelectItemList,
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, modifiedSelectedApiItemList: TApiEntitySelectItemList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SelectEnvironments: React.FC<ISelectEnvironmentsProps> = (props: ISelectEnvironmentsProps) => {
  const componentName = 'SelectEnvironments';

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
        <SearchSelectEnvironments
          organizationId={props.organizationId}
          currentSelectedEnvironmetItemList={props.currentSelectedEnvironmentItemList}
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
        <div className="manage-api-products select-environments-dialog-content">
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
