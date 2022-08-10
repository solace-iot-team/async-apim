
import React from "react";
import { useHistory } from 'react-router-dom';

import { TabPanel, TabView } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { TreeSelect, TreeSelectChangeParams } from "primereact/treeselect";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { TAPManagedAssetBusinessGroupInfo } from "../../../displayServices/APManagedAssetDisplayService";
import { APDisplayApAttributeDisplayList } from "../../../components/APDisplay/APDisplayApAttributeDisplayList";
import { Config } from "../../../Config";
import { Globals } from "../../../utils/Globals";
import APVersioningDisplayService, { TAPVersionTreeTableNodeList } from "../../../displayServices/APVersioningDisplayService";
import APMetaInfoDisplayService, { TAPMetaInfo } from "../../../displayServices/APMetaInfoDisplayService";
import { TAPAttributeDisplayList } from "../../../displayServices/APAttributesDisplayService/APAttributesDisplayService";
import { APDisplayBusinessGroupInfo } from "../../../components/APDisplay/APDisplayBusinessGroupInfo";
import { IAPLifecycleStageInfo } from "../../../displayServices/APLifecycleStageInfoDisplayService";
import APApisDisplayService, { IAPApiDisplay } from "../../../displayServices/APApisDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageApisCommon";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { DisplayAdminPortalApiProductReferenceList } from "./DisplayAdminPortalApiProductReferenceList";
import { E_AP_Navigation_Scope, TAPPageNavigationInfo } from "../../../displayServices/APPageNavigationDisplayUtils";
import { EUIAdminPortalResourcePaths } from "../../../utils/Globals";
import { APDisplayApiChannelParameterList } from "../../../components/APDisplay/APDisplayApiChannelParameterList";
import APApiSpecsDisplayService from "../../../displayServices/APApiSpecsDisplayService";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export enum E_DISPLAY_ADMIN_PORTAL_API_SCOPE {
  REVIEW_AND_CREATE = "REVIEW_AND_CREATE",
  VIEW_EXISTING = "VIEW_EXISTING",
  VIEW_EXISTING_MAINTAIN = "VIEW_EXISTING_MAINTAIN"
}

export interface IDisplayAdminPortalApiProps {
  organizationId: string;
  apApiDisplay: IAPApiDisplay;
  scope: E_DISPLAY_ADMIN_PORTAL_API_SCOPE;
  onSuccess: (apiCallState: TApiCallState) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  apPageNavigationInfo?: TAPPageNavigationInfo;
}

