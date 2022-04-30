
import React from "react";

import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { E_DISPLAY_ORGANIZATION_SCOPE } from "./ManageOrganizationsCommon";
import { IAPSingleOrganizationDisplay } from "../../../displayServices/APOrganizationsDisplayService/APSingleOrganizationDisplayService";
import { IAPSystemOrganizationDisplay } from "../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import APOrganizationsDisplayService, { 
  EAPCloudConnectivityConfigType, 
  EAPOrganizationSempv2AuthType, 
  TAPCloudConnectivityConfig, 
  TAPOrganizationSempv2Auth 
} from "../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";
import { Globals } from "../../../utils/Globals";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";

import '../../../components/APComponents.css';
import "./ManageOrganizations.css";

export interface IDisplayOrganizationProps {
  apOrganizationDisplay: IAPSystemOrganizationDisplay | IAPSingleOrganizationDisplay;
  scope: E_DISPLAY_ORGANIZATION_SCOPE;
}

export const DisplayOrganization: React.FC<IDisplayOrganizationProps> = (props: IDisplayOrganizationProps) => {
  const ComponentName = 'DisplayOrganization';

  type TManagedObject = IAPSystemOrganizationDisplay | IAPSingleOrganizationDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);

  const doInitialize = async () => {
    setManagedObject(props.apOrganizationDisplay);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */


    // * render *
    const renderToken = (title: string, token: string): JSX.Element => {
      let displayToken: string = token;
      if(token === APOrganizationsDisplayService.APOrganizationDisplay_EmptyString) displayToken = 'not configured';
      return (
        <React.Fragment>
          <span>{title}:</span>
          <span className="p-ml-2" style={{ fontSize: '12px', maxWidth: '1000px', overflowWrap: 'break-word', wordWrap: 'break-word' }}>{displayToken}</span>
        </React.Fragment>
      );
    }
  
    const renderCloudConnectivityConfig = (apCloudConnectivityConfig: TAPCloudConnectivityConfig) => {
      const funcName = 'renderCloudConnectivityConfig';
      const logName = `${ComponentName}.${funcName}()`;
  
      const renderDetails = () => {
        const configType: EAPCloudConnectivityConfigType = apCloudConnectivityConfig.configType;
        switch(configType) {
          case EAPCloudConnectivityConfigType.SIMPLE:
            if(apCloudConnectivityConfig.configType !== EAPCloudConnectivityConfigType.SIMPLE) throw new Error(`${logName}: apCloudConnectivityConfig.configType !== ${EAPCloudConnectivityConfigType.SIMPLE}`);
            return renderToken('Cloud Token', apCloudConnectivityConfig.cloudToken);
          case EAPCloudConnectivityConfigType.ADVANCED:
            if(apCloudConnectivityConfig.configType !== EAPCloudConnectivityConfigType.ADVANCED) throw new Error(`${logName}: apCloudConnectivityConfig.configType !== ${EAPCloudConnectivityConfigType.ADVANCED}`);
            return(
              <React.Fragment>
                <div>Solace Cloud:</div>
                <div>
                  <div>Base URL: {apCloudConnectivityConfig.apSolaceCloudConfig.baseUrl}</div>
                  { renderToken('Token', apCloudConnectivityConfig.apSolaceCloudConfig.cloudToken)}
                </div>
                <div>Event Portal:</div>
                <div>
                  <div>Base URL: {apCloudConnectivityConfig.apEventPortalConfig.baseUrl}</div>
                  { renderToken('Token', apCloudConnectivityConfig.apEventPortalConfig.cloudToken)}
                </div>
              </React.Fragment>
            );
          default:
            Globals.assertNever(logName, configType);
        }
      }
  
      return (
        <React.Fragment>
          <div className="p-mb-2 p-mt-4 ap-display-component-header">Cloud Connectivity:</div>
          <div className="p-ml-4">{renderDetails()}</div>
        </React.Fragment>
      );
    }
  
  const renderOrganizationSempv2Auth = (apOrganizationSempv2Auth: TAPOrganizationSempv2Auth) => {
    const funcName = 'renderOrganizationSempv2Auth';
    const logName = `${ComponentName}.${funcName}()`;
  
    const renderDetails = () => {
      const authType: EAPOrganizationSempv2AuthType = apOrganizationSempv2Auth.apAuthType;
      switch(authType) {
        case EAPOrganizationSempv2AuthType.BASIC_AUTH:
          if(apOrganizationSempv2Auth.apAuthType !== EAPOrganizationSempv2AuthType.BASIC_AUTH) throw new Error(`${logName}: apOrganizationSempv2Auth.apAuthType !== ${ EAPOrganizationSempv2AuthType.BASIC_AUTH}`);
          return (
            <div><b>Auth Type: </b>{apOrganizationSempv2Auth.apAuthType}</div>
          );
        case  EAPOrganizationSempv2AuthType.API_KEY:
          if(apOrganizationSempv2Auth.apAuthType !== EAPOrganizationSempv2AuthType.API_KEY) throw new Error(`${logName}: apCloudConnectivityConfig.configType !== ${ EAPOrganizationSempv2AuthType.API_KEY}`);
          return(
            <React.Fragment>
              <div><b>Auth Type: </b>{apOrganizationSempv2Auth.apAuthType}</div>
              <div>
                <div>API Key Location: {apOrganizationSempv2Auth.apiKeyLocation}</div>
                <div>API Key Name: {apOrganizationSempv2Auth.apiKeyName}</div>
              </div>
            </React.Fragment>
          );
        default:
          Globals.assertNever(logName, authType);
      }
    }
  
    return (
      <React.Fragment>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">Broker SempV2 Auth:</div>
        <div className="p-ml-4">{renderDetails()}</div>
      </React.Fragment>
    );
  }
  
    const renderGeneralInfo = (): Array<JSX.Element> => {
      const funcName = 'renderGeneralInfo';
      const logName = `${ComponentName}.${funcName}()`;
      if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
      const jsxList: Array<JSX.Element> = [];
      jsxList.push(
        <div id={Globals.getUUID()}><b>Config Status</b>: {managedObject.apOrganizationConfigStatus}</div>
      );
      jsxList.push(
        <div id={Globals.getUUID()}><b>Type</b>: TODO: config type simple / advanced</div>
      );
      jsxList.push(
        <div id={Globals.getUUID()}><b>Cloud Connectivity</b>: {String(managedObject.apOrganizationOperationalStatus.cloudConnectivity)}</div>
      );
      jsxList.push(
        <div id={Globals.getUUID()}><b>Event Portal Connectivity</b>: {String(managedObject.apOrganizationOperationalStatus.eventPortalConnectivity)}</div>
      )
      return jsxList;
    }
  
    const renderHeader = (): JSX.Element => {
      const funcName = 'renderHeader';
      const logName = `${ComponentName}.${funcName}()`;
      if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
      return (
        <div className="p-col-12">
          <div className="organization-view">
            <div className="detail-left">
              {renderGeneralInfo()}
            </div>
            <div className="detail-right">
              <div>Id: {managedObject.apEntityId.id}</div>
            </div>            
          </div>
        </div>      
      );
    }
  
  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    
    const renderApis2ApiProductsRation = (ratio: number): string => {
      if(ratio === -1) return 'not limited';
      return ratio.toString();
    }
    
    return (
      <React.Fragment>

        { renderHeader() }
        
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          <TabPanel header='General'>
            <React.Fragment>
              <p><b>Max Number of APIs per API Product: </b>{renderApis2ApiProductsRation(managedObject.apNumApis2ApiProductRatio)}</p>
              <p><b>App Credentials Expiration: </b>{APDisplayUtils.convertMilliseconds(managedObject.apAppCredentialsExpiryDuration)}</p>
            </React.Fragment>
          </TabPanel>
          <TabPanel header='Connectivity'>            
            <React.Fragment>
              { renderCloudConnectivityConfig(managedObject.apCloudConnectivityConfig) }
              { renderOrganizationSempv2Auth(managedObject.apOrganizationSempv2Auth) }
            </React.Fragment>
          </TabPanel>
          {/* <TabPanel header='OrganizationIntegrations'>
            <React.Fragment>
              <div>TODO</div>
            </React.Fragment>
          </TabPanel> */}
        </TabView> 
      </React.Fragment>
    );

  }

  return (
    <React.Fragment>
      <div className="manage-organizations">

        { managedObject && <APComponentHeader header={`Organization: ${managedObject.apEntityId.displayName}`} /> }

        { managedObject && renderManagedObject() }

      </div>
    </React.Fragment>
  );
}
