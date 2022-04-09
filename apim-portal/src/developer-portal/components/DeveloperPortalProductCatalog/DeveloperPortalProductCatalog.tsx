
import React from "react";
import { useHistory } from 'react-router-dom';

import { Toolbar } from 'primereact/toolbar';
import { Button } from "primereact/button";
import { MenuItem } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { E_COMPONENT_STATE } from "./DeveloperPortalProductCatalogCommon";
import { EUIDeveloperPortalResourcePaths } from "../../../utils/Globals";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APDeveloperPortalApiProductsDisplayService, { TAPDeveloperPortalApiProductDisplay } from "../../displayServices/APDeveloperPortalApiProductsDisplayService";
import { DeveloperPortalGridListApiProducts } from "./DeveloperPortalGridListApiProducts";
import { DeveloperPortalViewApiProduct } from "./DeveloperPortalViewApiProduct";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";

export interface IDeveloperPortalProductCatalogProps {
  organizationEntityId: TAPEntityId;
  viewApiProductEntityId?: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
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

  const [userContext] = React.useContext(UserContext);

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);

  const [isAllowedToCreateApp, setIsAllowedToCreateApp] = React.useState<boolean>(false);

  // * useEffect Hooks *
  React.useEffect(() => {
    if(props.viewApiProductEntityId) {
      setManagedObjectEntityId(props.viewApiProductEntityId);
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    } else {
      setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW);
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
 
  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        // do nothing
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  const onViewManagedObject = (apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay): void => {
    
    setIsAllowedToCreateApp(APDeveloperPortalApiProductsDisplayService.isAllowed_To_CreateApp({
      apDeveloperPortalApiProductDisplay: apDeveloperPortalApiProductDisplay,
      userId: userContext.apLoginUserDisplay.apEntityId.id,
      userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id
    }));

    setApiCallStatus(null);
    setManagedObjectEntityId(apDeveloperPortalApiProductDisplay.apEntityId);    
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * Create App *

  const manageAppsHistory = useHistory<TAPEntityId>();

  const onCreateAppWithProductFromToolbar = () => {
    const funcName = 'onCreateAppWithProductFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) Error(`${logName}: managedObjectEntityId is undefined`);
    manageAppsHistory.push({
      pathname: EUIDeveloperPortalResourcePaths.ManageUserApplications,
      state: managedObjectEntityId
    });
  }

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showListComponent) return undefined;
    if(showViewComponent) return  undefined;
    return undefined;
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    if(componentState.currentState === undefined) return undefined;
    if(showViewComponent) {
      if(isAllowedToCreateApp)
        return (
          <React.Fragment>
            <Button icon="pi pi-plus" label="Create App" className="p-button-text p-button-plain p-button-outlined" onClick={onCreateAppWithProductFromToolbar}/>        
          </React.Fragment>
        );
      }
    return undefined;
  }
  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    const rightToolbarTemplate: JSX.Element | undefined = renderRightToolbarContent();
    if(leftToolbarTemplate || rightToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />);
    else return (<></>);
  }
  
  // * prop callbacks *
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    props.setBreadCrumbItemList(itemList);
  }
  const onListViewSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
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

      <CheckConnectorHealth />
      
      <Loading show={isLoading} />      
      
      {!isLoading && renderToolbar() }
      
      {showListComponent && 
        <DeveloperPortalGridListApiProducts
          key={componentState.previousState}
          organizationEntityId={props.organizationEntityId}
          onSuccess={onListViewSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onManagedObjectView={onViewManagedObject}
        />
      }

      {showViewComponent && managedObjectEntityId && 
        <DeveloperPortalViewApiProduct 
          organizationId={props.organizationEntityId.id}
          apiProductEntityId={managedObjectEntityId}
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />      
      }
    </div>
  );
}
