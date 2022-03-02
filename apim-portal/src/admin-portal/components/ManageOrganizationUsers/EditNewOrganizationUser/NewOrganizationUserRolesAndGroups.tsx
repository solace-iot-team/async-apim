
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { APSOpenApiFormValidationRules } from "../../../../utils/APSOpenApiFormValidationRules";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import APUsersDisplayService, { 
  TAPUserDisplay, 
  TAPUserOrganizationRolesDisplay, 
  TAPUserProfileDisplay 
} from "../../../../displayServices/old.APUsersDisplayService";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";
import { EditOrganizationUserOrganizationRoles, EEditOrganzationUserOrganizationRolesAction } from "./EditOrganizationUserOrganizationRoles";
import { NewManageOrganizationUserMemberOfOrganizationRoles } from "./NewManageOrganizationUserMemberOfOrganizationRoles";

export interface INewOrganizationUserRolesAndGroupsProps {
  organizationEntityId: TAPEntityId;
  apUserDisplay: TAPUserDisplay;
  onNext: (updatedApUserDisplay: TAPUserDisplay) => void;
  onBack: () => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewOrganizationUserRolesAndGroups: React.FC<INewOrganizationUserRolesAndGroupsProps> = (props: INewOrganizationUserRolesAndGroupsProps) => {
  const ComponentName = 'NewOrganizationUserRolesAndGroups';

  type TManagedObject = TAPUserDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // * Api Calls *


  const doInitialize = () => {
    const funcName = 'doInitialize';
    const logName = `${ComponentName}.${funcName}()`;
    // take a copy of apUserDisplay, since component changes it before finally returning it
    setManagedObject(JSON.parse(JSON.stringify(props.apUserDisplay)));
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

  // const doSubmitManagedObject = async (mo: TManagedObject) => {
  //   // const funcName = 'doSubmitManagedObject';
  //   // const logName = `${ComponentName}.${funcName}()`;
  //   props.onNext(mo);
  // }

  // const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
  //   const funcName = 'onSubmitManagedObjectForm';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
  //   doSubmitManagedObject(create_ManagedObject_From_FormEntities({
  //     orginalManagedObject: managedObject,
  //     formDataEnvelope: newMofde,
  //   }));
  // }

  // const onInvalidSubmitManagedObjectForm = () => {
  //   // placeholder
  // }

  const onNext = () => {
    const funcName = 'onNext';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    alert(`${logName}: 1. apply newApUserDisplay.apMemberOfOrganizationGroupsDisplayList to apUserDisplay.apsUserResponse. 2. Need to validate that at least 1 role is set`);
    // alert(`${logName}: check console log for managedObject log to be sent to Next\ndoes it contain calculated roles?`);
    // console.log(`${logName}: newApUserDisplay.apMemberOfOrganizationGroupsDisplayList = ${JSON.stringify(managedObject.apMemberOfOrganizationGroupsDisplayList, null, 2)}`);
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

  const onEdit_OrganizationUser_OrganizationRoles = (updatedApUserOrganizationRolesDisplay: TAPUserOrganizationRolesDisplay) => {
    const funcName = 'onEdit_OrganizationUser_OrganizationRoles';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);



    const newApUserDisplay: TAPUserDisplay = APUsersDisplayService.set_ApUserOrganizationRolesDisplay({
      organizationEntityId: props.organizationEntityId,
      apUserDisplay: managedObject,
      apUserOrganizationRolesDisplay: updatedApUserOrganizationRolesDisplay
    });

    alert(`${logName}: check console log for newApUserDisplay, does it have the new apsUserResponse set?`);
    console.log(`${logName}: newApUserDisplay = ${JSON.stringify(newApUserDisplay, null, 2)}`);

    setManagedObject(newApUserDisplay);
    setRefreshCounter(refreshCounter + 1);
  }

  const renderComponent = () => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    return (
      <React.Fragment>
        <p>Edit Organization Roles == save in managed object == validate</p>
        <p>Edit Business Groups & Roles == save in managed object == validate</p>
        <p>on Next: no validation required</p>
        <NewManageOrganizationUserMemberOfOrganizationRoles
          key={`${ComponentName}_NewManageOrganizationUserMemberOfOrganizationRoles_${refreshCounter}`}
          organizationEntityId={props.organizationEntityId}
          apUserDisplay={managedObject}
          onEditSuccess={onEdit_OrganizationUser_OrganizationRoles}
          onCancel={props.onCancel}
          onError={props.onError}
          onLoadingChange={props.onLoadingChange}
        />

        {/* <EditOrganizationUserMemberOfBusinessGroups
          key={`EditOrganizationUserMemberOfBusinessGroups_${refreshCounter}`}
          organizationEntityId={props.organizationEntityId}
          apUserDisplay={mo}
          onError={onError_EditOrganizationUserMemberOf}
          onCancel={props.onCancel}
          onSaveSuccess={onSaveSuccess_EditOrganizationUserMemberOf}
          onLoadingChange={props.onLoadingChange}
        /> */}

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
