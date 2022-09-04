
import React from "react";

import { MenuItem } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { Loading } from "../../../components/Loading/Loading";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { E_COMPONENT_STATE } from "./MonitorOrganizationJobsCommon";
import { ListOrganizationJobs } from "./ListOrganizationJobs";
import { IAPJobDisplay } from "../../../displayServices/APJobsDisplayService";
import { ViewOrganizationJob } from "./ViewOrganizationJob";

import '../../../components/APComponents.css';
import "./MonitorOrganizationJobs.css";

export interface IMonitorOrganizationJobsProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const MonitorOrganizationJobs: React.FC<IMonitorOrganizationJobsProps> = (props: IMonitorOrganizationJobsProps) => {
  const ComponentName = 'MonitorOrganizationJobs';

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

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [managedObjectEntityId, setManagedObjectEntityId] = React.useState<TAPEntityId>();

  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);  
  const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  // * prop callbacks *
  const onSubComponentSetBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    setBreadCrumbItemList(itemList);
    props.setBreadCrumbItemList(itemList);
  }
  const onSubComponentAddBreadCrumbItemList = (itemList: Array<MenuItem>) => {
    const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
    props.setBreadCrumbItemList(newItemList);
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }
  const onViewManagedObject = (apJobDisplay: IAPJobDisplay): void => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apJobDisplay.apEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }  
  const onNavigate_To_View = (apJobDisplayEntityId: TAPEntityId) => {
    setApiCallStatus(null);
    setManagedObjectEntityId(apJobDisplayEntityId);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    setRefreshCounter(refreshCounter +1);
  }
  const onNavigate_To_List = () => {
    setApiCallStatus(null);
    setManagedObjectEntityId(undefined);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW);
    setRefreshCounter(refreshCounter +1);
  }

  const calculateShowStates = (componentState: TComponentState) => {
    const funcName = 'calculateShowStates';
    const logName = `${ComponentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowListComponent(false);
      setShowViewComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_LIST_VIEW) {
      setShowListComponent(true);
      setShowViewComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowListComponent(false);
      setShowViewComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="monitor-organization-jobs">

      <Loading show={isLoading} />      
      
      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {showListComponent && 
        <ListOrganizationJobs
          key={`${ComponentName}_ListOrganizationJobs_${refreshCounter}`}
          organizationId={props.organizationId}
          onLoadingChange={setIsLoading}
          onError={onSubComponentError}
          setBreadCrumbItemList={onSubComponentSetBreadCrumbItemList}
          onNavigateHere={onNavigate_To_List}
          onManagedObjectView={onViewManagedObject}
        />
      }
      {showViewComponent && managedObjectEntityId &&
        <ViewOrganizationJob
          key={`${ComponentName}_ViewOrganizationJob_${refreshCounter}`}
          organizationId={props.organizationId}
          apJobDisplayEntityId={managedObjectEntityId}
          onError={onSubComponentError}
          onLoadingChange={setIsLoading}
          onNavigateHere={onNavigate_To_View}
          setBreadCrumbItemList={onSubComponentAddBreadCrumbItemList}
        />
      }
    </div>
  );
}
