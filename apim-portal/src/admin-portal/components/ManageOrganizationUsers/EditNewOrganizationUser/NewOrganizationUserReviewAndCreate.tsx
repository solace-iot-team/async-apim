
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import APEntityIdsService, { 
  TAPEntityId, 
  TAPEntityIdList 
} from "../../../../utils/APEntityIdsService";
import { AuthHelper } from "../../../../auth/AuthHelper";
import { EUIAdminPortalResourcePaths } from "../../../../utils/Globals";
import { AuthContext } from "../../../../components/AuthContextProvider/AuthContextProvider";
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import { APDisplayUserProfile } from "../../../../components/APDisplay/APDisplayUserProfile";
import { TAPUserAuthenticationDisplay } from "../../../../displayServices/APUsersDisplayService/APUsersDisplayService";
import { APDisplayOrganizationUserBusinessGroups } from "../../../../components/APDisplay/APDisplayOrganizationBusinessGroups/APDisplayOrganizationUserBusinessGroups";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface INewOrganizationUserReviewAndCreateProps {
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  onCreateSuccess: (apUserEntityId: TAPEntityId, apiCallState: TApiCallState) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewOrganizationUserReviewAndCreate: React.FC<INewOrganizationUserReviewAndCreateProps> = (props: INewOrganizationUserReviewAndCreateProps) => {
  const ComponentName = 'NewOrganizationUserReviewAndCreate';

  type  TManagedObject = TAPOrganizationUserDisplay;
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [authContext] = React.useContext(AuthContext); 

  // * Api Calls *

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_USER, `create user: ${mo.apEntityId.id}`);
    try { 
      await APOrganizationUsersDisplayService.apsCreate_ApOrganizationUserDisplay({
        apOrganizationUserDisplay: mo
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(APOrganizationUsersDisplayService.set_isActivated({
      apUserDisplay: props.apOrganizationUserDisplay,
      isActivated: true
    }) as TAPOrganizationUserDisplay);
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
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_USER) {
        if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
        props.onCreateSuccess(managedObject.apEntityId, apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doCreate = async() => {
    const funcName = 'doCreate';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    props.onLoadingChange(true);
    await apiCreateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const onCreate = () => {
    doCreate();
  }

  const componentFooterLeftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button key={ComponentName+'Back'} label="Back" icon="pi pi-arrow-left" className="p-button-text p-button-plain p-button-outlined" onClick={props.onBack}/>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
      </React.Fragment>
    );
  }

  const componentFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button key={ComponentName+'Create'} label="Create" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" onClick={onCreate}/>
      </React.Fragment>
    );
  }

  const renderComponentFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" left={componentFooterLeftToolbarTemplate} right={componentFooterRightToolbarTemplate} />
    )
  }

  const renderSystemRoles = (apSystemRoleEntityIdList: TAPEntityIdList): string => {
    if(apSystemRoleEntityIdList.length === 0) return 'None';
    return APEntityIdsService.getSortedDisplayNameList_As_String(apSystemRoleEntityIdList);
  }

  const renderLegacyOrganzationRoles = (mo: TManagedObject): string => {
    return APEntityIdsService.getSortedDisplayNameList_As_String(mo.memberOfOrganizationDisplay.apLegacyOrganizationRoleEntityIdList);
  }

  const renderCredentials = (apUserAuthenticationDisplay: TAPUserAuthenticationDisplay): string => {
    if(apUserAuthenticationDisplay.password.length > 0) return '***';
    return 'None';
  }

  const renderManagedObjectReviewView = (mo: TManagedObject) => {
    return (
      <React.Fragment>

        <div><b>Activated</b>: {String(APOrganizationUsersDisplayService.get_isActivated({ apUserDisplay: mo}))}</div>

        <APDisplayUserProfile 
          apUserProfileDisplay={APOrganizationUsersDisplayService.get_ApUserProfileDisplay({ apUserDisplay: mo })}
          className="p-mt-2"
        />

        <div className="p-mt-2"><b>Password</b>: {renderCredentials(APOrganizationUsersDisplayService.get_ApUserAuthenticationDisplay({ apUserDisplay: mo }))}.</div>                    

        { AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, EUIAdminPortalResourcePaths.ManageSystemUsers) &&
          <div className="p-mt-2"><b>System Roles</b>: {renderSystemRoles(mo.apSystemRoleEntityIdList)}.</div>
        }
        
        <div className="p-mt-2" style={{ color: 'lightgray'}}><b>Legacy Organzation Roles</b>: {renderLegacyOrganzationRoles(mo)}.</div>                    

        <APDisplayOrganizationUserBusinessGroups
          apOrganizationUserDisplay={mo}
          className="card p-mt-2"
        />

        {/* DEBUG */}
        {/* <p><b>{ComponentName}:mo.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList=</b></p>
        <pre style={ { fontSize: '10px', width: '500px' }} >
          {JSON.stringify(mo.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList, null, 2)}
        </pre> */}
      </React.Fragment>
    );
  }

  const renderComponent = (mo: TManagedObject) => {

    return (
      <React.Fragment>

        {renderManagedObjectReviewView(mo)}

        {renderComponentFooter()}

      </React.Fragment>
    )
  }

  
  return (
    <div className="manage-users">

      { managedObject && renderComponent(managedObject) }

    </div>
  );
}
