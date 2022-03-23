
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import APOrganizationUsersDisplayService, { 
  TAPOrganizationUserDisplay
 } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplayList, 
  TAPMemberOfOrganizationDisplay
 } from "../../../../displayServices/APUsersDisplayService/APMemberOfService";
import { 
  TAPSystemUserDisplay
 } from "../../../../displayServices/APUsersDisplayService/APSystemUsersDisplayService";
 import { TAPEntityId } from "../../../../utils/APEntityIdsService";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { NewManageOrganizationUserMemberOfOrganizationRoles } from "../EditNewOrganizationUser/NewManageOrganizationUserMemberOfOrganizationRoles";
import { EditOrganizationUserMemberOfBusinessGroups } from "../EditNewOrganizationUser/EditOrganizationUserMemberOfBusinessGroups";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";

export interface IAddOrganizationUserRolesAndGroupsProps {
  apSystemUserDisplay: TAPSystemUserDisplay;
  organizationEntityId: TAPEntityId;
  onSuccess: (apiCallState: TApiCallState, addedUserEntityId: TAPEntityId) => void;
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const AddOrganizationUserRolesAndGroups: React.FC<IAddOrganizationUserRolesAndGroupsProps> = (props: IAddOrganizationUserRolesAndGroupsProps) => {
  const ComponentName = 'AddOrganizationUserRolesAndGroups';

  type TManagedObject = TAPOrganizationUserDisplay;

  const RolesNotValid_UserMessage = 'Specify at least 1 role. Either an organization role or a role within at least 1 business group.';

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [validationMessage, setValidationMessage] = React.useState<string>();

  // * Api Calls *

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_ADD_USER_TO_ORG, `add user: ${mo.apEntityId.id}`);
    try {
      // console.log(`${logName}: mo.memberOfOrganizationDisplay = ${JSON.stringify(mo.memberOfOrganizationDisplay, null, 2)}`);
      await APOrganizationUsersDisplayService.apsUpdate_ApMemberOf({ 
        apOrganizationUserDisplay: mo,
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    const apOrganizationUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.create_ApOrganizationUserDisplay_From_ApSystemUserDisplay({
      organizationEntityId: props.organizationEntityId,
      apSystemUserDisplay: props.apSystemUserDisplay,
    });
    setManagedObject(apOrganizationUserDisplay);
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    // const funcName = 'useEffect[]';
    // const logName = `${ComponentName}.${funcName}()`;
    // console.log(`${logName}: mounting ...`);
    props.setBreadCrumbItemList([{
      label: props.apSystemUserDisplay.apEntityId.id
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // const funcName = 'useEffect[managedObject]';
    // const logName = `${ComponentName}.${funcName}()`;
    // console.log(`${logName}: managedObject = ${JSON.stringify(managedObject, null, 2)}`);
    if(managedObject !== undefined) setIsInitialized(true);
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_ADD_USER_TO_ORG) {
        if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
        props.onSuccess(apiCallStatus, managedObject.apEntityId);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doAdd = async(mo: TManagedObject) => {
    await apiUpdateManagedObject(mo);
  }

  const onAdd = () => {
    const funcName = 'onAdd';
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
    doAdd(managedObject);
  }

  const componentFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
        <Button key={ComponentName+'Add'} label="Add" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" onClick={onAdd}/>
      </React.Fragment>
    );
  }

  const renderComponentFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={componentFooterRightToolbarTemplate} />
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
      <div className="p-mt-4 p-ml-2" style={{ color: 'red' }}>
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

        {renderValidationMessage()}

        <NewManageOrganizationUserMemberOfOrganizationRoles
          key={`${ComponentName}_NewManageOrganizationUserMemberOfOrganizationRoles_${refreshCounter}`}
          apOrganizationUserDisplay={managedObject}
          onEditSuccess={onEditSuccess_OrganizationRoles}
          onCancel={props.onCancel}
          onError={props.onError}
          onLoadingChange={props.onLoadingChange}
        />

        <div className="p-ml-2">
          <EditOrganizationUserMemberOfBusinessGroups
            key={`${ComponentName}_EditOrganizationUserMemberOfBusinessGroups_${refreshCounter}`}
            apOrganizationUserDisplay={managedObject}
            onSave={onEditSuccess_BusinessGroupRoles}
            onCancel={props.onCancel}
          />
        </div>

        {renderComponentFooter()}

      </React.Fragment>
    )
  }

  
  return (
    <div className="manage-users">

      <div className="p-mb-4">
        <APComponentHeader header={`Set Roles & Business Groups:`} />
      </div>
      
      <ApiCallStatusError apiCallStatus={apiCallStatus} />

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
