
import React from "react";

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { TabPanel, TabView } from "primereact/tabview";
import { Dropdown, DropdownChangeParams } from "primereact/dropdown";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APDisplayAsyncApiSpec } from "../../../components/APDisplayAsyncApiSpec/APDisplayAsyncApiSpec";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APDisplayClientOptions } from "../../../components/APDisplay/APDisplayClientOptions";
import APEntityIdsService, { 
} from "../../../utils/APEntityIdsService";
import APApiSpecsDisplayService, { TAPApiSpecDisplay } from "../../../displayServices/APApiSpecsDisplayService";
import { TAPManagedAssetBusinessGroupInfo, TAPManagedAssetLifecycleInfo } from "../../../displayServices/APManagedAssetDisplayService";
import { APDisplayApControlledChannelParameters } from "../../../components/APDisplay/APDisplayApControlledChannelParameters";
import APVersioningDisplayService from "../../../displayServices/APVersioningDisplayService";
import { APDisplayBusinessGroupInfo } from "../../../components/APDisplay/APDisplayBusinessGroupInfo";
import APDeveloperPortalApiProductsDisplayService, { TAPDeveloperPortalApiProductDisplay } from "../../displayServices/APDeveloperPortalApiProductsDisplayService";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalProductCatalogCommon";
import APMetaInfoDisplayService from "../../../displayServices/APMetaInfoDisplayService";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";


export interface IDisplayDeveloperPortalApiProductProps {
  organizationId: string;
  apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay;
  userBusinessGroupId?: string;
  userId?: string;
  onSuccess: (apiCallState: TApiCallState) => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DisplayDeveloperPortalApiProduct: React.FC<IDisplayDeveloperPortalApiProductProps> = (props: IDisplayDeveloperPortalApiProductProps) => {
  const ComponentName = 'DisplayDeveloperPortalApiProduct';

  type TManagedObject = TAPDeveloperPortalApiProductDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [showApiId, setShowApiId] = React.useState<string>();
  const [apiSpec, setApiSpec] = React.useState<TAPApiSpecDisplay>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showApiSpecRefreshCounter, setShowApiSpecRefreshCounter] = React.useState<number>(0);
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  // version
  const [selectedVersion, setSelectedVersion] = React.useState<string>();

