
import React from "react";

import { Dialog } from 'primereact/dialog';

import { APSUserId } from '@solace-iot-team/apim-server-openapi-browser';

import { TApiCallState } from "../../../utils/ApiCallState";
import { TApiEntitySelectItemList, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { TViewManagedApiProductList } from "../../../components/APApiObjectsCommon";
import { DeveloperPortalUserAppSearchSelectApiProducts } from "./DeveloperPortalUserAppSearchSelectApiProducts";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export interface IDeveloperPortalUserAppSelectApiProductsProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  currentSelectedApiProductItemList: TApiEntitySelectItemList,
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, selectedApiProductItemList: TApiEntitySelectItemList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalUserAppSelectApiProducts: React.FC<IDeveloperPortalUserAppSelectApiProductsProps> = (props: IDeveloperPortalUserAppSelectApiProductsProps) => {
  const componentName = 'DeveloperPortalUserAppSelectApiProducts';

  const DialogHeader = 'Search & Select API Product(s):';

  const renderSelectDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        {/* DEBUG */}
        <p>props.currentSelectedApiProductItemList:</p>
        <pre style={ { fontSize: '8px' }} >
          {JSON.stringify(props.currentSelectedApiProductItemList)}
        </pre>
        <DeveloperPortalUserAppSearchSelectApiProducts 
          organizationId={props.organizationId}
          userId={props.userId}
          currentSelectedApiProductItemList={props.currentSelectedApiProductItemList}
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
        header={DialogHeader}
        visible={true} 
        style={{ width: '80%', height: '50rem' }} 
        modal
        closable={true}
        onHide={()=> props.onCancel()}
      >
        {renderSelectDialogContent()}
      </Dialog>
    );
  } 
  
  return (
    <div className="apd-manage-user-apps">        
      {renderSelectDialog()}
    </div>
  );
}
