import { 
  EnvironmentListItem, 
  EnvironmentResponse,
  EnvironmentsService,
  Protocol,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay } from './APEntityIdsService';

export type TAPProtocolDisplay = IAPEntityIdDisplay & {
  connectorProtocol: Protocol;
}
export type TAPProtocolDisplayList = Array<TAPProtocolDisplay>;
export type TAPEnvironmentDisplay = IAPEntityIdDisplay & {
  connectorEnvironmentResponse: EnvironmentResponse;
  apDisplayString: string;
  // references ...
}
export type TAPEnvironmentDisplayList = Array<TAPEnvironmentDisplay>;


class APEnvironmentsService {
  private readonly BaseComponentName = "APEnvironmentsService";

  private getApDisplayString(envResponse: EnvironmentResponse): string {
    return `${envResponse.displayName} (${envResponse.datacenterProvider}:${envResponse.datacenterId})`;
  }

  private create_ApEnvironmentDisplay_From_ApiEntities = (connectorEnvResponse: EnvironmentResponse): TAPEnvironmentDisplay => {
    const _base: TAPEnvironmentDisplay = {
      apEntityId: {
        id: connectorEnvResponse.name,
        displayName: connectorEnvResponse.displayName ? connectorEnvResponse.displayName : connectorEnvResponse.name
      },
      connectorEnvironmentResponse: connectorEnvResponse,
      apDisplayString: this.getApDisplayString(connectorEnvResponse)
    }
    return _base;
  }

  private create_Empty_ConnectorEnvironmentResponse(): EnvironmentResponse {
    return {
      name: '',
      description: '',
      serviceId: '',
    }
  }

  public create_ConnectorProtocols_From_ApProtocolDisplayList(list: TAPProtocolDisplayList): Array<Protocol> {
    return list.map( (x) => {
      return x.connectorProtocol;
    });
  }

  private create_ApProtocolDisplay_From_ConnectorProtocol(connectorProtocol: Protocol): TAPProtocolDisplay {
    return {
      apEntityId: {
        id: connectorProtocol.name,
        displayName: connectorProtocol.version ? `${connectorProtocol.name} (${connectorProtocol.version })` : connectorProtocol.name
      },
      connectorProtocol: connectorProtocol
    }
  }

  public create_ConsolidatedApProtocolDisplayList(apEnvironmentDisplayList: TAPEnvironmentDisplayList): TAPProtocolDisplayList {
    const connectorList: Array<Protocol> = [];
    for(const apEnvDisplay of apEnvironmentDisplayList) {
      const exposedProtocols: Array<Protocol> = apEnvDisplay.connectorEnvironmentResponse.exposedProtocols ? apEnvDisplay.connectorEnvironmentResponse.exposedProtocols : [];
      connectorList.push(...exposedProtocols);
    }
    const unique = new Map<string, number>();
    const distinctConnectorList: Array<Protocol> = [];
    for(let i=0; i < connectorList.length; i++) {      
      if(!unique.has(connectorList[i].name)) {
        distinctConnectorList.push(connectorList[i]);
        unique.set(connectorList[i].name, 1);
      } 
    }
    const resultList: TAPProtocolDisplayList = [];
    for(const connectorProtocol of distinctConnectorList) {
      resultList.push(this.create_ApProtocolDisplay_From_ConnectorProtocol(connectorProtocol));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPProtocolDisplay>(resultList);
  }

  public create_EmptyObject(): TAPEnvironmentDisplay {
    return {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      connectorEnvironmentResponse: this.create_Empty_ConnectorEnvironmentResponse(),
      apDisplayString: ''
    };
  }

  public async listApEnvironmentDisplay({ organizationId }: {
    organizationId: string;
  }): Promise<TAPEnvironmentDisplayList> {

    const envListItemList: Array<EnvironmentListItem> = await EnvironmentsService.listEnvironments({
      organizationName: organizationId
    });
    // TODO: PARALLELIZE
    const apEnvDisplayList: TAPEnvironmentDisplayList = [];
    for(const envListItem of envListItemList) {
      const envResponse = await EnvironmentsService.getEnvironment({
        organizationName: organizationId,
        envName: envListItem.name
      });
      apEnvDisplayList.push(this.create_ApEnvironmentDisplay_From_ApiEntities(envResponse));
    }
    return apEnvDisplayList;
  }

  public async listApEnvironmentDisplayForEnvIdList({ organizationId, envIdList }: {
    organizationId: string;
    envIdList: Array<string>;
  }): Promise<TAPEnvironmentDisplayList> {

    // TODO: PARALLELIZE
    const apEnvDisplayList: TAPEnvironmentDisplayList = [];
    for(const envId of envIdList) {
      const envResponse = await EnvironmentsService.getEnvironment({
        organizationName: organizationId,
        envName: envId
      });
      apEnvDisplayList.push(this.create_ApEnvironmentDisplay_From_ApiEntities(envResponse));
    }
    return apEnvDisplayList;
  }

}

export default new APEnvironmentsService();
