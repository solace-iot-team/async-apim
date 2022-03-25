import { 
  Protocol,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay } from './APEntityIdsService';

export type TAPProtocolDisplay = IAPEntityIdDisplay & {
  connectorProtocol: Protocol;
}
export type TAPProtocolDisplayList = Array<TAPProtocolDisplay>;

class APProtocolsService {
  private readonly BaseComponentName = "APProtocolsService";

  private create_DisplayName(connectorProtocol: Protocol): string {
    return connectorProtocol.version ? `${connectorProtocol.name} (${connectorProtocol.version })` : connectorProtocol.name;
  }
  
  public create_ApProtocolDisplay_From_ConnectorProtocol(connectorProtocol: Protocol): TAPProtocolDisplay {
    return {
      apEntityId: {
        id: connectorProtocol.name,
        displayName: this.create_DisplayName(connectorProtocol)
      },
      connectorProtocol: connectorProtocol
    }
  }

  public create_SortedApProtocolDisplayList_From_ConnectorProtocolList(connectorProtocolList?: Array<Protocol>): TAPProtocolDisplayList {
    if(!connectorProtocolList) return [];
    const list: TAPProtocolDisplayList = [];
    for(const connectorProtocol of connectorProtocolList) {
      list.push(this.create_ApProtocolDisplay_From_ConnectorProtocol(connectorProtocol));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPProtocolDisplay>(list);
  }

  public create_ConnectorProtocols_From_ApProtocolDisplayList(list: TAPProtocolDisplayList): Array<Protocol> {
    return list.map( (x) => {
      return x.connectorProtocol;
    });
  }

  public create_DisplayString_From_ApProtocolDisplayList(apProtocolDisplayList: TAPProtocolDisplayList): string {
    if(apProtocolDisplayList.length > 0) {
      return APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPProtocolDisplay>(apProtocolDisplayList).join(', ');
    } else return '-';
  }

}

export default new APProtocolsService();

