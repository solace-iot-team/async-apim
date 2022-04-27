
import React from "react";

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { EditApiProductsForm } from "./EditApiProductsForm";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import APAdminPortalAppsDisplayService, { 
  TAPAdminPortalAppDisplay 
} from "../../../displayServices/APAdminPortalAppsDisplayService";
import APDeveloperPortalAppApiProductsDisplayService, { 
  EAPApp_ApiProduct_Status, 
  TAPDeveloperPortalAppApiProductDisplay 
} from "../../../../developer-portal/displayServices/APDeveloperPortalAppApiProductsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageAppsCommon";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface IEditApiProductsProps {
  organizationId: string;
  apAdminPortalAppDisplay: TAPAdminPortalAppDisplay;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditApiProducts: React.FC<IEditApiProductsProps> = (props: IEditApiProductsProps) => {
  const ComponentName = 'EditApiProducts';

  type TManagedObjectElement = TAPDeveloperPortalAppApiProductDisplay;
  type TManagedObject = Array<TManagedObjectElement>;

  const FormId = `ManageApps_ManageAccess_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);


  const hasApiProductListChanged = (): boolean => {
    // set to true to always enable save, seems easier to manage externally produced apps that are not approved
    return true;
    // const funcName = 'hasApiProductListChanged';
    // const logName = `${ComponentName}.${funcName}()`;
    // if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    // // compare original with managedObject
    // let hasChanged: boolean = false;
    // managedObject.forEach( (moElem: TManagedObjectElement) => {
    //   const currentAppApiProductDisplay: TAPDeveloperPortalAppApiProductDisplay | undefined = props.apAdminPortalAppDisplay.apAppApiProductDisplayList.find( (x) => {
    //     return x.apEntityId.id === moElem.apEntityId.id;
    //   });
    //   if(currentAppApiProductDisplay === undefined) throw new Error(`${logName}: currentAppApiProductDisplay === undefined`);
    //   if(moElem.apApp_ApiProduct_Status !== currentAppApiProductDisplay.apApp_ApiProduct_Status) hasChanged = true;
    // });
    // return hasChanged;
  }

  const get_OriginalManagedObjectElement = (moElem: TManagedObjectElement): TManagedObjectElement => {
    const funcName = 'get_OriginalManagedObjectElement';
    const logName = `${ComponentName}.${funcName}()`;
    // find it in original list
    const original = props.apAdminPortalAppDisplay.apAppApiProductDisplayList.find( (x) => {
      return x.apEntityId.id === moElem.apEntityId.id;
    });
    if(original === undefined) throw new Error(`${logName}: original === undefined`);
    return original;
  }

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_APP_API_PRODUCTS, `update api products for app: ${props.apAdminPortalAppDisplay.apEntityId.displayName}`);
    try {
      await APAdminPortalAppsDisplayService.apiUpdate_ApAdminPortalAppDisplay_ApAppApiProductDisplayList_Status({
        organizationId: props.organizationId,
        apAdminPortalAppDisplay: props.apAdminPortalAppDisplay,
        apDeveloperPortalAppApiProductDisplayList: mo
      });
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    // work on a copy 
    setManagedObject(JSON.parse(JSON.stringify(props.apAdminPortalAppDisplay.apAppApiProductDisplayList)));
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    if(refreshCounter > 0) setRefreshCounter(refreshCounter + 1);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // const funcName = 'useEffect[apiCallStatus]';
    // const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_APP_API_PRODUCTS) {
          // if(updatedManagedObject === undefined) throw new Error(`${logName}: updatedManagedObject === undefined`);
          // props.onSaveSuccess(apiCallStatus, updatedManagedObject);
          props.onSaveSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
    setRefreshCounter(refreshCounter + 1);
  }

  const onSubmit = (mo: TManagedObject) => {
    doSubmitManagedObject(mo);
  }

  const onApprove = (moElem: TManagedObjectElement) => {
    const funcName = 'onApprove';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    setManagedObject(APDeveloperPortalAppApiProductsDisplayService.set_ApApp_ApiProduct_Status_In_List({
      apiProductEntityId: moElem.apEntityId,
      apDeveloperPortalAppApiProductDisplayList: managedObject,
      apApp_ApiProduct_Status: EAPApp_ApiProduct_Status.LIVE // WILL_BE_LIVE?
    }));
    setRefreshCounter(refreshCounter + 1);
  }

  const onRevoke = (moElem: TManagedObjectElement) => {
    const funcName = 'onRevoke';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    setManagedObject(APDeveloperPortalAppApiProductsDisplayService.set_ApApp_ApiProduct_Status_In_List({
      apiProductEntityId: moElem.apEntityId,
      apDeveloperPortalAppApiProductDisplayList: managedObject,
      apApp_ApiProduct_Status: EAPApp_ApiProduct_Status.APPROVAL_REVOKED
    }));
    setRefreshCounter(refreshCounter + 1);
  }

  const onReset = (moElem: TManagedObjectElement) => {
    const funcName = 'onReset';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    setManagedObject(APDeveloperPortalAppApiProductsDisplayService.set_ApApp_ApiProduct_Status_In_List({
      apiProductEntityId: moElem.apEntityId,
      apDeveloperPortalAppApiProductDisplayList: managedObject,
      apApp_ApiProduct_Status: get_OriginalManagedObjectElement(moElem).apApp_ApiProduct_Status
    }));
    setRefreshCounter(refreshCounter + 1);
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
      const isSaveDisabled: boolean = !hasApiProductListChanged();
      return (
        <React.Fragment>
          <Button key={ComponentName+'Save'} form={FormId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" 
            disabled={isSaveDisabled} 
          />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-2">
        <div className="p-fluid">
        {/* <div className="p-mt-4">Instructions for the user - remove & save ?:</div> */}
          <EditApiProductsForm 
            key={ComponentName + '_EditApiProductsForm_' + refreshCounter}
            organizationId={props.organizationId}
            formId={FormId}
            apDeveloperPortalApp_ApiProductDisplayList={mo}
            original_ApDeveloperPortalApp_ApiProductDisplayList={props.apAdminPortalAppDisplay.apAppApiProductDisplayList}
            onSubmit={onSubmit}
            onApprove={onApprove}
            onRevoke={onRevoke}
            onReset={onReset}
          />
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }
  
  return (
    <div className="ap-manage-apps">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
