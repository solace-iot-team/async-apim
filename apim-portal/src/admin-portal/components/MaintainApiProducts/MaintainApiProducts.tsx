
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { TApiCallState } from "../../../utils/ApiCallState";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from "./MaintainApiProductsCommon";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay, 
  TAPAdminPortalApiProductDisplay_AllowedActions 
} from "../../displayServices/APAdminPortalApiProductsDisplayService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { AuthContext } from "../../../components/AuthContextProvider/AuthContextProvider";
import { ListMaintainApiProducts } from "./ListMaintainApiProducts";
import { ViewApiProduct } from "../ManageApiProducts/ViewApiProduct";
import { ManageEditNewApiProduct } from "../ManageApiProducts/EditNewApiProduct/ManageEditNewApiProduct";
import { EAction } from "../ManageApiProducts/ManageApiProductsCommon";
import { DeleteApiProduct } from "../ManageApiProducts/DeleteApiProduct";

import '../../../components/APComponents.css';
import "./MaintainApiProducts.css";
import { E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE } from "../ManageApiProducts/DisplayApiProduct";

export interface IMaintainApiProductsProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const MaintainApiProducts: React.FC<IMaintainApiProductsProps> = (props: IMaintainApiProductsProps) => {
  const ComponentName = 'MaintainApiProducts';

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
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  
  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  // * initialized object *
  const onInitializedManagedObject = (apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay) => {
    setManagedObject_AllowedActions(APAdminPortalApiProductsDisplayService.get_AllowedActions({
      apAdminPortalApiProductDisplay: apAdminPortalApiProductDisplay,
      authorizedResourcePathAsString: authContext.authorizedResourcePathsAsString,
      userId: userContext.apLoginUserDisplay.apEntityId.id,
      userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id
    }));
  }
  //  * View Object *
  const onViewManagedObject = (apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apAdminPortalApiProductDisplay.apEntityId);
    setManagedObject_AllowedActions(APAdminPortalApiProductsDisplayService.get_AllowedActions({
      apAdminPortalApiProductDisplay: apAdminPortalApiProductDisplay,
      authorizedResourcePathAsString: authContext.authorizedResourcePathsAsString,
      userId: userContext.apLoginUserDisplay.apEntityId.id,
      userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id
    }));
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  
  // * Edit Object *
  const onEditManagedObjectFromToolbar = () => {
    const funcName = 'onEditManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  // * Delete Object *
  const onDeleteManagedObjectFromToolbar = () => {
    const funcName = 'onDeleteManagedObjectFromToolbar';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId === undefined, componentState=${componentState}`);
    setApiCallStatus(null);
    setManagedObjectEntityId(managedObjectEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_DELETE);
  }
  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showViewComponent) {          
      return (
        <React.Fragment>
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
  }
  const renderToolbar = (): JSX.Element => {
    const rightToolbarTemplate: JSX.Element | undefined = renderRightToolbarContent();
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate || rightToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />);
    else return (<></>);
  }
  
  // * prop callbacks *
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    props.setBreadCrumbItemList(itemList);
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
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(false);
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW && 
              componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(true);
      setShowViewComponent(false);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(false)
    }
    else if(  componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW && 
      componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_DELETE) {
      setShowListComponent(false);
      setShowViewComponent(true);
      setShowEditComponent(false);
      setShowDeleteComponent(true);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowListComponent(false);
      setShowViewComponent(false);
      setShowEditComponent(true);
      setShowDeleteComponent(false);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="ap-maintain-api-products">

      <CheckConnectorHealth />
      
      <Loading show={isLoading} />      
      
      { !isLoading && renderToolbar() }

      {showListComponent && 
        <ListMaintainApiProducts
          key={`${ComponentName}_ListMaintainApiProducts_${refreshCounter}`}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onListManagedObjectsSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectView={onViewManagedObject}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {showViewComponent && managedObjectEntityId &&
        <ViewApiProduct
          key={`${ComponentName}_showViewComponent_${refreshCounter}`}
          organizationId={props.organizationEntityId.id}
          apiProductEntityId={managedObjectEntityId}
          onInitialized={onInitializedManagedObject}
          onSuccess={onSubComponentUserNotification} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageObjectComponentState_To_View}
          scope={E_DISPLAY_ADMIN_PORTAL_API_PRODUCT_SCOPE.VIEW_EXISTING_MAINTAIN}
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
