
import React from "react";

import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { DisplaySectionHeader_EventPortalServices, DisplaySectionHeader_SempV2Auth, DisplaySectionHeader_SolaceCloudServices, E_DISPLAY_ORGANIZATION_SCOPE } from "../ManageOrganizationsCommon";
import { IAPSingleOrganizationDisplay } from "../../../../displayServices/APOrganizationsDisplayService/APSingleOrganizationDisplayService";
import { IAPSystemOrganizationDisplay } from "../../../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";
import APOrganizationsDisplayService, { 
  EAPCloudConnectivityConfigType, 
  EAPEventPortalConnectivityConfigType, 
  EAPOrganizationConfigStatus, 
  EAPOrganizationConnectivityConfigType, 
  EAPOrganizationOperationalStatus, 
  EAPOrganizationSempv2AuthType, 
  TAPCloudConnectivityConfig, 
  TAPCloudConnectivityConfigCustom, 
  TAPCloudConnectivityConfigSolaceCloud, 
  TAPEventPortalConnectivityConfig, 
  TAPEventPortalConnectivityConfigCustom, 
  TAPOrganizationSempv2AuthConfig, 
  TAPOrganizationSempv2AuthConfig_ApiKeyAuth, 
} from "../../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";
import { Globals } from "../../../../utils/Globals";
import APDisplayUtils from "../../../../displayServices/APDisplayUtils";
import { DisplayIntegration } from "./DisplayIntegration";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

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
    let displayToken: string = token ? APOrganizationsDisplayService.get_SecretMask() : 'undefined';
    return (
      <React.Fragment>
        <span>{title}:</span>
        <span className="p-ml-2" style={{ fontSize: '12px', maxWidth: '1000px', overflowWrap: 'break-word', wordWrap: 'break-word' }}>{displayToken}</span>
      </React.Fragment>
    );
  }

  const renderEventPortalConnectivityConfig = (apEventPortalConnectivityConfig: TAPEventPortalConnectivityConfig, apOperationalStatus: EAPOrganizationOperationalStatus) => {
    const funcName = 'renderEventPortalConnectivityConfig';
    const logName = `${ComponentName}.${funcName}()`;

    const renderDetails = () => {
      const configType: EAPEventPortalConnectivityConfigType = apEventPortalConnectivityConfig.configType;
      switch(configType) {
        case EAPEventPortalConnectivityConfigType.CUSTOM:
          const apCustom: TAPEventPortalConnectivityConfigCustom = apEventPortalConnectivityConfig as TAPEventPortalConnectivityConfigCustom;
          return(
            <React.Fragment>
              <div>Base URL: {apCustom.baseUrl}</div>
              { renderToken('Token', apCustom.token)}
            </React.Fragment>
          );
        case EAPEventPortalConnectivityConfigType.UNDEFINED:
          // const apUndefined: TAPEventPortalConnectivityConfigUndefined = apEventPortalConnectivityConfig as TAPEventPortalConnectivityConfigUndefined;
          return(
            <React.Fragment>
              <div>
                <em>Note: See Solace Cloud Connectivity.</em>
              </div>
              {/* <div>Base URL: {apUndefined.baseUrl}</div>
              { renderToken('Token', 'same as Solace Cloud')} */}
            </React.Fragment>
          );
        default:
          Globals.assertNever(logName, configType);
      }
    }

    return (
      <React.Fragment>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">{DisplaySectionHeader_EventPortalServices}:</div>
        <div className="p-ml-4">
          { props.scope !== E_DISPLAY_ORGANIZATION_SCOPE.REVIEW_AND_CREATE && 
            <div> Status: {apOperationalStatus}</div>
          }
          {renderDetails()}
        </div>
      </React.Fragment>
    );
  }

  const renderCloudConnectivityConfig = (apCloudConnectivityConfig: TAPCloudConnectivityConfig, apOperationalStatus: EAPOrganizationOperationalStatus) => {
    const funcName = 'renderCloudConnectivityConfig';
    const logName = `${ComponentName}.${funcName}()`;

    const renderDetails = () => {
      const configType: EAPCloudConnectivityConfigType = apCloudConnectivityConfig.configType;
      switch(configType) {
        case EAPCloudConnectivityConfigType.SOLACE_CLOUD:
          const apSolaceCloud: TAPCloudConnectivityConfigSolaceCloud = apCloudConnectivityConfig as TAPCloudConnectivityConfigSolaceCloud;
          return renderToken('Cloud Token', apSolaceCloud.token);
        case EAPCloudConnectivityConfigType.CUSTOM:
          const apCustom: TAPCloudConnectivityConfigCustom = apCloudConnectivityConfig as TAPCloudConnectivityConfigCustom;
          return(
            <React.Fragment>
              <div>Base URL: {apCustom.baseUrl}</div>
              { renderToken('Token', apCustom.token)}
            </React.Fragment>
          );
        case EAPCloudConnectivityConfigType.UNDEFINED:
          return renderToken('Cloud Token', 'not configured');
        default:
          Globals.assertNever(logName, configType);
      }
    }

    return (
      <React.Fragment>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">{DisplaySectionHeader_SolaceCloudServices}:</div>
        <div className="p-ml-4">
          { props.scope !== E_DISPLAY_ORGANIZATION_SCOPE.REVIEW_AND_CREATE && 
            <div>Status: {apOperationalStatus}</div>
          }
          {renderDetails()}
        </div>
      </React.Fragment>
    );
  }
  
  const renderOrganizationSempv2AuthConfig = (apOrganizationConnectivityConfigType: EAPOrganizationConnectivityConfigType,  apOrganizationSempv2AuthConfig: TAPOrganizationSempv2AuthConfig) => {
    const funcName = 'renderOrganizationSempv2AuthConfig';
    const logName = `${ComponentName}.${funcName}()`;
  
    const renderDetails = () => {
      const authType: EAPOrganizationSempv2AuthType = apOrganizationSempv2AuthConfig.apAuthType;
      switch(authType) {
        case EAPOrganizationSempv2AuthType.BASIC_AUTH:
          // const apBasic: TAPOrganizationSempv2_BasicAuth = apOrganizationSempv2Auth as TAPOrganizationSempv2_BasicAuth;
          return (
            <React.Fragment>
              <div><b>Auth Type: </b>{apOrganizationSempv2AuthConfig.apAuthType}</div>
              <div className="p-ml-2">
                <em>Note: Credentials from discovery service response.</em>
              </div>
            </React.Fragment>
          );
        case EAPOrganizationSempv2AuthType.API_KEY:
          const apApiKey: TAPOrganizationSempv2AuthConfig_ApiKeyAuth = apOrganizationSempv2AuthConfig as TAPOrganizationSempv2AuthConfig_ApiKeyAuth;
          return(
            <React.Fragment>
              <div><b>Auth Type: </b>{apOrganizationSempv2AuthConfig.apAuthType}</div>
              <div className="p-ml-2">
                <div>API Key Location: {apApiKey.apiKeyLocation}</div>
                <div>API Key Name: {apApiKey.apiKeyName}</div>
              </div>
            </React.Fragment>
          );
        // case EAPOrganizationSempv2AuthType.UNDEFINED:
        //   const apUndefined: TAPOrganizationSempv2AuthConfig_Undefined = apOrganizationSempv2AuthConfig as TAPOrganizationSempv2AuthConfig_Undefined;
        //   return(
        //     <React.Fragment>
        //       <div><b>Auth Type: </b>{apOrganizationSempv2AuthConfig.apAuthType}</div>
        //       {/* <div className="p-ml-2">
        //         <div>API Key Location: {apApiKey.apiKeyLocation}</div>
        //         <div>API Key Name: {apApiKey.apiKeyName}</div>
        //       </div> */}
        //     </React.Fragment>
        //   );
        default:
          Globals.assertNever(logName, authType);
      }
    }
  
    if(apOrganizationConnectivityConfigType === EAPOrganizationConnectivityConfigType.SIMPLE) return (<></>);
    return (
      <React.Fragment>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">{DisplaySectionHeader_SempV2Auth}:</div>
        <div className="p-ml-4">{renderDetails()}</div>
      </React.Fragment>
    );
  }
  
    const renderGeneralInfo = (): Array<JSX.Element> => {
      const funcName = 'renderGeneralInfo';
      const logName = `${ComponentName}.${funcName}()`;
      if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
      const jsxList: Array<JSX.Element> = [];
      if(props.scope !== E_DISPLAY_ORGANIZATION_SCOPE.REVIEW_AND_CREATE) {
        const configStatusStyle: React.CSSProperties = managedObject.apOrganizationConfigStatus === EAPOrganizationConfigStatus.NOT_OPERATIONAL ? {color: 'red'} : {};
        jsxList.push(
          <div id={Globals.getUUID()}><b>Config Status</b>: <span style={configStatusStyle}>{managedObject.apOrganizationConfigStatus}</span></div>
        );
        jsxList.push(
          <div id={Globals.getUUID()}><b>Cloud Connectivity Status</b>: {String(managedObject.apOrganizationOperationalStatus.cloudConnectivity)}</div>
        );
        jsxList.push(
          <div id={Globals.getUUID()}><b>Event Portal Connectivity Status</b>: {String(managedObject.apOrganizationOperationalStatus.eventPortalConnectivity)}</div>
        );  
      }
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
    
    const jsxTabPanelList: Array<JSX.Element> = [];
    jsxTabPanelList.push(
      <TabPanel header='General' key={Globals.getUUID()}>
        <React.Fragment>
          <p><b>Max Number of APIs per API Product: </b>{renderApis2ApiProductsRation(managedObject.apNumApis2ApiProductRatio)}</p>
          <p><b>App Credentials Expiration: </b>{APDisplayUtils.convertMilliseconds(managedObject.apAppCredentialsExpiryDuration)}</p>
        </React.Fragment>
        </TabPanel>
    );
    jsxTabPanelList.push(
      <TabPanel header='Connectivity' key={Globals.getUUID()}>            
        <React.Fragment>
          { renderCloudConnectivityConfig(managedObject.apCloudConnectivityConfig, managedObject.apOrganizationOperationalStatus.cloudConnectivity) }
          { renderEventPortalConnectivityConfig(managedObject.apEventPortalConnectivityConfig, managedObject.apOrganizationOperationalStatus.eventPortalConnectivity) }
          { renderOrganizationSempv2AuthConfig(managedObject.apOrganizationConnectivityConfigType, managedObject.apOrganizationSempv2AuthConfig) }
        </React.Fragment>
      </TabPanel>
    );
    if(props.scope !== E_DISPLAY_ORGANIZATION_SCOPE.REVIEW_AND_CREATE) {
      jsxTabPanelList.push(
        <TabPanel header='Integration' key={Globals.getUUID()}>
          <DisplayIntegration
            apNotificationHubConfig={managedObject.apNotificationHubConfig}
          />
        </TabPanel>
      );  
    }

    return (
      <React.Fragment>

        { renderHeader() }
        
        <TabView className="p-mt-4" activeIndex={tabActiveIndex} onTabChange={(e) => setTabActiveIndex(e.index)}>
          { jsxTabPanelList }
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
