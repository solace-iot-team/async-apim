
import React from "react";

import { 
  AdministrationService, 
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
  ManageOrganizationsCommon, 
  TAPOrganizationConfig 
} from "./ManageOrganizationsCommon";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IViewOrganizationProps {
  organizationId: CommonName;
  organizationDisplayName: CommonDisplayName;
  reInitializeTrigger: number,
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ViewOrganization: React.FC<IViewOrganizationProps> = (props: IViewOrganizationProps) => {
  const componentName = 'ViewOrganization';

  type TManagedObject = TAPOrganizationConfig;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve details for organization: ${props.organizationDisplayName}`);
    try { 
      const apiOrganization = await AdministrationService.getOrganization({
        organizationName: props.organizationId
      });
      setManagedObject(ManageOrganizationsCommon.transformApiOrganizationToAPOrganizationConfig(apiOrganization));
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
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    doInitialize();
  }, [props.reInitializeTrigger]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;

    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);

    return (
      <React.Fragment>
        <div className="p-col-12">
          <div className="organization-view">
            <div className="detail-left">
              <div><b>Type</b>: {managedObject.configType}</div>
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
