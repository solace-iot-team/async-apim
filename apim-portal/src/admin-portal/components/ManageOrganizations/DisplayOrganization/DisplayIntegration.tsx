
import React from "react";

import { 
  EAPNotificationHubAuthType, 
  TAPNotificationHubConfig, 
  TAPNotificationHub_ApiKeyAuth, 
  TAPNotificationHub_BasicAuth, 
  TAPNotificationHub_BearerTokenAuth, 
} from "../../../../displayServices/APOrganizationsDisplayService/APOrganizationsDisplayService";
import { Globals } from "../../../../utils/Globals";

import '../../../../components/APComponents.css';
import "../ManageOrganizations.css";

export interface IDisplayIntegrationProps {
  apNotificationHubConfig?: TAPNotificationHubConfig;
}

export const DisplayIntegration: React.FC<IDisplayIntegrationProps> = (props: IDisplayIntegrationProps) => {
  const ComponentName = 'DisplayIntegration';

  const renderNotificationHubConfig = (apNotificationHubConfig: TAPNotificationHubConfig | undefined) => {
    const funcName = 'renderNotificationHubConfig';
    const logName = `${ComponentName}.${funcName}()`;

    const renderDetails = (apNotificationHubConfig: TAPNotificationHubConfig): Array<JSX.Element> => {
      const jsxList: Array<JSX.Element> = [];
      const apNotificationHubAuthType: EAPNotificationHubAuthType = apNotificationHubConfig.apNotificationHubAuth.apAuthType;
      jsxList.push(
        <div id={Globals.getUUID()}>Base URL: {apNotificationHubConfig.baseUrl}</div>
      );
      jsxList.push(
        <div id={Globals.getUUID()}>Auth Method: {apNotificationHubAuthType}</div>
      );
      switch(apNotificationHubAuthType) {
        case EAPNotificationHubAuthType.BASIC_AUTH:
          const basicAuth: TAPNotificationHub_BasicAuth = apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_BasicAuth;
          jsxList.push(
              <div id={Globals.getUUID()} className="p-ml-2">
                <div>Username: {basicAuth.username}</div>
                <div>Password: {basicAuth.password}</div>
              </div>
          );
          break;
        case EAPNotificationHubAuthType.API_KEY_AUTH:
          const apiKeyAuth: TAPNotificationHub_ApiKeyAuth = apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_ApiKeyAuth;
          jsxList.push(
            <div id={Globals.getUUID()} className="p-ml-2">
              <div>Location: {apiKeyAuth.apiKeyLocation}</div>
              <div>Api Key Fieldname: {apiKeyAuth.apiKeyFieldName}</div>
              <div>Api Key Value: {apiKeyAuth.apiKeyValue}</div>
            </div>
          );
        break;
        case EAPNotificationHubAuthType.BEARER_TOKEN_AUTH:
          const tokenAuth: TAPNotificationHub_BearerTokenAuth = apNotificationHubConfig.apNotificationHubAuth as TAPNotificationHub_BearerTokenAuth;
          jsxList.push(
            <div id={Globals.getUUID()} className="p-ml-2">
              <div>Token: {tokenAuth.token}</div>
            </div>
          );
        break;
        case EAPNotificationHubAuthType.UNDEFINED:
          throw new Error(`${logName}: apNotificationHubAuthType=${apNotificationHubAuthType}`);
        default:
          Globals.assertNever(logName, apNotificationHubAuthType);
      }
      return jsxList;
    }

    return (
      <React.Fragment>
        <div className="p-mb-2 p-mt-4 ap-display-component-header">Notification Hub:</div>
        <div className="p-ml-4">
          { apNotificationHubConfig !== undefined && renderDetails(apNotificationHubConfig) }
          { apNotificationHubConfig === undefined && 
            <div>None defined.</div>
          }
        </div>
      </React.Fragment>
    );
  }

  const renderComponent = () => {
    
    return (
      <React.Fragment>
        { renderNotificationHubConfig(props.apNotificationHubConfig) }
      </React.Fragment>
    );

  }

  return (
    <React.Fragment>
      <div className="manage-organizations">

        { renderComponent() }

      </div>
    </React.Fragment>
  );
}
