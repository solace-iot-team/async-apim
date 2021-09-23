
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { E_EVENT_PORTAL_CALL_STATE_ACTIONS, TManagedObjectId } from "./ManageApisCommon";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { EventPortalListEventApiProducts } from "./EventPortalListEventApiProducts";
import { EventPortalImportApiDialog } from "./EventPortalImportApiDialog";

import '../../../components/APComponents.css';
import "./ManageApis.css";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";

export interface IEventPortalImportApiProps {
  organizationId: TAPOrganizationId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  onBreadCrumbLabelList: (breadCrumbLableList: Array<string>) => void;
}

export const EventPortalImportApi: React.FC<IEventPortalImportApiProps> = (props: IEventPortalImportApiProps) => {
  const componentName = 'EventPortalImportApi';

  const breadCrumbLabelList = ['Event Portal:Event API Products'];

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
    // MANAGED_OBJECT_IMPORT = "MANAGED_OBJECT_IMPORT",
    MANAGED_OBJECT_IMPORT_DIALOG = "MANAGED_OBJECT_IMPORT_DIALOG"
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
  
  // const ToolbarNewManagedObjectButtonLabel = 'New';
  // const ToolbarEditManagedObjectButtonLabel = 'Edit';
  // const ToolbarDeleteManagedObjectButtonLabel = 'Delete';
  // const ToolbarButtonLabelImportEventPortal = 'Import from Event Portal';

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  // const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // const [managedObjectId, setManagedObjectId] = React.useState<TManagedObjectId>();
  // const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  const [importManagedObjectId, setImportManagedObjectId] = React.useState<TManagedObjectId>();
  const [importManagedObjectDisplayName, setImportManagedObjectDisplayName] = React.useState<string>();
  const [importEventPortalId, setImportEventPortalId] = React.useState<string>();

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showImportComponent, setShowImportComponent] = React.useState<boolean>(false);
  
  // * useEffect Hooks *
  React.useEffect(() => {
    props.onBreadCrumbLabelList(breadCrumbLabelList);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(!managedObjectDisplayName) return;
  //   if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW ||
  //       componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT
  //     ) props.onBreadCrumbLabelList([managedObjectDisplayName]);
  //   else props.onBreadCrumbLabelList([]);
  // }, [componentState, managedObjectDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if (apiCallStatus !== null) {
  //     if(apiCallStatus.success) {
  //       switch (apiCallStatus.context.action) {
  //         case E_CALL_STATE_ACTIONS.API_DELETE_API:
  //         case E_CALL_STATE_ACTIONS.API_CREATE_API:
  //         case E_CALL_STATE_ACTIONS.API_UPDATE_API:
  //             props.onSuccess(apiCallStatus);
  //           break;
  //         default:
  //       }
  //     } else props.onError(apiCallStatus);
  //   }
  // }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   const funcName = 'useEffect[apiCallStatus]';
  //   const logName = `${componentName}.${funcName}()`;
  //   if (apiCallStatus !== null) {
  //     if(!apiCallStatus.success) props.onError(apiCallStatus);
  //     else if(apiCallStatus.context.action === E_EVENT_PORTAL_CALL_STATE_ACTIONS.SELECT_EVENT_API_PRODUCT) {
  //       if(!selectedManagedObjectId) throw new Error(`${logName}: selectedManagedObjectId is undefined`);
  //       if(!selectedManagedObjectDisplayName) throw new Error(`${logName}: selectedManagedObjectDisplayName is undefined`);
  //       props.onSelectSuccess(apiCallStatus, selectedManagedObjectId, selectedManagedObjectDisplayName);
  //     }
  //   }
  // }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  // * sub-component callbacks *

  // * Import from Event Portal *
  const onImportEventApiProduct = (connectorId: TManagedObjectId, eventPortalId: TManagedObjectId, displayName: string) => {
    setApiCallStatus(null);
    setImportEventPortalId(eventPortalId);
    setImportManagedObjectId(connectorId);
    setImportManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_DIALOG);
  }
  const onListEventApiProductsSuccess = (apiCallState: TApiCallState) => {
    // do nothing
  }

  const onImportEventApiProductSuccess = (apiCallState: TApiCallState) => {
    props.onSuccess(apiCallState);
  }

  const onImportEventApiProductError = (apiCallState: TApiCallState) => {
    setPreviousComponentState();
    setApiCallStatus(apiCallState);
    props.onError(apiCallState);
  }
  
  const onEventPortalImportApiDialogCancel = () : void => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }

  // * Toolbar *
  // const renderLeftToolbarContent = (): JSX.Element | undefined => {
  //   if(!componentState.currentState) return undefined;
  //   if(showListComponent) return (
  //     <React.Fragment>
  //       <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
  //       <Button label={ToolbarButtonLabelImportEventPortal} icon="pi pi-plus" onClick={onImportManagedObjectEventPortal} className="p-button-text p-button-plain p-button-outlined"/>
  //     </React.Fragment>
  //   );
  //   if(showViewComponent) return (
  //     <React.Fragment>
  //       <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/>
  //       <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
  //       <Button label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>        
  //     </React.Fragment>
  //   );
  //   if(showEditComponent) return undefined;
  //   if(showDeleteComponent) return undefined;
  //   if(showNewComponent) return undefined;
  // }
  // const renderToolbar = (): JSX.Element => {
  //   const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
  //   if(leftToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} />);
  //   else return (<React.Fragment></React.Fragment>);
  // }
  
  // const onListManagedObjectsSuccess = (apiCallState: TApiCallState) => {
  //   setApiCallStatus(apiCallState);
  //   setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  // }
  // const onImportManagedObjectSuccess = (apiCallState: TApiCallState, newId: TManagedObjectId, newDisplayName: string) => {
  //   setApiCallStatus(apiCallState);

  //   if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
  //     setManagedObjectId(newId);
  //     setManagedObjectDisplayName(newDisplayName);
  //     setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  //   }
  //   else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  // }
  // const onEditManagedObjectSuccess = (apiCallState: TApiCallState, updatedDisplayName: string | undefined) => {
  //   setApiCallStatus(apiCallState);
  //   if(componentState.previousState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
  //     if(updatedDisplayName) setManagedObjectDisplayName(updatedDisplayName);
  //     setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  //   }
  //   else setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  // }
  // const onSubComponentError = (apiCallState: TApiCallState) => {
  //   setApiCallStatus(apiCallState);
  // }

  // const onSubComponentCancel = () => {
  //   setPreviousComponentState();
  // }

  const calculateShowStates = (componentState: TComponentState) => {
    const funcName = 'calculateShowStates';
    const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowImportComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowImportComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_DIALOG) {
      setShowListComponent(true);
      setShowImportComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="manage-apis">

      {/* <Loading show={isLoading} />       */}
      
      {/* { !isLoading && renderToolbar() } */}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {showListComponent && 
        <EventPortalListEventApiProducts
          // key={componentState.previousState} // force re-render if needed
          organizationId={props.organizationId}
          onError={props.onError} 
          onLoadListSuccess={onListEventApiProductsSuccess} 
          onLoadingChange={props.onLoadingChange} 
          onSelect={onImportEventApiProduct}
        />
      }

      {showImportComponent && importManagedObjectId && importManagedObjectDisplayName && importEventPortalId &&
        <EventPortalImportApiDialog
          organizationId={props.organizationId}
          connectorApiId={importManagedObjectId}
          eventPortalApiId={importEventPortalId}
          eventPortalApiDisplayName={importManagedObjectDisplayName}
          onSuccess={onImportEventApiProductSuccess} 
          onError={onImportEventApiProductError}
          onCancel={onEventPortalImportApiDialogCancel}
          onLoadingChange={props.onLoadingChange}
        />      
      }
    </div>
  );
}
