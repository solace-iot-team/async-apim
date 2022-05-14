
import React from "react";
import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEntityId } from "../../../../utils/APEntityIdsService";
import { ButtonLabel_Cancel, ButtonLabel_Clone, E_CALL_STATE_ACTIONS } from "../ManageApiProductsCommon";
import APAdminPortalApiProductsDisplayService, { 
  TAPAdminPortalApiProductDisplay, TAPAdminPortalApiProductDisplay_CloningInfo 
} from "../../../displayServices/APAdminPortalApiProductsDisplayService";
import { 
  TAPManagedAssetBusinessGroupInfo, 
} from "../../../../displayServices/APManagedAssetDisplayService";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";
import { IAPVersionInfo } from "../../../../displayServices/APVersioningDisplayService";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import { APIProductAccessLevel } from "@solace-iot-team/apim-connector-openapi-browser";
import { APDisplayBusinessGroupInfo } from "../../../../components/APDisplay/APDisplayBusinessGroupInfo";
import { APSClientOpenApi } from "../../../../utils/APSClientOpenApi";
import { IAPLifecycleStageInfo } from "../../../../displayServices/APLifecycleStageInfoDisplayService";
import { CloneApiProductForm } from "./CloneApiProductForm";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IManageCloneApiProductProps {
  organizationId: string;
  apiProductEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onSaveSuccess: (newApiProductEntityId: TAPEntityId) => void;
  onNavigateToCommand: (apiProductEntityId: TAPEntityId) => void;
}

export const ManageCloneApiProduct: React.FC<IManageCloneApiProductProps> = (props: IManageCloneApiProductProps) => {
  const ComponentName = 'ManageCloneApiProduct';

  type TManagedObject = TAPAdminPortalApiProductDisplay_CloningInfo;

  const [apAdminPortalApiProductDisplay, setApAdminPortalApiProductDisplay] = React.useState<TAPAdminPortalApiProductDisplay>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const [userContext] = React.useContext(UserContext);
  const FormId = `ManageApiProducts_ManageClone_${ComponentName}`;

  // * Api Calls * 

  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(props.apiProductEntityId === undefined) throw new Error(`${logName}: props.apiProductEntityId === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${props.apiProductEntityId.displayName}`);
    try { 
      const apAdminPortalApiProductDisplay: TAPAdminPortalApiProductDisplay = await APAdminPortalApiProductsDisplayService.apiGet_AdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: props.apiProductEntityId.id,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id
      });
      setApAdminPortalApiProductDisplay(apAdminPortalApiProductDisplay);
      setManagedObject(APAdminPortalApiProductsDisplayService.get_CloningInfo({ apAdminPortalApiProductDisplay: apAdminPortalApiProductDisplay }));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCloneManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCloneManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CLONE_API_PRODUCT, `clone api product: ${props.apiProductEntityId.displayName}`); 
    try { 
      alert(`${logName} - implement me: new id=${mo.apCloneEntityId.id}`);
      // // create a suggested next version
      // apAdminPortalApiProductDisplay.apVersionInfo.apCurrentVersion = APVersioningDisplayService.create_NextVersion(apAdminPortalApiProductDisplay.apVersionInfo.apLastVersion);
      // await APAdminPortalApiProductsDisplayService.apiUpdate_ApApiProductDisplay({
      //   organizationId: props.organizationId,
      //   apApiProductDisplay: APAdminPortalApiProductsDisplayService.set_ApApiProductDisplay_PublishDestinationInfo({ 
      //     apApiProductDisplay: apAdminPortalApiProductDisplay,
      //     apApiProductDisplay_PublishDestinationInfo: mo
      //   }),
      // });  
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  const ManagedCloneApiProduct_onNavigateToCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToCommand(props.apiProductEntityId);
  }

  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList([
      {
        label: props.apiProductEntityId.displayName,
        command: ManagedCloneApiProduct_onNavigateToCommand
      },
      {
        label: 'Create New Version'
      }  
    ]);  
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    setBreadCrumbItemList();
    doInitialize()
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CLONE_API_PRODUCT) {
        if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
        props.onSaveSuccess(managedObject.apCloneEntityId);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiCloneManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmit = (mo: TManagedObject) => {
    doSubmitManagedObject(mo);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Cancel} type="button" label={ButtonLabel_Cancel} className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+ButtonLabel_Clone} form={FormId} type="submit" label={ButtonLabel_Clone} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <CloneApiProductForm
            formId={FormId}
            organizationId={props.organizationId}
            apAdminPortalApiProductDisplay_CloningInfo={managedObject}
            onSubmit={onSubmit}
            onError={props.onError}
            // onLoadingChange={props.onLoadingChange}
          />
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }

  const renderBusinessGroupInfo = (apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): JSX.Element => {
    return (
      <APDisplayBusinessGroupInfo
        apManagedAssetBusinessGroupInfo={apManagedAssetBusinessGroupInfo}
        showSharingInfo={true}
      />
    );
  }
  const renderRevisionInfo = (apVersionInfo: IAPVersionInfo): JSX.Element => {
    return (<div><b>Last Revision:</b> {apVersionInfo.apLastVersion}</div>);
  }
  const renderState = (apLifecycleStageInfo: IAPLifecycleStageInfo): JSX.Element => {
    // if(props.action === EAction.NEW) return (<></>);
    return(<div><b>State: </b>{apLifecycleStageInfo.stage}</div>);
  }
  const renderAccessLevel = (accessLevel: APIProductAccessLevel): JSX.Element => {
    return(<div><b>Access: </b>{accessLevel}</div>);
  }

  const renderComponent = () => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    if(apAdminPortalApiProductDisplay === undefined) throw new Error(`${logName}: apAdminPortalApiProductDisplay === undefined`);
    return (
      <React.Fragment>
        <div className="p-mt-4 p-mb-4">
          {renderBusinessGroupInfo(apAdminPortalApiProductDisplay.apBusinessGroupInfo)}
          {renderRevisionInfo(apAdminPortalApiProductDisplay.apVersionInfo)}
          {/* {renderState(apAdminPortalApiProductDisplay.apLifecycleStageInfo)} */}
          {/* {renderAccessLevel(apAdminPortalApiProductDisplay.apAccessLevel)} */}
          {/* {renderPublishDestinationInfo(apAdminPortalApiProductDisplay.apPublishDestinationInfo)} */}
        </div>
        <div className="p-mt-6">
          {renderManagedObjectForm()}
        </div>
      </React.Fragment>
    ); 
  }
  
  const getHeaderNotes = (): string | undefined => {
    return undefined;
    // const funcName = 'getComponentHeader';
    // const logName = `${ComponentName}.${funcName}()`;
    // if(apAdminPortalApiProductDisplay === undefined) throw new Error(`${logName}: apAdminPortalApiProductDisplay === undefined`);
    // if(apAdminPortalApiProductDisplay.apAppReferenceEntityIdList.length === 0) return 'Not used by any Apps.';
    // return `Used by ${apAdminPortalApiProductDisplay.apAppReferenceEntityIdList.length} APP(s).`;
  }

  const getHeader = (): string => {
    return `Create new version from: ${managedObject?.apOriginalEntityId.displayName}`;
  }
  return (
    <div className="manage-api-products">

      {managedObject && apAdminPortalApiProductDisplay && <APComponentHeader header={getHeader()} notes={getHeaderNotes()}/>}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && apAdminPortalApiProductDisplay && renderComponent()}

    </div>
  );
}
