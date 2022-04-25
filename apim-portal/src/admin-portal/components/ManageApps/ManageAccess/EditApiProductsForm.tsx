
import React from "react";
import { useForm } from 'react-hook-form';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import APDeveloperPortalAppApiProductsDisplayService, { 
  EAPApp_ApiProduct_Status,
  TAPApp_ApiProduct_AllowedActions,
  TAPDeveloperPortalAppApiProductDisplay, 
  TAPDeveloperPortalAppApiProductDisplayList 
} from "../../../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import APDeveloperPortalApiProductsDisplayService from "../../../../developer-portal/displayServices/APDeveloperPortalApiProductsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface IEditApiProductsFormProps {
  organizationId: string;
  formId: string;
  apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  original_ApDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  onSubmit: (apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList) => void;
  onApprove: (apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay) => void;
  onRevoke: (apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay) => void;
  onReset: (apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay) => void;
}

export const EditApiProductsForm: React.FC<IEditApiProductsFormProps> = (props: IEditApiProductsFormProps) => {
  const ComponentName='EditApiProductsForm';

  type TManagedObjectElement = TAPDeveloperPortalAppApiProductDisplay;
  type TManagedObject = Array<TManagedObjectElement>;
  type TManagedObjectFormData = {
    dummy: string;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
      dummy: ''
    };
    return {
      formData: fd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = managedObject;
    // const fd: TManagedObjectFormData = formDataEnvelope.formData;
    // if(isNewManagedObject()) mo.apEntityId.id = fd.id;
    // mo.apEntityId.displayName = fd.displayName;
    return mo;
  }

  const get_OriginalManagedObjectElement = (moElem: TManagedObjectElement): TManagedObjectElement => {
    const funcName = 'get_OriginalManagedObjectElement';
    const logName = `${ComponentName}.${funcName}()`;
    // find it in original list
    const original = props.original_ApDeveloperPortalApp_ApiProductDisplayList.find( (x) => {
      return x.apEntityId.id === moElem.apEntityId.id;
    });
    if(original === undefined) throw new Error(`${logName}: original === undefined`);
    return original;
  }

  const ApproveButtonLabel = 'Approve Access';
  const RevokeButtonLabel = 'Revoke Access';
  const RevokeConfirmDialogHeader = "Confirm Revoking Access to API Product";
  const RevokeConfirmDialogButtonLabel = "De-Provision on Save";

  const [managedObject] = React.useState<TManagedObject>(props.apDeveloperPortalApp_ApiProductDisplayList);
  const [managedObjectElementToRevoke, setManagedObjectElementToRevoke] = React.useState<TManagedObjectElement>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const componentDataTableRef = React.useRef<any>(null);

  const doInitialize = async () => {
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const onApproveManagedObjectElement = (moElem: TManagedObjectElement) => {
    props.onApprove(moElem);
  }

  const doRevokeManagedObjectElement = (moElem: TManagedObjectElement) => {
    props.onRevoke(moElem);
    setManagedObjectElementToRevoke(undefined);
  }
  const onRevokeManagedObjectElement = (moElem: TManagedObjectElement) => {
    if(get_OriginalManagedObjectElement(moElem).apApp_ApiProduct_Status === EAPApp_ApiProduct_Status.LIVE) {
      setManagedObjectElementToRevoke(moElem);
    } else {
      doRevokeManagedObjectElement(moElem);
    }
  }

  const onResetManagedObjectElement = (moElem: TManagedObjectElement) => {
    props.onReset(moElem);
  }

  const nameBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    return (<div>{row.apEntityId.displayName}</div>);
  }
  const versionBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    return (<div>{`${row.apVersionInfo.apLastVersion} (${row.apLifecycleInfo.apLifecycleState})`}</div>);
  }
  const ownerBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    return (<div>{row.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}</div>);
  }
  const newStatusBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    return (<div>{row.apApp_ApiProduct_Status}</div>);
  }
  const currentStatusBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    return (<div>{get_OriginalManagedObjectElement(row).apApp_ApiProduct_Status}</div>);
  }

  const actionsBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    const funcName = 'actionsBodyTemplate';
    const logName = `${ComponentName}.${funcName}()`;

    const renderResetButton = (): JSX.Element => {
      return(
        <Button
          icon="pi pi-replay"
          tooltip="reset"
          className="p-button-text p-button-plain p-button-outlined"
          onClick={() => onResetManagedObjectElement(row)} 
        />
      );     
    }
    const apApp_ApiProduct_AllowedActions: TAPApp_ApiProduct_AllowedActions = APDeveloperPortalAppApiProductsDisplayService.get_AllowedActions({ apAppApiProductDisplay: row });
    if(apApp_ApiProduct_AllowedActions.isApproveAllowed) {
      return(
        <div className="p-d-flex p-flex-nowrap">
          <Button 
            icon="pi pi-check" 
            label={ApproveButtonLabel}
            className="p-button-text p-button-plain p-button-outlined"
            onClick={() => onApproveManagedObjectElement(row)} 
            style={{ color: "green", borderColor: 'green' }}
          />
          {renderResetButton()}
        </div>
      );
    }
    if(apApp_ApiProduct_AllowedActions.isRevokeAllowed) {
      return(
        <div className="p-d-flex p-flex-nowrap">
          <Button 
            icon="pi pi-times" 
            label={RevokeButtonLabel}
            className="p-button-text p-button-plain p-button-outlined"
            onClick={() => onRevokeManagedObjectElement(row)} 
            style={{ color: "red", borderColor: 'red' }}
          />
          {renderResetButton()}
        </div>
      );
    }
    throw new Error(`${logName}: unknown apApp_ApiProduct_AllowedActions=${JSON.stringify(apApp_ApiProduct_AllowedActions)}`);
  }

  const renderApiProductsTable = (): JSX.Element => {
    // const funcName = 'renderApiProductsTable';
    // const logName = `${ComponentName}.${funcName}()`;
    const dataKey = APDeveloperPortalApiProductsDisplayService.nameOf_ApEntityId('id');
    const nameField = APDeveloperPortalApiProductsDisplayService.nameOf_ApEntityId('displayName');
    const statusField = APDeveloperPortalApiProductsDisplayService.nameOf<TManagedObjectElement>('apApp_ApiProduct_Status');

    return (
      <div className="card">
        <DataTable
          // key={ComponentName + '_DataTable_' + refreshCounter}
          className="p-datatable-sm"
          ref={componentDataTableRef}
          dataKey={dataKey}
          value={managedObject}
          sortMode="single" 
          sortField={nameField} 
          sortOrder={1}
          scrollable 
          autoLayout={true}
          emptyMessage="No API Products defined."
          // scrollHeight="200px" 
          // expandedRows={expandedViewProductsDataTableRows}
          // onRowToggle={(e) => setExpandedViewProductsDataTableRows(e.data)}
          // rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column header="API Product" body={nameBodyTemplate} field={nameField} sortable />
          <Column header="Version (State)" body={versionBodyTemplate} style={{width: '15%'}} />
          <Column header="Owner" body={ownerBodyTemplate} style={{width: '20%'}} />
          <Column header="Current Status" body={currentStatusBodyTemplate} style={{width: '15%'}} />
          <Column header="New Status" body={newStatusBodyTemplate} style={{width: '15%'}} field={statusField} />
          <Column body={actionsBodyTemplate} bodyStyle={{textAlign: 'right' }} style={{ width: '15em' }} />
        </DataTable>
      </div>    
    );
  }
  
  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    props.onSubmit(create_ManagedObject_From_FormEntities({
      formDataEnvelope: newMofde,
    }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const renderManagedObjectForm = () => {
    return (
      <React.Fragment>
        <form id={props.formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
          {/* empty form */}
        </form>
        {renderApiProductsTable()}
      </React.Fragment>
    );
  }

  const renderRevokeWarningDialog = (moElem: TManagedObjectElement): JSX.Element => {
    const onRevokeOk = () => { doRevokeManagedObjectElement(moElem); }
    const onRevokeCancel = () => { setManagedObjectElementToRevoke(undefined); }
    const renderHeader = () => {
      return (<span style={{ color: 'red' }}>{RevokeConfirmDialogHeader}</span>);
    }
    const renderContent = (): JSX.Element => {
      return (
        <React.Fragment>
          <p>API Product: <b>{moElem.apEntityId.displayName}</b> is live and will be de-provisioned on save.</p>
          <p>Are you sure you want to revoke access and de-provision it?</p>
        </React.Fragment>  
      );
    }  
    const renderFooter = (): JSX.Element =>{
      return (
        <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onRevokeCancel} />
          <Button label={RevokeConfirmDialogButtonLabel} icon="pi pi-times" className="p-button-text p-button-plain p-button-outlined" onClick={onRevokeOk} style={{ color: "red", borderColor: 'red'}} />
        </React.Fragment>
      );
    } 
    return (
      <Dialog
        className="p-fluid"
        visible={managedObjectElementToRevoke !== undefined} 
        style={{ width: '450px' }} 
        header={renderHeader}
        modal
        closable={false}
        footer={renderFooter()}
        onHide={()=> {}}
        contentClassName="ap-manage-apps-delete-confirmation-content"
      >
        <div>
          <p><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></p>
          {renderContent()}
        </div>
      </Dialog>
    );
  } 

  return (
    <div className="ap-manage-apps">
        
        { managedObjectFormDataEnvelope && renderManagedObjectForm() } 

        { managedObjectElementToRevoke && renderRevokeWarningDialog(managedObjectElementToRevoke) }

    </div>
  );
}


