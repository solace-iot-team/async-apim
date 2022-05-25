
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import APApisDisplayService, { IAPApiDisplay } from "../../../displayServices/APApisDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageApisCommon";
import { DisplayAdminPortalApi, E_DISPLAY_ADMIN_PORTAL_API_SCOPE } from "./DisplayAdminPortalApi";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IViewApiProps {
  organizationId: string;
  apiEntityId: TAPEntityId;
  onInitialized: (apApiDisplay: IAPApiDisplay) => void;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (apiEntityId: TAPEntityId) => void;
}

export const ViewApi: React.FC<IViewApiProps> = (props: IViewApiProps) => {
  const ComponentName = 'ViewApi';

  type TManagedObject = IAPApiDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [userContext] = React.useContext(UserContext);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve details for api: ${props.apiEntityId.displayName}`);
    try { 
      const apApiDisplay: IAPApiDisplay = await APApisDisplayService.apiGet_ApApiDisplay({
        organizationId: props.organizationId,
        apiId: props.apiEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        fetch_async_api_spec: true,
        fetch_revision_list: true,
      });
      // console.log(`${logName}: apAdminPortalApiProductDisplay = ${JSON.stringify(apAdminPortalApiProductDisplay, null, 2)}`);
      setManagedObject(apApiDisplay);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ViewApi_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(props.apiEntityId);
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const setBreadCrumbItemList = (moDisplayName: string) => {
    props.setBreadCrumbItemList([
      {
        label: moDisplayName,
        command: ViewApi_onNavigateHereCommand
      }
    ]);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setBreadCrumbItemList(managedObject.apEntityId.displayName);
    props.onInitialized(managedObject);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <React.Fragment>
      <div className="manage-apis">

        { managedObject && 
          <DisplayAdminPortalApi
            scope={E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING}
            organizationId={props.organizationId}
            apApiDisplay={managedObject}
            onError={props.onError}
            onSuccess={props.onSuccess}
            onLoadingChange={props.onLoadingChange}
          />
        }

      </div>
    </React.Fragment>
  );
}
