

import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { TAPApiProductDisplay_AccessAndState } from "../../../../displayServices/APApiProductsDisplayService";
import { ButtonLabel_Back, ButtonLabel_Cancel, ButtonLabel_Next, EAction } from "../ManageApiProductsCommon";
import { EditNewAccessAndStateForm } from "./EditNewAccessAndStateForm";
import { TAPEntityIdList } from "../../../../utils/APEntityIdsService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditNewAccessAndStateProps {
  action: EAction;
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  apAvailablePublishDestinationExternalSystemEntityIdList: TAPEntityIdList;
  onSaveChanges: (apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewAccessAndState: React.FC<IEditNewAccessAndStateProps> = (props: IEditNewAccessAndStateProps) => {
  const ComponentName = 'EditNewAccessAndState';

  type TManagedObject = TAPApiProductDisplay_AccessAndState;
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();

  const FormId = `ManageApiProducts_EditNewApiProduct_${ComponentName}`;

  const doInitialize = async () => {
    setManagedObject(APAdminPortalApiProductsDisplayService.get_ApApiProductDisplay_AccessAndState({
      apApiProductDisplay: props.apAdminPortalApiProductDisplay
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onSaveChanges(mo);
  }

  const onSubmit = (apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState) => {
    doSubmitManagedObject(apApiProductDisplay_AccessAndState);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Back} type="button" label={ButtonLabel_Back} icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
          <Button key={ComponentName+ButtonLabel_Cancel} type="button" label={ButtonLabel_Cancel} className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Next} form={FormId} type="submit" label={ButtonLabel_Next} icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" />
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
          <EditNewAccessAndStateForm
            formId={FormId}
            action={props.action}
            apApiProductDisplay_AccessAndState={mo}
            apAvailablePublishDestinationExternalSystemEntityIdList={props.apAvailablePublishDestinationExternalSystemEntityIdList}
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
