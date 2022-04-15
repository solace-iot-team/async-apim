
import { 
  Protocol, 
  Endpoint, 
  Service, 
  EnvironmentResponse,  
  CommonEntityNameList
} from '@solace-iot-team/apim-connector-openapi-browser';

import { Globals } from '../../../utils/Globals';
import { TAPEnvironmentName } from "../../../components/deleteme.APComponentsCommon";

export type TOrganizationService = Service;
export type TManagedObjectId = TAPEnvironmentName;
export type TServiceEndpoint = Endpoint;
export type TViewServiceEndpoint = Endpoint & {
  attributes: string
}
export type TViewApiObject = EnvironmentResponse;
export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  globalSearch: string,
  transformedServiceClassDisplayedAttributes: {
    highAvailability: string
  },
  exposedViewServiceEndpointList: Array<TViewServiceEndpoint>,
  apiObject: TViewApiObject,
  apiUsedBy_ApiProductEntityNameList: CommonEntityNameList
}

export enum E_CALL_STATE_ACTIONS {
  API_DELETE_ENVIRONMENT = "API_DELETE_ENVIRONMENT",
  API_GET_ENVIRONMENT_LIST = "API_GET_ENVIRONMENT_LIST",
  API_CREATE_ENIRONMENT = "API_CREATE_ENIRONMENT",
  API_GET_ENVIRONMENT = "APi_GET_ENVIRONMENT",
  API_UPDATE_ENVIRONMENT = "API_UPDATE_ENVIRONMENT"
}

export class ManageEnvironmentsCommon {
 
  private static getServiceEndpointAttributes = (serviceEndpoint: TServiceEndpoint): string => {
    // const funcName = 'getServiceEndpointAttributes';
    // const logName = `${ManageEnvironmentsCommon.name}.${funcName}()`;
    // console.log(`${logName}: serviceEndpoint = ${JSON.stringify(serviceEndpoint, null, 2)}`);
    if(serviceEndpoint.secure ==='yes' && serviceEndpoint.compressed === 'yes') return 'secure+compressed';
    if(serviceEndpoint.secure === 'yes') return 'secure';
    if(serviceEndpoint.compressed === 'yes') return 'compressed';
    return 'plain';
  }

  public static getServiceEndpointListByProtocolList = (protocolList: Array<Protocol>, serviceEndpointList: Array<TServiceEndpoint>): Array<TViewServiceEndpoint> => {
    const funcName = 'getServiceEndpointListByProtocolList';
    const logName = `${ManageEnvironmentsCommon.name}.${funcName}()`;
    if(protocolList.length === 0) throw new Error(`${logName}: protocolList is empty`);
    if(serviceEndpointList.length === 0) throw new Error(`${logName}: serviceEndpointList is empty`);
    let viewServiceEndpointList: Array<TViewServiceEndpoint> = [];
    protocolList.forEach( (protocol: Protocol) => {
      const serviceEndpoint: TServiceEndpoint | undefined = serviceEndpointList.find( (serviceEndpoint: TServiceEndpoint) => {
        if(serviceEndpoint.protocol) return (serviceEndpoint.protocol?.name === protocol.name)
        else return false;
      });
      if(serviceEndpoint) viewServiceEndpointList.push({
        ...serviceEndpoint,
        attributes: ManageEnvironmentsCommon.getServiceEndpointAttributes(serviceEndpoint)
      });
    });
    return viewServiceEndpointList;
  }

  private static generateGlobalSearchContent = (viewManagedObject: TViewManagedObject): string => {
    return Globals.generateDeepObjectValuesString(viewManagedObject);
  }

  public static transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject, usedByApiProductEntityNameList: CommonEntityNameList): TViewManagedObject => {
    const funcName = 'transformViewApiObjectToViewManagedObject';
    const logName = `${ManageEnvironmentsCommon.name}.${funcName}()`;
    if(!viewApiObject.exposedProtocols) throw new Error(`${logName}: viewApiObject.exposedProtocols is undefined`);
    if(!viewApiObject.messagingProtocols) throw new Error(`${logName}: viewApiObject.messagingProtocols is undefined`);
    const exposedViewServiceEndpointList: Array<TViewServiceEndpoint> = ManageEnvironmentsCommon.getServiceEndpointListByProtocolList(viewApiObject.exposedProtocols, viewApiObject.messagingProtocols);
    const highAvailability: string | undefined = viewApiObject.serviceClassDisplayedAttributes?.["High Availability"];
    let viewManagedObject: TViewManagedObject = {
      id: viewApiObject.name,
      displayName: viewApiObject.displayName ? viewApiObject.displayName : viewApiObject.name,
      transformedServiceClassDisplayedAttributes: {
        highAvailability: highAvailability ? highAvailability : 'unknown'
      },
      exposedViewServiceEndpointList: exposedViewServiceEndpointList,
      apiObject: viewApiObject,
      apiUsedBy_ApiProductEntityNameList: usedByApiProductEntityNameList,
      globalSearch: ''
    }
    viewManagedObject.globalSearch = ManageEnvironmentsCommon.generateGlobalSearchContent(viewManagedObject);
    return viewManagedObject;
  }

}
