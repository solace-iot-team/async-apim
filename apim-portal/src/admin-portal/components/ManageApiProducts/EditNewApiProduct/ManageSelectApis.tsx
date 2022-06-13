
import React from "react";

import { Dialog } from 'primereact/dialog';

import { TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { TApiCallState } from "../../../../utils/ApiCallState";
import { SearchSelectApis } from "./SearchSelectApis";
import { TAPApiDisplayList } from "../../../../displayServices/APApisDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IManageSelectApisProps {
  organizationId: string;  
  selectedApiEntityIdList: TAPEntityIdList;
  onSave: (apApiDisplayList: TAPApiDisplayList) => void;
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ManageSelectApis: React.FC<IManageSelectApisProps> = (props: IManageSelectApisProps) => {
  // const ComponentName = 'ManageSelectApis';

  const renderSelectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        {/* <SearchSelectApiVersions
          organizationId={props.organizationId}
          selectedApiEntityIdList={props.selectedApiEntityIdList}
          onError={props.onError}
          onSave={props.onSave}
          onCancel={props.onCancel}
          onLoadingChange={props.onLoadingChange}
        /> */}
        <SearchSelectApis
          organizationId={props.organizationId}
          selectedApiEntityIdList={props.selectedApiEntityIdList}
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
        <div className="manage-api-products select-apis-dialog-content">
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
