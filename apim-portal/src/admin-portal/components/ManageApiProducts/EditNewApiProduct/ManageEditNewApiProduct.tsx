
import React from "react";
import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { Globals } from "../../../../utils/Globals";
import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId, TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { EAction, E_CALL_STATE_ACTIONS, E_COMPONENT_STATE_EDIT_NEW } from "../ManageApiProductsCommon";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { 
  TAPApiProductDisplay_AccessAndState,
  TAPApiProductDisplay_Apis, 
  TAPApiProductDisplay_Environments, 
  TAPApiProductDisplay_General, 
  TAPApiProductDisplay_Policies 
} from "../../../../displayServices/APApiProductsDisplayService";
import { TAPManagedAssetBusinessGroupInfo, TAPManagedAssetDisplay_Attributes, TAPManagedAssetLifecycleInfo } from "../../../../displayServices/APManagedAssetDisplayService";
import { EditNewGeneral } from "./EditNewGeneral";
import { EditNewPolicies } from "./EditNewPolicies";
import { EditNewApis } from "./EditNewApis";
import { EditNewEnvironments } from "./EditNewEnvironments";
import { EditNewAttributes } from "./EditNewAttributes";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import APVersioningDisplayService, { IAPVersionInfo } from "../../../../displayServices/APVersioningDisplayService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { EditNewReviewAndCreate } from "./EditNewReviewAndCreate";
import { EditNewAccessAndState } from "./EditNewAccessAndState";
import { APIProductAccessLevel } from "@solace-iot-team/apim-connector-openapi-browser";
import { APDisplayBusinessGroupInfo } from "../../../../components/APDisplay/APDisplayBusinessGroupInfo";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";
import APExternalSystemsDisplayService from "../../../../displayServices/APExternalSystemsDisplayService";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";

export interface IManageEditNewApiProductProps {
  /** both */
  action: EAction;
  organizationId: string;
  onError: (apiCallState: TApiCallState) => void;
  onUserNotification: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onEditNewSuccess: (apiCallState: TApiCallState, apiProductEntityId: TAPEntityId) => void;
  /** edit: required */
  apiProductEntityId?: TAPEntityId;
  onNavigateToCommand?: (apiProductEntityId: TAPEntityId) => void;
}

