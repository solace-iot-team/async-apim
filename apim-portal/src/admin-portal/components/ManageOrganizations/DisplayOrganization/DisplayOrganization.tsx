
import React from "react";

import { TabPanel, TabView } from "primereact/tabview";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { DisplaySectionHeader_ApiProducts, DisplaySectionHeader_Apps, DisplaySectionHeader_AssetManagement, DisplaySectionHeader_EventPortalServices, DisplaySectionHeader_SempV2Auth, DisplaySectionHeader_SolaceCloudServices, E_DISPLAY_ORGANIZATION_SCOPE } from "../ManageOrganizationsCommon";
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
import { APSAssetIncVersionStrategy } from "../../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { ConfigContext } from "../../../../components/ConfigContextProvider/ConfigContextProvider";
import { About } from "@solace-iot-team/apim-connector-openapi-browser";
import { ManageEpSettings } from "../ManageEpSettings/ManageEpSettings";
import { EManageEpSettingsScope } from "../ManageEpSettings/ManageEpSettingsCommon";
import { TApiCallState } from "../../../../utils/ApiCallState";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IDisplayOrganizationProps {
  apOrganizationDisplay: IAPSystemOrganizationDisplay | IAPSingleOrganizationDisplay;
  scope: E_DISPLAY_ORGANIZATION_SCOPE;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
}

