
import React from "react";

import { Dialog } from 'primereact/dialog';

import { TApiCallState } from "../../../../../utils/ApiCallState";
import { IAPEpApplicationDomainDisplay, TAPEpApplicationDomainDisplayList } from "../../../../../displayServices/APEpApplicationDomainsDisplayService";
import { SearchSelectAppDomain } from "./SearchSelectAppDomain";

import '../../../../../components/APComponents.css';
import "../../ManageOrganizations.css";

export interface IManageSelectAppDomainProps {
  organizationId: string;  
  currentSelected_apEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay; 
  excludeFromSelection_TAPEpApplicationDomainDisplayList: TAPEpApplicationDomainDisplayList; 
  onSave: (apEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay) => void;
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
}

export const ManageSelectAppDomain: React.FC<IManageSelectAppDomainProps> = (props: IManageSelectAppDomainProps) => {
  // const ComponentName = 'ManageSelectAppDomain';

  const renderSelectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <SearchSelectAppDomain
          organizationId={props.organizationId}
          currentSelected_IAPEpApplicationDomainDisplay={props.currentSelected_apEpApplicationDomainDisplay}
          excludeFromSelection_TAPEpApplicationDomainDisplayList={props.excludeFromSelection_TAPEpApplicationDomainDisplayList}
          onError={props.onError}
          onSave={props.onSave}
          onCancel={props.onCancel}
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
        <div className=".manage-organizations .select-appdomain-dialog-content">
          {renderSelectDialogContent()}
        </div>
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-organizations">
      {renderSelectDialog()}
    </div>
  );
}
