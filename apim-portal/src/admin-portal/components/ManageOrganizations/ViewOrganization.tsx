
import React from "react";

import { 
  CommonName,
  CommonDisplayName
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  EAPBrokerServiceDiscoveryProvisioningType, 
  EAPOrganizationConfigType, 
  E_CALL_STATE_ACTIONS, 
  E_COMPONENT_STATE, 
  ManageOrganizationsCommon, 
  TAPOrganizationConfig 
} from "./ManageOrganizationsCommon";
import { APOrganizationsService, TAPOrganization } from "../../../utils/APOrganizationsService";
import { E_ManageOrganizations_Scope, TManageOrganizationsScope } from "./ManageOrganizations";
import { Globals } from "../../../utils/Globals";
import { MenuItem, MenuItemCommandParams } from "primereact/api";
import { TAPEntityId } from "../../../utils/APEntityIdsService";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IViewOrganizationProps {
  organizationId: CommonName;
  organizationDisplayName: CommonDisplayName;
  scope: TManageOrganizationsScope;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateHere: (manageUsersComponentState: E_COMPONENT_STATE, organizationEntityId: TAPEntityId) => void;
}

export const ViewOrganization: React.FC<IViewOrganizationProps> = (props: IViewOrganizationProps) => {
  const componentName = 'ViewOrganization';

  type TManagedObject = TAPOrganizationConfig;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  const ManageOrganizations_ViewOrganization_onNavigateHereCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateHere(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW, { id: props.organizationId, displayName: props.organizationDisplayName });
  }

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve details for organization: ${props.organizationDisplayName}`);
    try {
      const apOrganization: TAPOrganization = await APOrganizationsService.getOrganization(props.organizationId);
      setManagedObject(ManageOrganizationsCommon.transformAPOrganizationToAPOrganizationConfig(apOrganization));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    setBreadCrumbItemList([{
      label: props.organizationDisplayName,
      command: ManageOrganizations_ViewOrganization_onNavigateHereCommand
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: props.organizationDisplayName,
      command: ManageOrganizations_ViewOrganization_onNavigateHereCommand
    }]);
  }, [breadCrumbItemList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderToken = (title: string, token: string): JSX.Element => {
    return (
      <React.Fragment>
        <div>{title}:</div>
          <div className="p-ml-2" style={{ fontSize: '12px', maxWidth: '1000px', overflowWrap: 'break-word', wordWrap: 'break-word' }}>{token}</div>
      </React.Fragment>
    );
  }
  const renderSimple = (mo: TManagedObject): JSX.Element => {
    const isActive: boolean = (mo.configType === EAPOrganizationConfigType.SIMPLE);
    if(!isActive) return (<></>);
    return (
      <React.Fragment>
        {renderToken('Cloud Token', mo.configSimple.cloudToken)}
      </React.Fragment>
    );
  }
  const renderAdvanced_SolaceCloud = (mo: TManagedObject): JSX.Element => {
    const isActive: boolean = (mo.configAdvancedServiceDiscoveryProvisioning.bsdp_Type === EAPBrokerServiceDiscoveryProvisioningType.SOLACE_CLOUD);
    if(!isActive) return (<></>);
    return (
      <React.Fragment>
        <div><b>Type</b>: {mo.configAdvancedServiceDiscoveryProvisioning.bsdp_Type}</div>
        <div>Base URL: {mo.configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.baseUrl}</div>
        {renderToken('Cloud Token', mo.configAdvancedServiceDiscoveryProvisioning.bsdp_SolaceCloud.cloudToken)}
      </React.Fragment>
    );
  }
  const renderAdvanced_ReverseProxy = (mo: TManagedObject): JSX.Element => {
    const isActive: boolean = (mo.configAdvancedServiceDiscoveryProvisioning.bsdp_Type === EAPBrokerServiceDiscoveryProvisioningType.REVERSE_PROXY);
    if(!isActive) return (<></>);
    return (
      <React.Fragment>
        <div><b>Type</b>: {mo.configAdvancedServiceDiscoveryProvisioning.bsdp_Type}</div>
        <div style={{ fontSize: '12px' }}>{JSON.stringify(mo.configAdvancedServiceDiscoveryProvisioning.bsdp_ReverseProxy)}</div>
      </React.Fragment>
    );
  }
  const renderAdvanced_EventPortal = (mo: TManagedObject): JSX.Element => {
    return (
      <React.Fragment>
        <div>Base URL: {mo.configAdvancedEventPortal.baseUrl}</div>
        {renderToken('Cloud Token', mo.configAdvancedEventPortal.cloudToken)}
      </React.Fragment>
    );
  }
  const renderAdvanced = (mo: TManagedObject): JSX.Element => {
    const isActive: boolean = (mo.configType === EAPOrganizationConfigType.ADVANCED);
    if(!isActive) return (<></>);
    return (
      <React.Fragment>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">
          Broker Gateway Service Discovery &amp; Provisioning:
        </div>
        <div className="p-ml-4">
          {renderAdvanced_SolaceCloud(mo)}
          {renderAdvanced_ReverseProxy(mo)}
        </div>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">
          Event Portal:
        </div>
        <div className="p-ml-4">
          {renderAdvanced_EventPortal(mo)}
        </div>
      </React.Fragment>
    );
  }
  const renderGeneralInfo = (mo: TManagedObject): Array<JSX.Element> => {
    const jsxList: Array<JSX.Element> = [];
    jsxList.push(
      <div id={Globals.getUUID()}><b>Type</b>: {mo.configType}</div>
    );
    if(props.scope.type === E_ManageOrganizations_Scope.ALL_ORGS) {
      jsxList.push(
        <div id={Globals.getUUID()}><b>Cloud Connectivity</b>: {String(mo.apOrganization.status?.cloudConnectivity)}</div>
      );
      jsxList.push(
        <div id={Globals.getUUID()}><b>Event Portal Connectivity</b>: {String(mo.apOrganization.status?.eventPortalConnectivity)}</div>
      )
    }
    return jsxList;
  }

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;

    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);

    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="organization-view">
            <div className="detail-left">
              {renderGeneralInfo(managedObject)}
              {renderSimple(managedObject)}
              {renderAdvanced(managedObject)}
            </div>
            <div className="detail-right">
              <div>Id: {managedObject.name}</div>
            </div>            
          </div>
        </div>    
      </React.Fragment>
    );
  }

  return (
    <div className="manage-organizations">

      <APComponentHeader header={`Organization: ${props.organizationDisplayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && renderManagedObject() }

    </div>
  );
}