export const DisplayOrganization: React.FC<IDisplayOrganizationProps> = (props: IDisplayOrganizationProps) => {
  const ComponentName = 'DisplayOrganization';

  type TManagedObject = IAPSystemOrganizationDisplay | IAPSingleOrganizationDisplay;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [tabActiveIndex, setTabActiveIndex] = React.useState(0);
  const [configContext] = React.useContext(ConfigContext);


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

  const renderEventPortalConnectivityConfig = ({ apEventPortalConnectivityConfig, apOperationalStatus, apOrganizationConnectivityConfigType }:{
    apEventPortalConnectivityConfig: TAPEventPortalConnectivityConfig;
    apOperationalStatus: EAPOrganizationOperationalStatus;
    apOrganizationConnectivityConfigType: EAPOrganizationConnectivityConfigType;
  }) => {
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
          if(apOrganizationConnectivityConfigType === EAPOrganizationConnectivityConfigType.ADVANCED && apOperationalStatus === EAPOrganizationOperationalStatus.DOWN) {
            return (<div><em>Not configured.</em></div>);
          }
          if(apOperationalStatus === EAPOrganizationOperationalStatus.UNDEFINED) {
            return (<div><em>Not configured.</em></div>);
          }
          return(<div><em>Configured as part of Solace Cloud Services.</em></div>);
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

  const renderCloudConnectivityConfig = ({ apCloudConnectivityConfig, apOperationalStatus, apOrganizationConnectivityConfigType }:{
    apOrganizationConnectivityConfigType: EAPOrganizationConnectivityConfigType;
    apCloudConnectivityConfig: TAPCloudConnectivityConfig;
    apOperationalStatus: EAPOrganizationOperationalStatus;
  }) => {
    const funcName = 'renderCloudConnectivityConfig';
    const logName = `${ComponentName}.${funcName}()`;

    const renderDetails = () => {
      const configType: EAPCloudConnectivityConfigType = apCloudConnectivityConfig.configType;
      switch(configType) {
        case EAPCloudConnectivityConfigType.SOLACE_CLOUD:
          const apSolaceCloud: TAPCloudConnectivityConfigSolaceCloud = apCloudConnectivityConfig as TAPCloudConnectivityConfigSolaceCloud;
          return renderToken('Token', apSolaceCloud.token);
        case EAPCloudConnectivityConfigType.CUSTOM:
          const apCustom: TAPCloudConnectivityConfigCustom = apCloudConnectivityConfig as TAPCloudConnectivityConfigCustom;
          return(
            <React.Fragment>
              <div>Base URL: {apCustom.baseUrl}</div>
              { renderToken('Token', apCustom.token)}
            </React.Fragment>
          );
        case EAPCloudConnectivityConfigType.UNDEFINED:
          return renderToken('Token', 'not configured');
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
  
  const renderOrganizationSempv2AuthConfig = ({ apOrganizationConnectivityConfigType, apOrganizationSempv2AuthConfig }:{
    apOrganizationConnectivityConfigType: EAPOrganizationConnectivityConfigType;
    apOrganizationSempv2AuthConfig: TAPOrganizationSempv2AuthConfig;
  }) => {
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
                <em>Note: Credentials from Solace Cloud Services: Discovery Service response.</em>
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
                <div className="p-ml-2">
                  <em>Note: API key value from Solace Cloud Services: Discovery Service response: field=username.</em>
                </div>
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

    const renderAssetIncVersionStrategy = (apsAssetIncVersionStrategy: APSAssetIncVersionStrategy): string => {
      // TODO: switch and translate e-num values to displayValues
      return apsAssetIncVersionStrategy;
    }

    const renderEnvs2ApiProductsRatio = (ratio: number): string => {
      if(ratio === -1) return 'not limited';
      return ratio.toString();
    }

    const renderApis2ApiProductsRatio = (ratio: number): string => {
      if(ratio === -1) return 'not limited';
      return ratio.toString();
    }

    const render_apAppCredentialsExpiryDuration = (duration: number): string => {
      if(duration === -1) return 'no expiry configured';
      return `${APDisplayUtils.convertMilliseconds_To_Days(duration).toString()} days`;
    }

    const jsxTabPanelList: Array<JSX.Element> = [];
    jsxTabPanelList.push(
      <TabPanel header='General' key={Globals.getUUID()}>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">{DisplaySectionHeader_AssetManagement}:</div>
        <div className="p-ml-4">
          <p><b>Version Increment Strategy: </b>{renderAssetIncVersionStrategy(managedObject.apAssetIncVersionStrategy)}</p>
        </div>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">{DisplaySectionHeader_ApiProducts}:</div>
        <div className="p-ml-4">
          <p><b>Max Number of Environments per API Product: </b>{renderEnvs2ApiProductsRatio(managedObject.apMaxNumEnvs_Per_ApiProduct)}</p>
          <p><b>Max Number of APIs per API Product: </b>{renderApis2ApiProductsRatio(managedObject.apMaxNumApis_Per_ApiProduct)}</p>
        </div>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">{DisplaySectionHeader_Apps}:</div>
        <div className="p-ml-4">
          <p><b>App Credentials Expiration: </b>{render_apAppCredentialsExpiryDuration(managedObject.apAppCredentialsExpiryDuration_millis)}</p>
        </div>
      </TabPanel>
    );
    managedObject.apOrganizationConnectivityConfigType = EAPOrganizationConnectivityConfigType.ADVANCED
    jsxTabPanelList.push(
      <TabPanel header='Connectivity' key={Globals.getUUID()}>            
        <React.Fragment>
          { renderCloudConnectivityConfig({
              apCloudConnectivityConfig: managedObject.apCloudConnectivityConfig,
              apOperationalStatus: managedObject.apOrganizationOperationalStatus.cloudConnectivity,
              apOrganizationConnectivityConfigType: managedObject.apOrganizationConnectivityConfigType
            }) 
          }
          { renderEventPortalConnectivityConfig({
              apEventPortalConnectivityConfig: managedObject.apEventPortalConnectivityConfig,
              apOperationalStatus: managedObject.apOrganizationOperationalStatus.eventPortalConnectivity,
              apOrganizationConnectivityConfigType: managedObject.apOrganizationConnectivityConfigType
            })
          }
          { renderOrganizationSempv2AuthConfig({
              apOrganizationConnectivityConfigType: managedObject.apOrganizationConnectivityConfigType,
              apOrganizationSempv2AuthConfig: managedObject.apOrganizationSempv2AuthConfig
            })
          }
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
    if(props.scope !== E_DISPLAY_ORGANIZATION_SCOPE.REVIEW_AND_CREATE && configContext.portalAppInfo?.eventPortalVersion === About.EVENT_PORTAL_VERSION._2) {
      jsxTabPanelList.push(
        <TabPanel header='Event Portal' key={Globals.getUUID()}>
          <ManageEpSettings
            scope={EManageEpSettingsScope.VIEW}
            organizationEntityId={managedObject.apEntityId}
            onSuccess={props.onSuccess}
            onError={props.onError}
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
