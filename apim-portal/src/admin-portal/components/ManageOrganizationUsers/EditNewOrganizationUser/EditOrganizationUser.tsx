
import React from "react";
import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import APUsersDisplayService, { 
  TAPUserDisplay 
} from "../../../../displayServices/APUsersDisplayService";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { EditOrganizationUserProfile } from "./EditOrganizationUserProfile";
import { EditOrganizationUserCredentails } from "./EditOrganizationUserCredentials";
import { EditOrganizationUserMemberOfBusinessGroups } from "./EditOrganizationUserMemberOfBusinessGroups";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

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

  type TManagedObject = TAPUserDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *
  const apiGetManagedObject = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${userEntityId.displayName}`);
    try { 
      const object: TAPUserDisplay = await APUsersDisplayService.getApUserDisplay({
        userId: userEntityId.id
      });
      setManagedObject(object);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    // const funcName = 'doInitialize';
    // const logName = `${ComponentName}.${funcName}()`;
    props.onLoadingChange(true);
    await apiGetManagedObject(props.userEntityId);
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: 'Edit'
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // const funcName = 'useEffect[apiCallStatus]';
    // const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const renderContent = (mo: TManagedObject) => {
    return (
      <React.Fragment>
        <div className="p-mt-4"><b>Activated</b>: {String(mo.apsUserResponse.isActivated)}</div>

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='Profile'>
            <React.Fragment>
              <EditOrganizationUserProfile
                apUserDisplay={mo} 
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onSaveSuccess={props.onSaveSuccess}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Business Groups'>
            <React.Fragment>
              <p>{ComponentName}: No System Roles in Organization Edit</p>
              <EditOrganizationUserMemberOfBusinessGroups
                organizationEntityId={props.organizationEntityId}
                apUserDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onSaveSuccess={props.onSaveSuccess}
                onLoadingChange={props.onLoadingChange}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Credentials'>
            <React.Fragment>
              <EditOrganizationUserCredentails
                apUserDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onSaveSuccess={props.onSaveSuccess}
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
