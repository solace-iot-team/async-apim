import { 
  AppEnvironment, 
  ChannelPermission, 
  Endpoint,
  Protocol,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  IAPEntityIdDisplay, 
  TAPEntityId
} from '../../utils/APEntityIdsService';
import { TAPEnvironmentDisplay, TAPEnvironmentDisplayList } from '../APEnvironmentsDisplayService';

export enum E_ApEndpoint_Properties {
  SECURE_AND_COMPRESSED = "secure+compressed",
  SECURE = "secure",
  COMPRESSED = "compressed",
  PLAIN = "plain",
}

export type TAPEndpointDisplay = {
  protocol: Protocol;
  transport: string;
  properties: E_ApEndpoint_Properties;
  uri: string;
  messageVpnName?: string;
};
export type TAPEndpointDisplayList = Array<TAPEndpointDisplay>;

export type TAPChannelPermissionDisplay = {
  channel: string;
  channelId: string;
  permittedTopicList: Array<string>;
}
export type TAPChannelPermissionDisplayList = Array<TAPChannelPermissionDisplay>;
export type TAPChannelPermissionsDisplay = {
  apSubscribePermissionList: TAPChannelPermissionDisplayList;
  apPublishPermissionList: TAPChannelPermissionDisplayList;
}
export enum E_APChannelOperation {
  SUBSCRIBE = "subscribe",
  PUBLISH = "publish"
}
export enum E_APTopicSyntax {
  SMF = "smf",
  MQTT = "mqtt"
}

// convenience types
/**
 * apEntityId is the environment
*/
export type TAPEnvironmentEndpointDisplay = IAPEntityIdDisplay & TAPEndpointDisplay;
export type TAPEnvironmentEndpointDisplayList = Array<TAPEnvironmentEndpointDisplay>;

export type TAPChannelTopicDisplay = {
  channel: string;
  channelId: string;
  topic: string;
}
export type TAPChannelTopicDisplayList = Array<TAPChannelTopicDisplay>;

export interface IAPAppEnvironmentDisplay extends IAPEntityIdDisplay {
  devel_connectorAppEnvironment_smf: AppEnvironment;
  devel_connectorAppEnvironment_mqtt?: AppEnvironment;
  apEndpointList: TAPEndpointDisplayList;
  apChannelPermissions_smf: TAPChannelPermissionsDisplay;
  apChannelPermissions_mqtt?: TAPChannelPermissionsDisplay;
}
export type TAPAppEnvironmentDisplayList = Array<IAPAppEnvironmentDisplay>;

export class APAppEnvironmentsDisplayService {
  private readonly BaseComponentName = "APAppEnvironmentsDisplayService";

  private create_ApChannelPermissionDisplayList_From_ApiEntities({ channelPermissions }:{
    channelPermissions?: Array<Record<string, ChannelPermission>>;
  }): TAPChannelPermissionDisplayList {
    if(channelPermissions === undefined) return [];
    return channelPermissions.map( (elem: Record<string, ChannelPermission>) => {
      const channel: string = Object.keys(elem)[0];
      const channelPermission: ChannelPermission = Object.values(elem)[0];      
      const apChannelPermissionDisplay: TAPChannelPermissionDisplay = {
        channel: channel,
        permittedTopicList: channelPermission.permissions,
        channelId: channelPermission.channelId ? channelPermission.channelId : channel
      };
      return apChannelPermissionDisplay;
    });
  }

  private create_ApEndpoint_Properties({ secure, compressed }: {
    secure?: Endpoint.secure;
    compressed?: Endpoint.compressed;
  }): E_ApEndpoint_Properties {
    const isSecure: boolean = secure ? (secure === Endpoint.secure.YES ? true : false) : false;
    const isCompressed: boolean = compressed ? (compressed === Endpoint.compressed.YES ? true : false) : false;
    if(isSecure && isCompressed) return E_ApEndpoint_Properties.SECURE_AND_COMPRESSED;
    if(isSecure) return  E_ApEndpoint_Properties.SECURE;
    if(isCompressed) return E_ApEndpoint_Properties.COMPRESSED;
    return E_ApEndpoint_Properties.PLAIN;
  }

