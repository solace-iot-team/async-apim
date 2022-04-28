
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APDeveloperPortalTeamAppsDisplayService, { TAPDeveloperPortalTeamAppDisplay } from "../../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import APAppsDisplayService, { TAPAppDisplay_General } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { EditNewGeneralForm } from "./EditNewGeneralForm";
import { EAction, EAppType, E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageAppsCommon";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { Globals } from "../../../../utils/Globals";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface INewGeneralProps {
  appType: EAppType;
  organizationId: string;
  apDeveloperPortalAppDisplay: TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;
  onCreateSuccess: (apiCallState: TApiCallState, appEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewGeneral: React.FC<INewGeneralProps> = (props: INewGeneralProps) => {
  const ComponentName = 'NewGeneral';

  type TManagedObject = TAPAppDisplay_General;

  const FormId = `DeveloperPortalManageApps_EditNewApp_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [userContext] = React.useContext(UserContext);

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_APP, `create app: ${mo.apEntityId.displayName}`);
    try {
      switch(props.appType) {
        case EAppType.USER:
          await APDeveloperPortalUserAppsDisplayService.apiCreate_ApDeveloperPortalUserAppDisplay({
            organizationId: props.organizationId,
            userId: userContext.apLoginUserDisplay.apEntityId.id,
            apDeveloperPortalUserAppDisplay: APDeveloperPortalUserAppsDisplayService.set_ApAppDisplay_General({
              apAppDisplay: props.apDeveloperPortalAppDisplay,
              apAppDisplay_General: mo
            }) as TAPDeveloperPortalUserAppDisplay,
          });
          break;
        case EAppType.TEAM:
          if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: props.appType === EAppType.TEAM && userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
          await APDeveloperPortalTeamAppsDisplayService.apiCreate_ApDeveloperPortalTeamAppDisplay({
            organizationId: props.organizationId,
            teamId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
            apDeveloperPortalTeamAppDisplay: APDeveloperPortalTeamAppsDisplayService.set_ApAppDisplay_General({
              apAppDisplay: props.apDeveloperPortalAppDisplay,
              apAppDisplay_General: mo
            }) as TAPDeveloperPortalTeamAppDisplay,
          });
          break;
        default:
          Globals.assertNever(logName, props.appType);
      }
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(APAppsDisplayService.get_ApAppDisplay_General({ 
      apAppDisplay: props.apDeveloperPortalAppDisplay 
    }));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_APP) {
        if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
        props.onCreateSuccess(apiCallStatus, managedObject.apEntityId);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    props.onLoadingChange(true);
    await apiCreateManagedObject(managedObject);
    props.onLoadingChange(false);
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
          <Button key={ComponentName+'Create'} form={FormId} type="submit" label="Create" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-6">
        <div className="p-fluid">
          <EditNewGeneralForm
            formId={FormId}
            organizationId={props.organizationId}
            action={EAction.NEW}
            apAppDisplay_General={mo}
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
    <div className="apd-manage-user-apps">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
