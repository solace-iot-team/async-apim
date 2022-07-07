import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { IAPVersionInfo } from "../../../../displayServices/APVersioningDisplayService";
import { TAPManagedAssetBusinessGroupInfo } from "../../../../displayServices/APManagedAssetDisplayService";
import { APDisplayBusinessGroupInfo } from "../../../../components/APDisplay/APDisplayBusinessGroupInfo";
import { IAPLifecycleStageInfo } from "../../../../displayServices/APLifecycleStageInfoDisplayService";
import APApisDisplayService, { IAPApiDisplay } from "../../../../displayServices/APApisDisplayService";
import { E_CALL_STATE_ACTIONS } from "../ManageApisCommon";
import { EditAccess } from "./EditAccess";
import { EditAsyncApiSpec } from "./EditAsyncApiSpec";
import { EditState } from "./EditState";

import '../../../../components/APComponents.css';
import "../ManageApis.css";
import { EditAttributes } from "./EditAttributes";

export enum E_Edit_Scope {
  MAINTAIN = "MAINTAiN",
  MANAGE = "MANAGE"
}
export interface IManageEditApiProps {
  scope: E_Edit_Scope;
  organizationId: string;
  apiEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onSaveSuccessNotification: (apiCallState: TApiCallState) => void;
  onChanged: (apApiDisplay: IAPApiDisplay) => void;
  onNavigateToCommand: (apiEntityId: TAPEntityId) => void;
}

export const ManageEditApi: React.FC<IManageEditApiProps> = (props: IManageEditApiProps) => {
  const ComponentName = 'ManageEditApi';

  type TManagedObject = IAPApiDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [userContext] = React.useContext(UserContext);

  // * Api Calls *

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve details for api: ${props.apiEntityId.displayName}`);
    try { 
      const apApiDisplay: IAPApiDisplay = await APApisDisplayService.apiGet_ApApiDisplay({
        organizationId: props.organizationId,
        apiId: props.apiEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        fetch_async_api_spec: true,
        fetch_revision_list: true,
      });
      setManagedObject(apApiDisplay);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ManagedEditApi_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(props.apiEntityId);
  }

  const doInitialize = async (doRefresh: boolean = false) => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    if(doRefresh) setRefreshCounter(refreshCounter + 1);
    props.onLoadingChange(false);
  }

  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList([
      {
        label: props.apiEntityId.displayName,
        command: ManagedEditApi_onNavigateToCommand
      },
      {
        label: 'Edit'
      }  
    ]);  
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    props.onChanged(managedObject);
    setBreadCrumbItemList();
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onError_SubComponent = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onEdit_SaveSuccess = (apiCallState: TApiCallState) => {
    props.onSaveSuccessNotification(apiCallState);
    doInitialize(true);
  }

  const renderBusinessGroupInfo = (apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): JSX.Element => {
    return (
      <APDisplayBusinessGroupInfo
        apManagedAssetBusinessGroupInfo={apManagedAssetBusinessGroupInfo}
        showSharingInfo={true}
      />
    );
  }
  const renderOwner = (apOwnerInfo: TAPEntityId): JSX.Element => {
    return (<div><b>Owner</b>: {apOwnerInfo.displayName}</div>);
  }
  const renderRevisionInfo = (apVersionInfo: IAPVersionInfo): JSX.Element => {
    return (<div><b>Last Version:</b> {apVersionInfo.apLastVersion}</div>);
  }
  const renderState = (apLifecycleStageInfo: IAPLifecycleStageInfo): JSX.Element => {
    return(<div><b>State: </b>{apLifecycleStageInfo.stage}</div>);
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <React.Fragment>
        {renderBusinessGroupInfo(mo.apBusinessGroupInfo)}
        {renderOwner(mo.apOwnerInfo)}
        {renderRevisionInfo(mo.apVersionInfo)}
        {renderState(mo.apLifecycleStageInfo)}
      </React.Fragment>
    );
  }

  const renderTabPanels = (): Array<JSX.Element> => {
    const funcName = 'renderTabPanels';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const tabPanels: Array<JSX.Element> = [];

    if(props.scope === E_Edit_Scope.MANAGE) {
      tabPanels.push(
        <TabPanel header='Async Api Spec'>
          <React.Fragment>
            <EditAsyncApiSpec
              key={`${ComponentName}_EditAsyncApiSpec_${refreshCounter}`}
              organizationId={props.organizationId}
              apApiDisplay={managedObject}
              onError={onError_SubComponent}
              onCancel={props.onCancel}
              onLoadingChange={props.onLoadingChange}
              onSaveSuccess={onEdit_SaveSuccess}
            />
          </React.Fragment>
        </TabPanel>
      );
    }
    tabPanels.push(
      <TabPanel header='Access'>
        <React.Fragment>
          <EditAccess
            key={`${ComponentName}_EditAccess_${refreshCounter}`}
            organizationId={props.organizationId}
            apApiDisplay={managedObject}
            onError={onError_SubComponent}
            onCancel={props.onCancel}
            onLoadingChange={props.onLoadingChange}
            onSaveSuccess={onEdit_SaveSuccess}
          />
        </React.Fragment>
      </TabPanel>  
    );
    tabPanels.push(
      <TabPanel header='Attributes'>
        <React.Fragment>
          <EditAttributes
            key={`${ComponentName}_EditAttributes_${refreshCounter}`}
            organizationId={props.organizationId}
            apApiDisplay={managedObject}
            onError={onError_SubComponent}
            onCancel={props.onCancel}
            onLoadingChange={props.onLoadingChange}
            onSaveSuccess={onEdit_SaveSuccess}
          />
        </React.Fragment>
      </TabPanel>
    );
    if(props.scope === E_Edit_Scope.MANAGE) {
      tabPanels.push(
        <TabPanel header='State'>
          <EditState
            key={`${ComponentName}_EditState_${refreshCounter}`}
            organizationId={props.organizationId}
            apApiDisplay={managedObject}
            onError={onError_SubComponent}
            onCancel={props.onCancel}
            onLoadingChange={props.onLoadingChange}
            onSaveSuccess={onEdit_SaveSuccess}
          />
        </TabPanel>
      );
    }
    return tabPanels;
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <React.Fragment>
        <div className="p-mt-2">
          {renderHeader(managedObject)}
        </div>              
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          { renderTabPanels() }
        </TabView>
      </React.Fragment>
    ); 
  }

  const renderEditHeader = (): JSX.Element => {
    const funcName = 'renderEditHeader';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const getHeaderNotes = (): string | undefined => {
      if(managedObject.apApiProductReferenceEntityIdList.length === 0) return 'Not used by any API Products.';
      return `Used by ${managedObject.apApiProductReferenceEntityIdList.length} API Product(s).`;
    }  
    return(
      <React.Fragment>
        <APComponentHeader 
          header={`Edit: ${managedObject.apEntityId.displayName}`} 
          notes={getHeaderNotes()}
        />
      </React.Fragment>
    );
  }

  return (
    <div className="manage-apis">

      { managedObject && renderEditHeader() }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObject && renderContent() }

    </div>
  );

}