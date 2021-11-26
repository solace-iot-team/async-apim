
import React from "react";

import { Toolbar } from 'primereact/toolbar';
import { Button } from "primereact/button";

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { DeveloperPortalListApiProducts } from "./DeveloperPortalListApiProducts";
import { E_COMPONENT_STATE } from "./DeveloperPortalProductCatalogCommon";
import { DeveloperPortalViewApiProduct } from "./DeveloperPortalViewApiProduct";
import { CommonDisplayName, CommonName } from "@solace-iot-team/apim-connector-openapi-browser";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";
import { DeveloperPortalGridListApiProducts } from "./DeveloperPortalGridListApiProducts";

export interface IDeveloperPortalProductCatalogProps {
  organizationName: TAPOrganizationId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onBreadCrumbLabelList: (breadCrumbLableList: Array<string>) => void;
}

export const DeveloperPortalProductCatalog: React.FC<IDeveloperPortalProductCatalogProps> = (props: IDeveloperPortalProductCatalogProps) => {
  // const componentName = 'DeveloperPortalProductCatalog';

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
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObjectId, setManagedObjectId] = React.useState<CommonName>();
  const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<CommonDisplayName>();
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);

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
  const onViewManagedObject = (id: CommonName, displayName: CommonDisplayName): void => {
    setApiCallStatus(null);
    setManagedObjectId(id);
    setManagedObjectDisplayName(displayName);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showListComponent) return undefined;
    if(showViewComponent) return  undefined;
    return undefined;
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    const onImplementMe = () => { alert('implement me'); }

    if(!componentState.currentState) return undefined;
    if(showViewComponent) return (
      <React.Fragment>
        <Button icon="pi pi-bolt" label="SUBSCRIBE?" className="p-button-text p-button-plain p-button-outlined" onClick={onImplementMe}/>        
      </React.Fragment>
    );
    return undefined;
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
  const onListViewSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    // setNewComponentState(componentState);
  }
  const onSubComponentSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    setPreviousComponentState();
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  
  const calculateShowStates = (componentState: TComponentState) => {
    if(!componentState.currentState) {
      setShowListComponent(false);
      setShowViewComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW) {
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
      
      {!isLoading && renderToolbar() }
      
      {showListComponent && 
        <DeveloperPortalGridListApiProducts
          key={componentState.previousState}
          organizationId={props.organizationName}
          onSuccess={onListViewSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectOpen={onViewManagedObject}
        />
      }

      {/* {showListComponent && 
        <DeveloperPortalListApiProducts
          key={componentState.previousState}
          organizationId={props.organizationName}
          onSuccess={onListViewSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          onManagedObjectOpen={onViewManagedObject}
        />
      } */}

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
