
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../utils/ApiCallState";
import { TManagedObjectId } from "./ManageApisCommon";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { EventPortalListEventApiProducts } from "./EventPortalListEventApiProducts";
import { EventPortalImportApiDialog } from "./EventPortalImportApiDialog";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { EventPortalViewEventApiProduct } from "./EventPortalViewEventApiProduct";

import '../../../components/APComponents.css';
import "./ManageApis.css";

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
  const ToolbarButtonLabelBackToList = "back to list";
  const ToolbarButtonLabelImport = 'Import';

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_OBJECT_LIST_VIEW = "MANAGED_OBJECT_LIST_VIEW",
    MANAGED_OBJECT_IMPORT_DIALOG = "MANAGED_OBJECT_IMPORT_DIALOG",
    VIEW_EVENT_API_PRODUCT = 'VIEW_EVENT_API_PRODUCT'
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
  
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [importManagedObjectId, setImportManagedObjectId] = React.useState<TManagedObjectId>();
  const [importManagedObjectDisplayName, setImportManagedObjectDisplayName] = React.useState<string>();
  const [importEventPortalId, setImportEventPortalId] = React.useState<string>();
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showImportComponent, setShowImportComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  
  // * useEffect Hooks *
  React.useEffect(() => {
    props.onBreadCrumbLabelList(breadCrumbLabelList);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Import from Event Portal *
  const onImportEventApiProduct = (connectorId: TManagedObjectId, eventPortalId: TManagedObjectId, displayName: string) => {
    setApiCallStatus(null);
    setImportEventPortalId(eventPortalId);
    setImportManagedObjectId(connectorId);
    setImportManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_DIALOG);
  }

  const onEventPortalViewEventApiProductImport = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_DIALOG);    
  }

  const onViewEventApiProduct = (connectorId: TManagedObjectId, eventPortalId: TManagedObjectId, displayName: string) => {
    setApiCallStatus(null);
    setImportEventPortalId(eventPortalId);
    setImportManagedObjectId(connectorId);
    setImportManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.VIEW_EVENT_API_PRODUCT);
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
    setPreviousComponentState();
  }

  const onEventPortalViewEventApiProductError = (apiCallState: TApiCallState) => {
    setPreviousComponentState();
    setApiCallStatus(apiCallState);
    props.onError(apiCallState);
  }

  const onBackToList = () => {
    setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }

  const calculateShowStates = (componentState: TComponentState) => {
    const funcName = 'calculateShowStates';
    const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowImportComponent(false);
      setShowViewComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowImportComponent(false);
      setShowViewComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_IMPORT_DIALOG) {
      // setShowListComponent(true); // leave as is
      setShowImportComponent(true);
      // setShowViewComponent(false); // leave as is
    }
    else if(componentState.currentState === E_COMPONENT_STATE.VIEW_EVENT_API_PRODUCT) {
      setShowListComponent(false);
      setShowImportComponent(false);
      setShowViewComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showViewComponent) return (
      <>
        <Button label={ToolbarButtonLabelBackToList} icon="pi pi-arrow-left" onClick={onBackToList} className="p-button-text p-button-plain"/>
        <Button label={ToolbarButtonLabelImport} icon="pi pi-cloud-download" onClick={onEventPortalViewEventApiProductImport} className="p-button-text p-button-plain p-button-outlined"/>
        
      </>
    );
    else return undefined;
  }
  
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} />);
    else return (<React.Fragment></React.Fragment>);
  }


  return (
    <div className="manage-apis">

      { renderToolbar() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {showListComponent && 
        <EventPortalListEventApiProducts
          // key={componentState.previousState} // force re-render if needed
          organizationId={props.organizationId}
          onError={props.onError} 
          onLoadListSuccess={onListEventApiProductsSuccess} 
          onLoadingChange={props.onLoadingChange} 
          onSelect={onImportEventApiProduct}
          onViewEventApiProduct={onViewEventApiProduct}
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

      {showViewComponent && importManagedObjectId && importManagedObjectDisplayName && importEventPortalId &&
        <EventPortalViewEventApiProduct
          organizationId={props.organizationId}
          eventApiProductId={importEventPortalId}
          eventApiProductDisplayName={importManagedObjectDisplayName}
          onError={onEventPortalViewEventApiProductError}
          onLoadingChange={props.onLoadingChange}
        />      
      }
    </div>
  );
}
