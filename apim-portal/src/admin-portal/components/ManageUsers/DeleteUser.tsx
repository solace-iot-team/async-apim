
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { 
  APSOrganizationIdList,
  APSUser,
  ApsUsersService, 
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { CommonDisplayName, CommonName } from "@solace-iot-team/apim-connector-openapi-browser";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, E_ManageUsers_Scope, ManageUsersCommon, TManagedObjectId, TManageOrganizationUsersScope, TManageUsersScope, TViewManagedObject } from "./ManageUsersCommon";
import { TAPAssetInfoWithOrgList } from "../../../utils/APTypes";
import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";

import '../../../components/APComponents.css';
import "./ManageUsers.css";
import { Globals } from "../../../utils/Globals";

export interface IDeleteUserProps {
  userId: TManagedObjectId;
  userDisplayName: string;
  scope: TManageUsersScope;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeleteUser: React.FC<IDeleteUserProps> = (props: IDeleteUserProps) => {
  const componentName = 'DeleteUser';

  type TManagedObject = TViewManagedObject;

  const SystemDeleteManagedObjectConfirmDialogHeader = "Confirm Deleting User";
  const OrgDeleteManagedObjectConfirmDialogHeader = "Confirm Deleting User";
  const DeleteManagedObjectNotPossibleDialogHeader = "User Cannot be Deleted";

  const [configContext] = React.useContext(ConfigContext); 
  const [showManagedObjectDeleteDialog, setShowManagedObjectDeleteDialog] = React.useState<boolean>(true);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [isInitializing, setIsInitializing] = React.useState<boolean>(false);

  // * Api Calls *
  const apiGetManagedObject = async(organizationId: CommonName | undefined): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${props.userId}`);
    try { 
      const apsUser: APSUser = await ApsUsersService.getApsUser({
        userId: props.userId
      });
      let userAssetInfoList: TAPAssetInfoWithOrgList = await ManageUsersCommon.getUserAssetList(apsUser, organizationId);
      setManagedObject(ManageUsersCommon.transformViewApiObjectToViewManagedObject(configContext, apsUser, userAssetInfoList));
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiDeleteManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_DELETE_USER, `delete user: ${props.userId}`);
    try { 
      await ApsUsersService.deleteApsUser({
        userId: props.userId
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiRemoveOrgIdFromManagedObject = async(orgId: CommonName): Promise<TApiCallState> => {
    const funcName = 'apiRemoveOrgIdFromManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_REMOVE_ORG, `remove user ${props.userId} from org ${orgId}`);
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    if(!managedObject.apiObject.memberOfOrganizations) throw new Error(`${logName}: managedObject.apiObject.memberOfOrganizations is undefined`);
    try { 
      const newMemberOfOrgList: APSOrganizationIdList = managedObject.apiObject.memberOfOrganizations.filter((org: string) => { return org !== orgId});
      await ApsUsersService.updateApsUser({
        userId: props.userId,
        requestBody: {
          memberOfOrganizations: newMemberOfOrgList
        }
      });
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    let _orgId: CommonName | undefined = undefined;
    const _type = props.scope.type;
    switch(_type) {
      case E_ManageUsers_Scope.ALL_USERS:
        _orgId = undefined;
        break;
      case E_ManageUsers_Scope.ORG_USERS:
        const orgUsersScope = props.scope as TManageOrganizationUsersScope;
        _orgId = orgUsersScope.organizationId;
        break;
      default:
        Globals.assertNever(logName, _type);
    }
    setIsInitializing(true);
    props.onLoadingChange(true);
    await apiGetManagedObject(_orgId);
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(!isInitializing) props.onSuccess(apiCallStatus);
      setIsInitializing(false);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * UI Controls *
  const doDeleteManagedObject = async () => {
    const funcName = 'doDeleteManagedObject';
    const logName = `${componentName}.${funcName}()`;
    const _type = props.scope.type;
    switch(_type) {
      case E_ManageUsers_Scope.ALL_USERS:
        props.onLoadingChange(true);
        await apiDeleteManagedObject();
        props.onLoadingChange(false);
        break;
      case E_ManageUsers_Scope.ORG_USERS:
        const orgUsersScope = props.scope as TManageOrganizationUsersScope;
        props.onLoadingChange(true);
        await apiRemoveOrgIdFromManagedObject(orgUsersScope.organizationId);
        props.onLoadingChange(false);
        break;
      default:
        Globals.assertNever(logName, _type);
    }
  }

  const onDeleteManagedObject = () => {
    doDeleteManagedObject();
  }

  const onDeleteManagedObjectCancel = () => {
    setShowManagedObjectDeleteDialog(false);
    props.onCancel();
  }

  const renderDeleteNotPossibleDialog = (numAssets: number): JSX.Element => {
    const renderFooter = (): JSX.Element => {
      return (
        <React.Fragment>
          <Button label="Ok" className="p-button-text p-button-plain" onClick={onDeleteManagedObjectCancel} />
        </React.Fragment>
      );
    } 
    return (
      <Dialog
        className="p-fluid"
        visible={showManagedObjectDeleteDialog} 
        style={{ width: '450px' }} 
        header={DeleteManagedObjectNotPossibleDialogHeader}
        modal
        closable={false}
        footer={renderFooter()}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
          <p><i className="pi pi-exclamation-circle p-mr-3" style={{ fontSize: '2rem'}} />
            User has {numAssets} asset(s).
          </p>
          <p>Delete all the assets first.</p>
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  }

  const renderSystemDeleteManagedObjectDialogContent = (): JSX.Element => {
    const funcName = 'renderSystemDeleteManagedObjectDialogContent';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);

    return (
      <React.Fragment>
        <p>Deleting user <b>{props.userId}</b>.</p>
        {managedObject.apiObject.isActivated &&
          <p>Alternatively, you could de-activate the user.</p>
        }
        <p>Are you sure you want to delete it?</p>
      </React.Fragment>  
    );
  }

  const renderSystemDeleteManagedObjectDialogFooter = (): JSX.Element => {
    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onDeleteManagedObjectCancel} />
          <Button label="Delete" icon="pi pi-trash" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject}/>
      </React.Fragment>
    );
  } 

  const renderOrgDeleteManagedObjectDialogContent = (): JSX.Element => {
    const funcName = 'renderOrgDeleteManagedObjectDialogContent';
    const logName = `${componentName}.${funcName}()`;
    let _orgDisplayName: CommonDisplayName = '';
    if(props.scope.type === E_ManageUsers_Scope.ORG_USERS) {
      const orgUsersScope = props.scope as TManageOrganizationUsersScope;
      _orgDisplayName = orgUsersScope.organizationDisplayName;
    } else throw new Error(`${logName}: wrong props.scope.type = ${props.scope.type}`);
    return (
      <React.Fragment>
        <p>Delete user <b>{props.userId}</b> from organization <b>{_orgDisplayName}</b>.</p>
        <p>Are you sure you want to delete it?</p>
      </React.Fragment>  
    );
  }

  const renderOrgDeleteManagedObjectDialogFooter = (): JSX.Element => {
    return (
      <React.Fragment>
          <Button label="Cancel" className="p-button-text p-button-plain" onClick={onDeleteManagedObjectCancel} />
          <Button label="Delete" icon="pi pi-trash" className="p-button-text p-button-plain p-button-outlined" onClick={onDeleteManagedObject}/>
      </React.Fragment>
    );
  } 

  const renderManagedObjectDeleteDialog = (): JSX.Element => {
    const funcName = 'renderManagedObjectDeleteDialog';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    if(managedObject.userAssetInfoList.length > 0) return renderDeleteNotPossibleDialog(managedObject.userAssetInfoList.length);
    const _type = props.scope.type;
    let renderDialogFooterFunc = renderSystemDeleteManagedObjectDialogFooter;
    let renderDialogContentFunc = renderSystemDeleteManagedObjectDialogContent;
    let dialogHeader = SystemDeleteManagedObjectConfirmDialogHeader;
    switch(_type) {
      case E_ManageUsers_Scope.ALL_USERS:
        renderDialogFooterFunc = renderSystemDeleteManagedObjectDialogFooter;
        renderDialogContentFunc = renderSystemDeleteManagedObjectDialogContent;
        dialogHeader = SystemDeleteManagedObjectConfirmDialogHeader;
        break;
      case E_ManageUsers_Scope.ORG_USERS:
        renderDialogFooterFunc = renderOrgDeleteManagedObjectDialogFooter;
        renderDialogContentFunc = renderOrgDeleteManagedObjectDialogContent;
        dialogHeader = OrgDeleteManagedObjectConfirmDialogHeader;
        break;
      default:
        Globals.assertNever(logName, _type);
    }

    return (
      <Dialog
        className="p-fluid"
        visible={showManagedObjectDeleteDialog} 
        style={{ width: '450px' }} 
        header={dialogHeader}
        modal
        closable={false}
        footer={renderDialogFooterFunc()}
        onHide={()=> {}}
      >
        <div className="confirmation-content">
            <p><i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} /></p>
            {renderDialogContentFunc()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <React.Fragment>
      {managedObject &&
        <div className="manage-users">
          {renderManagedObjectDeleteDialog()}
        </div>
      }
      {/* DEBUG */}
      {/* <pre style={ { fontSize: '12px' }} >
        managedObject={JSON.stringify(managedObject, null, 2)}
      </pre> */}
    </React.Fragment>
  );
}
