
import React from "react";
import { useHistory } from 'react-router-dom';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { EUIAdminPortalResourcePaths } from "../../../utils/Globals";
import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { UserContext } from "../../../components/UserContextProvider/UserContextProvider";
import { ConfigContext } from "../../../components/ConfigContextProvider/ConfigContextProvider";
import { ConfigHelper } from "../../../components/ConfigContextProvider/ConfigHelper";
import { E_CALL_STATE_ACTIONS } from "./ManageConnectorsCommon";
import { ListConnectors } from "./ListConnectors";
import { ViewConnector } from "./ViewConnector";
import { SetConnectorActive } from "./SetConnectorActive";
import { TestConnector } from "./TestConnector";
import { DeleteConnector } from "./DeleteConnector";
import { EAction, EditNewConnector } from "./EditNewConnector";
import { APSId } from "@solace-iot-team/apim-server-openapi-browser";

import '../../../components/APComponents.css';
import "./ManageConnectors.css";

export interface IManageConnectorsProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onBreadCrumbLabelList: (breadCrumbLableList: Array<string>) => void;
}

export const ManageConnectors: React.FC<IManageConnectorsProps> = (props: IManageConnectorsProps) => {
  const componentName = 'ManageConnectors';

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
    MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
    MANAGED_OBJECT_EDIT = "MANAGED_OBJECT_EDIT",
    MANAGED_OBJECT_DELETE = "MANAGED_OBJECT_DELETE",
    MANAGED_OBJECT_NEW = "MANAGED_OBJECT_NEW",
    SET_CONNECTOR_ACTIVE = "SET_CONNECTOR_ACTIVE",
    TEST_CONNECTOR = "TEST_CONNECTOR"
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
  const ToolbarEditManagedObjectButtonLabel = 'Edit';
  const ToolbarDeleteManagedObjectButtonLabel = 'Delete';
  const ToolbarTestConnectorButtonLabel = 'Test';
  const ToolbarSetConnectorActiveButtonLabel = 'Set Active';

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectId, setManagedObjectId] = React.useState<APSId>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  const [connectorIsActive, setConnectorIsActive] = React.useState<boolean>(false);
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [showSetConnectorActive, setShowSetConnectorActive] = React.useState<boolean>(false);
  const [showTestConnector, setShowTestConnector] = React.useState<boolean>(false);
  // const [reInitializeTrigger, setReInitializeTrigger] = React.useState<number>(0);
  
  // * Logout *
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const history = useHistory();

  const navigateTo = (path: string): void => { history.push(path); }
  
  const doLogout = () => {
    dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT' });
    dispatchUserContextAction({ type: 'CLEAR_USER_CONTEXT' });
    navigateTo(EUIAdminPortalResourcePaths.Home);
  }
  // * Config Context *
  const setConfigContextActiveConnector = async() => {
    dispatchConfigContextAction({ type: 'SET_CONFIG_CONNECTOR', connector: await ConfigHelper.apiGetActiveConnectorInstance()});
  }
  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(!managedObjectDisplayName) return;
    if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW ||
        componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT
      ) props.onBreadCrumbLabelList([managedObjectDisplayName]);
    else props.onBreadCrumbLabelList([]);
  }, [componentState, managedObjectDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_DELETE_CONNECTOR:
          case E_CALL_STATE_ACTIONS.API_CREATE_CONNECTOR:
          case E_CALL_STATE_ACTIONS.API_REPLACE_CONNECTOR:
              props.onSuccess(apiCallStatus);
            break;
          default:
        }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedObject = (id: APSId, displayName: string, isActive: boolean): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setConnectorIsActive(isActive);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * New Object *
  const onNewManagedObject = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_NEW);
  }
  // * Edit Object *
  const onEditManagedObjectFromToolbar = () => {
    const funcName = 'onEditManagedObjectFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onEditManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onEditManagedObject = (id: APSId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Set Connector Active *
  const onSetConnectorActive = (id: APSId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.SET_CONNECTOR_ACTIVE);
  }   
  const onSetConnectorActiveFromToolbar = () => {
    const funcName = 'onSetConnectorActiveFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onSetConnectorActive(managedObjectId, managedObjectDisplayName);
  }
  // * Test Connector *
  const onTestConnector = (id: APSId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.TEST_CONNECTOR);
  }   
  const onTestConnectorFromToolbar = () => {
    const funcName = 'onTestConnectorFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onTestConnector(managedObjectId, managedObjectDisplayName);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectId) throw new Error(`${logName}: managedObjectId is undefined for componentState=${componentState}`);
    if(!managedObjectDisplayName) throw new Error(`${logName}: managedObjectDisplayName is undefined for componentState=${componentState}`);
    onDeleteManagedObject(managedObjectId, managedObjectDisplayName);
  }
  const onDeleteManagedObject = (id: APSId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
      </React.Fragment>
    );
    if(showViewComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
        <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
        <Button label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
        <Button label={ToolbarTestConnectorButtonLabel} icon="pi pi-fast-forward" onClick={onTestConnectorFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>
        {!connectorIsActive &&        
          <Button label={ToolbarSetConnectorActiveButtonLabel} icon="pi pi-check" onClick={onSetConnectorActiveFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
        }
      </React.Fragment>
    );
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
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, newId: APSId, newDisplayName: string) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setManagedObjectId(newId);
      setManagedObjectDisplayName(newDisplayName);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onSetConnectorActiveSuccess = (apiCallState: TApiCallState) => {
    doLogout();
    setConfigContextActiveConnector();
  }
  const onSubComponentSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onSubComponentCancel = () => {
    setPreviousComponentState();
  }

  const calculateShowStates = (componentState: TComponentState) => {
    if(!componentState.currentState) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowSetConnectorActive(false);
      setShowTestConnector(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowSetConnectorActive(false);
      setShowTestConnector(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
      componentState.currentState === E_COMPONENT_STATE.SET_CONNECTOR_ACTIVE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowSetConnectorActive(true);
      setShowTestConnector(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
      componentState.currentState === E_COMPONENT_STATE.TEST_CONNECTOR) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowSetConnectorActive(false);
      setShowTestConnector(true);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowSetConnectorActive(false);
      setShowTestConnector(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
      setShowNewComponent(false);
      setShowSetConnectorActive(false);
      setShowTestConnector(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.SET_CONNECTOR_ACTIVE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowSetConnectorActive(true);
      setShowTestConnector(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_COMPONENT_STATE.TEST_CONNECTOR) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowSetConnectorActive(false);
      setShowTestConnector(true);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
      setShowNewComponent(false);
      setShowSetConnectorActive(false);
      setShowTestConnector(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
      setShowNewComponent(false);
      setShowSetConnectorActive(false);
      setShowTestConnector(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_NEW) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
      setShowNewComponent(true);
      setShowSetConnectorActive(false);
      setShowTestConnector(false);
    }
  }

  return (
    <div className="manage-connectors">

      <Loading show={isLoading} />      
      
      {!isLoading &&
        renderToolbar()
      }
      {showListComponent && 
        <ListConnectors
          key={componentState.previousState}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectEdit={onEditManagedObject}
          onManagedObjectDelete={onDeleteManagedObject}
          onManagedObjectView={onViewManagedObject}
          onSetConnectorActive={onSetConnectorActive}
          onTestConnector={onTestConnector}
        />
      }
      {showViewComponent && managedObjectId && managedObjectDisplayName &&
        <ViewConnector
          connectorId={managedObjectId}
          connectorDisplayName={managedObjectDisplayName}
          // reInitializeTrigger={reInitializeTrigger}
          reInitializeTrigger={0}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
        />      
      }
      { showSetConnectorActive && managedObjectId && managedObjectDisplayName &&
        <SetConnectorActive
          connectorId={managedObjectId}
          connectorDisplayName={managedObjectDisplayName}
          onSuccess={onSetConnectorActiveSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      { showTestConnector && managedObjectId && managedObjectDisplayName &&
        <TestConnector
          connectorId={managedObjectId}
          connectorDisplayName={managedObjectDisplayName}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
        />
      }
      {showEditComponent && managedObjectId && managedObjectDisplayName &&
        <EditNewConnector
          action={EAction.EDIT}
          connectorId={managedObjectId}
          connectorDisplayName={managedObjectDisplayName}
          onEditSuccess={onSubComponentSuccess} 
          onNewSuccess={onNewManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      {showNewComponent && 
        <EditNewConnector
          action={EAction.NEW}
          onEditSuccess={onSubComponentSuccess} 
          onNewSuccess={onNewManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
      {showDeleteComponent && managedObjectId && managedObjectDisplayName &&
        <DeleteConnector
          connectorId={managedObjectId}
          connectorDisplayName={managedObjectDisplayName}
          onSuccess={onDeleteManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
        />
      }
    </div>
  );
}