export const DisplayAdminPortalApi: React.FC<IDisplayAdminPortalApiProps> = (props: IDisplayAdminPortalApiProps) => {
  const ComponentName = 'DisplayAdminPortalApi';

  type TManagedObject = IAPApiDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [selectedTreeVersion, setSelectedTreeVersion] = React.useState<string>();
  const [showApiSpecRefreshCounter, setShowApiSpecRefreshCounter] = React.useState<number>(0);
  const [userContext] = React.useContext(UserContext);
  const viewApiProductReferenceHistory = useHistory<TAPPageNavigationInfo>();

  const ReferencedByTabIndex: number = 2;

  // * Api Calls *
  const apiGetManagedObject = async(apVersion: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve details for api: ${props.apApiDisplay.apEntityId.displayName}, version: ${apVersion}`);
    try { 
      // test version fetch error handling 
      // if(apVersion === '1.0.0') throw new Error(`${logName}: error for apVersion=${apVersion}`);
      const connectorRevision = APVersioningDisplayService.get_OrginalConnectorRevision({
        apVersion_ConnectorRevision_Map: props.apApiDisplay.apVersionInfo.apVersion_ConnectorRevision_Map,
        apVersion: apVersion
      });
      const apApiDisplay: IAPApiDisplay = await APApisDisplayService.apiGet_ApApiDisplay({
        organizationId: props.organizationId,
        apiId: props.apApiDisplay.apEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        fetch_async_api_spec: true,
        fetch_revision_list: true,
        version: connectorRevision
      });
      setManagedObject(apApiDisplay);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetManagedObjectZipContents = async(): Promise<Blob | undefined> => {
    const funcName = 'apiGetManagedObjectZipContents';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve zip contents for api: ${props.apApiDisplay.apEntityId.displayName}, version: ${managedObject.apVersionInfo.apCurrentVersion}`);
    let zipContents: Blob | undefined = undefined;
    try { 
      const connectorRevision = APVersioningDisplayService.get_OrginalConnectorRevision({
        apVersion_ConnectorRevision_Map: props.apApiDisplay.apVersionInfo.apVersion_ConnectorRevision_Map,
        apVersion: managedObject.apVersionInfo.apCurrentVersion
      });
      zipContents = await APApiSpecsDisplayService.apiGet_Api_ApiSpec_ZipContents({ 
        organizationId: props.organizationId,
        apiEntityId: managedObject.apEntityId,
        version: connectorRevision,
      });
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return zipContents;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    setApiCallStatus(null);
    setManagedObject(props.apApiDisplay);
    props.onLoadingChange(false);
  }

  const doFetchVersion = async (version: string) => {
    props.onLoadingChange(true);
    setApiCallStatus(null);
    await apiGetManagedObject(version);
    props.onLoadingChange(false);
    setShowApiSpecRefreshCounter(showApiSpecRefreshCounter + 1);
  }

  const doFetchZipContents = async(): Promise<Blob | undefined> => {
    props.onLoadingChange(true);
    const zipContents: Blob | undefined = await apiGetManagedObjectZipContents();
    props.onLoadingChange(false);
    if(zipContents !== undefined) return zipContents;
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setSelectedTreeVersion(managedObject.apVersionInfo.apCurrentVersion);
    if(props.apPageNavigationInfo !== undefined && props.apPageNavigationInfo.apNavigationTarget.scope === E_AP_Navigation_Scope.ORIGIN) {
      // alert(`${ComponentName}: props.apPageNavigationInfo=${JSON.stringify(props.apPageNavigationInfo, null, 2)}`);
      if(props.apPageNavigationInfo.apNavigationTarget.tabIndex !== undefined) setTabActiveIndex(props.apPageNavigationInfo.apNavigationTarget.tabIndex);
    }
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(selectedTreeVersion === undefined) return;
    if(managedObject === undefined) return;
    if(selectedTreeVersion !== managedObject.apVersionInfo.apCurrentVersion) doFetchVersion(selectedTreeVersion);
  }, [selectedTreeVersion]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) {
        if(managedObject !== undefined) setSelectedTreeVersion(managedObject.apVersionInfo.apCurrentVersion);
        props.onError(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onViewApiProductReference = (apiProductEntityId: TAPEntityId) => {
    // alert(`${ComponentName}: open mo.apEntityId=${JSON.stringify(mo.apEntityId)}`);
    if(props.scope === E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING) {
      viewApiProductReferenceHistory.push({       
        pathname: EUIAdminPortalResourcePaths.ManageOrganizationApiProducts,
        state: {
          apNavigationTarget: {
            apEntityId: apiProductEntityId,
            scope: E_AP_Navigation_Scope.LINKED,
          },
          apNavigationOrigin: {
            breadcrumbLabel: 'APIs',
            apOriginPath: EUIAdminPortalResourcePaths.ManageOrganizationApis,
            apEntityId: props.apApiDisplay.apEntityId,
            tabIndex: ReferencedByTabIndex,
            scope: E_AP_Navigation_Scope.ORIGIN
          }
        }
      });
    }
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
    if(props.scope === E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING) {
      return (
        <div><b>Owner</b>: {apOwnerInfo.displayName}</div>
      );
    } else return (<></>);
  }

  const renderVersionSelect = (): JSX.Element => {
    const funcName = 'renderVersionSelect';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);
    if(managedObject.apVersionInfo.apVersionList === undefined) throw new Error(`${logName}: managedObject.apVersionInfo.apVersionList is undefined`);

    const onVersionSelectTree = (e: TreeSelectChangeParams) => {
      setSelectedTreeVersion(e.value as string);
    }

    const apVersionTreeTableNodeList: TAPVersionTreeTableNodeList = APVersioningDisplayService.create_VersionTreeTableNodeList({ apVersionList: managedObject.apVersionInfo.apVersionList });
    return(
      <React.Fragment>
        {/* <pre>{JSON.stringify(apVersionTreeTableNodeList, null, 2)}</pre> */}
        <TreeSelect
          value={selectedTreeVersion}
          options={apVersionTreeTableNodeList}
          onChange={onVersionSelectTree}
          filter={true}
          selectionMode="single"
        />
      </React.Fragment>            
    );
  }
  const renderVersion = (mo: TManagedObject): JSX.Element => {
    const funcName = 'renderVersion';
    const logName = `${ComponentName}.${funcName}()`;
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING:
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING_MAINTAIN:
        return (
          <React.Fragment>
            {/* <pre>{JSON.stringify(mo.apVersionInfo, null, 2)}</pre> */}
            <div><b>Version: </b>{renderVersionSelect()}</div>
          </React.Fragment>
        );
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE:
        return (
          // <div><b>New Version: {mo.apVersionInfo.apCurrentVersion}</b></div>
          <></>
        );
      default:
        Globals.assertNever(logName, props.scope);
    }
    return (<></>);
  }
  const renderState = (apLifecycleStageInfo: IAPLifecycleStageInfo): JSX.Element => {
    const funcName = 'renderState';
    const logName = `${ComponentName}.${funcName}()`;
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING:
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING_MAINTAIN:
        return (
          <React.Fragment>
            <div><b>State: </b>{apLifecycleStageInfo.stage}</div>
            {apLifecycleStageInfo.notes !== undefined &&
              <React.Fragment>
                <div><b>Notes: </b></div>
                <div className="p-ml-2">{apLifecycleStageInfo.notes}</div>
              </React.Fragment>
            } 
          </React.Fragment>
        );
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE:
        return (
          <></>
        );
      default:
        Globals.assertNever(logName, props.scope);
    }
    return (<></>);
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="api-view">
          <div className="api-view-detail-left">

            <div>{renderBusinessGroupInfo(mo.apBusinessGroupInfo)}</div>
            <div>{renderOwner(mo.apOwnerInfo)}</div>
            <div>{renderState(mo.apLifecycleStageInfo)}</div>

            {/* DEBUG */}
            {/* <pre>map={JSON.stringify(mo.apVersionInfo.apVersion_ConnectorRevision_Map, null, 2)}</pre> */}

          </div>
          <div className="api-view-detail-right">
            <div>{renderVersion(mo)}</div>
          </div>            
        </div>
      </div>  
    );
  }

  const renderMeta = (apMetaInfo: TAPMetaInfo): JSX.Element => {
    if(props.scope === E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE) return (<></>);
    return (
      <React.Fragment>  
        <div>Created by: {apMetaInfo.apCreatedBy}</div>
        <div>Created on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(apMetaInfo.apCreatedOn)}</div>
        <div>Last Modified by: {apMetaInfo.apLastModifiedBy}</div>
        <div>Last Modified on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(apMetaInfo.apLastModifiedOn)}</div>        
      </React.Fragment>
    );
  }

  const renderDevelAttributeList = (mo: TManagedObject): JSX.Element => {
    const funcName = 'renderDevelAttributeList';
    const logName = `${ComponentName}.${funcName}()`;
    let apAttributeDisplayList: TAPAttributeDisplayList = [];
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING:
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING_MAINTAIN:
        apAttributeDisplayList = mo.devel_display_complete_ApAttributeList;
        break;
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE:
        apAttributeDisplayList = []
        break;
      default:
        Globals.assertNever(logName, props.scope);
    }
    return (
      <APDisplayApAttributeDisplayList
        apAttributeDisplayList={apAttributeDisplayList}
        tableRowHeader_AttributeName="Devel Attribute"
        tableRowHeader_AttributeValue="Value"
        emptyMessage="No attributes defined"
        className="p-ml-4"
      />
    );
  }

  const renderChannelParameters = (): JSX.Element => {
    const funcName = 'renderChannelParameters';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING:
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING_MAINTAIN:
        return(
          <React.Fragment>
            <div className="p-text-bold">Channel Parameters:</div>
            <APDisplayApiChannelParameterList
              key={`${ComponentName}_APDisplayApiChannelParameterList_${showApiSpecRefreshCounter}`}
              apApiChannelParameterList={managedObject.apApiChannelParameterList}
              emptyChannelParameterListMessage="No Channel Parameters defined in Async API Spec."
              className="p-mt-2"
            />  
          </React.Fragment>
        );
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE:
        return(<></>);
      default:
        Globals.assertNever(logName, props.scope);
    }
    return(<></>);
  }

  const renderSummaryAndDescription = (): JSX.Element => {
    const funcName = 'renderSummaryAndDescription';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING:
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING_MAINTAIN:
        return(
          <React.Fragment>
            <div><b>Summary:</b> {managedObject.summary}</div>

            <div className="p-text-bold">Description:</div>
            <div className="p-ml-2">{managedObject.description}</div>
          </React.Fragment>
        );
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE:
        return(<></>);
      default:
        Globals.assertNever(logName, props.scope);
    }
    return(<></>);

  }

  const renderTabPanels = (): Array<JSX.Element> => {
    const funcName = 'renderTabPanels';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const tabPanels: Array<JSX.Element> = [];

    tabPanels.push(
      <TabPanel header='Async API Spec'>
        { renderChannelParameters() }
        <APDisplayAsyncApiSpec 
          key={`${ComponentName}_APDisplayAsyncApiSpec_${showApiSpecRefreshCounter}`}
          schema={managedObject.apApiSpecDisplay.spec} 
          schemaId={managedObject.apEntityId.id}
          renderDownloadButtons={props.scope !== E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE}
          onDownloadError={props.onError}
          onDownloadSuccess={props.onSuccess}
          fetchZipContentsFunc={doFetchZipContents}
        />
      </TabPanel>
    );
    tabPanels.push(
      <TabPanel header='General'>
        <div className="p-col-12">
          <div className="api-view">
            <div className="api-view-detail-left">

              <div><b>Name:</b> {managedObject.apEntityId.id}</div>

              {renderSummaryAndDescription()}

            </div>
            <div className="api-view-detail-right">
              <div>Id: {managedObject.apEntityId.id}</div>
              <div>Source: {managedObject.connectorApiInfo.source}</div>
              <div>{renderMeta(managedObject.apMetaInfo)}</div>
            </div>            
          </div>
        </div>  
      </TabPanel>
    );
    tabPanels.push(
      <TabPanel header='Attributes'>
        <React.Fragment>
          <div className="p-text-bold">General Attributes:</div>
          <APDisplayApAttributeDisplayList
            apAttributeDisplayList={managedObject.apExternal_ApAttributeDisplayList}
            tableRowHeader_AttributeName="Attribute"
            tableRowHeader_AttributeValue="Value"  
            emptyMessage="No attributes defined"
            className="p-ml-4"
          />
          {Config.getUseDevelTools() &&
            <React.Fragment>
              <Divider />
              <div className="p-text-bold">DEVEL: All Attributes for cross checking:</div>
              {renderDevelAttributeList(managedObject)}
            </React.Fragment>
          }
        </React.Fragment>
      </TabPanel>
    );  
    if(props.scope === E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING || props.scope === E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING_MAINTAIN) {
      tabPanels.push(
        <TabPanel header='Referenced By'>
          <div className="p-ml-2">
            <DisplayAdminPortalApiProductReferenceList
              organizationId={props.organizationId}
              apApiDisplay={managedObject}
              onSuccess={props.onSuccess}
              onError={props.onError}
              onViewApiProductReference={onViewApiProductReference}
            />
          </div>
        </TabPanel>
      );  
    } 
    return tabPanels;
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <React.Fragment>

        {renderHeader(managedObject)}

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          
          { renderTabPanels() }
        
        </TabView> 
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="manage-apis">

        {props.scope === E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING && managedObject && 
          <APComponentHeader header={`API: ${managedObject.apEntityId.displayName}`} />
        }

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {managedObject && selectedTreeVersion !== undefined && renderManagedObject() }

      </div>
    </React.Fragment>
  );
}
