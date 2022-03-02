
import React from "react";

import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import { 
  TAPEntityId, TAPEntityIdList, 
} from "../../../../utils/APEntityIdsService";
import APUsersDisplayService, { 
  TAPMemberOfBusinessGroupDisplayList, 
  TAPMemberOfBusinessGroupTreeNodeDisplay, 
  TAPMemberOfBusinessGroupTreeNodeDisplayList, 
  TAPUserDisplay
} from "../../../../displayServices/old.APUsersDisplayService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from "../../../../displayServices/APBusinessGroupsDisplayService";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { EditOrganizationUserBusinessGroupRoles, EEditOrganzationUserBusinessGroupRolesAction } from "./EditOrganizationUserBusinessGroupRoles";
import { APDisplayOrganizationBusinessGroupRoles } from "../../../../components/APDisplay/APDisplayOrganizationBusinessGroups/APDisplayOrganizationBusinessGroupRoles";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface IManageListOrganizationUserMemberOfBusinessGroupsProps {
  organizationEntityId: TAPEntityId;
  userEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSaveSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ManageListOrganizationUserMemberOfBusinessGroups: React.FC<IManageListOrganizationUserMemberOfBusinessGroupsProps> = (props: IManageListOrganizationUserMemberOfBusinessGroupsProps) => {
  const ComponentName = 'ManageListOrganizationUserMemberOfBusinessGroups';

  type TEditBusinessGroupRoles = {
    businessGroupEntityId: TAPEntityId;
    businessGroupRoleEntityIdList: TAPEntityIdList;
  };

  const [apUserDisplay, setApUserDisplay] = React.useState<TAPUserDisplay>();
  const [completeOrganizationApBusinessGroupDisplayList, setCompleteOrganizationApBusinessGroupDisplayList] = React.useState<TAPBusinessGroupDisplayList>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [editBusinessGroupRolesObject, setEditBusinessGroupsRolesObject] = React.useState<TEditBusinessGroupRoles>();
  const [removeBusinessGroupRolesObject, setRemoveBusinessGroupRolesObject] = React.useState<TEditBusinessGroupRoles>();

  // * Api Calls *

  const apiGetApUserDisplay = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiGetApUserDisplay';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${userEntityId.id}`);
    try { 
      const object: TAPUserDisplay = await APUsersDisplayService.apsGet_ApUserDisplay({
        userId: userEntityId.id
      });
      setApUserDisplay(object);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  const apiGetCompleteApBusinessGroupDisplayList = async(organizationId: string): Promise<TApiCallState> => {
    const funcName = 'apiGetCompleteApBusinessGroupDisplayList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_LIST, 'retrieve list of business groups');
    try {
      const list: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: organizationId
      });
      setCompleteOrganizationApBusinessGroupDisplayList(list);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    await apiGetApUserDisplay(props.userEntityId);
    await apiGetCompleteApBusinessGroupDisplayList(props.organizationEntityId.id);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(completeOrganizationApBusinessGroupDisplayList.length > 0) setIsInitialized(true);
  }, [completeOrganizationApBusinessGroupDisplayList]); /* eslint-disable-line react-hooks/exhaustive-deps */


  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_GET_USER) return;
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_LIST) return;
        props.onSaveSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onBusinessGroupEdit = (node: TAPMemberOfBusinessGroupTreeNodeDisplay) => {
    setEditBusinessGroupsRolesObject({
      businessGroupEntityId: node.data.apBusinessGroupDisplay.apEntityId,
      businessGroupRoleEntityIdList: node.data.apConfiguredBusinessGroupRoleEntityIdList
    });
  }

  const onBusinessGroupRemove = (node: TAPMemberOfBusinessGroupTreeNodeDisplay) => {
    setRemoveBusinessGroupRolesObject({
      businessGroupEntityId: node.data.apBusinessGroupDisplay.apEntityId,
      businessGroupRoleEntityIdList: node.data.apConfiguredBusinessGroupRoleEntityIdList
    });
  }

  const rolesBodyTemplate = (node: TAPMemberOfBusinessGroupTreeNodeDisplay): JSX.Element => {
    return (
      <APDisplayOrganizationBusinessGroupRoles 
        apMemberOfBusinessGroupTreeNodeDisplay={node}
      />
    );
  }

  // const topLevelBodyTemplate = (node: TAPMemberOfBusinessGroupTreeNodeDisplay): string => {
  //   const isTopLevel: boolean = node.key === props.organizationEntityId.id;
  //   return String(isTopLevel);
  // }

  const actionBodyTemplate = (node: TAPMemberOfBusinessGroupTreeNodeDisplay) => {
    const isTopLevel: boolean = node.key === props.organizationEntityId.id;
    const isRemovePossible: boolean = node.data.apConfiguredBusinessGroupRoleEntityIdList.length > 0;
    const editIcon: string = (node.data.apConfiguredBusinessGroupRoleEntityIdList.length > 0 ? "pi pi-pencil" : "pi pi-plus");
    const key = node.key;
    if(isTopLevel) return (<></>);
    return (
      <React.Fragment>
        <Button key={`edit-${key}`} icon={editIcon} className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" style={{ border: 'none'}} onClick={() => onBusinessGroupEdit(node)} />
        <Button key={`delete-${key}`} icon="pi pi-times" className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" style={{ border: 'none'}} onClick={() => onBusinessGroupRemove(node)} disabled={!isRemovePossible} />
      </React.Fragment>
    );
  }

  const renderOrganizationBusinessGroupsTreeTable = (apMemberOfBusinessGroupTreeNodeDisplayList: TAPMemberOfBusinessGroupTreeNodeDisplayList): JSX.Element => {
    if(apMemberOfBusinessGroupTreeNodeDisplayList.length === 0) return (
      <div><b>Business Groups</b>: None.</div>
    );
    const field_Name = 'apBusinessGroupDisplay.apEntityId.displayName';
    return (
      <React.Fragment>
        <div><b>Business Groups</b>:</div>
        <div className="card p-mt-2">
          <TreeTable
            value={apMemberOfBusinessGroupTreeNodeDisplayList}
            autoLayout={true}
            sortMode='single'
            sortField={field_Name}
            sortOrder={1}
          >
            <Column header="Name" field={field_Name} bodyStyle={{ verticalAlign: 'top' }} sortable expander />
            {/* <Column header="isToplevel?" body={topLevelBodyTemplate} bodyStyle={{verticalAlign: 'top'}} /> */}
            <Column header="Roles" body={rolesBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
            <Column body={actionBodyTemplate} bodyStyle={{verticalAlign: 'top', textAlign: 'right' }} />
          </TreeTable>
        </div>

        {/* DEBUG */}
        {/* <p><b>apMemberOfBusinessGroupTreeNodeDisplayList=</b></p>
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(apMemberOfBusinessGroupTreeNodeDisplayList, null, 2)}
        </pre> */}

      </React.Fragment>
    );
  }

  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(apUserDisplay === undefined) throw new Error(`${logName}: apUserDisplay === undefined`);
    const apMemberOfBusinessGroupsDisplayList: TAPMemberOfBusinessGroupDisplayList = APUsersDisplayService.find_ApMemberOfBusinessGroupDisplayList({
      organizationId: props.organizationEntityId.id,
      apUserDisplay: apUserDisplay
    });
    // console.log(`${logName}: apMemberOfBusinessGroupsDisplayList=\n${JSON.stringify(apMemberOfBusinessGroupsDisplayList, null, 2)}`);
    const treeNodeList: TAPMemberOfBusinessGroupTreeNodeDisplayList = APUsersDisplayService.generate_ApMemberOfBusinessGroupsTreeNodeDisplay({
      apMemberOfBusinessGroupDisplayList: apMemberOfBusinessGroupsDisplayList,
      apBusinessGroupDisplayList: completeOrganizationApBusinessGroupDisplayList
    });
    return (
      <React.Fragment>
        <div className="p-mt-2">{renderOrganizationBusinessGroupsTreeTable(treeNodeList)}</div>
      </React.Fragment>
    );
  }

  const onCancelEditBusinessGroupRoles = () => {
    setEditBusinessGroupsRolesObject(undefined);
    setRemoveBusinessGroupRolesObject(undefined);
  }
  const onSaveEditBusinessGroupRoles = (apiCallState: TApiCallState) => {
    props.onSaveSuccess(apiCallState);
    // setApiCallStatus(apiCallState);
    setEditBusinessGroupsRolesObject(undefined);
    setRemoveBusinessGroupRolesObject(undefined);
  }
  const onErrorEditBusinessGroupRoles = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setEditBusinessGroupsRolesObject(undefined);
    setRemoveBusinessGroupRolesObject(undefined);
  }

  const renderEditBusinessGroupRolesDialog = (editBusinessGroupRolesObject: TEditBusinessGroupRoles) => {
    const funcName = 'renderEditBusinessGroupRolesDialog';
    const logName = `${ComponentName}.${funcName}()`;
   
    if(apUserDisplay === undefined) throw new Error(`${logName}: apUserDisplay === undefined`);

    const dialogHeader = 'Edit User Role(s)';

    return (
      <Dialog
        className="p-fluid"
        visible={true} 
        style={{ width: '60%' }} 
        header={dialogHeader}
        modal
        closable={true}
        onHide={()=> { onCancelEditBusinessGroupRoles(); }}
      >
        <div className="p-mb-6">Business group: <b>{editBusinessGroupRolesObject.businessGroupEntityId.displayName}</b>.</div>
        <EditOrganizationUserBusinessGroupRoles
          action={EEditOrganzationUserBusinessGroupRolesAction.EDIT}
          organizationEntityId={props.organizationEntityId}
          businessGroupEntityId={editBusinessGroupRolesObject.businessGroupEntityId}
          businessGroupRoleEntityIdList={editBusinessGroupRolesObject.businessGroupRoleEntityIdList}
          completeOrganizationApBusinessGroupDisplayList={completeOrganizationApBusinessGroupDisplayList}
          apUserDisplay={apUserDisplay}
          onSaveSuccess={onSaveEditBusinessGroupRoles}
          onCancel={onCancelEditBusinessGroupRoles}
          onError={onErrorEditBusinessGroupRoles}
          onLoadingChange={props.onLoadingChange}
        />
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  }

  const renderRemoveBusinessGroupRolesDialog = (removeBusinessGroupRolesObject: TEditBusinessGroupRoles) => {
    const funcName = 'renderRemoveBusinessGroupRolesDialog';
    const logName = `${ComponentName}.${funcName}()`;
   
    if(apUserDisplay === undefined) throw new Error(`${logName}: apUserDisplay === undefined`);

    const dialogHeader = 'Remove User from Business Group';

    return (
      <Dialog
        className="p-fluid"
        visible={true} 
        style={{ width: '60%' }} 
        header={dialogHeader}
        modal
        closable={true}
        onHide={()=> { onCancelEditBusinessGroupRoles(); }}
      >
        <div className="p-mb-6">Business group: <b>{removeBusinessGroupRolesObject.businessGroupEntityId.displayName}</b>.</div>
        <EditOrganizationUserBusinessGroupRoles
          action={EEditOrganzationUserBusinessGroupRolesAction.REMOVE}
          organizationEntityId={props.organizationEntityId}
          businessGroupEntityId={removeBusinessGroupRolesObject.businessGroupEntityId}
          businessGroupRoleEntityIdList={removeBusinessGroupRolesObject.businessGroupRoleEntityIdList}
          completeOrganizationApBusinessGroupDisplayList={completeOrganizationApBusinessGroupDisplayList}
          apUserDisplay={apUserDisplay}
          onSaveSuccess={onSaveEditBusinessGroupRoles}
          onCancel={onCancelEditBusinessGroupRoles}
          onError={onErrorEditBusinessGroupRoles}
          onLoadingChange={props.onLoadingChange}
        />
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  }

  return (
    <div className="manage-users">

      {isInitialized && 
        renderComponent()
      }

      {editBusinessGroupRolesObject &&
        renderEditBusinessGroupRolesDialog(editBusinessGroupRolesObject)
      }

      {removeBusinessGroupRolesObject &&
        renderRemoveBusinessGroupRolesDialog(removeBusinessGroupRolesObject)
      }

    </div>
  );

}