  private create_ApEndpointDisplayList_From_ApiEntities({ endpoints, apEnvironmentDisplay }:{
    endpoints?: Array<Endpoint>;
    apEnvironmentDisplay: TAPEnvironmentDisplay;
  }): TAPEndpointDisplayList {
    const funcName = 'create_ApEndpointDisplayList_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    if(endpoints === undefined) return [];
    return endpoints.map( (endpoint: Endpoint) => {
      if(endpoint.protocol === undefined) throw new Error(`${logName}: endpoint.protocol === undefined`);
      if(endpoint.transport === undefined) throw new Error(`${logName}: endpoint.transport === undefined`);
      if(endpoint.uri === undefined) throw new Error(`${logName}: endpoint.uri === undefined`);
      const apEndpointDisplay: TAPEndpointDisplay = {
        protocol: endpoint.protocol,
        transport: endpoint.transport,
        uri: endpoint.uri,
        properties: this.create_ApEndpoint_Properties({ secure: endpoint.secure, compressed: endpoint.compressed }),
        messageVpnName: apEnvironmentDisplay.connectorEnvironmentResponse.msgVpnName
      } 
      return apEndpointDisplay;
    });
  }

  public create_ApAppEnvironmentDisplay_From_ApiEntities({ connectorAppEnvironment_smf, connectorAppEnvironment_mqtt, apEnvironmentDisplay }: {
    connectorAppEnvironment_smf: AppEnvironment;
    connectorAppEnvironment_mqtt?: AppEnvironment;
    apEnvironmentDisplay: TAPEnvironmentDisplay;
  }): IAPAppEnvironmentDisplay {
    const funcName = 'create_ApAppEnvironmentDisplay_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if(connectorAppEnvironment_smf.name === undefined) throw new Error(`${logName}: connectorAppEnvironment_smf.name === undefined`);
    if(connectorAppEnvironment_smf.displayName === undefined) throw new Error(`${logName}: connectorAppEnvironment_smf.displayName === undefined`);
    
    let apSubscribePermissionList_smf: TAPChannelPermissionDisplayList = [];
    let apPublishPermissionList_smf: TAPChannelPermissionDisplayList = [];
    if(connectorAppEnvironment_smf.permissions !== undefined) {
      apSubscribePermissionList_smf = this.create_ApChannelPermissionDisplayList_From_ApiEntities({ channelPermissions: connectorAppEnvironment_smf.permissions.subscribe });
      apPublishPermissionList_smf = this.create_ApChannelPermissionDisplayList_From_ApiEntities({ channelPermissions: connectorAppEnvironment_smf.permissions.publish})
    }
    let apSubscribePermissionList_mqtt: TAPChannelPermissionDisplayList = [];
    let apPublishPermissionList_mqtt: TAPChannelPermissionDisplayList = [];
    if(connectorAppEnvironment_mqtt && connectorAppEnvironment_mqtt.permissions !== undefined) {
      apSubscribePermissionList_mqtt = this.create_ApChannelPermissionDisplayList_From_ApiEntities({ channelPermissions: connectorAppEnvironment_mqtt.permissions.subscribe });
      apPublishPermissionList_mqtt = this.create_ApChannelPermissionDisplayList_From_ApiEntities({ channelPermissions: connectorAppEnvironment_mqtt.permissions.publish})
    }

    const apEnvironmentEntityId: TAPEntityId = {
      id: connectorAppEnvironment_smf.name,
      displayName: connectorAppEnvironment_smf.displayName
    };
    const apAppEnvironmentDisplay: IAPAppEnvironmentDisplay = {
      apEntityId: apEnvironmentEntityId,
      apEndpointList: this.create_ApEndpointDisplayList_From_ApiEntities({ endpoints: connectorAppEnvironment_smf.messagingProtocols, apEnvironmentDisplay: apEnvironmentDisplay }),
      apChannelPermissions_smf: {
        apSubscribePermissionList: apSubscribePermissionList_smf,
        apPublishPermissionList: apPublishPermissionList_smf,  
      },
      apChannelPermissions_mqtt: {
        apSubscribePermissionList: apSubscribePermissionList_mqtt,
        apPublishPermissionList: apPublishPermissionList_mqtt
      },
      devel_connectorAppEnvironment_smf: connectorAppEnvironment_smf,
      devel_connectorAppEnvironment_mqtt: connectorAppEnvironment_mqtt,
    };

    return apAppEnvironmentDisplay;

  }

