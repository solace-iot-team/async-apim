
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { ButtonLabel_EditSaveChanges, EAction } from "../ManageApiProductsCommon";
import { EditNewGeneralForm } from "./EditNewGeneralForm";
import { TAPApiProductDisplay_General } from "../../../../displayServices/APApiProductsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewGeneralProps {
  action: EAction;
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  onSaveChanges: (apApiProductDisplay_General: TAPApiProductDisplay_General) => void;
  onBack?: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewGeneral: React.FC<IEditNewGeneralProps> = (props: IEditNewGeneralProps) => {
  const ComponentName = 'EditNewGeneral';

  type TManagedObject = TAPApiProductDisplay_General;
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const formId = `ManageApiProducts_EditNewApiProduct_${ComponentName}`;


  const doInitialize = async () => {
    setManagedObject(APAdminPortalApiProductsDisplayService.get_ApiProductDisplay_General({
      apApiProductDisplay: props.apAdminPortalApiProductDisplay
    }));
  }

  const validateProps = () => {
    const funcName = 'validateProps';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.action === EAction.NEW) {
      if(props.onBack === undefined) throw new Error(`${logName}: props.onBack === undefined`);
    }
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    validateProps();
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onSaveChanges(mo);
  }

  const onSubmit = (mo: TManagedObject) => {
    doSubmitManagedObject(mo);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          {props.action === EAction.NEW && 
            <Button key={ComponentName+'Next'} form={formId} type="submit" label="Next" icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
          }
          {props.action === EAction.EDIT && 
            <Button key={ComponentName+'Save'} form={formId} type="submit" label={ButtonLabel_EditSaveChanges} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
          }
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <EditNewGeneralForm
            formId={formId}
            organizationId={props.organizationId}
            action={props.action}
            apApiProductDisplay_General={mo}
            onError={props.onError}
            onLoadingChange={props.onLoadingChange}
            onSubmit={onSubmit}
          />
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }

  
  return (
    <div className="manage-api-products">

      {managedObject && 
        renderManagedObjectForm(managedObject)
      }
    </div>
  );
}
