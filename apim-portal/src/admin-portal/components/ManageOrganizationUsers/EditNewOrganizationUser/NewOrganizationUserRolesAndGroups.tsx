
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../../utils/ApiCallState";
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import { NewManageOrganizationUserMemberOfOrganizationRoles } from "./NewManageOrganizationUserMemberOfOrganizationRoles";
import APMemberOfService, { TAPMemberOfBusinessGroupDisplayList, TAPMemberOfOrganizationDisplay } from "../../../../displayServices/APUsersDisplayService/APMemberOfService";
import { EditOrganizationUserMemberOfBusinessGroups } from "./EditOrganizationUserMemberOfBusinessGroups";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface INewOrganizationUserRolesAndGroupsProps {
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  onNext: (updated_ApOrganizationUserDisplay: TAPOrganizationUserDisplay) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewOrganizationUserRolesAndGroups: React.FC<INewOrganizationUserRolesAndGroupsProps> = (props: INewOrganizationUserRolesAndGroupsProps) => {
  const ComponentName = 'NewOrganizationUserRolesAndGroups';

  type TManagedObject = TAPOrganizationUserDisplay;

  const RolesNotValid_UserMessage = 'Specify at least 1 role. Either an organization role or a role within at least 1 business group.';

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [apiCallStatus] = React.useState<TApiCallState | null>(null);
  const [validationMessage, setValidationMessage] = React.useState<string>();

  // * Api Calls *

  const doInitialize = () => {
    // take a copy of apUserDisplay, since component changes it before finally returning it
    setManagedObject(JSON.parse(JSON.stringify(props.apOrganizationUserDisplay)));
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    const funcName = 'useEffect[]';
    const logName = `${ComponentName}.${funcName}()`;
    console.log(`${logName}: mounting ...`);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[managedObject]';
    const logName = `${ComponentName}.${funcName}()`;
    console.log(`${logName}: managedObject = ${JSON.stringify(managedObject, null, 2)}`);
    if(managedObject !== undefined) setIsInitialized(true);
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onNext = () => {
    const funcName = 'onNext';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    // calculate the legacy org roles for display 
    managedObject.memberOfOrganizationDisplay.apLegacyOrganizationRoleEntityIdList = APMemberOfService.create_ApLegacyOrganizationRoleEntityIdList({
      apOrganizationUserMemberOfOrganizationDisplay: managedObject.memberOfOrganizationDisplay,
    });
    if(!APOrganizationUsersDisplayService.validate_MemberOf_Roles({ apOrganizationUserDisplay: managedObject })) {
      setValidationMessage(RolesNotValid_UserMessage);
      return;
    }
    setValidationMessage(undefined);
    props.onNext(managedObject);
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
        <Button key={ComponentName+'Next'} label="Next" icon="pi pi-arrow-right" className="p-button-text p-button-plain p-button-outlined" onClick={onNext}/>
      </React.Fragment>
    );
  }

  const renderComponentFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" left={componentFooterLeftToolbarTemplate} right={componentFooterRightToolbarTemplate} />
    )
  }

  const onEditSuccess_OrganizationRoles = (updated_ApMemberOfOrganizationDisplay: TAPMemberOfOrganizationDisplay) => {
    const funcName = 'onEditSuccess_OrganizationRoles';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    
    setValidationMessage(undefined);

    const newApUserDisplay: TAPOrganizationUserDisplay = APOrganizationUsersDisplayService.set_ApMemberOfOrganizationDisplay({
      apOrganizationUserDisplay: managedObject,
      apMemberOfOrganizationDisplay: updated_ApMemberOfOrganizationDisplay
    });

    // // DEBUG: check if root business group has new roles
    // alert(`${logName}: updated_ApMemberOfOrganizationDisplay.apOrganizationRoleEntityIdList=${JSON.stringify(updated_ApMemberOfOrganizationDisplay.apOrganizationRoleEntityIdList, null, 2)}`);
    // const found = newApUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList.find( (x) => {
    //   return x.apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined;
    // });
    // if(found === undefined) throw new Error(`${logName}: found === undefined`);
    // alert(`${logName}: applied org role list to newApUserDisplay: found.apConfiguredBusinessGroupRoleEntityIdList=${JSON.stringify(found.apConfiguredBusinessGroupRoleEntityIdList, null, 2)}`);

    // alert(`${logName}: check console log for newApUserDisplay, legacy + roles + root group?`);
    // console.log(`${logName}: newApUserDisplay = ${JSON.stringify(newApUserDisplay, null, 2)}`);

    setManagedObject(newApUserDisplay);
    setRefreshCounter(refreshCounter + 1);
  }

  const onEditSuccess_BusinessGroupRoles = (updated_ApMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList) => {
    const funcName = 'onEditSuccess_BusinessGroupRoles';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    
    setValidationMessage(undefined);

    const newApUserDisplay: TAPOrganizationUserDisplay = APOrganizationUsersDisplayService.set_ApMemberOfBusinessGroupDisplayList({
      apOrganizationUserDisplay: managedObject,
      apMemberOfBusinessGroupDisplayList: updated_ApMemberOfBusinessGroupDisplayList
    });

    setManagedObject(newApUserDisplay);
    setRefreshCounter(refreshCounter + 1);
  }

  const renderValidationMessage = () => {
    if(validationMessage !== undefined) return(
      <div style={{ color: 'red' }}>
        <b>{validationMessage}</b>
      </div>
    );
  }
  const renderComponent = () => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return (
      <React.Fragment>
        <p>Edit Organization Roles, then save in managed object (no validation)</p>
        <p>Edit Business Groups & Roles, then save in managed object (no validation)</p>
        <p>on Next: validate all together</p>

        {renderValidationMessage()}

        <NewManageOrganizationUserMemberOfOrganizationRoles
          key={`${ComponentName}_NewManageOrganizationUserMemberOfOrganizationRoles_${refreshCounter}`}
          apOrganizationUserDisplay={managedObject}
          onEditSuccess={onEditSuccess_OrganizationRoles}
          onCancel={props.onCancel}
          onError={props.onError}
          onLoadingChange={props.onLoadingChange}
        />

        <EditOrganizationUserMemberOfBusinessGroups
          key={`${ComponentName}_EditOrganizationUserMemberOfBusinessGroups_${refreshCounter}`}
          apOrganizationUserDisplay={managedObject}
          onSave={onEditSuccess_BusinessGroupRoles}
          onCancel={props.onCancel}
        />

        {renderComponentFooter()}

      </React.Fragment>
    )
  }

  
  return (
    <div className="manage-users">

      { isInitialized && renderComponent() }

      {/* DEBUG */}
      {/* { isInitialized && managedObject &&
        <React.Fragment>
          <hr />
          <p><b>{ComponentName}:</b></p>
          <p><b>managedObject.apLegacy_MemberOfOrganizationRolesDisplayList=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.apLegacy_MemberOfOrganizationRolesDisplayList, null, 2)}
          </pre>
          <p><b>managedObject.apMemberOfOrganizationGroupsDisplayList=</b></p>
          <pre style={ { fontSize: '10px', width: '500px' }} >
            {JSON.stringify(managedObject.apMemberOfOrganizationGroupsDisplayList, null, 2)}
          </pre>
      </React.Fragment>
      } */}


    </div>
  );
}
