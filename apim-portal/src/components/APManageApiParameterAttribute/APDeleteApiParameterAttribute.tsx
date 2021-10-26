
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { TAPManagedApiParameterAttribute } from "./APManageApiParameterAttribute";

import "../APComponents.css";
import "./APManageApiParameterAttribute.css";

export interface IAPDeleteApiParameterAttributeProps {
  apManagedApiParameterAttribute: TAPManagedApiParameterAttribute;
  onConfirmed: (apManagedApiParameterAttribute: TAPManagedApiParameterAttribute) => void;
  onCancel: () => void;
}

export const APDeleteApiParameterAttribute: React.FC<IAPDeleteApiParameterAttributeProps> = (props: IAPDeleteApiParameterAttributeProps) => {
  const componentName = 'APDeleteApiParameterAttribute';

  const DeleteConfirmDialogHeader = 'Confirm Removing Attribute';
  const ToolbarConfirmDeleteButtonLabel = 'Remove';
  const ToolbarCancelDeleteButtonLabel = 'Cancel';

  const onDeleteConfirm = () => {
    props.onConfirmed({
      ...props.apManagedApiParameterAttribute,
      apiAttribute: undefined
    });
  }

  const onDeleteCancel = () => {
    props.onCancel();
  }

  const renderDeleteDialogContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <p>Remove attribute: <b>{props.apManagedApiParameterAttribute.apiAttribute?.name}.</b></p>
        <p>Are you sure you want to remove it?</p>
      </React.Fragment>  
    );
  }

  const renderDeleteDialogFooter = (): JSX.Element =>{
    return (
      <React.Fragment>
          <Button label={ToolbarCancelDeleteButtonLabel} className="p-button-text p-button-plain" onClick={onDeleteCancel} />
          <Button label={ToolbarConfirmDeleteButtonLabel} icon="pi pi-times" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteConfirm}/>
      </React.Fragment>
    );
  } 

  const renderDeleteDialog = (): JSX.Element => {
    return (
      <Dialog
        className="p-fluid"
        visible={true}
        style={{ width: '450px' }} 
        header={DeleteConfirmDialogHeader}
        modal
        closable={false}
        footer={renderDeleteDialogFooter()}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
          <p><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></p>
          {renderDeleteDialogContent()}
        </div>
      </Dialog>
    );
  } 
  
  return (
    <div className="manage-attribute">
      {renderDeleteDialog()}
    </div>
  );
}
