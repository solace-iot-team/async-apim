
import React from "react";

import { TabPanel, TabView } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { Dropdown, DropdownChangeParams } from "primereact/dropdown";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APEntityIdsService, { 
  TAPEntityId,
  TAPEntityIdList 
} from "../../../utils/APEntityIdsService";
import { TAPManagedAssetBusinessGroupInfo } from "../../../displayServices/APManagedAssetDisplayService";
import { APDisplayApAttributeDisplayList } from "../../../components/APDisplay/APDisplayApAttributeDisplayList";
import { Config } from "../../../Config";
import { Globals } from "../../../utils/Globals";
import APVersioningDisplayService from "../../../displayServices/APVersioningDisplayService";
import APMetaInfoDisplayService, { TAPMetaInfo } from "../../../displayServices/APMetaInfoDisplayService";
import { TAPAttributeDisplayList } from "../../../displayServices/APAttributesDisplayService/APAttributesDisplayService";
import { APDisplayBusinessGroupInfo } from "../../../components/APDisplay/APDisplayBusinessGroupInfo";
import { IAPLifecycleStageInfo } from "../../../displayServices/APLifecycleStageInfoDisplayService";
import APApisDisplayService, { IAPApiDisplay } from "../../../displayServices/APApisDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageApisCommon";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { APDisplayApApiChannelParameterList } from "../../../components/APDisplay/APDisplayApApiChannelParameterList";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export enum E_DISPLAY_ADMIN_PORTAL_API_SCOPE {
  REVIEW_AND_CREATE = "REVIEW_AND_CREATE",
  VIEW_EXISTING = "VIEW_EXISTING"
}

export interface IDisplayAdminPortalApiProps {
  organizationId: string;
  apApiDisplay: IAPApiDisplay;
  scope: E_DISPLAY_ADMIN_PORTAL_API_SCOPE;
  onSuccess: (apiCallState: TApiCallState) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DisplayAdminPortalApi: React.FC<IDisplayAdminPortalApiProps> = (props: IDisplayAdminPortalApiProps) => {
  const ComponentName = 'DisplayAdminPortalApi';

  type TManagedObject = IAPApiDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [selectedVersion, setSelectedVersion] = React.useState<string>();
  const [userContext] = React.useContext(UserContext);


  // * Api Calls *
  const apiGetManagedObject = async(version: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API, `retrieve details for api: ${props.apApiDisplay.apEntityId.displayName}, version: ${version}`);
    try { 
      const apApiDisplay: IAPApiDisplay = await APApisDisplayService.apiGet_ApApiDisplay({
        organizationId: props.organizationId,
        apiId: props.apApiDisplay.apEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        fetch_async_api_spec: true,
        fetch_revision_list: true,
        version: version,
      });
      setManagedObject(apApiDisplay);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(props.apApiDisplay);
  }

  const doFetchVersion = async (version: string) => {
    props.onLoadingChange(true);
    await apiGetManagedObject(version);
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
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
  const renderUsedByApiProducts = (apApiProductReferenceEntityIdList: TAPEntityIdList): JSX.Element => {
    const funcName = 'renderUsedByApiProducts';
    const logName = `${ComponentName}.${funcName}()`;

    const _renderUsedByApiProducts = (apApiProductReferenceEntityIdList: TAPEntityIdList): JSX.Element => {
      if(apApiProductReferenceEntityIdList.length === 0) return (<div>None.</div>);
      return (
        <div>
            {/* {APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList(row.apApiProductReferenceEntityIdList))} */}
            {APEntityIdsService.create_SortedDisplayNameList(apApiProductReferenceEntityIdList).join(', ')}
        </div>
      );
    }
  
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING:
        return (
          <React.Fragment>
            <div className="p-text-bold">Used by Api Products:</div>
            <div className="p-ml-2">{_renderUsedByApiProducts(apApiProductReferenceEntityIdList)}</div>
          </React.Fragment>
        );
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE:
        return (<></>);
      default:
        Globals.assertNever(logName, props.scope);
    }
    return (<></>);
  }
  const renderVersionSelect = (): JSX.Element => {
    const funcName = 'renderVersionSelect';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);
    if(managedObject.apVersionInfo.apVersionList === undefined) throw new Error(`${logName}: managedObject.apVersionInfo.apVersionList is undefined`);

    const onVersionSelect = (e: DropdownChangeParams) => {
      setSelectedVersion(e.value);
    }

    return(
      <Dropdown
        value={selectedVersion}
        options={APVersioningDisplayService.get_Sorted_ApVersionList(managedObject.apVersionInfo.apVersionList)}
        onChange={onVersionSelect}
      />                          
    );
  }
  const renderVersion = (mo: TManagedObject): JSX.Element => {
    const funcName = 'renderVersion';
    const logName = `${ComponentName}.${funcName}()`;
    switch(props.scope) {
      case E_DISPLAY_ADMIN_PORTAL_API_SCOPE.VIEW_EXISTING:
        return (
          <div><b>Version: </b>{renderVersionSelect()}</div>
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
        return (
          <span><b>State: </b>{apLifecycleStageInfo.stage}</span>
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
        return(
          <React.Fragment>
            <div className="p-text-bold">Channel Parameters:</div>
            <APDisplayApApiChannelParameterList
              apApiChannelParameterList={managedObject.apApiChannelParameterList}
              // apApiChannelParameterList={[]}
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
          schema={managedObject.apApiSpecDisplay.spec} 
          schemaId={managedObject.apEntityId.id}
          renderDownloadButtons={props.scope !== E_DISPLAY_ADMIN_PORTAL_API_SCOPE.REVIEW_AND_CREATE}
          onDownloadError={props.onError}
          onDownloadSuccess={props.onSuccess}
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

              <div className="p-ml-2">{renderUsedByApiProducts(managedObject.apApiProductReferenceEntityIdList)}</div>

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
    if(Config.getUseDevelTools()) {
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

        {managedObject && selectedVersion !== undefined && renderManagedObject() }

      </div>
    </React.Fragment>
  );
}
