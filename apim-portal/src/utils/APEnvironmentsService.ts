import { 
  EnvironmentListItem, 
  EnvironmentResponse,
  EnvironmentsService,
  Protocol,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId } from './APEntityIdsService';
import APProtocolsService, { TAPProtocolDisplay, TAPProtocolDisplayList } from './APProtocolsService';
import APSearchContentService, { IAPSearchContent } from './APSearchContentService';

export type TAPEnvironmentDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  connectorEnvironmentResponse: EnvironmentResponse;
  apDisplayString: string;
  // references ...
}
export type TAPEnvironmentDisplayList = Array<TAPEnvironmentDisplay>;


class APEnvironmentsService {
  private readonly BaseComponentName = "APEnvironmentsService";

  public nameOf_Entity(name: keyof TAPEntityId) {
    return `apEntityId.${name}`;
  }

  private create_DisplayString(envResponse: EnvironmentResponse): string {
    return `${envResponse.displayName} (${envResponse.datacenterProvider}:${envResponse.datacenterId})`;
  }

  private create_ApEnvironmentDisplay_From_ApiEntities = (connectorEnvResponse: EnvironmentResponse): TAPEnvironmentDisplay => {
    const _base: TAPEnvironmentDisplay = {
      apEntityId: {
        id: connectorEnvResponse.name,
        displayName: connectorEnvResponse.displayName ? connectorEnvResponse.displayName : connectorEnvResponse.name
      },
      connectorEnvironmentResponse: connectorEnvResponse,
      apDisplayString: this.create_DisplayString(connectorEnvResponse),
      apSearchContent: ''
    }
    return APSearchContentService.add_SearchContent<TAPEnvironmentDisplay>(_base);
  }

  private create_Empty_ConnectorEnvironmentResponse(): EnvironmentResponse {
    return {
      name: '',
      description: '',
      serviceId: '',
    }
  }

  public create_SortedApProtocolDisplayList_From_ApEnvironmentDisplay(apEnvironmentDisplay: TAPEnvironmentDisplay): TAPProtocolDisplayList {
    return APProtocolsService.create_SortedApProtocolDisplayList_From_ConnectorProtocolList(apEnvironmentDisplay.connectorEnvironmentResponse.exposedProtocols);
  }

  public create_ConsolidatedApProtocolDisplayList(apEnvironmentDisplayList: TAPEnvironmentDisplayList): TAPProtocolDisplayList {
    const connectorList: Array<Protocol> = [];
    for(const apEnvDisplay of apEnvironmentDisplayList) {
      const exposedProtocols: Array<Protocol> = apEnvDisplay.connectorEnvironmentResponse.exposedProtocols ? apEnvDisplay.connectorEnvironmentResponse.exposedProtocols : [];
      connectorList.push(...exposedProtocols);
    }
    const unique = new Map<string, number>();
    const distinctConnectorProtocolList: Array<Protocol> = [];
    for(let i=0; i < connectorList.length; i++) {      
      if(!unique.has(connectorList[i].name)) {
        distinctConnectorProtocolList.push(connectorList[i]);
        unique.set(connectorList[i].name, 1);
      } 
    }
    const resultList: TAPProtocolDisplayList = APProtocolsService.create_SortedApProtocolDisplayList_From_ConnectorProtocolList(distinctConnectorProtocolList);
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPProtocolDisplay>(resultList);
  }

  public create_EmptyObject(): TAPEnvironmentDisplay {
    return {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      connectorEnvironmentResponse: this.create_Empty_ConnectorEnvironmentResponse(),
      apDisplayString: '',
      apSearchContent: ''
    };
  }

  public async listApEnvironmentDisplay({ organizationId }: {
    organizationId: string;
  }): Promise<TAPEnvironmentDisplayList> {

    const envListItemList: Array<EnvironmentListItem> = await EnvironmentsService.listEnvironments({
      organizationName: organizationId
    });
    // TODO: PARALLELIZE
    const list: TAPEnvironmentDisplayList = [];
    for(const envListItem of envListItemList) {
      const envResponse = await EnvironmentsService.getEnvironment({
        organizationName: organizationId,
        envName: envListItem.name
      });
      list.push(this.create_ApEnvironmentDisplay_From_ApiEntities(envResponse));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPEnvironmentDisplay>(list);    
  }

  public async listApEnvironmentDisplayForEnvIdList({ organizationId, envIdList }: {
    organizationId: string;
    envIdList: Array<string>;
  }): Promise<TAPEnvironmentDisplayList> {

    // TODO: PARALLELIZE
    const list: TAPEnvironmentDisplayList = [];
    for(const envId of envIdList) {
      const envResponse = await EnvironmentsService.getEnvironment({
        organizationName: organizationId,
        envName: envId
      });
      list.push(this.create_ApEnvironmentDisplay_From_ApiEntities(envResponse));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPEnvironmentDisplay>(list);    
  }

}

export default new APEnvironmentsService();
