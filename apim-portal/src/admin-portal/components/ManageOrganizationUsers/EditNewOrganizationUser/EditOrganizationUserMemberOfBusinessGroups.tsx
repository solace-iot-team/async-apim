
import React from "react";

import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import { TAPOrganizationUserDisplay } from "../../../../displayServices/APUsersDisplayService/APOrganizationUsersDisplayService";
import APMemberOfService, { 
  TAPMemberOfBusinessGroupDisplayList,
  TAPMemberOfBusinessGroupTreeTableNode,
  TAPMemberOfBusinessGroupTreeTableNodeList 
} from "../../../../displayServices/APUsersDisplayService/APMemberOfService";
import { APDisplayOrganizationUserBusinessGroupRoles } from "../../../../components/APDisplay/APDisplayOrganizationBusinessGroups/APDisplayOrganizationUserBusinessGroupRoles";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { Dialog } from "primereact/dialog";
import { EditOrganizationUserBusinessGroupRoles, EEditOrganizationUserBusinessGroupRolesAction } from "./EditOrganizationUserBusinessGroupRoles";
import APBusinessGroupsDisplayService, { TAPTreeTableExpandedKeysType } from "../../../../displayServices/APBusinessGroupsDisplayService";

import '../../../../components/APComponents.css';
import "../ManageOrganizationUsers.css";

export interface IEditOrganizationUserMemberOfBusinessGroupsProps {
  apOrganizationUserDisplay: TAPOrganizationUserDisplay;
  onSave: (updated_ApMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList) => void;
  onCancel: () => void;
}

export const EditOrganizationUserMemberOfBusinessGroups: React.FC<IEditOrganizationUserMemberOfBusinessGroupsProps> = (props: IEditOrganizationUserMemberOfBusinessGroupsProps) => {
  const ComponentName = 'EditOrganizationUserMemberOfBusinessGroups';

  type TEditBusinessGroupRoles = {
    businessGroupEntityId: TAPEntityId;
    // businessGroupRoleEntityIdList: TAPEntityIdList;
  };

  const [editBusinessGroupRolesObject, setEditBusinessGroupsRolesObject] = React.useState<TEditBusinessGroupRoles>();
  const [removeBusinessGroupRolesObject, setRemoveBusinessGroupRolesObject] = React.useState<TEditBusinessGroupRoles>();
  const [apMemberOfBusinessGroupTreeTableNodeList, setApMemberOfBusinessGroupTreeTableNodeList] = React.useState<TAPMemberOfBusinessGroupTreeTableNodeList>();
  const [expandedKeys, setExpandedKeys] = React.useState<TAPTreeTableExpandedKeysType>();
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);


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

  React.useEffect(() => {
    const funcName = 'useEffect[]';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined) throw new Error(`${logName}: props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined`);
        
    const apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList = APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList({
      organizationEntityId: props.apOrganizationUserDisplay.organizationEntityId,
      apMemberOfBusinessGroupDisplayList: props.apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList,
      apOrganizationRoleEntityIdList: props.apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList,
      completeApOrganizationBusinessGroupDisplayList: props.apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList,
      pruneBusinessGroupsNotAMemberOf: false,
      accessOnly_To_BusinessGroupManageAssets: false,
    });
    setApMemberOfBusinessGroupTreeTableNodeList(apMemberOfBusinessGroupTreeTableNodeList);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const onBusinessGroupEdit = (node: TAPMemberOfBusinessGroupTreeTableNode) => {
    setEditBusinessGroupsRolesObject({
      businessGroupEntityId: node.data.apBusinessGroupDisplay.apEntityId,
      // businessGroupRoleEntityIdList: node.data.apConfiguredBusinessGroupRoleEntityIdList
    });
  }

  const onBusinessGroupRemove = (node: TAPMemberOfBusinessGroupTreeTableNode) => {
    setRemoveBusinessGroupRolesObject({
      businessGroupEntityId: node.data.apBusinessGroupDisplay.apEntityId,
      // businessGroupRoleEntityIdList: node.data.apConfiguredBusinessGroupRoleEntityIdList
    });
  }

  const actionBodyTemplate = (node: TAPMemberOfBusinessGroupTreeTableNode) => {
    const isTopLevel: boolean = node.key === props.apOrganizationUserDisplay.organizationEntityId.id;
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

  const renderBusinessGroupsTreeTable = (apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList): JSX.Element => {
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
        <div className="p-mt-2">{renderBusinessGroupsTreeTable(apMemberOfBusinessGroupTreeTableNodeList)}</div>
      </React.Fragment>
    );
  }

  const onCancelEditBusinessGroupRoles = () => {
    setEditBusinessGroupsRolesObject(undefined);
    setRemoveBusinessGroupRolesObject(undefined);
  }
  const onSaveEditBusinessGroupRoles = (updated_ApMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList) => {
    props.onSave(updated_ApMemberOfBusinessGroupDisplayList);
    setEditBusinessGroupsRolesObject(undefined);
    setRemoveBusinessGroupRolesObject(undefined);
  }

  const renderEditBusinessGroupRolesDialog = (editBusinessGroupRolesObject: TEditBusinessGroupRoles) => {
    // const funcName = 'renderEditBusinessGroupRolesDialog';
    // const logName = `${ComponentName}.${funcName}()`;
   
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
          action={EEditOrganizationUserBusinessGroupRolesAction.EDIT}
          apOrganizationUserDisplay={props.apOrganizationUserDisplay}
          businessGroupEntityId={editBusinessGroupRolesObject.businessGroupEntityId}
          onSave={onSaveEditBusinessGroupRoles}
          onCancel={onCancelEditBusinessGroupRoles}
        />
      </Dialog>
    );
  }

  const renderRemoveBusinessGroupRolesDialog = (removeBusinessGroupRolesObject: TEditBusinessGroupRoles) => {
    // const funcName = 'renderRemoveBusinessGroupRolesDialog';
    // const logName = `${ComponentName}.${funcName}()`;
   
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
          action={EEditOrganizationUserBusinessGroupRolesAction.REMOVE}
          apOrganizationUserDisplay={props.apOrganizationUserDisplay}
          businessGroupEntityId={removeBusinessGroupRolesObject.businessGroupEntityId}
          onSave={onSaveEditBusinessGroupRoles}
          onCancel={onCancelEditBusinessGroupRoles}
        />
      </Dialog>
    );
  }

  return (
    <div className="manage-users">

      { isInitialized && renderComponent() }

      {editBusinessGroupRolesObject &&
        renderEditBusinessGroupRolesDialog(editBusinessGroupRolesObject)
      }

      {removeBusinessGroupRolesObject &&
        renderRemoveBusinessGroupRolesDialog(removeBusinessGroupRolesObject)
      }

    </div>
  );

}
