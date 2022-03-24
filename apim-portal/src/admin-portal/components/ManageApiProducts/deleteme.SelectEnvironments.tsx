
import React from "react";

import { Dialog } from 'primereact/dialog';

import { TApiCallState } from "../../../utils/ApiCallState";
import { SearchSelectEnvironments } from "./deleteme.SearchSelectEnvironments";
import { TAPEntityIdList } from "../../../utils/APEntityIdsService";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface ISelectEnvironmentsProps {
  organizationId: string;  
  currentSelectedEnvironmentEntityIdList: TAPEntityIdList;
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, modifiedSelectedApiItemList: TAPEntityIdList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SelectEnvironments: React.FC<ISelectEnvironmentsProps> = (props: ISelectEnvironmentsProps) => {
  // const componentName = 'SelectEnvironments';

  const renderSelectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <SearchSelectEnvironments
          organizationId={props.organizationId}
          currentSelectedEnvironmentEntityIdList={props.currentSelectedEnvironmentEntityIdList}
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
        closable={true}
        onHide={() => { props.onCancel(); }}
      >
        <div className="manage-api-products select-environments-dialog-content">
          {renderSelectDialogContent()}
        </div>
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-api-products">
      {renderSelectDialog()}
    </div>
  );
}
