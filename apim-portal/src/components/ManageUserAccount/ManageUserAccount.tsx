
import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import APLoginUsersDisplayService, { TAPLoginUserDisplay } from "../../displayServices/APUsersDisplayService/APLoginUsersDisplayService";
import { UserContext } from "../APContextProviders/APUserContextProvider";
import { AuthContext } from "../AuthContextProvider/AuthContextProvider";
import { OrganizationContext } from "../APContextProviders/APOrganizationContextProvider";
import { TAPEntityId } from "../../utils/APEntityIdsService";
import { E_CALL_STATE_ACTIONS } from "./ManageUserAccountCommon";
import { APSClientOpenApi } from "../../utils/APSClientOpenApi";
import { EUICommonResourcePaths } from "../../utils/Globals";
import { APComponentHeader } from "../APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { Loading } from "../Loading/Loading";
import { ShowInfo } from "./ShowInfo";
import { EditProfile } from "./EditProfile";
import { EditAuthentication } from "./EditAuthentication";
import APContextsDisplayService from "../../displayServices/APContextsDisplayService";
import { SessionContext } from "../APContextProviders/APSessionContextProvider";

import '../APComponents.css';
import "./ManageUserAccount.css";

export interface IManageUserAccountProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageUserAccount: React.FC<IManageUserAccountProps> = (props: IManageUserAccountProps) => {
  const ComponentName = 'ManageUserAccount';

  type TManagedObject = TAPLoginUserDisplay;

  // const EditingYourselfMessage = 'You are editing yourself. You will need to login again afterwards.';
  const history = useHistory();

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [resetContexts, setResetContexts] = React.useState<boolean>(false);
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [organizationContext, dispatchOrganizationContextAction] = React.useContext(OrganizationContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [sessionContext, dispatchSessionContextAction] = React.useContext(SessionContext);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  // const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  const navigateTo = (path: string): void => { history.push(path); }

  // * Api Calls *
  const apiGetManagedObject = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${userEntityId.id}`);
    try { 
      const apUserDisplay: TAPLoginUserDisplay = await APLoginUsersDisplayService.apsGet_ApLoginUserDisplay({
        userId: userEntityId.id,
      });
      setManagedObject(apUserDisplay);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiLogout = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiLogout';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_USER_LOGOUT, `logout user: ${userEntityId.id}`);
    try { 
      await APLoginUsersDisplayService.apsLogout({
        userId: userEntityId.id
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setIsLoading(true);
    await apiGetManagedObject(userContext.apLoginUserDisplay.apEntityId);
    setIsLoading(false);
  }

  const doReloadContexts = async () => {
    await doInitialize();
    setResetContexts(true);
      //   setRefreshCounter(refreshCounter + 1);????
  }

  const doLogout = async() => {
    APContextsDisplayService.clear_LoginContexts({
      dispatchAuthContextAction: dispatchAuthContextAction,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction,
      dispatchSessionContextAction: dispatchSessionContextAction,
    });
    navigateTo(EUICommonResourcePaths.Login);
    await apiLogout(userContext.apLoginUserDisplay.apEntityId);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: 'My Account'
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject !== undefined && resetContexts) {
      dispatchUserContextAction({ type: 'SET_USER', apLoginUserDisplay: managedObject });
      setResetContexts(false);
    }
  }, [resetContexts]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_PROFILE) props.onSuccess(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_CREDENTIALS) props.onSuccess(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onSaveSuccess_EditProfile = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    doReloadContexts();
  }

  const onSaveSuccess_EditAuthentication = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    doLogout();
  }

  const renderContent = (mo: TManagedObject) => {
    return (
      <React.Fragment>
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Info'>
            <React.Fragment>
              <ShowInfo
                apLoginUserDisplay={mo}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Profile'>
            <React.Fragment>
              <EditProfile
                apLoginUserDisplay={mo}
                onSaveSuccess={onSaveSuccess_EditProfile}
                onError={onError_SubComponent}
                onLoadingChange={setIsLoading}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Authentication'>
            <React.Fragment>
              <EditAuthentication
                apLoginUserDisplay={mo}
                onSaveSuccess={onSaveSuccess_EditAuthentication}
                onError={onError_SubComponent}
                onLoadingChange={setIsLoading}
              />
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }
  
  return (
    <div className="manage-user-account">

      <Loading show={isLoading} />      

      <APComponentHeader header={`My Account`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && 
        renderContent(managedObject)
      }
    </div>
  );
}
