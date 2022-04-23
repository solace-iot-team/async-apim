
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { TApiCallState } from "../../../utils/ApiCallState";
import { EAction, E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from './ManageApiProductsCommon';
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { ListApiProducts } from "./ListApiProducts";
import { ViewApiProduct } from "./ViewApiProduct";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay, 
  TAPAdminPortalApiProductDisplay_AllowedActions 
} from "../../displayServices/APAdminPortalApiProductsDisplayService";
import { DeleteApiProduct } from "./DeleteApiProduct";
import { ManageEditNewApiProduct } from "./EditNewApiProduct/ManageEditNewApiProduct";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export interface IManageApiProductsProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ManageApiProducts: React.FC<IManageApiProductsProps> = (props: IManageApiProductsProps) => {
  const ComponentName = 'ManageApiProducts';

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

  const [userContext] = React.useContext(UserContext);
  const [authContext] = React.useContext(AuthContext);
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();
  const [managedObject_AllowedActions, setManagedObject_AllowedActions] = React.useState<TAPAdminPortalApiProductDisplay_AllowedActions>(APAdminPortalApiProductsDisplayService.get_Empty_AllowedActions());

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    props.setBreadCrumbItemList(breadCrumbItemList);
  }, [breadCrumbItemList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_CREATE_VERSION_API_PRODUCT:
          case E_CALL_STATE_ACTIONS.API_DELETE_API_PRODUCT:
            props.onSuccess(apiCallStatus);
            break;
          default:
          }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedObject = (apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apAdminPortalApiProductDisplay.apEntityId);
    // // DEBUG: is the version set?
    // alert(`${ComponentName}.onViewManagedObject():  apAdminPortalApiProductDisplay.apEntityId = ${JSON.stringify(apAdminPortalApiProductDisplay.apEntityId)}`);
    setManagedObject_AllowedActions(APAdminPortalApiProductsDisplayService.get_AllowedActions({
      apAdminPortalApiProductDisplay: apAdminPortalApiProductDisplay,
      authorizedResourcePathAsString: authContext.authorizedResourcePathsAsString,
      userId: userContext.apLoginUserDisplay.apEntityId.id,
      userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id
    }));
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
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    onEditManagedObject(managedObjectEntityId);
  }
  const onEditManagedObject = (moEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(moEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    onDeleteManagedObject(managedObjectEntityId);
  }
  const onDeleteManagedObject = (moEntityId: TAPEntityId): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(moEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // // * Recover objects *
  // const onRecoverManagedObjectListFromToolbar = () => {
  //   setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_RECOVER);
  // }

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showListComponent) return (
      <React.Fragment>
        <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
      </React.Fragment>
    );
    if(showViewComponent) {          
      return (
        <React.Fragment>
          <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
          <Button 
            label={ToolbarEditManagedObjectButtonLabel} 
            icon="pi pi-pencil" 
            onClick={onEditManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined"
            disabled={!managedObject_AllowedActions.isEditAllowed}
          />        
        </React.Fragment>
      );
    }
    if(showEditComponent) return undefined;
    if(showDeleteComponent) return undefined;
    if(showNewComponent) return undefined;
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    if(showViewComponent) {
      return (
        <React.Fragment>
          <Button 
            label={ToolbarDeleteManagedObjectButtonLabel} 
            icon="pi pi-trash" 
            onClick={onDeleteManagedObjectFromToolbar} 
            className="p-button-text p-button-plain p-button-outlined" 
            disabled={!managedObject_AllowedActions.isDeleteAllowed} 
            style={{ color: "red", borderColor: 'red'}} 
          />        
        </React.Fragment>
      );
    }
    // if(showListComponent && APRbacDisplayService.isAuthorized_To_ManageRecoveredAssets(authContext.authorizedResourcePathsAsString)) {
    //   return (
    //     <Button 
    //       label={ToolbarRecoverManagedObjectListButtonLabel} 
    //       icon="pi pi-cog" 
    //       onClick={onRecoverManagedObjectListFromToolbar} 
    //       className="p-button-text p-button-plain p-button-outlined" 
    //     />        
    //   );
    // }
  }
  const renderToolbar = (): JSX.Element => {
    const rightToolbarTemplate: JSX.Element | undefined = renderRightToolbarContent();
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate || rightToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />);
    else return (<></>);
  }
  
  // * prop callbacks *
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    setBreadCrumbItemList(itemList);
  }
  const onSetManageObjectComponentState_To_View = (apiProductEntityId: TAPEntityId) => {
    setManagedObjectEntityId(apiProductEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onDeleteManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter + 1);
  }
  const onNewManagedObjectSuccess = (apiCallState: TApiCallState, newMoEntityId: TAPEntityId) => {
    setApiCallStatus(apiCallState);
    if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setManagedObjectEntityId(newMoEntityId);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    }
    else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }
  const onEditSaveManagedObjectSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }
  const onSubComponentUserNotification = (apiCallState: TApiCallState) => {
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
    const logName = `${ComponentName}.${funcName}()`;
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
      setShowDeleteComponent(false);
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
    <div className="manage-api-products">

      <CheckConnectorHealth />
      
      <Loading show={isLoading} />      
      
      { !isLoading && renderToolbar() }

      {showListComponent && 
        <ListApiProducts
          key={`${ComponentName}_ListApiProducts_${refreshCounter}`}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectView={onViewManagedObject}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {/* {showListRecoverComponent && 
        <ManageRecoverApiProducts
          key={`${ComponentName}_ListRecoverableApiProducts_${refreshCounter}`}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onMangeRecoverManagedObjectsSuccess} 
          onError={onSubComponentError} 
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateToCommand={onSetManageObjectComponentState_From_List}
        />
      } */}
      {showViewComponent && managedObjectEntityId &&
        <ViewApiProduct
          key={`${ComponentName}_showViewComponent_${refreshCounter}`}
          organizationId={props.organizationEntityId.id}
          apiProductEntityId={managedObjectEntityId}
          onSuccess={onSubComponentUserNotification} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageObjectComponentState_To_View}
        />      
      }
      {showDeleteComponent && managedObjectEntityId &&
        <DeleteApiProduct
        organizationId={props.organizationEntityId.id}
        apiProductEntityId={managedObjectEntityId}
        onError={onSubComponentError} 
        onLoadingChange={setIsLoading}
        onCancel={onSubComponentCancel}
        onDeleteSuccess={onDeleteManagedObjectSuccess}
        />
      }
      {showNewComponent &&
        <ManageEditNewApiProduct
          action={EAction.NEW}
          organizationId={props.organizationEntityId.id}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onEditNewSuccess={onNewManagedObjectSuccess}
          onUserNotification={onSubComponentUserNotification}
        />
      }
      {showEditComponent && managedObjectEntityId &&
        <ManageEditNewApiProduct
          action={EAction.EDIT}
          organizationId={props.organizationEntityId.id}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onEditNewSuccess={onEditSaveManagedObjectSuccess}
          apiProductEntityId={managedObjectEntityId}
          onNavigateToCommand={onSetManageObjectComponentState_To_View}
          onUserNotification={onSubComponentUserNotification}
        />
      }
    </div>
  );
}
