import { 
  EnvironmentListItem, 
  EnvironmentResponse,
  EnvironmentsService,
  Protocol,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay } from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import APProtocolsDisplayService, { TAPProtocolDisplay, TAPProtocolDisplayList } from './APProtocolsDisplayService';

export type TAPEnvironmentDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  connectorEnvironmentResponse: EnvironmentResponse;
  apDisplayString: string;
  apProtocolDisplayList: TAPProtocolDisplayList;
  // references ...
}
export type TAPEnvironmentDisplayList = Array<TAPEnvironmentDisplay>;

class APEnvironmentsDisplayService {
  private readonly BaseComponentName = "APEnvironmentsDisplayService";

  private create_DisplayString(envResponse: EnvironmentResponse): string {
    return `${envResponse.displayName} (${envResponse.datacenterProvider}:${envResponse.datacenterId})`;
  }

  private create_ApEnvironmentDisplay_From_ApiEntities = ({ connectorEnvResponse }:{
    connectorEnvResponse: EnvironmentResponse
  }): TAPEnvironmentDisplay => {
    const _base: TAPEnvironmentDisplay = {
      apEntityId: {
        id: connectorEnvResponse.name,
        displayName: connectorEnvResponse.displayName ? connectorEnvResponse.displayName : connectorEnvResponse.name
      },
      connectorEnvironmentResponse: connectorEnvResponse,
      apDisplayString: this.create_DisplayString(connectorEnvResponse),
      apProtocolDisplayList: APProtocolsDisplayService.create_SortedApProtocolDisplayList_From_ConnectorProtocolList({ connectorProtocolList: connectorEnvResponse.exposedProtocols }),
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

  // public create_SortedApProtocolDisplayList_From_ApEnvironmentDisplay({ apEnvironmentDisplay }:{
  //   apEnvironmentDisplay: TAPEnvironmentDisplay
  // }): TAPProtocolDisplayList {
  //   return APProtocolsService.create_SortedApProtocolDisplayList_From_ConnectorProtocolList(apEnvironmentDisplay.connectorEnvironmentResponse.exposedProtocols);
  // }

  public create_ConsolidatedApProtocolDisplayList({ apEnvironmentDisplayList }:{
    apEnvironmentDisplayList: TAPEnvironmentDisplayList
  }): TAPProtocolDisplayList {
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
    const resultList: TAPProtocolDisplayList = APProtocolsDisplayService.create_SortedApProtocolDisplayList_From_ConnectorProtocolList({ connectorProtocolList: distinctConnectorProtocolList });
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPProtocolDisplay>(resultList);
  }

  public create_EmptyObject(): TAPEnvironmentDisplay {
    return {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      connectorEnvironmentResponse: this.create_Empty_ConnectorEnvironmentResponse(),
      apDisplayString: '',
      apProtocolDisplayList: [],
      apSearchContent: ''
    };
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************


  public async apiGetList_ApEnvironmentDisplay({ organizationId }: {
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
      list.push(this.create_ApEnvironmentDisplay_From_ApiEntities({connectorEnvResponse: envResponse }));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPEnvironmentDisplay>(list);    
  }

  public async apiGetList_ApEnvironmentDisplay_For_EnvIdList({ organizationId, envIdList }: {
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
      list.push(this.create_ApEnvironmentDisplay_From_ApiEntities({ connectorEnvResponse: envResponse }));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPEnvironmentDisplay>(list);    
  }

}

export default new APEnvironmentsDisplayService();
