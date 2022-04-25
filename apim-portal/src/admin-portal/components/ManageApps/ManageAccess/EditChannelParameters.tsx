
import React from "react";

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import APAdminPortalAppsDisplayService, { 
  TAPAdminPortalAppDisplay 
} from "../../../displayServices/APAdminPortalAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageAppsCommon";
import { APDisplayApApiProductListControlledChannelParameterListPanel } from "../../../../components/APDisplay/APDisplayApApiProductListApControlledChannelParameterListPanel";
import { EditChannelParametersForm } from "./EditChannelParametersForm";
import APAppsDisplayService, { TAPAppDisplay_ChannelParameters } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface IEditChannelParametersProps {
  organizationId: string;
  apAdminPortalAppDisplay: TAPAdminPortalAppDisplay;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditChannelParameters: React.FC<IEditChannelParametersProps> = (props: IEditChannelParametersProps) => {
  const ComponentName = 'EditChannelParameters';

  type TManagedObject = TAPAppDisplay_ChannelParameters;

  const FormId = `ManageApps_ManageAccess_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_APP_CHANNEL_PARAMETERS, `update channel parameters for app: ${props.apAdminPortalAppDisplay.apEntityId.displayName}`);
    try {
      await APAdminPortalAppsDisplayService.apiUpdate_ApAppDisplay_ChannelParameters({
        organizationId: props.organizationId,
        apAppDisplay: props.apAdminPortalAppDisplay,
        apAppDisplay_ChannelParameters: mo
      });
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    // should work on a copy?
    setManagedObject(APAppsDisplayService.get_ApAppDisplay_ChannelParameters({
      apAppDisplay: props.apAdminPortalAppDisplay
    }));
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
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_APP_CHANNEL_PARAMETERS) {
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
          <Button key={ComponentName+'Save'} form={FormId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
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
          <APDisplayApApiProductListControlledChannelParameterListPanel
            apAppApiProductDisplayList={props.apAdminPortalAppDisplay.apAppApiProductDisplayList}
            emptyApiProductDisplayListMessage="No API Products defined."
            emptyControlledChannelParameterListMessage="No Controlled Channel Parameters defined."
            // className="p-mt-6"
          />

          <EditChannelParametersForm
            key={ComponentName + '_EditChannelParametersForm_' + refreshCounter}
            organizationId={props.organizationId}
            formId={FormId}
            apAppDisplay_ChannelParameters={mo}
            onSubmit={onSubmit}
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
