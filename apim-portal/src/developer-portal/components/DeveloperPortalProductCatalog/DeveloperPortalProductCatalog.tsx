
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { DeveloperPortalListApiProducts } from "./DeveloperPortalListApiProducts";
// import { ListEnvironments } from "./ListEnvironments";
// import { ViewEnvironment } from "./ViewEnvironment";
// import { EditEnvironment } from "./EditEnvironment";
// import { DeleteEnvironment } from "./DeleteEnvironment";
// import { NewEnvironment } from "./NewEnvironment";
import { E_COMPONENT_STATE, TManagedObjectId } from "./DeveloperPortalProductCatalogCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";
import { DeveloperPortalViewApiProduct } from "./DeveloperPortalViewApiProduct";

export interface IDeveloperPortalProductCatalogProps {
  organizationName: TAPOrganizationId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onBreadCrumbLabelList: (breadCrumbLableList: Array<string>) => void;
}

export const DeveloperPortalProductCatalog: React.FC<IDeveloperPortalProductCatalogProps> = (props: IDeveloperPortalProductCatalogProps) => {
  const componentName = 'DeveloperPortalProductCatalog';

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

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectId, setManagedObjectId] = React.useState<TManagedObjectId>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  // const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  // const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);
  // const [showNewComponent, setShowNewComponent] = React.useState<boolean>(false);

  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
 
  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(!managedObjectDisplayName) return;
    if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW
      ) props.onBreadCrumbLabelList([managedObjectDisplayName]);
    else props.onBreadCrumbLabelList([]);
  }, [componentState, managedObjectDisplayName]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        // do nothing
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedObject = (id: TManagedObjectId, displayName: string): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  
  const onListAsList = () => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW);
  }
  const onListAsGrid = () => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW);
  }

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showListComponent) return (
      <React.Fragment>
        {/* <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/> */}
        {/* <Button label='any action?' icon="pi pi-question" className="p-button-text p-button-plain p-button-outlined"/>         */}
      </React.Fragment>
    );
    if(showViewComponent) return (
      <React.Fragment>
        <Button label='any action?' icon="pi pi-question" className="p-button-text p-button-plain p-button-outlined"/>        
        {/* <Button label={ToolbarNewManagedObjectButtonLabel} icon="pi pi-plus" onClick={onNewManagedObject} className="p-button-text p-button-plain p-button-outlined"/> */}
        {/* <Button label={ToolbarEditManagedObjectButtonLabel} icon="pi pi-pencil" onClick={onEditManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>         */}
        {/* <Button label={ToolbarDeleteManagedObjectButtonLabel} icon="pi pi-trash" onClick={onDeleteManagedObjectFromToolbar} className="p-button-text p-button-plain p-button-outlined"/>         */}
      </React.Fragment>
    );
    return undefined;
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showListComponent) return (
      <React.Fragment>
        <Button icon="pi pi-list" className="p-button-text p-button-plain p-button-outlined" onClick={onListAsList}/>        
        <Button icon="pi pi-th-large" className="p-button-text p-button-plain p-button-outlined" onClick={onListAsGrid}/>        
        {/* <Button tooltip='show as list' icon="pi pi-list" className="p-button-text p-button-plain p-button-outlined" onClick={onListAsList}/>         */}
        {/* <Button tooltip='show as grid' icon="pi pi-th-large" className="p-button-text p-button-plain p-button-outlined" onClick={onListAsGrid}/>         */}
      </React.Fragment>
    );
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    const rightToolbarTemplate: JSX.Element | undefined = renderRightToolbarContent();
    if(leftToolbarTemplate || rightToolbarTemplate) 
      return (
        <Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
      );
    else return (<React.Fragment></React.Fragment>);
  }
  
  // * prop callbacks *
  const onListViewSuccess = (apiCallState: TApiCallState, componentState: E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW | E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW) => {
    setApiCallStatus(apiCallState);
    setNewComponentState(componentState);
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
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW ||
            componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW
            ) {
      setShowListComponent(true);
      setShowViewComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
    }
  }

  return (
    <div className="adp-productcatalog">

      <Loading show={isLoading} />      
      
      {!isLoading &&
        renderToolbar()
      }
      {showListComponent && 
        <DeveloperPortalListApiProducts
          key={componentState.previousState}
          organizationId={props.organizationName}
          componentState={componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW?E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW:E_COMPONENT_STATE.MANAGED_OBJECT_LIST_GRID_VIEW}
          onSuccess={onListViewSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectView={onViewManagedObject}
        />
      }
      {showViewComponent && managedObjectId && managedObjectDisplayName &&
        <DeveloperPortalViewApiProduct 
          organizationId={props.organizationName}
          apiProductId={managedObjectId}
          apiProductDisplayName={managedObjectDisplayName}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
        />      
      }
    </div>
  );
}