export const ManageEditNewApiProduct: React.FC<IManageEditNewApiProductProps> = (props: IManageEditNewApiProductProps) => {
  const ComponentName = 'ManageEditNewApiProduct';

  type TManagedObject = TAPAdminPortalApiProductDisplay;

  type TComponentState = {
    previousState: E_COMPONENT_STATE_EDIT_NEW,
    currentState: E_COMPONENT_STATE_EDIT_NEW
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE_EDIT_NEW.UNDEFINED,
    currentState: E_COMPONENT_STATE_EDIT_NEW.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE_EDIT_NEW) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  const setNextComponentState = () => {
    const funcName = 'setNextComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    switch(componentState.currentState) {
      case E_COMPONENT_STATE_EDIT_NEW.UNDEFINED:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.GENERAL);
      case E_COMPONENT_STATE_EDIT_NEW.GENERAL:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.APIS);
      case E_COMPONENT_STATE_EDIT_NEW.APIS:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.POLICIES);
      case E_COMPONENT_STATE_EDIT_NEW.POLICIES:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.ENVIRONMENTS);
      case E_COMPONENT_STATE_EDIT_NEW.ENVIRONMENTS:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.ATTRIBUTES);
      case E_COMPONENT_STATE_EDIT_NEW.ATTRIBUTES:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.ACCESS_AND_STATE);
      case E_COMPONENT_STATE_EDIT_NEW.ACCESS_AND_STATE:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.REVIEW);  
      case E_COMPONENT_STATE_EDIT_NEW.REVIEW:
        return;
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }
  const setPreviousComponentState = () => {
    const funcName = 'setPreviousComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    switch(componentState.currentState) {
      case E_COMPONENT_STATE_EDIT_NEW.UNDEFINED:
      case E_COMPONENT_STATE_EDIT_NEW.GENERAL:
        return;
      case E_COMPONENT_STATE_EDIT_NEW.APIS:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.GENERAL);
      case E_COMPONENT_STATE_EDIT_NEW.POLICIES:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.APIS);
      case E_COMPONENT_STATE_EDIT_NEW.ENVIRONMENTS:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.POLICIES);
      case E_COMPONENT_STATE_EDIT_NEW.ATTRIBUTES:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.ENVIRONMENTS);
      case E_COMPONENT_STATE_EDIT_NEW.ACCESS_AND_STATE:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.ATTRIBUTES);
      case E_COMPONENT_STATE_EDIT_NEW.REVIEW:
        return setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.ACCESS_AND_STATE);
      default:
        Globals.assertNever(logName, componentState.currentState);
    }
  }
  const ComponentState2TabIndexMap = new Map<E_COMPONENT_STATE_EDIT_NEW, number>([
    [E_COMPONENT_STATE_EDIT_NEW.GENERAL, 0],
    [E_COMPONENT_STATE_EDIT_NEW.APIS, 1],
    [E_COMPONENT_STATE_EDIT_NEW.POLICIES, 2],
    [E_COMPONENT_STATE_EDIT_NEW.ENVIRONMENTS, 3],
    [E_COMPONENT_STATE_EDIT_NEW.ATTRIBUTES, 4],
    [E_COMPONENT_STATE_EDIT_NEW.ACCESS_AND_STATE, 5],
    [E_COMPONENT_STATE_EDIT_NEW.REVIEW, 6]
  ]);
  const setActiveTabIndexByComponentState = (state: E_COMPONENT_STATE_EDIT_NEW) => {
    const funcName = 'setActiveTabIndexByComponentState';
    const logName = `${ComponentName}.${funcName}()`;
    const idx = ComponentState2TabIndexMap.get(state);
    if(idx === undefined) throw new Error(`${logName}: idx === undefined, state=${state}`);
    setTabActiveIndex(idx);
  }

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);

  const [showGeneral, setShowGeneral] = React.useState<boolean>(false);
  const [showApis, setShowApis] = React.useState<boolean>(false);
  const [showPolicies, setShowPolicies] = React.useState<boolean>(false);
  const [showEnvironments, setShowEnvironments] = React.useState<boolean>(false);
  const [showAttributes, setShowAttributes] = React.useState<boolean>(false);
  const [showAccessAndState, setShowAccessAndState] = React.useState<boolean>(false);
  const [showReview, setShowReview] = React.useState<boolean>(false);

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [original_ManagedObject, setOriginal_ManagedObject] = React.useState<TManagedObject>();
  const [availablePublishDestinationExternalSystemEntityIdList, setAvailablePublishDestinationExternalSystemEntityIdList] = React.useState<TAPEntityIdList>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [userContext] = React.useContext(UserContext);

  // * Api Calls * 

  const apiGetPublishDestinations = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetPublishDestinations';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PUBLISH_DESTINATIONS, 'get publish destinations');
    try {
      const publishDestinationList: TAPEntityIdList = await APExternalSystemsDisplayService.apiGetList_PublishDestinations({
        organizationId: props.organizationId
      });
      setAvailablePublishDestinationExternalSystemEntityIdList(publishDestinationList);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    if(props.action === EAction.NEW) return apiGetManagedObject_New();
    else return apiGetManagedObject_Edit();
  }

  const apiGetManagedObject_New = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject_New';
    const logName = `${ComponentName}.${funcName}()`;
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EMPTY_API_PRODUCT, 'create empty api product');
    try {
      const empty: TAPAdminPortalApiProductDisplay = APAdminPortalApiProductsDisplayService.create_Empty_ApAdminPortalApiProductDisplay();
      const _businessGroupInfo: TAPManagedAssetBusinessGroupInfo = {
        apOwningBusinessGroupEntityId: userContext.runtimeSettings.currentBusinessGroupEntityId,
        apBusinessGroupSharingList: []
      };
      APAdminPortalApiProductsDisplayService.set_ApBusinessGroupInfo({
        apManagedAssetDisplay: empty,
        apManagedAssetBusinessGroupInfo: _businessGroupInfo
      });
      // set the owner info
      APAdminPortalApiProductsDisplayService.set_ApOwnerInfo({
        apManagedAssetDisplay: empty,
        apOwnerInfo: userContext.apLoginUserDisplay.apEntityId
      });
      // create a suggested next version
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

  const apiGetManagedObject_Edit = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject_Edit';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.apiProductEntityId === undefined) throw new Error(`${logName}: props.apiProductEntityId === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${props.apiProductEntityId.displayName}`);
    try { 
      const object: TAPAdminPortalApiProductDisplay = await APAdminPortalApiProductsDisplayService.apiGet_AdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: props.apiProductEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id
      });
      // create a suggested next version
      object.apVersionInfo.apCurrentVersion = APVersioningDisplayService.create_NextVersion(object.apVersionInfo.apLastVersion);
      setManagedObject(object);
      setOriginal_ManagedObject(JSON.parse(JSON.stringify(object)));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    await apiGetPublishDestinations();
    props.onLoadingChange(false);
    setNewComponentState(E_COMPONENT_STATE_EDIT_NEW.GENERAL);  
  }

  const validateProps = () => {
    const funcName = 'validateProps';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.action === EAction.EDIT) {
      if(props.apiProductEntityId === undefined) throw new Error(`${logName}: props.apiProductEntityId === undefined`);
      if(props.onNavigateToCommand === undefined) throw new Error(`${logName}: props.onNavigateToCommand === undefined`);
    }
  }

  const ManagedEditApiProduct_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    const funcName = 'ManagedEditApiProduct_onNavigateToCommand';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.onNavigateToCommand === undefined) throw new Error(`${logName}: props.onNavigateToCommand === undefined`);
    if(props.apiProductEntityId === undefined) throw new Error(`${logName}: props.apiProductEntityId === undefined`);
    props.onNavigateToCommand(props.apiProductEntityId);
  }

  const setBreadCrumbItemList = () => {
    const funcName = 'setBreadCrumbItemList';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.action === EAction.EDIT) {
      if(props.apiProductEntityId === undefined) throw new Error(`${logName}: props.apiProductEntityId === undefined`);
      props.setBreadCrumbItemList([
        {
          label: props.apiProductEntityId.displayName,
          command: ManagedEditApiProduct_onNavigateToCommand
        },
        {
          label: 'Edit'
        }  
      ]);  
    } else {
      props.setBreadCrumbItemList([{
        label: 'New API Product'
      }]);  
    }
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    validateProps();
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
    if(componentState.currentState === E_COMPONENT_STATE_EDIT_NEW.UNDEFINED) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowAccessAndState(false);
      setShowReview(false);
      return;
    }
    if(componentState.currentState === E_COMPONENT_STATE_EDIT_NEW.GENERAL) {
      setShowGeneral(true);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowAccessAndState(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_EDIT_NEW.APIS) {
      setShowGeneral(false);
      setShowApis(true);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowAccessAndState(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_EDIT_NEW.POLICIES) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(true);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowAccessAndState(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_EDIT_NEW.ENVIRONMENTS) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(true);
      setShowAttributes(false);
      setShowAccessAndState(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_EDIT_NEW.ATTRIBUTES) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(true);
      setShowAccessAndState(false);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_EDIT_NEW.ACCESS_AND_STATE) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowAccessAndState(true);
      setShowReview(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE_EDIT_NEW.REVIEW) {
      setShowGeneral(false);
      setShowApis(false);
      setShowPolicies(false);
      setShowEnvironments(false);
      setShowAttributes(false);
      setShowAccessAndState(false);
      setShowReview(true);
    }
    // set the tabIndex
    setActiveTabIndexByComponentState(componentState.currentState);
  }

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onNext_From_General = (apApiProductDisplay_General: TAPApiProductDisplay_General) => {
    const funcName = 'onNext_From_General';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApiProductDisplay_General({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_General: apApiProductDisplay_General
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Apis = (apApiProductDisplay_Apis: TAPApiProductDisplay_Apis) => {
    const funcName = 'onNext_From_Apis';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_Apis({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_Apis: apApiProductDisplay_Apis
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Policies = (apApiProductDisplay_Policies: TAPApiProductDisplay_Policies) => {
    const funcName = 'onNext_From_Policies';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_Policies({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_Policies: apApiProductDisplay_Policies
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Environments = (apApiProductDisplay_Environments: TAPApiProductDisplay_Environments) => {
    const funcName = 'onNext_From_Environments';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_Environments({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_Environments: apApiProductDisplay_Environments
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_Attributes = (apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes) => {
    const funcName = 'onNext_From_Attributes';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApManagedAssetDisplay_Attributes({ 
      apManagedAssetDisplay: managedObject,
      apManagedAssetDisplay_Attributes: apManagedAssetDisplay_Attributes
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onNext_From_AccessAndState = (apApiProductDisplay_AccessAndState: TAPApiProductDisplay_AccessAndState) => {
    const funcName = 'onNext_From_AccessAndState';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const newMo: TManagedObject = APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_AccessAndState({ 
      apApiProductDisplay: managedObject,
      apApiProductDisplay_AccessAndState: apApiProductDisplay_AccessAndState
    }) as TManagedObject;

    setManagedObject(newMo);
    setNextComponentState();
  }

  const onBack = () => {
    setPreviousComponentState();
  }

  const onCreateSuccess = (apiCallState: TApiCallState, apiProductEntityId: TAPEntityId) => {
    props.onEditNewSuccess(apiCallState, apiProductEntityId);
  }

  const renderBusinessGroupInfo = (apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): JSX.Element => {
    return (
      <APDisplayBusinessGroupInfo
        apManagedAssetBusinessGroupInfo={apManagedAssetBusinessGroupInfo}
        showSharingInfo={ props.action === EAction.EDIT}
      />
    );
  }

  const renderVersionInfo = (apVersionInfo: IAPVersionInfo): JSX.Element => {
    if(props.action === EAction.NEW) return (<></>);
    return (<div><b>Current Version:</b> {apVersionInfo.apLastVersion}</div>);
  }

  const renderState = (apManagedAssetLifecycleInfo: TAPManagedAssetLifecycleInfo): JSX.Element => {
    if(props.action === EAction.NEW) return (<></>);
    return(<div><b>State: </b>{apManagedAssetLifecycleInfo.apLifecycleState}</div>);
  }
  const renderAccessLevel = (accessLevel: APIProductAccessLevel): JSX.Element => {
    if(props.action === EAction.NEW) return (<></>);
    return(<div><b>Access: </b>{accessLevel}</div>);
  }

  const renderComponent = (mo: TManagedObject) => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(original_ManagedObject === undefined) throw new Error(`${logName}: original_ManagedObject === undefined`);
    if(availablePublishDestinationExternalSystemEntityIdList === undefined) throw new Error(`${logName}: availablePublishDestinationExternalSystemEntityIdList === undefined`);
    return (
      <React.Fragment>
        <div className="p-mt-4">
          {renderBusinessGroupInfo(original_ManagedObject.apBusinessGroupInfo)}
          {renderVersionInfo(original_ManagedObject.apVersionInfo)}
          {renderState(original_ManagedObject.apLifecycleInfo)}
          {renderAccessLevel(original_ManagedObject.apAccessLevel)}
        </div>
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General' disabled={!showGeneral}>
            <React.Fragment>
              <EditNewGeneral
                action={props.action}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_General}
                onBack={() => {}}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='APIs' disabled={!showApis}>
            <React.Fragment>
              <EditNewApis
                action={props.action}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_Apis}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Policies' disabled={!showPolicies}>
            <React.Fragment>
              <EditNewPolicies
                action={props.action}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_Policies}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Environments' disabled={!showEnvironments}>
            <React.Fragment>
              <EditNewEnvironments
                action={props.action}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_Environments}
                onBack={onBack}
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Attributes' disabled={!showAttributes}>
            <React.Fragment>
              <EditNewAttributes
                action={props.action}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                onError={onError_SubComponent}
                onCancel={props.onCancel}
                onLoadingChange={props.onLoadingChange}
                onSaveChanges={onNext_From_Attributes}
                onBack={onBack} 
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Access & State' disabled={!showAccessAndState}>
            <React.Fragment>
              <EditNewAccessAndState
                action={props.action}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
                apAvailablePublishDestinationExternalSystemEntityIdList={availablePublishDestinationExternalSystemEntityIdList}
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
              <EditNewReviewAndCreate
                action={props.action}
                organizationId={props.organizationId}
                apAdminPortalApiProductDisplay={mo}
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
  
  const getHeaderNotes = (): string | undefined => {
    const funcName = 'getComponentHeader';
    const logName = `${ComponentName}.${funcName}()`;
    if(original_ManagedObject === undefined) throw new Error(`${logName}: original_ManagedObject === undefined`);
    if(props.action === EAction.NEW) return undefined;
    if(original_ManagedObject.apAppReferenceEntityIdList.length === 0) return 'Not used by any Apps.';
    return `Used by ${original_ManagedObject.apAppReferenceEntityIdList.length} APP(s).`;
  }

  const getComponentHeader = (): string => {
    const funcName = 'getComponentHeader';
    const logName = `${ComponentName}.${funcName}()`;
    if(original_ManagedObject === undefined) throw new Error(`${logName}: original_ManagedObject === undefined`);
  
    if(props.action === EAction.NEW) return 'Create New API Product';
    else return `Edit API Product: ${original_ManagedObject.apEntityId.displayName}`
  }

  return (
    <div className="manage-api-products">

      {managedObject && original_ManagedObject && <APComponentHeader header={getComponentHeader()} notes={getHeaderNotes()}/>}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && original_ManagedObject && availablePublishDestinationExternalSystemEntityIdList && renderComponent(managedObject)}

    </div>
  );
}
