
import React from "react";

import { Button } from 'primereact/button'; 
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay } from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { ButtonLabel_Cancel, ButtonLabel_Save, EAction, E_CALL_STATE_ACTIONS } from "../ManageApiProductsCommon";
import { TAPApiProductDisplay_AccessAndState } from "../../../../displayServices/APApiProductsDisplayService";
import { EditNewAccessAndStateForm } from "./EditNewAccessAndStateForm";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import APExternalSystemsDisplayService from "../../../../displayServices/APExternalSystemsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditAccessAndStateProps {
  organizationId: string;
  apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditAccessAndState: React.FC<IEditAccessAndStateProps> = (props: IEditAccessAndStateProps) => {
  const ComponentName = 'EditAccessAndState';

  type TManagedObject = TAPApiProductDisplay_AccessAndState;

  const FormId = `ManageApiProducts_EditNewApiProduct_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [availablePublishDestinationExternalSystemEntityIdList, setAvailablePublishDestinationExternalSystemEntityIdList] = React.useState<TAPEntityIdList>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [userContext] = React.useContext(UserContext);


  // * Api Calls *

  const apiGetPublishDestinations = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetPublishDestinations';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PUBLISH_DESTINATIONS, 'get publish destinations');
    try {
      const publishDestinationList: TAPEntityIdList = await APExternalSystemsDisplayService.apiGetList_PublishDestinations({
        organizationId: props.organizationId
      });
      setAvailablePublishDestinationExternalSystemEntityIdList(publishDestinationList);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_API_PRODUCT, `update api product: ${mo.apEntityId.displayName}`);
    try {
      await APAdminPortalApiProductsDisplayService.apiUpdate_ApApiProductDisplay({
        organizationId: props.organizationId,
        apApiProductDisplay: APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_AccessAndState({
          apApiProductDisplay: props.apAdminPortalApiProductDisplay,
          apApiProductDisplay_AccessAndState: mo
        }),
        userId: userContext.apLoginUserDisplay.apEntityId.id,
      });  
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetPublishDestinations();
    setManagedObject(APAdminPortalApiProductsDisplayService.get_ApApiProductDisplay_AccessAndState({
      apApiProductDisplay: props.apAdminPortalApiProductDisplay
    }));
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        props.onSaveSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmit = (mo: TManagedObject) => {
    doSubmitManagedObject(mo);
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button type="button" label={ButtonLabel_Cancel} className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button key={ComponentName+ButtonLabel_Save} form={FormId} type="submit" label={ButtonLabel_Save} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(availablePublishDestinationExternalSystemEntityIdList === undefined) throw new Error(`${logName}: availablePublishDestinationExternalSystemEntityIdList === undefined`);

    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <EditNewAccessAndStateForm
            formId={FormId}
            action={EAction.EDIT}
            apApiProductDisplay_AccessAndState={managedObject}
            apAvailablePublishDestinationExternalSystemEntityIdList={availablePublishDestinationExternalSystemEntityIdList}
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

      {managedObject &&  availablePublishDestinationExternalSystemEntityIdList && 
        renderManagedObjectForm()
      }

    </div>
  );
}