  // * Api Calls *
  const apiGetManagedObject = async(version: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT, `retrieve details for api product: ${props.apDeveloperPortalApiProductDisplay.apEntityId.displayName}, version: ${version}`);
    try { 
      const object: TAPDeveloperPortalApiProductDisplay = await APDeveloperPortalApiProductsDisplayService.apiGet_DeveloperPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: props.apDeveloperPortalApiProductDisplay.apEntityId.id,
        default_ownerId: props.apDeveloperPortalApiProductDisplay.apOwnerInfo.id,
        fetch_revision_list: true,
        revision: version,
      });
      setManagedObject(object);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetApiSpec = async(apiId: string, apiDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetApiSpec';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_SPEC, `retrieve api spec: ${apiDisplayName}`);
    try {
      const apiProductApiSpec: TAPApiSpecDisplay = await APApiSpecsDisplayService.apiGet_ApiProduct_ApiSpec({
        organizationId: props.organizationId, 
        apiProductId: managedObject.apEntityId.id,
        apiEntityId: { id: apiId, displayName: apiDisplayName }
      });
      setApiSpec(apiProductApiSpec);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setManagedObject(props.apDeveloperPortalApiProductDisplay);
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

  React.useEffect(() => {
    if(apiSpec === undefined) return;
    setShowApiSpecRefreshCounter(showApiSpecRefreshCounter + 1);
  }, [apiSpec]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doFetchApiSpec = async (apiId: string) => {
    props.onLoadingChange(true);
    await apiGetApiSpec(apiId, apiId);
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    if(showApiId === undefined) return;
    doFetchApiSpec(showApiId);
  }, [showApiId]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderShowApiButtons = () => {
    const funcName = 'renderShowApiButtons';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject is undefined`);

    const onShowApi = (event: any): void => {
      setShowApiId(event.currentTarget.dataset.id);
    }
  
    const jsxButtonList: Array<JSX.Element> = [];
    for (const apApiDisplay of managedObject.apApiDisplayList) {
      jsxButtonList.push(
        <Button 
          label={apApiDisplay.apEntityId.displayName} 
          key={apApiDisplay.apEntityId.id} 
          data-id={apApiDisplay.apEntityId.id} 
          // icon="pi pi-folder-open" 
          // className="p-button-text p-button-plain p-button-outlined p-button-rounded" 
          className="p-button-text p-button-plain p-button-outlined" 
          style={{ whiteSpace: 'nowrap' }}          
          onClick={onShowApi}
        />        
      );
    }
    const renderButtons = () => {
      return (
        <div className="p-grid">
          {jsxButtonList}
        </div>
      );
    }
    return (
      <Toolbar         
        style={{ 
          background: 'none',
          border: 'none'
        }} 
        left={renderButtons()}
      />
    );
  }

  const renderBusinessGroupInfo = (apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): JSX.Element => {
    return (
      <APDisplayBusinessGroupInfo
        apManagedAssetBusinessGroupInfo={apManagedAssetBusinessGroupInfo}
        showSharingInfo={false}
      />
    );
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
    return (<div><b>Version: </b>{renderVersionSelect()}</div>);
  }

  const renderState = (apManagedAssetLifecycleInfo: TAPManagedAssetLifecycleInfo): JSX.Element => {
    return(
      <span><b>State: </b>{apManagedAssetLifecycleInfo.apLifecycleState}</span>
    );
  }

  const renderAccess = (mo: TManagedObject): JSX.Element => {
    return(
      <span><b>Access: </b>
        {
          APDeveloperPortalApiProductsDisplayService.create_AccessDisplay({ 
            apDeveloperPortalApiProductDisplay: mo, 
            userBusinessGroupId: props.userBusinessGroupId,
            userId: props.userId
          })
        }
      </span>
    );
  }

  const renderMeta = (mo: TManagedObject): JSX.Element => {
    return (
      <React.Fragment>  
        <div>Created by: {mo.apMetaInfo.apCreatedBy}</div>
        <div>Created on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(mo.apMetaInfo.apCreatedOn)}</div>
        <div>Last Modified by: {mo.apMetaInfo.apLastModifiedBy}</div>
        <div>Last Modifined on: {APMetaInfoDisplayService.create_Timestamp_DisplayString(mo.apMetaInfo.apLastModifiedOn)}</div>
      </React.Fragment>
    );
  }

  const renderHeader = (mo: TManagedObject): JSX.Element => {
    return (
      <div className="p-col-12">
        <div className="api-product-view">
          <div className="api-product-view-detail-left">

            <div>{renderBusinessGroupInfo(mo.apBusinessGroupInfo)}</div>
            <div>{renderState(mo.apLifecycleInfo)}</div>
            <div>{renderAccess(mo)}</div>

            {/* DEBUG */}
            {/* <div><b>DEVEL: Current Version</b>: {mo.apVersionInfo.apCurrentVersion}, Last Version: {mo.apVersionInfo.apLastVersion}</div> */}

          </div>
          <div className="api-product-view-detail-right">
            <div>{renderVersion(mo)}</div>
          </div>            
        </div>
      </div>  
    );
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <React.Fragment>

        {renderHeader(managedObject)}

        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General'>
            <React.Fragment>
            <div className="p-col-12">
              <div className="api-product-view">
                <div className="api-product-view-detail-left">

                  <div className="p-text-bold">Description:</div>
                  <div className="p-ml-2">{managedObject.apDescription}</div>

                  {/* <div>{render_UsedByApps(managedObject.apAppReferenceEntityIdList)}</div> */}

                </div>
                <div className="api-product-view-detail-right">
                  <div>Id: {managedObject.apEntityId.id}</div>
                  {renderMeta(managedObject)}
                </div>            
              </div>
            </div>  
          </React.Fragment>
          </TabPanel>
          <TabPanel header='APIs'>
            <React.Fragment>
              <div>
                {renderShowApiButtons()}
                <APDisplayApControlledChannelParameters
                  apControlledChannelParameterList={managedObject.apControlledChannelParameterList}
                  emptyMessage="No controlled channel parameters defined"
                  className="p-ml-4 p-mt-4"
                />
              </div>
              {apiSpec && showApiId &&
                <React.Fragment>
                  <APDisplayAsyncApiSpec 
                    key={`${ComponentName}_APDisplayAsyncApiSpec_${showApiSpecRefreshCounter}`}
                    schema={apiSpec.spec} 
                    schemaId={showApiId} 
                    onDownloadSuccess={props.onSuccess}
                    onDownloadError={props.onError}
                  />
                </React.Fragment>  
              }
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Policies'>
            <React.Fragment>
              <div><b>Approval type</b>: {managedObject.apApprovalType}</div>
              {/* <div className="p-text-bold">Client Options:</div> */}
              <APDisplayClientOptions
                apClientOptionsDisplay={managedObject.apClientOptionsDisplay}
                className="p-mt-2"
              />
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Environments'>
            <React.Fragment>
              <div className="p-text-bold">Environments:</div>
              <div className="p-ml-2">
                {APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(managedObject.apEnvironmentDisplayList).join(', ')}
              </div>
              <div className="p-text-bold">Protocols:</div>
              <div className="p-ml-2">
                {APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(managedObject.apProtocolDisplayList).join(', ')}
              </div>
            </React.Fragment>
          </TabPanel>
        </TabView> 
      </React.Fragment>
    ); 
  }

  return (
    <React.Fragment>
      <div className="manage-api-products">

        {managedObject && 
          <APComponentHeader header={`${managedObject.apEntityId.displayName}`} />
        }

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        {/* <div>DEBUG: selectedVersion = {selectedVersion}</div> */}

        {managedObject && selectedVersion && renderManagedObject() }

      </div>
      {/* DEBUG */}
      {/* <pre style={ { fontSize: '10px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre> */}
      {/* <pre style={ { fontSize: '10px' }} >
        apSearchContent={JSON.stringify(managedObject?.apSearchContent.split(','), null, 2)}
      </pre> */}
    </React.Fragment>
  );
}