  public create_ApAppEnvironmentDisplayList_From_ApiEntities({  connectorAppEnvironments_smf, connectorAppEnvironments_mqtt, complete_ApEnvironmentDisplayList }: {
    connectorAppEnvironments_smf?: Array<AppEnvironment>;
    connectorAppEnvironments_mqtt?: Array<AppEnvironment>;
    complete_ApEnvironmentDisplayList: TAPEnvironmentDisplayList;
  }): TAPAppEnvironmentDisplayList {
    const funcName = 'create_ApAppEnvironmentDisplayList_From_ApiEntities';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if(connectorAppEnvironments_smf === undefined) return [];
    const apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList = [];
    for(const connectorAppEnvironment_smf of connectorAppEnvironments_smf) {
      // find the complete environment
      const apEnvironmentDisplay: TAPEnvironmentDisplay | undefined = complete_ApEnvironmentDisplayList.find( (_apEnvironmentDisplay: TAPEnvironmentDisplay) => {
        return connectorAppEnvironment_smf.name === _apEnvironmentDisplay.apEntityId.id;
      });
      if(apEnvironmentDisplay === undefined) throw new Error(`${logName}: apEnvironmentDisplay === undefined`);
      // find the corresponding mqtt environment
      let connectorAppEnvironment_mqtt: AppEnvironment | undefined = undefined;
      if(connectorAppEnvironments_mqtt !== undefined) {
        const found = connectorAppEnvironments_mqtt.find( (x) => {
          return x.name === connectorAppEnvironment_smf.name;
        });
        connectorAppEnvironment_mqtt = found;
      }
      apAppEnvironmentDisplayList.push(this.create_ApAppEnvironmentDisplay_From_ApiEntities({
        connectorAppEnvironment_smf: connectorAppEnvironment_smf,
        connectorAppEnvironment_mqtt: connectorAppEnvironment_mqtt,
        apEnvironmentDisplay: apEnvironmentDisplay,
      }));
    }
    return apAppEnvironmentDisplayList;
  }


  public get_apEnvironmentEndpointDisplayList({ apAppEnvironmentDisplayList }:{
    apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  }): TAPEnvironmentEndpointDisplayList {
    const apEnvironmentEndpointDisplayList: TAPEnvironmentEndpointDisplayList = [];
    for(const apAppEnvironmentDisplay of apAppEnvironmentDisplayList) {
      for(const apEndpoint of apAppEnvironmentDisplay.apEndpointList) {
        const apEnvironmentEndpointDisplay: TAPEnvironmentEndpointDisplay = {
          apEntityId: apAppEnvironmentDisplay.apEntityId,
          ...apEndpoint
        };
        apEnvironmentEndpointDisplayList.push(apEnvironmentEndpointDisplay);  
      }
    }
    return apEnvironmentEndpointDisplayList;
  }

  public get_ApChannelTopicDisplayList({ apChannelPermissionDisplayList }:{
    apChannelPermissionDisplayList: TAPChannelPermissionDisplayList;
  }): TAPChannelTopicDisplayList {
    const apChannelTopicDisplayList: TAPChannelTopicDisplayList = [];

    for(const apChannelPermissionDisplay of apChannelPermissionDisplayList) {
      for(const topic of apChannelPermissionDisplay.permittedTopicList) {
        const apChannelTopicDisplay: TAPChannelTopicDisplay = {
          channel: apChannelPermissionDisplay.channel,
          channelId: apChannelPermissionDisplay.channelId,
          topic: topic
        };
        apChannelTopicDisplayList.push(apChannelTopicDisplay);
      }
    }

    return apChannelTopicDisplayList;
  }

  public is_ApAppEnvironmentDisplay_Webhook_Capable({ apAppEnvironmentDisplay }:{
    apAppEnvironmentDisplay: IAPAppEnvironmentDisplay;
  }): boolean {
    // is http enabled?
    const foundHttp = apAppEnvironmentDisplay.apEndpointList.find( (apEndpointDisplay: TAPEndpointDisplay) => {
      return (apEndpointDisplay.protocol.name === Protocol.name.HTTP || apEndpointDisplay.protocol.name === Protocol.name.HTTPS);
    });
    if(foundHttp !== undefined) {
      // any publish permissions?
      if(apAppEnvironmentDisplay.apChannelPermissions_smf.apPublishPermissionList.length > 0) return true;
    }
    return false;
  }

  public isAny_ApAppEnvironmentDisplay_Webhook_Capable({ apAppEnvironmentDisplayList }:{
    apAppEnvironmentDisplayList: TAPAppEnvironmentDisplayList;
  }): boolean {
    if(apAppEnvironmentDisplayList.length === 0) return false;
    let isCapable: boolean = false;
    apAppEnvironmentDisplayList.forEach( (apAppEnvironmentDisplay: IAPAppEnvironmentDisplay) => {
      if(!isCapable && this.is_ApAppEnvironmentDisplay_Webhook_Capable({ apAppEnvironmentDisplay: apAppEnvironmentDisplay })) isCapable = true;
    });
    return isCapable;
  }

}

export default new APAppEnvironmentsDisplayService();
