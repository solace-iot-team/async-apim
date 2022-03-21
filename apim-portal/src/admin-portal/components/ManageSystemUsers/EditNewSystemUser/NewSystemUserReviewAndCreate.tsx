
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";

import { TApiCallState } from "../../../../utils/ApiCallState";
import APEntityIdsService, { 
  TAPEntityIdList 
} from "../../../../utils/APEntityIdsService";
import { APDisplayUserProfile } from "../../../../components/APDisplay/APDisplayUserProfile";
import { TAPUserAuthenticationDisplay } from "../../../../displayServices/APUsersDisplayService/APUsersDisplayService";
import APSystemUsersDisplayService, { TAPSystemUserDisplay } from "../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";

import '../../../../components/APComponents.css';
import "../ManageSystemUsers.css";

export interface INewSystemUserReviewAndCreateProps {
  apSystemUserDisplay: TAPSystemUserDisplay;
  onCreate: (apSystemUserDisplay: TAPSystemUserDisplay) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
}

export const NewSystemUserReviewAndCreate: React.FC<INewSystemUserReviewAndCreateProps> = (props: INewSystemUserReviewAndCreateProps) => {
  const ComponentName = 'NewSystemUserReviewAndCreate';

  type  TManagedObject = TAPSystemUserDisplay;
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();

  const doInitialize = async () => {
    setManagedObject(props.apSystemUserDisplay);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onCreate = () => {
    props.onCreate(props.apSystemUserDisplay);
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

  const renderCredentials = (apUserAuthenticationDisplay: TAPUserAuthenticationDisplay): string => {
    if(apUserAuthenticationDisplay.password.length > 0) return '***';
    return 'None';
  }

  const renderManagedObjectReviewView = (mo: TManagedObject) => {
    const funcName = 'renderManagedObjectReviewView';
    const logName = `${ComponentName}.${funcName}()`;

    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);

    return (
      <React.Fragment>

        <div><b>Activation Status</b>: {APSystemUsersDisplayService.get_ApUserActivationDisplay({apUserDisplay: managedObject}).activationStatusDisplayString}</div>

        <Divider />

        <APDisplayUserProfile
          apUserProfileDisplay={APSystemUsersDisplayService.get_ApUserProfileDisplay({ apUserDisplay: managedObject })}
        />

        {/* <APDisplayUserProfile 
          apUserProfileDisplay={APOrganizationUsersDisplayService.get_ApUserProfileDisplay({ apUserDisplay: mo })}
          className="p-mt-2"
        /> */}

        <Divider />
        
        <div className="p-mt-2"><b>Password</b>: {renderCredentials(APSystemUsersDisplayService.get_ApUserAuthenticationDisplay({ apUserDisplay: mo }))}.</div>                    

        <Divider />

        <div><b>System Roles</b>: {renderSystemRoles(managedObject.apSystemRoleEntityIdList)}</div>

        <Divider />

        {/* { AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, EUIAdminPortalResourcePaths.ManageSystemUsers) &&
          <div className="p-mt-2"><b>System Roles</b>: {renderSystemRoles(mo.apSystemRoleEntityIdList)}.</div>
        } */}

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
