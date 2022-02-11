
import React from "react";

import { Dialog } from 'primereact/dialog';
import { TApiCallState } from "../../../utils/ApiCallState";
import { SearchSelectApis } from "./SearchSelectApis";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";
import { TAPEntityIdList } from "../../../utils/APEntityIdsService";

export interface ISelectApisProps {
  organizationId: string;
  currentSelectedApiEntityIdList: TAPEntityIdList,
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, modifiedSelectedApiEntityIdList: TAPEntityIdList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const SelectApis: React.FC<ISelectApisProps> = (props: ISelectApisProps) => {
  // const componentName = 'SelectApis';

  const renderSelectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        {/* <p>currentSelectedApiItemList={JSON.stringify(props.currentSelectedApiItemList, null, 2)}</p> */}
        <SearchSelectApis 
          organizationId={props.organizationId}
          currentSelectedApiItemList={props.currentSelectedApiEntityIdList}
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
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-api-products">
      {renderSelectDialog()}
    </div>
  );
}
