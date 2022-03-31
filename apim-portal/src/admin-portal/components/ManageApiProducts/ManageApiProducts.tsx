
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { MenuItem } from "primereact/api";

import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { TApiCallState } from "../../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE } from './ManageApiProductsCommon';
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { ListApiProducts } from "./ListApiProducts";
import { ViewApiProduct } from "./ViewApiProduct";
import { ManageEditApiProduct } from "./EditNewApiProduct/ManageEditApiProduct";
import { ManagedNewApiProduct } from "./EditNewApiProduct/ManageNewApiProduct";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay } from "../../displayServices/APAdminPortalApiProductsDisplayService";
import { DeleteApiProduct } from "./DeleteApiProduct";

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

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();
  const [isManagedObjectDeleteAllowed, setIsManagedObjectDeleteAllowed] = React.useState<boolean>(false);

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  
  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(!managedObjectDisplayName) return;
  //   if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW ||
  //       componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT
  //     ) props.setBreadCrumbLabelList([managedObjectDisplayName]);
  //   else props.setBreadCrumbLabelList([]);
  // }, [componentState, managedObjectDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_UPDATE_API_PRODUCT:
          case E_CALL_STATE_ACTIONS.API_CREATE_API_PRODUCT:
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
    setIsManagedObjectDeleteAllowed(APAdminPortalApiProductsDisplayService.get_IsDeleteAllowed({
      apApiProductDisplay: apAdminPortalApiProductDisplay
    }));
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * New Object *
  const onNewManagedObject = () => {
    setApiCallStatus(null);
    // setManagedObjectEntityId(undefined);
    // setManagedObjectHasReferences(false);
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

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    // const funcName = 'renderLeftToolbarContent';
    // const logName = `${ComponentName}.${funcName}()`;
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
          <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
          <Button label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined" disabled={!isManagedObjectDeleteAllowed} />        
        </React.Fragment>
      );
      }
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
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    setBreadCrumbItemList(itemList);
    props.setBreadCrumbItemList(itemList);
  }
  const onSubComponentAddBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
    props.setBreadCrumbItemList(newItemList);
  }
  const onSetManageObjectComponentState = (componentState: E_COMPONENT_STATE, apiProductEntityId: TAPEntityId) => {
    setManagedObjectEntityId(apiProductEntityId);
    setNewComponentState(componentState);
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
    // props.onSuccess(apiCallState);

    // don't change - user can continue editing


    // if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
    //   setManagedObjectEntityId(updatedMoEntityId);
    //   setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    // }
    // else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
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
          onManagedObjectEdit={onEditManagedObject}
          onManagedObjectDelete={onDeleteManagedObject}
          onManagedObjectView={onViewManagedObject}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />
      }
      {showViewComponent && managedObjectEntityId &&
        <ViewApiProduct
          key={`${ComponentName}_ViewApiProduct_${refreshCounter}`}
          organizationId={props.organizationEntityId.id}
          apiProductEntityId={managedObjectEntityId}
          onSuccess={onSubComponentSuccessNoChange} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onSetManageObjectComponentState}
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
        <ManagedNewApiProduct
          organizationId={props.organizationEntityId.id}
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNewSuccess={onNewManagedObjectSuccess}
          onSuccessNotification={props.onSuccess}
        />
      }
      {showEditComponent && managedObjectEntityId &&
        <ManageEditApiProduct
          organizationId={props.organizationEntityId.id}
          apiProductEntityId={managedObjectEntityId}
          onSaveSuccess={onEditSaveManagedObjectSuccess} 
          onError={onSubComponentError}
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateToCommand={onSetManageObjectComponentState}
        />
      }
    </div>
  );
}
