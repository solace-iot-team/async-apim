
import React from "react";

import { Toolbar } from 'primereact/toolbar';
import { Button } from "primereact/button";
import { MenuItem } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { CheckConnectorHealth } from "../../../components/SystemHealth/CheckConnectorHealth";
import { E_COMPONENT_STATE, E_Mode } from "./DeveloperPortalProductCatalogCommon";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import APDeveloperPortalApiProductsDisplayService, { 
  TAPDeveloperPortalApiProductDisplay4List
} from "../../displayServices/APDeveloperPortalApiProductsDisplayService";
import { DeveloperPortalGridListApiProducts } from "./DeveloperPortalGridListApiProducts";
import { DeveloperPortalViewApiProduct } from "./DeveloperPortalViewApiProduct";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";

export interface IDeveloperPortalProductCatalogProps {
  organizationId: string;
  viewApiProductEntityId?: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  /** interaction with apps component */
  mode: E_Mode;
  title?: string;
  exclude_ApiProductIdList?: Array<string>;
  onAddToApp?: (apiProductEntityId: TAPEntityId) => void;
}

export const DeveloperPortalProductCatalog: React.FC<IDeveloperPortalProductCatalogProps> = (props: IDeveloperPortalProductCatalogProps) => {
  const componentName = 'DeveloperPortalProductCatalog';

  const DefaultTitle = "Explore API Products";
  const ToolbarAddButtonLabel = 'Add to App';
  const ToolbarBackToSearchButtonLabel = "Back to Search";

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
  // const setPreviousComponentState = () => {
  //   setComponentState({
  //     previousState: componentState.currentState,
  //     currentState: componentState.previousState
  //   });
  // }

  const [userContext] = React.useContext(UserContext);

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();

  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);

  const [isAllowedToCreateApp, setIsAllowedToCreateApp] = React.useState<boolean>(false);

  const validateProps = () => {
    const funcName = 'validateProps';
    const logName = `${componentName}.${funcName}()`;
    if(props.mode === E_Mode.ADD_TO_APP) {
      if(props.exclude_ApiProductIdList === undefined) throw new Error(`${logName}: props.exclude_ApiProductIdList === undefined, props.mode=${props.mode}`);
      if(props.onAddToApp === undefined) throw new Error(`${logName}: props.onAddToApp === undefined, props.mode=${props.mode}`);
    }
  }
  // * useEffect Hooks *
  React.useEffect(() => {
    validateProps();
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
  const onViewManagedObject = (apDeveloperPortalApiProductDisplay4List: TAPDeveloperPortalApiProductDisplay4List): void => {
    // const funcName = 'onViewManagedObject';
    // const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: starting ...`);
    setIsAllowedToCreateApp(APDeveloperPortalApiProductsDisplayService.isAllowed_To_CreateApp({
      apDeveloperPortalApiProductDisplay: apDeveloperPortalApiProductDisplay4List,
      userId: userContext.apLoginUserDisplay.apEntityId.id,
      userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id
    }));

    setApiCallStatus(null);
    setManagedObjectEntityId(apDeveloperPortalApiProductDisplay4List.apEntityId);    
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  

  // * Create App *

  // const manageAppsHistory = useHistory<TAPEntityId>();

  // const onCreateAppWithProductFromToolbar = () => {
  //   const funcName = 'onCreateAppWithProductFromToolbar';
  //   const logName = `${componentName}.${funcName}()`;
  //   if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId is undefined`);
  //   manageAppsHistory.push({
  //     pathname: EUIDeveloperPortalResourcePaths.DELETEME_ManageUserApplications,
  //     state: managedObjectEntityId
  //   });
  // }

  const onAddApiProductToAppFromToolbar = () => {
    const funcName = 'onAddApiProductToAppFromToolbar';
    const logName = `${componentName}.${funcName}()`;
    if(managedObjectEntityId === undefined) throw new Error(`${logName}: managedObjectEntityId is undefined`);
    if(props.onAddToApp === undefined) throw new Error(`${logName}: props.onAddToApp === undefined`);
    props.onAddToApp(managedObjectEntityId);
  }

  const onBackToSearchFromToolbar = () => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_LIST_VIEW);
  }

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;
    if(showListComponent) return undefined;
    if(showViewComponent) {
      if(props.mode === E_Mode.ADD_TO_APP) {
        return(<Button icon="pi pi-arrow-left" label={ToolbarBackToSearchButtonLabel} className="p-button-text p-button-plain p-button-outlined" onClick={onBackToSearchFromToolbar}/>);
      }
    }
    return undefined;
  }
  const renderRightToolbarContent = (): JSX.Element | undefined => {
    if(componentState.currentState === undefined) return undefined;
    if(showViewComponent) {
      if(isAllowedToCreateApp)
        return (
          <React.Fragment>
            {/* {props.mode === E_Mode.EXPLORE &&
              <Button icon="pi pi-plus" label="Create App" className="p-button-text p-button-plain p-button-outlined" onClick={onCreateAppWithProductFromToolbar}/>        
            } */}
            {props.mode === E_Mode.ADD_TO_APP &&
              <Button icon="pi pi-plus" label={ToolbarAddButtonLabel} className="p-button-text p-button-plain p-button-outlined" onClick={onAddApiProductToAppFromToolbar}/>        
            }
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
  const onSubComponentUserNotification = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
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

  const getTitle = (): string | undefined => {
    if(props.title) return props.title;
    if(props.mode === E_Mode.EXPLORE) return DefaultTitle;
    return undefined;
  }

  return (
    <div className="adp-productcatalog">

      <CheckConnectorHealth />
      
      <Loading show={isLoading} />      
      
      {!isLoading && renderToolbar() }
      
      {showListComponent && 
        <DeveloperPortalGridListApiProducts
          // key={`${ComponentName}_ListApiProducts_${refreshCounter}`}
          mode={props.mode}
          title={getTitle()}
          exclude_ApiProductIdList={props.exclude_ApiProductIdList}
          organizationId={props.organizationId}
          onSuccess={onListViewSuccess} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading} 
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onManagedObjectView={onViewManagedObject}
        />
      }

      {showViewComponent && managedObjectEntityId && 
        <DeveloperPortalViewApiProduct 
          mode={props.mode}
          organizationId={props.organizationId}
          apiProductEntityId={managedObjectEntityId}
          onSuccess={onSubComponentUserNotification} 
          onError={onSubComponentError} 
          onLoadingChange={setIsLoading}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
        />      
      }
    </div>
  );
}
