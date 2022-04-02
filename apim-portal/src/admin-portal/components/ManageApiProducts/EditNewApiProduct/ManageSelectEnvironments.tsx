
import React from "react";

import { Dialog } from 'primereact/dialog';

import { TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { 
  TAPEnvironmentDisplayList 
} from "../../../../displayServices/APEnvironmentsDisplayService";
import { TApiCallState } from "../../../../utils/ApiCallState";
import { SearchSelectEnvironments } from "./SearchSelectEnvironments";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IManageSelectEnvironmentsProps {
  organizationId: string;  
  selectedEnvironmentEntityIdList: TAPEntityIdList;
  onSave: (apEnvironmentDisplayList: TAPEnvironmentDisplayList) => void;
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ManageSelectEnvironments: React.FC<IManageSelectEnvironmentsProps> = (props: IManageSelectEnvironmentsProps) => {
  // const ComponentName = 'ManageSelectEnvironments';

  const renderSelectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <SearchSelectEnvironments
          organizationId={props.organizationId}
          selectedEnvironmentEntityIdList={props.selectedEnvironmentEntityIdList}
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
