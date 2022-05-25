
import React from "react";
import { MenuItem } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { Globals } from "../../../../utils/Globals";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import APApisDisplayService, { 
  IAPApiDisplay, 
  TAPApiDisplay_AccessAndState, 
  TAPApiDisplay_General 
} from "../../../../displayServices/APApisDisplayService";
import { 
  TAPManagedAssetBusinessGroupInfo, 
} from "../../../../displayServices/APManagedAssetDisplayService";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APVersioningDisplayService from "../../../../displayServices/APVersioningDisplayService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APDisplayBusinessGroupInfo } from "../../../../components/APDisplay/APDisplayBusinessGroupInfo";
import { IAPLifecycleStageInfo } from "../../../../displayServices/APLifecycleStageInfoDisplayService";
import { E_CALL_STATE_ACTIONS, E_COMPONENT_STATE_NEW } from "../ManageApisCommon";
import { NewGeneral } from "./NewGeneral";
import { NewAccessAndState } from "./NewAccessAndState";
import { NewReviewAndCreate } from "./NewReviewAndCreate";

import '../../../../components/APComponents.css';
import "../ManageApis.css";

export interface IManageNewApiProps {
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onUserNotification: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNewSuccess: (apiCallState: TApiCallState, apiEntityId: TAPEntityId) => void;
}

