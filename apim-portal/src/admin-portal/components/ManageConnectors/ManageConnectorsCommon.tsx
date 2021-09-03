import React from 'react';

import { 
  APSConnector, 
  APSId 
} from '@solace-iot-team/apim-server-openapi-browser';

import { Globals } from '../../../utils/Globals';
import { THealthCheckResult } from '../../../utils/APConnectorHealthCheck';

export type TManagedObjectId = APSId;

export type TViewApiObject = APSConnector;

export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  globalSearch: string,
  apiObject: TViewApiObject,
  healthCheckResult: THealthCheckResult
  healthCheckPassed: string
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_CONNECTOR = "API_DELETE_CONNECTOR",
  API_GET_CONNECTOR_LIST = "API_GET_CONNECTOR_LIST",
  API_CREATE_CONNECTOR = "API_CREATE_CONNECTOR",
  API_GET_CONNECTOR = "API_GET_CONNECTOR",
  API_REPLACE_CONNECTOR = "API_REPLACE_CONNECTOR",
  API_SET_CONNECTOR_ACTIVE = "API_SET_CONNECTOR_ACTIVE",
}

export class ManageConnectorsCommon {

  private static generateGlobalSearchContent = (viewApiObject: TViewApiObject): string => {
    const filteredViewApiObject = {
      ...viewApiObject,
      connectorClientConfig: {
        ...viewApiObject.connectorClientConfig,
        adminUserPwd: undefined,
        apiUserPwd: undefined
      }
    }
    return Globals.generateDeepObjectValuesString(filteredViewApiObject);
  }

  public static transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject, healthCheckResult: THealthCheckResult): TViewManagedObject => {
    return {
      id: viewApiObject.connectorId,
      displayName: viewApiObject.displayName,
      globalSearch: ManageConnectorsCommon.generateGlobalSearchContent(viewApiObject),
      apiObject: viewApiObject,
      healthCheckResult: healthCheckResult,
      healthCheckPassed: healthCheckResult.summary.success ? 'passed' : 'failed'
    }
  }

  public static renderSubComponentHeader = (header: string): JSX.Element => {
    return (
      <React.Fragment>
        <h3>{header}</h3>
        {/* <Divider/> */}
      </React.Fragment>
    )
  }

  public static isActiveBodyTemplate = (managedObject: TViewManagedObject) => {
    if (managedObject.apiObject.isActive) return (<span className="pi pi-check badge-active" />)
    else return (<span className="pi pi-times badge-active" />)
  }


}
