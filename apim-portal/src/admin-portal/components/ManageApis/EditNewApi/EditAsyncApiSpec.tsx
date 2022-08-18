
import React from "react";

import { Button } from 'primereact/button'; 
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APApisDisplayService, { 
  IAPApiDisplay, 
  TAPApiDisplay_AsyncApiSpec 
} from "../../../../displayServices/APApisDisplayService";
import { ButtonLabel_Cancel, ButtonLabel_Save, EAction, E_CALL_STATE_ACTIONS } from "../ManageApisCommon";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { EditNewAsyncApiSpecForm } from "./EditNewAsyncApiForm";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface IEditAsyncApiSpecProps {
  organizationId: string;
  apApiDisplay: IAPApiDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean, loadingHeader?: string) => void;
}

export const EditAsyncApiSpec: React.FC<IEditAsyncApiSpecProps> = (props: IEditAsyncApiSpecProps) => {
  const ComponentName = 'EditAsyncApiSpec';

  type TManagedObject = TAPApiDisplay_AsyncApiSpec;

  const FormId = `ManageApis_EditNewApi_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [userContext] = React.useContext(UserContext);

  // * Api Calls *

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_API, `update api: ${mo.apEntityId.id}`);
    try {
      await APApisDisplayService.apiCreate_ApApiDisplay_AsyncApiSpec({
        organizationId: props.organizationId,
        userId: userContext.apLoginUserDisplay.apEntityId.id,
        apApiDisplay: props.apApiDisplay,
        apApiDisplay_AsyncApiSpec: mo
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(APApisDisplayService.get_Empty_ApApiDisplay_AsyncApiSpec({ apApiDisplay: props.apApiDisplay }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    // alert(`${ComponentName}.React.useEffect([]): ${JSON.stringify(props.apAdminPortalApiProductDisplay.apVersionInfo, null, 2)}`)
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const renderInfo = () => {
    return(
      <div className="p-mb-6">
        <p><b>Upload a new Version of the Spec:</b></p>
        {/* <p>Latest Versions: {props.apApiDisplay.apVersionInfo.apLastMajorVersionList.join(', ')}</p> */}
      </div>
    );
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-4">
        {renderInfo()}
        <div className="p-fluid">
          <EditNewAsyncApiSpecForm
            formId={FormId}
            organizationId={props.organizationId}
            action={EAction.EDIT}
            apApiDisplay_AsyncApiSpec={mo}
            apLastVersion={props.apApiDisplay.apVersionInfo.apLastVersion}
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
    <div className="manage-apis">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
