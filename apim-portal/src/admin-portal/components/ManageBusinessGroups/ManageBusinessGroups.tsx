
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from './ManageBusinessGroupsCommon';
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { ListAsTreeTableBusinessGroups } from "./ListAsTreeTableBusinessGroups";
import { EAction, EditNewBusinessGroups } from "./EditNewBusinessGroup";
import { DeleteBusinessGroup } from "./DeleteBusinessGroup";
import { ViewBusinessGroup } from "./ViewBusinessGroup";
import APExternalSystemsService, { TAPExternalSystemDisplayList } from "../../../services/APExternalSystemsService";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";

import '../../../components/APComponents.css';
import "./ManageBusinessGroups.css";

export interface IManageBusinessGroupsProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageBusinessGroups: React.FC<IManageBusinessGroupsProps> = (props: IManageBusinessGroupsProps) => {
  const componentName = 'ManageBusinessGroups';

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
    MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
    MANAGED_OBJECT_EDIT = "MANAGED_OBJECT_EDIT",
    MANAGED_OBJECT_DELETE = "MANAGED_OBJECT_DELETE",
    MANAGED_OBJECT_NEW = "MANAGED_OBJECT_NEW",
    MANAGED_OBJECT_IMPORT_FROM_EXTERNAL_SYSTEM = "MANAGED_OBJECT_IMPORT_FROM_EXTERNAL_SYSTEM"
  }
  type TComponentState = {
    previousState: E_COMPONENT_STATE,
    currentState: E_COMPONENT_STATE
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE.UNDEFINED,
    currentState: E_COMPONENT_STATE.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  const setPreviousComponentState = () => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: componentState.previousState
    });
  }
  
  const ToolbarNewManagedObjectButtonLabel = 'New';
  const ToolbarButtonLabelImportBusinessGroup = 'Import';

  // /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectId, setManagedObjectId] = React.useState<string>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  const [managedObjectParentEntityId, setManagedObjectParentEntityId] = React.useState<TAPEntityId>();
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [externalSystemDisplayListCapableOfImport, setExternalSystemDisplayListCapableOfImport] = React.useState<TAPExternalSystemDisplayList>([]);

  //  * Api Calls *
  const apiGetApExternalSystemsCapableOfInteractiveImportBusinessGroups = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetApExternalSystemsCapableOfInteractiveImportBusinessGroups';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EXTERNAL_SYSTEM_LIST_CAPABLE_OF_INTERACTIVE_IMPORT_OF_BUSINESS_GRAOUPS, `retrieve external systems`);
    try { 
      const list: TAPExternalSystemDisplayList = await APExternalSystemsService.listApExternalSystemDisplay_ByCapability_InteractiveImportBusinessGroups({
        organizationId: props.organizationEntityId.id
      });
      setExternalSystemDisplayListCapableOfImport(list);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }


  // * useEffect Hooks *
  const doInitialize = async () => {
    setIsLoading(true);
    await apiGetApExternalSystemsCapableOfInteractiveImportBusinessGroups();
    setIsLoading(false);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_LIST:
          case E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP:
          case E_CALL_STATE_ACTIONS.API_GET_EXTERNAL_SYSTEM_LIST_CAPABLE_OF_INTERACTIVE_IMPORT_OF_BUSINESS_GRAOUPS:
            break;
          default:
            props.onSuccess(apiCallStatus);
          }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * View Object *
  const onViewManagedObject = (businessGroupEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectId(businessGroupEntityId.id);
    setManagedObjectDisplayName(businessGroupEntityId.displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * New Object *
  const onNewManagedObject = (parentBusinessGroupEntityId: TAPEntityId | undefined) => {
    // alert(`new business group, parentBusinessGroupEntityId=${JSON.stringify(parentBusinessGroupEntityId)}`);
    setManagedObjectParentEntityId(parentBusinessGroupEntityId);
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  const onNewManagedObjectFromToolbar = () => {
    onNewManagedObject(undefined);
  }

  // * Import *
  const onImportBusinessGroup = () => {
    alert('TODO: import business group(s) from external system');
    // setApiCallStatus(null);
    // setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_FROM_EXTERNAL_SYSTEM);
  }

  // * Edit Object *
  const onEditManagedObject = (businessGroupEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectId(businessGroupEntityId.id);
    setManagedObjectDisplayName(businessGroupEntityId.displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete Object *
  const onDeleteManagedObject = (businessGroupEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectId(businessGroupEntityId.id);
    setManagedObjectDisplayName(businessGroupEntityId.displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    // const funcName = 'renderLeftToolbarContent';
    // const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState) return undefined;

    const showImportBusinessGroupButton: boolean = externalSystemDisplayListCapableOfImport.length > 0;

    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>
        {showImportBusinessGroupButton && 
          <Button label={ToolbarButtonLabelImportBusinessGroup} icon="pi pi-cloud-download" onClick={onImportBusinessGroup} className="p-button-text p-button-plain p-button-outlined"/>
        }
      </React.Fragment>
    );
    if(showViewComponent) return undefined;
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} />);
    else return (<React.Fragment></React.Fragment>);
  }
  
  // * prop callbacks *
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    // setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, newId: string, newDisplayName: string) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setManagedObjectId(newId);
      setManagedObjectDisplayName(newDisplayName);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onEditManagedObjectSuccess = (apiCallState: TApiCallState, updatedDisplayName: string | undefined) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      if(updatedDisplayName) setManagedObjectDisplayName(updatedDisplayName);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onSubComponentSuccessNoChange = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentCancel = () => {
    setPreviousComponentState();
  }

  const calculateShowStates = (componentState: TComponentState) => {
    const funcName = 'calculateShowStates';
    const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="ap-manage-business-groups">

      <CheckConnectorHealth />
      
      <Loading show={isLoading} />      
      
      { !isLoading && renderToolbar() }

      {showListComponent && 
        <ListAsTreeTableBusinessGroups
          key={refreshCounter}
          organizationId={props.organizationEntityId.id}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          onManagedObjectNew={onNewManagedObject}
          onManagedObjectEdit={onEditManagedObject}
          onManagedObjectDelete={onDeleteManagedObject}
          onManagedObjectView={onViewManagedObject}
        />
      }
      {showViewComponent && managedObjectId && managedObjectDisplayName &&
        <ViewBusinessGroup
          organizationId={props.organizationEntityId.id}
          businessGroupEntityId={{id: managedObjectId, displayName: managedObjectDisplayName}}
          onSuccess={onSubComponentSuccessNoChange} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
        />      
      }
      {showDeleteComponent && managedObjectId && managedObjectDisplayName &&
        <DeleteBusinessGroup
          organizationId={props.organizationEntityId.id}
          businessGroupEntityId={{id: managedObjectId, displayName: managedObjectDisplayName}}
          onSuccess={onDeleteManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      {showNewComponent &&
        <EditNewBusinessGroups
          action={EAction.NEW}
          organizationId={props.organizationEntityId.id}
          businessGroupParentEntityId={managedObjectParentEntityId}
          onNewSuccess={onNewManagedObjectSuccess}
          onEditSuccess={onEditManagedObjectSuccess}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading} 
        />
      }
      {showEditComponent && managedObjectId && managedObjectDisplayName &&
        <EditNewBusinessGroups
          action={EAction.EDIT}
          organizationId={props.organizationEntityId.id}
          businessGroupEntityId={{id: managedObjectId, displayName: managedObjectDisplayName}}
          onNewSuccess={onNewManagedObjectSuccess} 
          onEditSuccess={onEditManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
    </div>
  );
}
