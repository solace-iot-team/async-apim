
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import APUsersDisplayService, { 
  APLegacyUserDisplayService,
  TAPLegacyMemberOfOrganizationRolesDisplay,
  TAPLegacyMemberOfOrganizationRolesDisplayList,
  TAPUserCredentialsDisplay,
  TAPUserDisplay, 
} from "../../../../displayServices/APUsersDisplayService";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { APDisplayUserProfile } from "../../../../components/APDisplay/APDisplayUserProfile";
import { AuthHelper } from "../../../../auth/AuthHelper";
import { EUIAdminPortalResourcePaths } from "../../../../utils/Globals";
import { AuthContext } from "../../../../components/AuthContextProvider/AuthContextProvider";
import { APDisplayOrganizationBusinessGroups } from "../../../../components/APDisplay/APDisplayOrganizationBusinessGroups/APDisplayOrganizationBusinessGroups";
import { TAPBusinessGroupDisplayList } from "../../../../displayServices/APBusinessGroupsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface INewOrganizationUserReviewAndCreateProps {
  organizationEntityId: TAPEntityId;
  apUserDisplay: TAPUserDisplay;
  completeOrganizationApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  onCreateSuccess: (apUserDisplay: TAPUserDisplay, apiCallState: TApiCallState) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewOrganizationUserReviewAndCreate: React.FC<INewOrganizationUserReviewAndCreateProps> = (props: INewOrganizationUserReviewAndCreateProps) => {
  const ComponentName = 'NewOrganizationUserReviewAndCreate';

  type  TManagedObject = TAPUserDisplay;
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [authContext] = React.useContext(AuthContext); 

  // * Api Calls *

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_USER, `create user: ${mo.apEntityId.id}`);
    try { 
      await APUsersDisplayService.apsCreate_ApUserDisplay({
        apUserDisplay: mo
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(APUsersDisplayService.set_isActivated({
      apUserDisplay: props.apUserDisplay,
      isActivated: true
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
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_USER) {
        if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
        props.onCreateSuccess(managedObject, apiCallStatus);
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

  const renderLegacyOrganzationRoles = (apLegacy_MemberOfOrganizationRolesDisplayList: TAPLegacyMemberOfOrganizationRolesDisplayList): string => {
    const apLegacyMemberOfOrganizationRolesDisplay: TAPLegacyMemberOfOrganizationRolesDisplay = APLegacyUserDisplayService.find_LegacyMemberOfOrganizationRolesDisplay({ 
      organizationId: props.organizationEntityId.id,
      apLegacyMemberOfOrganizationRolesDisplayList: apLegacy_MemberOfOrganizationRolesDisplayList
    });
    if(apLegacyMemberOfOrganizationRolesDisplay.apOrganizationAuthRoleEntityIdList.length === 0) return 'None';
    return APEntityIdsService.getSortedDisplayNameList_As_String(apLegacyMemberOfOrganizationRolesDisplay.apOrganizationAuthRoleEntityIdList);
  }

  const renderCredentials = (apUserCredentialsDisplay: TAPUserCredentialsDisplay): string => {
    if(apUserCredentialsDisplay.password.length > 0) return '***';
    return 'None';
  }

  const renderManagedObjectReviewView = (mo: TManagedObject) => {
    return (
      <React.Fragment>
        <div><b>Activated</b>: {String(APUsersDisplayService.get_isActivated({ apUserDisplay: mo}))}</div>
        <APDisplayUserProfile 
          apUserProfileDisplay={APUsersDisplayService.get_ApUserProfileDisplay({ apUserDisplay: mo })}
          className="p-mt-2"
        />
        <div className="p-mt-2"><b>Password</b>: {renderCredentials(APUsersDisplayService.get_ApUserCredentialsDisplay({ apUserDisplay: mo }))}.</div>                    
        { AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, EUIAdminPortalResourcePaths.ManageSystemUsers) &&
          <div className="p-mt-2"><b>System Roles</b>: {renderSystemRoles(mo.apSystemRoleEntityIdList)}.</div>
        }
        <div className="p-mt-2"><b>Legacy Organzation Roles</b>: {renderLegacyOrganzationRoles(mo.apLegacy_MemberOfOrganizationRolesDisplayList)}.</div>                    
        <APDisplayOrganizationBusinessGroups
          organizationEntityId={props.organizationEntityId}
          completeOrganizationApBusinessGroupDisplayList={props.completeOrganizationApBusinessGroupDisplayList}
          apMemberOfOrganizationGroupsDisplayList={APUsersDisplayService.find_ApMemberOfBusinessGroupDisplayList({
            organizationId: props.organizationEntityId.id,
            apUserDisplay: mo
          })}
          className="card p-mt-2"
        />
        {/* DEBUG */}
        {/* <p><b>managedObject=</b></p>
        <pre style={ { fontSize: '10px', width: '500px' }} >
          {JSON.stringify(managedObject, null, 2)}
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
