
import React from "react";
import { MenuItem } from "primereact/api";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { EAppType, E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageAppsCommon";
import APDeveloperPortalUserAppsDisplayService, { 
  TAPDeveloperPortalUserAppDisplay 
} from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import APDeveloperPortalTeamAppsDisplayService, { TAPDeveloperPortalTeamAppDisplay } from "../../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { NewGeneral } from "./NewGeneral";
import { Globals } from "../../../../utils/Globals";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface IManageNewAppProps {
  appType: EAppType;
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, appEntityId: TAPEntityId) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageNewApp: React.FC<IManageNewAppProps> = (props: IManageNewAppProps) => {
  const ComponentName = 'ManageNewApp';

  type TManagedObject = TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [userContext] = React.useContext(UserContext);

  // * Api Calls * 

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;

    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_APP, `create new app`);
    try {
      switch(props.appType) {
        case EAppType.USER:
          const empty_apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay = APDeveloperPortalUserAppsDisplayService.create_Empty_ApDeveloperPortalUserAppDisplay({
            userId: userContext.apLoginUserDisplay.apEntityId.id
          });
          setManagedObject(empty_apDeveloperPortalUserAppDisplay);
          break;
        case EAppType.TEAM:
          if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: props.appType === EAppType.TEAM && userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
          const empty_apDeveloperPortalTeamAppDisplay: TAPDeveloperPortalTeamAppDisplay = APDeveloperPortalTeamAppsDisplayService.create_Empty_ApDeveloperPortalTeamAppDisplay({
            teamId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
          });
          setManagedObject(empty_apDeveloperPortalTeamAppDisplay);
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
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList([{
      label: 'New App'
    }]);  
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    setBreadCrumbItemList();
    doInitialize()
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onCreateSuccess = (apiCallState: TApiCallState, appEntityId: TAPEntityId) => {
    props.onNewSuccess(apiCallState, appEntityId);
  }

  const renderComponent = (mo: TManagedObject) => {
    return (
      <React.Fragment>
        <div className="p-mt-4">
          <NewGeneral
            appType={props.appType}
            organizationId={props.organizationId}
            apDeveloperPortalAppDisplay={mo}
            onCreateSuccess={onCreateSuccess}
            onCancel={props.onCancel}
            onError={onError_SubComponent}
            onLoadingChange={props.onLoadingChange}
          />
        </div>
      </React.Fragment>
    ); 
  }
  
  return (
    <div className="apd-manage-user-apps">

      {<APComponentHeader header="Create New App" />}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderComponent(managedObject)}

    </div>
  );
}
