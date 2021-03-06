
import React from "react";

import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import { 
  TAPEntityId, TAPEntityIdList, 
} from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "../ManageOrganizationUsersCommon";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { EditOrganizationUserBusinessGroupRoles, EEditOrganzationUserBusinessGroupRolesAction } from "./refactor.EditOrganizationUserBusinessGroupRoles";
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupTreeTableNode, 
  TAPMemberOfBusinessGroupTreeTableNodeList 
} from "../../../../displayServices/APUsersDisplayService/APMemberOfService";
import { APDisplayOrganizationUserBusinessGroupRoles } from "../../../../components/APDisplay/APDisplayOrganizationBusinessGroups/APDisplayOrganizationUserBusinessGroupRoles";
import APBusinessGroupsDisplayService, { TAPTreeTableExpandedKeysType } from "../../../../displayServices/APBusinessGroupsDisplayService";

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

  const [apUserDisplay, setApUserDisplay] = React.useState<TAPOrganizationUserDisplay>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [editBusinessGroupRolesObject, setEditBusinessGroupsRolesObject] = React.useState<TEditBusinessGroupRoles>();
  const [removeBusinessGroupRolesObject, setRemoveBusinessGroupRolesObject] = React.useState<TEditBusinessGroupRoles>();
  const [apMemberOfBusinessGroupTreeTableNodeList, setApMemberOfBusinessGroupTreeTableNodeList] = React.useState<TAPMemberOfBusinessGroupTreeTableNodeList>();
  const [expandedKeys, setExpandedKeys] = React.useState<TAPTreeTableExpandedKeysType>();

  // * Api Calls *

  const apiGetApUserDisplay = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetApUserDisplay';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${props.userEntityId.id}`);
    try { 
      const apUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.apsGet_ApOrganizationUserDisplay({
        organizationEntityId: props.organizationEntityId,
        userId: props.userEntityId.id,
        fetch_ApOrganizationAssetInfoDisplayList: false,
      });
      setApUserDisplay(apUserDisplay);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    await apiGetApUserDisplay();
  }

  const initializeExpandedKeys = (apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList) => {
    const expandNode = (node: TAPMemberOfBusinessGroupTreeTableNode, _expandedKeys: TAPTreeTableExpandedKeysType) => {
      if (node.children && node.children.length) {
        _expandedKeys[node.key] = true;  
        for (let child of node.children) {
            expandNode(child, _expandedKeys);
        }
      }
    }
    let _expandedKeys = {};
    for(let node of apMemberOfBusinessGroupTreeTableNodeList) {
      expandNode(node, _expandedKeys);
    }
    setExpandedKeys(_expandedKeys);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apUserDisplay]';
    const logName = `${ComponentName}.${funcName}()`;

    if(apUserDisplay !== undefined) {
      if(apUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined) throw new Error(`${logName}: apUserDisplay.completeOrganizationBusinessGroupDisplayList`);
      const _apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList = APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList({
        organizationEntityId: apUserDisplay.organizationEntityId,
        apMemberOfBusinessGroupDisplayList: apUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList,
        apOrganizationRoleEntityIdList: apUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList,
        completeApOrganizationBusinessGroupDisplayList: apUserDisplay.completeOrganizationBusinessGroupDisplayList,
        pruneBusinessGroupsNotAMemberOf: false,
        accessOnly_To_BusinessGroupManageAssets: false
      });  
      setApMemberOfBusinessGroupTreeTableNodeList(_apMemberOfBusinessGroupTreeTableNodeList);
    }
  }, [apUserDisplay]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(()=> {
    if(apMemberOfBusinessGroupTreeTableNodeList !== undefined) {
      initializeExpandedKeys(apMemberOfBusinessGroupTreeTableNodeList);
    }
  },[apMemberOfBusinessGroupTreeTableNodeList]);

  React.useEffect(() => {
    if(expandedKeys !== undefined) {
      setIsInitialized(true);
    }
  }, [expandedKeys]);

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else {
        if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_GET_USER) return;
        // if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_LIST) return;
        props.onSaveSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onBusinessGroupEdit = (node: TAPMemberOfBusinessGroupTreeTableNode) => {
    setEditBusinessGroupsRolesObject({
      businessGroupEntityId: node.data.apBusinessGroupDisplay.apEntityId,
      businessGroupRoleEntityIdList: node.data.apConfiguredBusinessGroupRoleEntityIdList
    });
  }

  const onBusinessGroupRemove = (node: TAPMemberOfBusinessGroupTreeTableNode) => {
    setRemoveBusinessGroupRolesObject({
      businessGroupEntityId: node.data.apBusinessGroupDisplay.apEntityId,
      businessGroupRoleEntityIdList: node.data.apConfiguredBusinessGroupRoleEntityIdList
    });
  }

  const sourceByBodyTemplate = (node: TAPMemberOfBusinessGroupTreeTableNode): string => {
    return APBusinessGroupsDisplayService.getSourceDisplayString(node.data.apBusinessGroupDisplay);
  }

  const rolesBodyTemplate = (node: TAPMemberOfBusinessGroupTreeTableNode): JSX.Element => {
    return (
      <APDisplayOrganizationUserBusinessGroupRoles 
        apMemberOfBusinessGroupTreeTableNode={node}
      />
    );
  }

  // const topLevelBodyTemplate = (node: TAPMemberOfBusinessGroupTreeNodeDisplay): string => {
  //   const isTopLevel: boolean = node.key === props.organizationEntityId.id;
  //   return String(isTopLevel);
  // }

  const actionBodyTemplate = (node: TAPMemberOfBusinessGroupTreeTableNode) => {
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

  const renderOrganizationBusinessGroupsTreeTable = (apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList): JSX.Element => {
    // const funcName = 'renderOrganizationBusinessGroupsTreeTable';
    // const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: rendering ...`)

    if(apMemberOfBusinessGroupTreeTableNodeList.length === 0) return (
      <div><b>Business Groups</b>: None.</div>
    );
    const field_Name = 'apBusinessGroupDisplay.apEntityId.displayName';
    return (
      <React.Fragment>
        <div><b>Business Groups</b>:</div>
        <div className="card p-mt-2">
          <TreeTable
            value={apMemberOfBusinessGroupTreeTableNodeList}
            autoLayout={true}
            sortMode='single'
            sortField={field_Name}
            sortOrder={1}
            expandedKeys={expandedKeys}
            onToggle={e => setExpandedKeys(e.value)}
          >
            <Column header="Name" field={field_Name} bodyStyle={{ verticalAlign: 'top' }} sortable expander />
            <Column header="Source" body={sourceByBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
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
        
    if(apMemberOfBusinessGroupTreeTableNodeList === undefined) throw new Error(`${logName}: apMemberOfBusinessGroupTreeTableNodeList === undefined`);

    return (
      <React.Fragment>
        <div className="p-mt-2">{renderOrganizationBusinessGroupsTreeTable(apMemberOfBusinessGroupTreeTableNodeList)}</div>
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
          apOrganizationUserDisplay={apUserDisplay}
          businessGroupEntityId={editBusinessGroupRolesObject.businessGroupEntityId}
          businessGroupRoleEntityIdList={editBusinessGroupRolesObject.businessGroupRoleEntityIdList}
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
          apOrganizationUserDisplay={apUserDisplay}
          businessGroupEntityId={removeBusinessGroupRolesObject.businessGroupEntityId}
          businessGroupRoleEntityIdList={removeBusinessGroupRolesObject.businessGroupRoleEntityIdList}
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
