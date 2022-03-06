
import React from "react";
import { useHistory } from 'react-router-dom';

import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { EditOrganizationUserProfile } from "./EditOrganizationUserProfile";
import { EditOrganizationUserMemberOfBusinessGroups } from "./EditOrganizationUserMemberOfBusinessGroups";
import { EditOrganizationUserMemberOfOrganizationRoles } from "./EditOrganizationUserMemberOfOrganizationRoles";
import { EditOrganizationUserAuthentication } from "./EditOrganizationUserAuthentication";
import APOrganizationUsersDisplayService, { 
  TAPOrganizationUserDisplay 
} from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import { UserContext } from "../../../../components/UserContextProvider/UserContextProvider";
import { AuthContext } from "../../../../components/AuthContextProvider/AuthContextProvider";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";
import { EUICommonResourcePaths } from "../../../../utils/Globals";

export interface IEditOrganizationUserProps {
  organizationEntityId: TAPEntityId;
  userEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const EditOrganizationUser: React.FC<IEditOrganizationUserProps> = (props: IEditOrganizationUserProps) => {
  const ComponentName = 'EditOrganizationUser';

  type TManagedObject = TAPOrganizationUserDisplay;

  const EditingYourselfMessage = 'You are editing yourself. You will need to login again afterwards.';
  const history = useHistory();

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  const [editingYourself, setEditingYourself] = React.useState<boolean>(false);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  const navigateTo = (path: string): void => { history.push(path); }

  // * Api Calls *
  const apiGetManagedObject = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${userEntityId.displayName}`);
    try { 
      const apUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.apsGet_ApOrganizationUserDisplay({
        organizationEntityId: props.organizationEntityId,
        userId: props.userEntityId.id,
        fetch_ApOrganizationAssetInfoDisplayList: false
      });
      setManagedObject(apUserDisplay);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject(props.userEntityId);
    props.onLoadingChange(false);
  }

  const doLogout = () => {
    dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT' });
    dispatchUserContextAction({ type: 'CLEAR_USER_CONTEXT' });
    navigateTo(EUICommonResourcePaths.Login);
  }
  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: 'Edit'
    }]);
    if(userContext.user.userId === props.userEntityId.id) setEditingYourself(true);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onError_EditOrganizationUserMemberOf = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    props.onError(apiCallState);
    setRefreshCounter(refreshCounter + 1);
  }

  const onSaveSuccess_EditOrganizationUserMemberOf = (apiCallState: TApiCallState) => {
    setRefreshCounter(refreshCounter + 1);
    onSaveSuccess(apiCallState);
  }

  const onSaveSuccess = (apiCallState: TApiCallState) => {
    props.onSaveSuccess(apiCallState);
    if(editingYourself) doLogout();
  }

  const renderContent = (mo: TManagedObject) => {
    return (
      <React.Fragment>
        {editingYourself && 
          <div className="p-mt-4" style={{ color: 'red'}}><b>Warning</b>: {EditingYourselfMessage}</div>
        }
        <div className="p-mt-4"><b>Activated</b>: {String(APOrganizationUsersDisplayService.get_isActivated({apUserDisplay: mo}))}</div>

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Profile'>
            <React.Fragment>
              <EditOrganizationUserProfile
                apOrganizationUserDisplay={mo} 
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onSaveSuccess={onSaveSuccess}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Roles & Groups'>
            <React.Fragment>
              <EditOrganizationUserMemberOfOrganizationRoles
                key={`EditOrganizationUserMemberOfOrganizationRoles_${refreshCounter}`}
                apOrganizationUserDisplay={mo}
                onError={onError_EditOrganizationUserMemberOf}
                onCancel={props.onCancel}
                onSaveSuccess={onSaveSuccess_EditOrganizationUserMemberOf}
                onLoadingChange={props.onLoadingChange}
              />
              <EditOrganizationUserMemberOfBusinessGroups
                key={`EditOrganizationUserMemberOfBusinessGroups_${refreshCounter}`}
                apOrganizationUserDisplay={mo}
                onError={onError_EditOrganizationUserMemberOf}
                onCancel={props.onCancel}
                onSaveSuccess={onSaveSuccess_EditOrganizationUserMemberOf}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Authentication'>
            <React.Fragment>
              <EditOrganizationUserAuthentication
                apOrganizationUserDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onSaveSuccess={onSaveSuccess}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }
  
  return (
    <div className="manage-users">

      <APComponentHeader header={`Edit User: ${props.userEntityId.id}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && 
        renderContent(managedObject)
      }
    </div>
  );
}
