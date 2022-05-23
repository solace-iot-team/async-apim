
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TabPanel, TabView } from "primereact/tabview";
import { Dropdown, DropdownChangeParams } from "primereact/dropdown";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../utils/APEntityIdsService";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import APApisDisplayService, { IAPApiDisplay } from "../../../displayServices/APApisDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageApisCommon";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPManagedAssetBusinessGroupInfo } from "../../../displayServices/APManagedAssetDisplayService";
import { APDisplayBusinessGroupInfo } from "../../../components/APDisplay/APDisplayBusinessGroupInfo";
import { IAPLifecycleStageInfo } from "../../../displayServices/APLifecycleStageInfoDisplayService";
import APMetaInfoDisplayService, { TAPMetaInfo } from "../../../displayServices/APMetaInfoDisplayService";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import APVersioningDisplayService from "../../../displayServices/APVersioningDisplayService";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IViewApiProps {
  organizationId: string;
  apiEntityId: TAPEntityId;
  onInitialized: (apApiDisplay: IAPApiDisplay) => void;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (apiEntityId: TAPEntityId) => void;
}

export const ViewApi: React.FC<IViewApiProps> = (props: IViewApiProps) => {
  const ComponentName = 'ViewApi';

  type TManagedObject = IAPApiDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [selectedVersion, setSelectedVersion] = React.useState<string>();
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [userContext] = React.useContext(UserContext);

  // * Api Calls *
  const apiGetManagedObject = async(version?: string): Promise<TApiCallState> => {
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
        version: version,
      });
      // console.log(`${logName}: apAdminPortalApiProductDisplay = ${JSON.stringify(apAdminPortalApiProductDisplay, null, 2)}`);
      setManagedObject(apApiDisplay);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const ViewApi_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(props.apiEntityId);
  }

  const doFetchVersion = async (version: string) => {
    props.onLoadingChange(true);
    await apiGetManagedObject(version);
    props.onLoadingChange(false);
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const setBreadCrumbItemList = (moDisplayName: string) => {
    props.setBreadCrumbItemList([
      {
        label: moDisplayName,
        command: ViewApi_onNavigateHereCommand
      }
    ]);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setBreadCrumbItemList(managedObject.apEntityId.displayName);
    props.onInitialized(managedObject);
    setSelectedVersion(managedObject.apVersionInfo.apCurrentVersion);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(selectedVersion === undefined) return;
    if(managedObject === undefined) return;
    if(selectedVersion !== managedObject.apVersionInfo.apCurrentVersion) doFetchVersion(selectedVersion);
  }, [selectedVersion]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */


  // * render *
  const renderBusinessGroupInfo = (apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): JSX.Element => {
    return (
      <APDisplayBusinessGroupInfo
        apManagedAssetBusinessGroupInfo={apManagedAssetBusinessGroupInfo}
        showSharingInfo={true}
      />
    );
  }
  const renderOwner = (apOwnerInfo: TAPEntityId): JSX.Element => {
    return (
      <div><b>Owner</b>: {apOwnerInfo.displayName}</div>
    );
  }
  const renderState = (apLifecycleStageInfo: IAPLifecycleStageInfo): JSX.Element => {
    return(
      <span><b>State: </b>{apLifecycleStageInfo.stage}</span>
    );
  }
  const renderUsedByApiProducts = (apApiProductReferenceEntityIdList: TAPEntityIdList): JSX.Element => {
    if(apApiProductReferenceEntityIdList.length === 0) return (<div>None.</div>);
    return (
      <div>
          {/* {APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList(row.apApiProductReferenceEntityIdList))} */}
          {APEntityIdsService.create_SortedDisplayNameList(apApiProductReferenceEntityIdList).join(', ')}
      </div>
    );
  }
  const renderMeta = (apMetaInfo: TAPMetaInfo): JSX.Element => {
    return (
      <React.Fragment>  
        <div>Created by: {apMetaInfo.apCreatedBy}</div>
        <div>Created on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(apMetaInfo.apCreatedOn)}</div>
        <div>Last Modified by: {apMetaInfo.apLastModifiedBy}</div>
        <div>Last Modified on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(apMetaInfo.apLastModifiedOn)}</div>        
      </React.Fragment>
    );
  }

  const renderVersionSelect = (): JSX.Element => {
    const funcName = 'renderVersionSelect';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);
    if(managedObject.apVersionInfo.apVersionList === undefined) throw new Error(`${logName}: managedObject.apVersionInfo.apVersionList is undefined`);

    const onRevisionSelect = (e: DropdownChangeParams) => {
      setSelectedVersion(e.value);
    }

    return(
      <Dropdown
        value={selectedVersion}
        options={APVersioningDisplayService.get_Sorted_ApVersionList(managedObject.apVersionInfo.apVersionList)}
        onChange={onRevisionSelect}
      />                          
    );
  }

  const renderVersion = (): JSX.Element => {
    return (<div><b>Version: </b>{renderVersionSelect()}</div>);
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return(
      <div className="p-col-12">
        <div className="api-view">
          <div className="api-view-detail-left">

            <div>{renderBusinessGroupInfo(mo.apBusinessGroupInfo)}</div>
            <div>{renderOwner(mo.apOwnerInfo)}</div>

            {/* <div className="p-text-bold">Used by API Products:</div>
            <div className="p-ml-2">{renderUsedByApiProducts(managedObject.apApiProductReferenceEntityIdList)}</div> */}
          </div>
          <div className="api-view-detail-right">
            <div>{renderVersion()}</div>
          </div>            
        </div>
      </div>  
    );
  }
  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);
    if(managedObject.apApiSpecDisplay === undefined) throw new Error(`${logName}: managedObject.apApiSpecDisplay === undefined`);

    return (
      <React.Fragment>

        {renderHeader(managedObject)}

        {/* <pre>{JSON.stringify(managedObject.apVersionInfo, null, 2)}</pre> */}

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General'>
            <React.Fragment>
              <div className="p-col-12">
                <div className="api-view">
                  <div className="api-view-detail-left">

                    <div>{renderState(managedObject.apLifecycleStageInfo)}</div>

                    <div className="p-text-bold">Description or Notes: TODO</div>
                    {/* <div className="p-ml-2">{managedObject.apDescription}</div> */}

                    <div className="p-text-bold">Used by API Products:</div>
                    <div className="p-ml-2">{renderUsedByApiProducts(managedObject.apApiProductReferenceEntityIdList)}</div>

                  </div>
                  <div className="api-view-detail-right">
                    <div>Id: {managedObject.apEntityId.id}</div>
                    <div>Source: {managedObject.connectorApiInfo.source}</div>
                    <div>{renderMeta(managedObject.apMetaInfo)}</div>
                  </div>            
                </div>
              </div>  
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Async API Spec'>
            <APDisplayAsyncApiSpec 
              schema={managedObject.apApiSpecDisplay.spec} 
              schemaId={managedObject.apEntityId.id}
              onDownloadError={props.onError}
              onDownloadSuccess={props.onSuccess}
            />
          </TabPanel>
        </TabView>
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="manage-apis">

        <APComponentHeader header={`API: ${props.apiEntityId.displayName}`} />

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObject && renderManagedObject() }

      </div>
    </React.Fragment>
  );
}
