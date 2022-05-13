
import React from "react";
import { useForm } from 'react-hook-form';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import APDeveloperPortalAppApiProductsDisplayService, { 
  EAPApp_ApiProduct_Status,
  TAPDeveloperPortalAppApiProductDisplay, 
  TAPDeveloperPortalAppApiProductDisplayList 
} from "../../../displayServices/APDeveloperPortalAppApiProductsDisplayService";
import APDeveloperPortalApiProductsDisplayService from "../../../displayServices/APDeveloperPortalApiProductsDisplayService";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface IEditApiProductsFormProps {
  organizationId: string;
  formId: string;
  apDeveloperPortalApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList;
  onSubmit: (apDeveloperPortalUserApp_ApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList) => void;
  onRemove: (apDeveloperPortalAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay) => void;
}

export const EditApiProductsForm: React.FC<IEditApiProductsFormProps> = (props: IEditApiProductsFormProps) => {
  // const ComponentName='EditApiProductsForm';

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

  const RemoveManagedObjectButtonLabel = 'Remove';
  const RemoveManagedObjectConfirmDialogHeader = "Confirm Removing API Product";
  const RemoveManagedObjectConfirmDialogButtonLabel = "De-Provision on Save";

  const [managedObject] = React.useState<TManagedObject>(props.apDeveloperPortalApp_ApiProductDisplayList); 
  const [managedObjectToRemove, setManagedObjectToRemove] = React.useState<TManagedObjectElement>();
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  // const [apiCallStatus] = React.useState<TApiCallState | null>(null);
  
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

  const doRemoveManagedObject_FromList = (moElem: TManagedObjectElement) => {
    props.onRemove(moElem);
    setManagedObjectToRemove(undefined);
  }

  const onRemoveManagedObject_FromList = (moElem: TManagedObjectElement) => {
    if(moElem.apApp_ApiProduct_Status === EAPApp_ApiProduct_Status.LIVE) {
      setManagedObjectToRemove(moElem);
    } else {
      doRemoveManagedObject_FromList(moElem);
    }
  }

  const nameBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    return (
      // <div className="p-text-bold">{row.apEntityId.displayName}</div>
      <div>{row.apEntityId.displayName}</div>
    );
  }
  const versionBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    return (
      <div>{`${row.apVersionInfo.apLastVersion} (${row.apLifecycleStageInfo.stage})`}</div>
    );
  }
  const statusBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    return (
      <div>{row.apApp_ApiProduct_Status}</div>
    );
  }
  const ownerBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    return (
      <div>{row.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}</div>
    );
  }
  const existingNewBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    const isExisting: boolean = APDeveloperPortalAppApiProductsDisplayService.isExisting_ApAppApiProductDisplay({ apAppApiProductDisplay: row});
    if(isExisting) return (<div>existing</div>);
    else return (<div>new</div>);
  }

  const actionsBodyTemplate = (row: TManagedObjectElement): JSX.Element => {
    const style: React.CSSProperties = row.apApp_ApiProduct_Status === EAPApp_ApiProduct_Status.LIVE ? { color: "red", borderColor: 'red'} : {};
    return (
      <React.Fragment>
        <Button 
          icon="pi pi-times" 
          label={RemoveManagedObjectButtonLabel}
          className="p-button-text p-button-plain p-button-outlined"
          onClick={() => onRemoveManagedObject_FromList(row)} 
          style={style}
        />
      </React.Fragment>
    );
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
          emptyMessage="No API Products selected."
          // scrollHeight="200px" 
          // expandedRows={expandedViewProductsDataTableRows}
          // onRowToggle={(e) => setExpandedViewProductsDataTableRows(e.data)}
          // rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column header="API Product" body={nameBodyTemplate} field={nameField} sortable />
          <Column header="Version/State" body={versionBodyTemplate} style={{width: '15%'}} />
          <Column header="Owner" body={ownerBodyTemplate} style={{width: '20%'}} />
          <Column header="Status" body={statusBodyTemplate} style={{width: '15%'}} field={statusField} sortable />
          <Column header="Existing/New" body={existingNewBodyTemplate} style={{width: '10%'}} />
          <Column body={actionsBodyTemplate} bodyStyle={{textAlign: 'right' }} style={{ width: '8em' }} />
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

  const renderRemoveWarningDialog = (mo: TManagedObjectElement): JSX.Element => {
    const onRemoveOk = () => { doRemoveManagedObject_FromList(mo); }
    const onRemoveCancel = () => { setManagedObjectToRemove(undefined); }
    const renderHeader = () => {
      return (<span style={{ color: 'red' }}>{RemoveManagedObjectConfirmDialogHeader}</span>);
    }
    const renderContent = (): JSX.Element => {
      return (
        <React.Fragment>
          <p>API Product: <b>{mo.apEntityId.displayName}</b> is live and will be de-provisioned on save.</p>
          <p>Are you sure you want to de-provision it?</p>
        </React.Fragment>  
      );
    }  
    const renderFooter = (): JSX.Element =>{
      return (
        <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onRemoveCancel} />
          <Button label={RemoveManagedObjectConfirmDialogButtonLabel} icon="pi pi-times" className="p-button-text p-button-plain p-button-outlined" onClick={onRemoveOk} style={{ color: "red", borderColor: 'red'}} />
        </React.Fragment>
      );
    } 
    return (
      <Dialog
        className="p-fluid"
        visible={managedObjectToRemove !== undefined} 
        style={{ width: '450px' }} 
        header={renderHeader}
        modal
        closable={false}
        footer={renderFooter()}
        onHide={()=> {}}
        contentClassName="apd-manage-user-apps-delete-confirmation-content"
      >
        <div>
          <p><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></p>
          {renderContent()}
        </div>
      </Dialog>
    );
  } 

  return (
    <div className="apd-manage-user-apps">
        
        { managedObjectFormDataEnvelope && renderManagedObjectForm() } 

        { managedObjectToRemove && renderRemoveWarningDialog(managedObjectToRemove) }

    </div>
  );
}