export const ManageNewApi: React.FC<IManageNewApiProps> = (props: IManageNewApiProps) => {
  const ComponentName = 'ManageNewApi';

  type TManagedObject = IAPApiDisplay;

  type TComponentState = {
    previousState: E_COMPONENT_STATE_NEW,
    currentState: E_COMPONENT_STATE_NEW
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE_NEW.UNDEFINED,
    currentState: E_COMPONENT_STATE_NEW.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE_NEW) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  const setNextComponentState = () => {
    const funcName = 'setNextComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    switch(componentState.currentState) {
      case E_COMPONENT_STATE_NEW.UNDEFINED:
        return setNewComponentState(E_COMPONENT_STATE_NEW.GENERAL);
      case E_COMPONENT_STATE_NEW.GENERAL:
        return setNewComponentState(E_COMPONENT_STATE_NEW.ACCESS_AND_STATE);
      case E_COMPONENT_STATE_NEW.ACCESS_AND_STATE:
        return setNewComponentState(E_COMPONENT_STATE_NEW.REVIEW);  
      case E_COMPONENT_STATE_NEW.REVIEW:
        return;
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }
  const setPreviousComponentState = () => {
    const funcName = 'setPreviousComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    switch(componentState.currentState) {
      case E_COMPONENT_STATE_NEW.UNDEFINED:
      case E_COMPONENT_STATE_NEW.GENERAL:
        return;
      case E_COMPONENT_STATE_NEW.ACCESS_AND_STATE:
        return setNewComponentState(E_COMPONENT_STATE_NEW.GENERAL);
      case E_COMPONENT_STATE_NEW.REVIEW:
        return setNewComponentState(E_COMPONENT_STATE_NEW.ACCESS_AND_STATE);
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }
  const ComponentState2TabIndexMap = new Map<E_COMPONENT_STATE_NEW, number>([
    [E_COMPONENT_STATE_NEW.GENERAL, 0],
    [E_COMPONENT_STATE_NEW.ACCESS_AND_STATE, 1],
    [E_COMPONENT_STATE_NEW.REVIEW, 2]
  ]);
  const setActiveTabIndexByComponentState = (state: E_COMPONENT_STATE_NEW) => {
    const funcName = 'setActiveTabIndexByComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    const idx = ComponentState2TabIndexMap.get(state);
    if(idx === undefined) throw new Error(`${logName}: idx === undefined, state=${state}`);
    setTabActiveIndex(idx);
  }

  const ComponentHeader = "Create New API";

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);

  const [showGeneral, setShowGeneral] = React.useState<boolean>(false);
  const [showAccessAndState, setShowAccessAndState] = React.useState<boolean>(false);
  const [showReview, setShowReview] = React.useState<boolean>(false);

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [original_ManagedObject, setOriginal_ManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [userContext] = React.useContext(UserContext);

  // * Api Calls * 

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_API, 'create empty api');
    try {
      const empty: IAPApiDisplay = APApisDisplayService.create_Empty_ApApiDisplay();
      const _businessGroupInfo: TAPManagedAssetBusinessGroupInfo = {
        apOwningBusinessGroupEntityId: userContext.runtimeSettings.currentBusinessGroupEntityId,
        apBusinessGroupSharingList: []
      };
      APApisDisplayService.set_ApBusinessGroupInfo({
        apManagedAssetDisplay: empty,
        apManagedAssetBusinessGroupInfo: _businessGroupInfo
      });
      // set the owner info
      APApisDisplayService.set_ApOwnerInfo({
        apManagedAssetDisplay: empty,
        apOwnerInfo: userContext.apLoginUserDisplay.apEntityId
      });
      empty.apVersionInfo.apCurrentVersion = APVersioningDisplayService.create_NewVersion();
      setManagedObject(empty);
      setOriginal_ManagedObject(empty); // not a copy, to see the headers ...?
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    // props.onLoadingChange(true);
    await apiGetManagedObject();
    // props.onLoadingChange(false);
    setNewComponentState(E_COMPONENT_STATE_NEW.GENERAL);  
  }

  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList([{
      label: 'New API'
    }]);  
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    setBreadCrumbItemList();
    doInitialize()
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const calculateShowStates = (componentState: TComponentState) => {
    if(componentState.currentState === E_COMPONENT_STATE_NEW.UNDEFINED) {
      setShowGeneral(false);
      setShowAccessAndState(false);
      setShowReview(false);
      return;
    }
    if(componentState.currentState === E_COMPONENT_STATE_NEW.GENERAL) {
      setShowGeneral(true);
      setShowAccessAndState(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.ACCESS_AND_STATE) {
      setShowGeneral(false);
      setShowAccessAndState(true);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_NEW.REVIEW) {
      setShowGeneral(false);
      setShowAccessAndState(false);
      setShowReview(true);
    }
    // set the tabIndex
    setActiveTabIndexByComponentState(componentState.currentState);
  }

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onNext_From_General = (apApiDisplay_General: TAPApiDisplay_General) => {
    const funcName = 'onNext_From_General';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const newMo: TManagedObject = APApisDisplayService.set_ApApiDisplay_General({ 
      apApiDisplay: managedObject,
      apApiDisplay_General: apApiDisplay_General
    });
    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_AccessAndState = (apApiDisplay_AccessAndState: TAPApiDisplay_AccessAndState) => {
    const funcName = 'onNext_From_AccessAndState';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const newMo: TManagedObject = APApisDisplayService.set_ApApiDisplay_AccessAndState({ 
      apApiDisplay: managedObject,
      apApiDisplay_AccessAndState: apApiDisplay_AccessAndState
    });
    setManagedObject(newMo);
    setNextComponentState();
  }

  const onBack = () => {
    setPreviousComponentState();
  }

  const onCreateSuccess = (apiCallState: TApiCallState, apiEntityId: TAPEntityId) => {
    props.onNewSuccess(apiCallState, apiEntityId);
  }

  // * render functions *
  const renderBusinessGroupInfo = (apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): JSX.Element => {
    return (
      <APDisplayBusinessGroupInfo
        apManagedAssetBusinessGroupInfo={apManagedAssetBusinessGroupInfo}
        showSharingInfo={false}
      />
    );
  }
  const renderState = (apLifecycleStageInfo: IAPLifecycleStageInfo): JSX.Element => {
    return(<div><b>State: </b>{apLifecycleStageInfo.stage}</div>);
  }

  const renderComponent = (mo: TManagedObject) => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(original_ManagedObject === undefined) throw new Error(`${logName}: original_ManagedObject === undefined`);
    return (
      <React.Fragment>
        <div className="p-mt-4">
          {renderBusinessGroupInfo(original_ManagedObject.apBusinessGroupInfo)}
          {renderState(original_ManagedObject.apLifecycleStageInfo)}
        </div>
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General' disabled={!showGeneral}>
            <React.Fragment>
              <NewGeneral
                organizationId={props.organizationId}
                apApiDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_General}
                onBack={() => {}}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Access & State' disabled={!showAccessAndState}>
            <React.Fragment>
              <NewAccessAndState
                organizationId={props.organizationId}
                apApiDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_AccessAndState}
                onBack={onBack} 
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Review & Create' disabled={!showReview}>
            <React.Fragment>
              <NewReviewAndCreate
                organizationId={props.organizationId}
                apApiDisplay={mo}
                onBack={onBack}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onCreateSuccess={onCreateSuccess}
                onLoadingChange={props.onLoadingChange}
                onUserNotification={props.onUserNotification}
              />
            </React.Fragment>
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }
  
  return (
    <div className="manage-apis">

      {managedObject && original_ManagedObject && <APComponentHeader header={ComponentHeader} />}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && original_ManagedObject && renderComponent(managedObject)}

    </div>
  );
}
